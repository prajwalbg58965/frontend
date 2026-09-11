import { apiClient } from '../client';
import type { ResponderLookupResponse, Coordinates } from '../../types/domain';
import { ENDPOINTS, type ResponderLookupParams } from '../contracts';

export const respondersService = {
  getNearestResponders: (params: ResponderLookupParams) =>
    apiClient.get<ResponderLookupResponse>(ENDPOINTS.nearestResponders, {
      lat: params.coordinates.latitude,
      lng: params.coordinates.longitude,
      radiusKm: params.radiusKm,
      types: params.types?.join(','),
    }),

  getNearestRespondersForIncident: (coordinates: Coordinates, radiusKm = 100) =>
    apiClient.get<ResponderLookupResponse>(ENDPOINTS.nearestResponders, {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
      radiusKm,
    }),
};