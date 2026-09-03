# AgriTech — frontend

React single-page app for the AgriTech precision-agriculture system. See the [project README](../README.md) for context.

Built with Create React App, React 19, Tailwind CSS 3, Recharts and Firebase Auth.

## Running

```bash
npm install
npm run start-react     # http://localhost:3000
```

`npm start` runs the frontend and the Flask backend together via `concurrently`.

## Configuration

The API base URL comes from `src/API/config.js` and can be overridden at build time:

```bash
REACT_APP_API_URL=http://localhost:5001 npm run build
```

Firebase configuration lives in `src/firebase.js`. Those values are public by design — they identify the project and ship in every client bundle. Access is controlled by Firestore security rules and the authorized-domains list.

## Structure

```
src/
├── API/          Backend client — one module per endpoint, shared config.js
├── components/
│   ├── Navbar/
│   ├── Footer/
│   └── pages/    One component per route
├── data/         Recorded sensor readings used by the visualisation page
├── Images/       Page imagery
└── firebase.js   Auth and Firestore initialisation
```

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/about`, `/services`, `/contact` | Static content |
| `/Login`, `/Signup`, `/Profile` | Firebase authentication |
| `/Yieldprediction` | Yield prediction form |
| `/CropRecommendation` | Crop recommendation form |
| `/DiseasePrediction` | Leaf image upload |
| `/Visualization` | Recorded sensor charts |

## Note

The backend and sensor hardware are retired, so prediction pages will not return results unless a local Flask server is running — see [backend](../backend/). The visualisation page ships its own recorded data and works standalone.
