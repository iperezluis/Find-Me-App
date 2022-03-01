import React, { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import { Subject } from "rxjs";

import { v4 } from "uuid";
import { InitialPosition, Markers } from "../interfaces/interfacesMarker";

export const initialPosition: InitialPosition = {
  lng: 4,
  lat: 35,
  zoom: 2,
};

export const useMapBox = () => {
  const [mapa, setmapa] = useState<mapboxgl.Map>();
  const [coords, setCoords] = useState<InitialPosition>(initialPosition);
  const markers = useRef<Markers>({} as Markers);
  //aqui la solucion depsues de tanto pensar, es que el tipado del container es HTMLElement | string, el string es literalmente el id que pusiste en la etiqueta div osea[ <div id: "mapContainer"/>].
  const containMap = document.getElementById("mapContainer") || "mapContainer";
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: containMap,
      style: "mapbox://styles/mapbox/streets-v11",
      center: { lng: initialPosition.lng, lat: initialPosition.lat },
      zoom: initialPosition.zoom,
    });
    setmapa(map);
  }, []);

  //when we do moves the map
  useEffect(() => {
    mapa?.on("move", () => {
      const { lat, lng } = mapa.getCenter();
      // console.log({ lat, lng });
      const zoom = mapa.getZoom();
      setCoords({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        zoom: Number(zoom.toPrecision(1)),
      });
    });
    return () => {
      mapa?.off("move", () => console.log("listener eliminado"));
    };
  }, [mapa]);

  //we do use observable of rxjs
  const movementMarker = useRef(new Subject());
  const newMarker = useRef(new Subject());

  //function for add markers
  // we do useCallback for to evit the renderization and will return a memoized version of the callback
  // let markers: Markers;
  const addMarkers = useCallback(
    (e, id?: string) => {
      const { lng, lat } = e.lngLat || e;

      const marker = new mapboxgl.Marker();
      markers.current = {
        id: id ?? v4(),
        marker: marker,
      };
      console.log(marker);
      markers.current.marker // Object(newMarker)
        .setLngLat([lat, lng]);
      markers.current.marker.setDraggable(true);
      markers.current.marker.addTo(mapa!);
      console.log(markers);

      //adding object a rxjs for to extract
      if (!id) {
        newMarker.current.next({
          id: markers.current.id,
          lng: lng,
          lat: lat,
        });
      }

      //listerner for get  coords markers
      markers.current.marker.on("drag", (e) => {
        const { lat, lng } = markers.current.marker.getLngLat();
        console.log(e);

        movementMarker.current.next({
          id: markers.current.id || id,
          lng: lng,
          lat: lat,
        });
      });
    },
    [mapa]
  );
  //update markers
  const updatePosition = useCallback(
    ({ id, lat, lng }) => {
      console.log(id);
      // if (id !== markers.current.id) return null;
      markers.current.marker.setLngLat([lng, lat]);
    },
    [mapa]
  );

  //rigth now we will add markers when we do clicks
  useEffect(() => {
    //add with click
    mapa?.on("click", (e) => {
      addMarkers(e);
    });
  }, [mapa]);
  return {
    addMarkers,
    newMarker$: newMarker.current,
    movementMarker$: movementMarker.current,
    initialPosition,
    coords,
    mapa,
    updatePosition,
  };
};
