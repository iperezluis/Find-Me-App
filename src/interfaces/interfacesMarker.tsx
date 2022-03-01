export interface InitialPosition {
  lng: number;
  lat: number;
  zoom?: number;
}
export interface MarkerModel {
  id: string;
  lng: number;
  lat: number;
}
export interface Markers {
  id: string;
  marker: mapboxgl.Marker;
}
