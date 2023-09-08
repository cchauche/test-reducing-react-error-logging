import { Route, createRoutesFromElements } from "react-router-dom";
import App from "./App";

export const routes = createRoutesFromElements(
  <Route path="/" element={<App />} errorElement={<div>Error</div>} />
);
