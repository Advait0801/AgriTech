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

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Flask API base URL (defaults to `http://127.0.0.1:5001`) |
| `REACT_APP_FIREBASE_*` | Firebase project configuration |

The Firebase project used during development belonged to a team member and has been decommissioned, so you will need your own to run authentication and the profile page. Everything else — including the recorded-data visualisation — works without it.

Firebase web config is inlined into the client bundle at build time and is therefore public once deployed. That is normal and unavoidable for any browser SDK; a Firebase project is secured by Firestore rules, the authorized-domains list and API key restrictions, not by hiding the config. Keeping it in `.env` avoids committing it to git history, where it could not be removed without rewriting published commits.

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
| `/about`, `/services` | Static content |
| `/Login`, `/Signup`, `/Profile` | Firebase authentication |
| `/Yieldprediction` | Yield prediction form |
| `/CropRecommendation` | Crop recommendation form |
| `/DiseasePrediction` | Leaf image upload |
| `/Visualization` | Recorded sensor charts |

## Note

The backend and sensor hardware are retired, so prediction pages will not return results unless a local Flask server is running — see [backend](../backend/). The visualisation page ships its own recorded data and works standalone.
