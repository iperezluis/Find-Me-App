import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { MapasApp } from "./MapasApp";
import { SocketProvider } from "./context/SocketContext";

ReactDOM.render(
  <React.StrictMode>
    <SocketProvider>
      <MapasApp />
    </SocketProvider>
  </React.StrictMode>,

  document.getElementById("root")
);
