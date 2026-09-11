import { createContext, useContext, useState, ReactNode } from 'react';

export interface TrainInfo {
  id: string;
  name: string;
  route: string;
  origin: string;
  destination: string;
  status: string;
  speed: string;
  zone: string;
}

export const POPULAR_TRAINS: TrainInfo[] = [
  {
    id: '12841',
    name: 'Coromandel Express',
    route: 'Howrah (HWH) ➔ Chennai Central (MAS)',
    origin: 'Howrah (HWH)',
    destination: 'Chennai Central (MAS)',
    status: 'ACTIVE • Live ML Monitored',
    speed: '110 km/h',
    zone: 'SER'
  },
  {
    id: '16527',
    name: 'Yesvantpur - Kannur Express',
    route: 'Yesvantpur (YPR) ➔ Kannur (CAN)',
    origin: 'Yesvantpur (YPR)',
    destination: 'Kannur (CAN)',
    status: 'ACTIVE • Live Monitored',
    speed: '85 km/h',
    zone: 'SWR'
  },
  {
    id: '12839',
    name: 'Howrah - Chennai Mail',
    route: 'Howrah (HWH) ➔ Chennai Central (MAS)',
    origin: 'Howrah (HWH)',
    destination: 'Chennai Central (MAS)',
    status: 'ACTIVE • Scheduled',
    speed: '105 km/h',
    zone: 'SER'
  },
  {
    id: '12863',
    name: 'Howrah - SMVT Bengaluru SF Exp',
    route: 'Howrah (HWH) ➔ SMVT Bengaluru (SMVT)',
    origin: 'Howrah (HWH)',
    destination: 'SMVT Bengaluru (SMVT)',
    status: 'ACTIVE • Scheduled',
    speed: '95 km/h',
    zone: 'SER'
  },
  {
    id: '12626',
    name: 'Kerala Express',
    route: 'New Delhi (NDLS) ➔ Thiruvananthapuram (TVC)',
    origin: 'New Delhi (NDLS)',
    destination: 'Thiruvananthapuram (TVC)',
    status: 'ACTIVE • Scheduled',
    speed: '110 km/h',
    zone: 'NR'
  },
  {
    id: '12301',
    name: 'Howrah Rajdhani Express',
    route: 'Howrah (HWH) ➔ New Delhi (NDLS)',
    origin: 'Howrah (HWH)',
    destination: 'New Delhi (NDLS)',
    status: 'ACTIVE • High Priority',
    speed: '130 km/h',
    zone: 'ER'
  },
  {
    id: '12245',
    name: 'Howrah - SMVT Duronto Express',
    route: 'Howrah (HWH) ➔ SMVT Bengaluru (SMVT)',
    origin: 'Howrah (HWH)',
    destination: 'SMVT Bengaluru (SMVT)',
    status: 'ACTIVE • Non-Stop SF',
    speed: '120 km/h',
    zone: 'SER'
  },
  {
    id: '12801',
    name: 'Purushottam Express',
    route: 'Puri (PURI) ➔ New Delhi (NDLS)',
    origin: 'Puri (PURI)',
    destination: 'New Delhi (NDLS)',
    status: 'ACTIVE • Daily',
    speed: '100 km/h',
    zone: 'ECoR'
  }
];

interface TrainContextValue {
  selectedTrainId: string;
  setSelectedTrainId: (id: string) => void;
  getTrainInfo: (id: string) => TrainInfo;
  popularTrains: TrainInfo[];
}

const TrainContext = createContext<TrainContextValue | null>(null);

export function TrainProvider({ children }: { children: ReactNode }) {
  const [selectedTrainId, setSelectedTrainIdState] = useState<string>('12841');
  const [trainList, setTrainList] = useState<TrainInfo[]>(POPULAR_TRAINS);

  const getTrainInfo = (id: string): TrainInfo => {
    const found = trainList.find((t) => t.id === id);
    if (found) return found;
    return {
      id,
      name: `Express Train #${id}`,
      route: `Custom Route Query #${id}`,
      origin: 'Origin Station',
      destination: 'Destination Station',
      status: 'CUSTOM TRAIN • ML Query Active',
      speed: '100 km/h',
      zone: 'IR Network'
    };
  };

  const setSelectedTrainId = (id: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;

    // Check if known train or new custom train
    const existing = POPULAR_TRAINS.find((t) => t.id === cleanId);
    if (!trainList.some((t) => t.id === cleanId)) {
      const newTrain: TrainInfo = existing || {
        id: cleanId,
        name: `Express Train #${cleanId}`,
        route: `Custom Route Query #${cleanId}`,
        origin: 'Origin Station',
        destination: 'Destination Station',
        status: 'CUSTOM TRAIN • ML Query Active',
        speed: '100 km/h',
        zone: 'IR Network'
      };
      setTrainList((prev) => [newTrain, ...prev]);
    }
    
    setSelectedTrainIdState(cleanId);
  };

  return (
    <TrainContext.Provider
      value={{
        selectedTrainId,
        setSelectedTrainId,
        getTrainInfo,
        popularTrains: trainList
      }}
    >
      {children}
    </TrainContext.Provider>
  );
}

export function useTrain(): TrainContextValue {
  const context = useContext(TrainContext);
  if (!context) {
    throw new Error('useTrain must be used within a TrainProvider');
  }
  return context;
}

