# API reference

Flask service defined in [`backend/app.py`](../backend/app.py). Runs on port `5001`, CORS open to all origins.

```bash
cd backend && pip install -r requirements.txt && python app.py
```

Model files are resolved relative to the source file, at `../models/`. The frontend's base URL is set in `frontend/src/API/config.js` and can be overridden with `REACT_APP_API_URL`.

---

## `POST /predict_yield`

Estimate chilli yield from a full sensor reading.

**Request**

```json
{
  "Soil_Temp": 25.0,
  "N": 180, "P": 38, "K": 50,
  "Moisture": 85,
  "Humidity": 60,
  "Air_Temp": 30
}
```

All seven fields are required, in this order — the model consumes a positional feature vector. Values are standardised with the `StandardScaler` pickled alongside the regressor.

**Response** — `200`

```json
{ "yield": 3284.61 }
```

Yield in kg/acre. See the [target-variable caveat](models.md#yield-target) before interpreting it.

---

## `POST /predict_crop`

Recommend the three most suitable crops.

**Request**

```json
{ "N": 90, "P": 42, "K": 43, "temperature": 20.9, "humidity": 82.0 }
```

**Response** — `200`

```json
{
  "predictions": [
    { "crop": "rice",   "probability": 87.0 },
    { "crop": "jute",   "probability":  8.0 },
    { "crop": "maize",  "probability":  3.0 }
  ]
}
```

Probabilities are percentages from the Random Forest's vote distribution, descending.

---

## `POST /predict_disease`

Classify a chilli leaf photograph.

**Request** — `multipart/form-data` with a single `file` field.

```bash
curl -X POST -F "file=@leaf.jpg" http://127.0.0.1:5001/predict_disease
```

**Response** — `200`

```json
{ "predicted_class": "leaf curl" }
```

One of `healthy`, `leaf curl`, `leaf spot`, `whitefly`, `yellowish`.

Requires `disease_model.pth` in `models/` — see [DATA.md](DATA.md). Uses CUDA when available, otherwise CPU.

---

## Errors

| Status | Body | Cause |
|---|---|---|
| `400` | `{"error": "No file part"}` | Image upload missing the `file` field |
| `400` | `{"error": "<detail>"}` | Missing or non-numeric field in a JSON request |

## Known gaps

Documented rather than fixed, since the project is archived:

- **No authentication.** The frontend sends a Firebase `Authorization: Bearer` header on two endpoints; the server never reads it. The header is decorative.
- **No input validation.** Values outside sensor range are accepted and silently produce nonsense predictions rather than being rejected.
- **No `/health` endpoint**, and models load eagerly at import, so a missing weights file crashes startup rather than degrading one endpoint.
