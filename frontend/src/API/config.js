// Base URL for the Flask inference API.
//
// Override with REACT_APP_API_URL at build time; defaults to the local
// development server. Note that the deployed backend and the sensor
// hardware are retired — see the project README.
export const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";
