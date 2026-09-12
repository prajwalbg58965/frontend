import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { resolve } from 'path';

// Load .env file from root
dotenv.config({ path: resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PROXY_PORT || 3001;
const RAILRADAR_API_KEY = process.env.RAILRADAR_API_KEY;

app.use(cors());
app.use(express.json());

// In-memory cache to prevent hammering the API
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

// Normalization function mapping RailRadar schema to RailSentinel schema
function normalizeLiveResponse(payload, trainNumber) {
  // If data already normalized (e.g. from mock), return it
  if (payload.source === 'mock') return payload;

  const data = payload.data || payload; // Unwrap data if wrapped

  return {
    trainNumber: data.trainNumber || trainNumber,
    trainName: data.trainName || `Train ${trainNumber}`,
    status: data.status || 'ACTIVE',
    delayMinutes: data.delayMinutes ?? data.overallDelay ?? 0,
    lastUpdatedAt: data.lastUpdatedAt || new Date().toISOString(),
    currentLocation: {
      lat: data.currentLocation?.lat ?? data.currentLocation?.latitude ?? null,
      lng: data.currentLocation?.lng ?? data.currentLocation?.longitude ?? null,
      speedKmh: data.currentLocation?.speedKmh ?? data.currentLocation?.speedKmph ?? null,
      bearingDegrees: data.currentLocation?.bearingDegrees ?? data.currentLocation?.bearing ?? null,
      segmentProgress: data.currentLocation?.segmentProgress ?? 0,
      sequence: data.currentLocation?.sequence ?? 0,
      isHalt: data.currentLocation?.isHalt ?? false,
      stationCode: data.currentLocation?.stationCode ?? null
    },
    previousStation: data.previousStation?.stationName || data.previousHalt?.stationName || null,
    currentStation: data.currentLocation?.stationName || data.currentStation?.stationName || null,
    nextStation: data.nextStation?.stationName || data.nextHalt?.stationName || null,
    route: data.route || []
  };
}

// Generate Mock Data if RailRadar fails or no API key is present
function generateMockLiveData(trainNumber) {
  return {
    trainNumber: trainNumber,
    trainName: `Mock Express ${trainNumber}`,
    status: 'ACTIVE',
    delayMinutes: Math.floor(Math.random() * 30),
    lastUpdatedAt: new Date().toISOString(),
    currentLocation: {
      lat: 20.296 + (Math.random() - 0.5) * 0.1,
      lng: 85.824 + (Math.random() - 0.5) * 0.1,
      speedKmh: Math.floor(Math.random() * 120),
      bearingDegrees: Math.floor(Math.random() * 360),
      segmentProgress: Math.random()
    },
    previousStation: 'Mock Station A',
    currentStation: null,
    nextStation: 'Mock Station B',
    exceptions: [],
    source: 'mock'
  };
}

app.get('/api/trains/:number/live', async (req, res) => {
  const { number } = req.params;
  
  const cacheKey = `live_${number}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return res.json({ success: true, data: cached.data });
  }

  if (!RAILRADAR_API_KEY) {
    return res.status(401).json({ success: false, error: { message: 'RAILRADAR_API_KEY not configured', status: 401 } });
  }

  try {
    const queryParams = new URLSearchParams(req.query).toString();
    const url = `https://api.railradar.in/v1/trains/${number}/live${queryParams ? `?${queryParams}` : ''}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${RAILRADAR_API_KEY}`
      },
      timeout: 5000
    });

    const normalized = normalizeLiveResponse(response.data, number);
    cache.set(cacheKey, { timestamp: Date.now(), data: normalized });
    res.json({ success: true, data: normalized });

  } catch (error) {
    console.error(`[Proxy] RailRadar /live error for ${number}:`, error.message);
    
    // Return stale cache if available
    if (cached) {
      console.log(`[Proxy] Serving stale cache for ${number}`);
      return res.json({ success: true, data: { ...cached.data, isStale: true } });
    }

    const status = error.response?.status || 503;
    let message = 'Upstream service unavailable';
    if (status === 401) message = 'Invalid or missing RailRadar API key';
    if (status === 404) message = 'Train not found on RailRadar';
    if (status === 429) message = 'RailRadar rate limit exceeded';

    res.status(status).json({ success: false, error: { message, status } });
  }
});

app.get('/api/trains/:number/route', async (req, res) => {
  const { number } = req.params;
  
  const cacheKey = `route_${number}`;
  const cached = cache.get(cacheKey);
  // Route data doesn't change often, cache for longer
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL * 10)) {
    return res.json(cached.data);
  }

  if (!RAILRADAR_API_KEY) {
    console.warn(`[Proxy] No RAILRADAR_API_KEY found. Suggest frontend uses local fallback GeoJSON.`);
    return res.status(404).json({ error: 'Mock route not implemented, use local fallback' });
  }

  try {
    const response = await axios.get(`https://api.railradar.in/v1/trains/${number}/route?format=geojson&stops=true`, {
      headers: {
        'Authorization': `Bearer ${RAILRADAR_API_KEY}`
      },
      timeout: 5000
    });

    cache.set(cacheKey, { timestamp: Date.now(), data: response.data });
    res.json(response.data);

  } catch (error) {
    console.error(`[Proxy] RailRadar /route error for ${number}:`, error.message);
    res.status(404).json({ error: 'Route not found or API failed' });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ RailSentinel Proxy Backend listening on port ${PORT}`);
});
