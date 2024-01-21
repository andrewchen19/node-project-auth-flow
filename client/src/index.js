import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "normalize.css";
import App from "./App";
import { AppProvider } from "./context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppProvider>
    <App />
  </AppProvider>
);
