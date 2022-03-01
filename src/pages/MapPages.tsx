import React, { useEffect, useState, useContext } from "react";
import mapboxgl from "mapbox-gl";
import { useMapBox } from "../hooks/useMapBox";
import { SocketContext } from "../context/SocketContext";
import { MarkerModel } from "../interfaces/interfacesMarker";

mapboxgl.accessToken =
  "pk.eyJ1IjoicGVyZXpsdWlzdiIsImEiOiJjbDA0MmgwM2Examl3M2lzMHF3NDJ2eTN2In0.RlBdrrs1rpItpTRtDGEu6Q";

export const MapPages = () => {
  const { movementMarker$, newMarker$, coords, addMarkers, updatePosition } =
    useMapBox();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    socket.on("markers-available", (marker) => {
      for (const key of Object.keys(marker)) {
        addMarkers(marker[key], key);
      }
      console.log(marker);
    });
    return () => {
      socket.off("markers-available");
    };
  }, [socket, addMarkers]);

  useEffect(() => {
    socket.on("new-marker", (marker: MarkerModel) => {
      addMarkers(marker, marker.id);
    });
    return () => {
      socket.off("new-marker");
    };
  }, [socket, addMarkers]);

  //we do to create a RXJS for do not to includes sockets with our useMapBox
  useEffect(() => {
    newMarker$.subscribe((marker) => {
      socket.emit("new-marker", marker);
    });
  }, [newMarker$]);

  useEffect(() => {
    movementMarker$.subscribe((data) => {
      socket.emit("movement-marker", data);
    });
  }, [movementMarker$]);

  useEffect(() => {
    socket.on("movement-marker", (marker: MarkerModel) => {
      console.log(marker.id);
      updatePosition(marker);
      // setMarkers(marker);
    });

    return () => {
      socket.off("movement-marker");
    };
  }, [socket, updatePosition]);

  return (
    <>
      <div className="coords">
        Lng: {coords.lng} | Lat: {coords.lat} | zoom: {coords.zoom}
      </div>
      <div id="mapContainer" />
    </>
  );
};
