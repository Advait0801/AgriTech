"""Flask inference API for the AgriTech precision-agriculture system.

Serves the three trained models behind a small JSON API consumed by the
React frontend:

    POST /predict_yield    KNN regressor      -> chilli yield (kg/acre)
    POST /predict_crop     Random Forest      -> top-3 crops with confidence
    POST /predict_disease  Vision Transformer -> one of five leaf classes

Model artefacts live in ../models/. The two scikit-learn pickles are
committed; disease_model.pth is 343 MB and is distributed via Google
Drive instead (see docs/DATA.md).

Note: this project is archived. The hardware has been decommissioned and
the ThingSpeak channel retired, so the service is documented here rather
than actively maintained.
"""

from pathlib import Path
import pickle

import numpy as np
import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from torchvision import transforms
from transformers import ViTForImageClassification

app = Flask(__name__)
CORS(app)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

# Trained with scikit-learn 1.6.1; unpickling requires a matching version.
with open(MODEL_DIR / "yield_model.pkl", "rb") as f:
    yield_model, yield_scaler = pickle.load(f)  # (KNeighborsRegressor, StandardScaler)

with open(MODEL_DIR / "recommendation_model.pkl", "rb") as f:
    crop_model = pickle.load(f)  # RandomForestClassifier

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
disease_model = ViTForImageClassification.from_pretrained(
    'google/vit-base-patch16-224-in21k',
    num_labels=5
)
disease_model.load_state_dict(
    torch.load(MODEL_DIR / "disease_model.pth", map_location=device)
)
disease_model.to(device)
disease_model.eval()

def preprocess_image(image):
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    input_tensor = preprocess(image).unsqueeze(0)
    input_tensor = input_tensor.to(device)  # Move to device (GPU if available)
    return input_tensor

# Class names (replace with your actual class names)
class_names = ['healthy', 'leaf curl', 'leaf spot', 'whitefly', 'yellowish']  

@app.route('/predict_disease', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    image = Image.open(file.stream)

    input_tensor = preprocess_image(image)  # Call the preprocessing function

    with torch.no_grad():
        outputs = disease_model(input_tensor).logits
        predicted_class = torch.argmax(outputs, dim=1)

    predicted_class_name = class_names[predicted_class.item()]

    return jsonify({'predicted_class': predicted_class_name})

# Define feature names for crop recommendation model
crop_feature_names = ['N', 'P', 'K', 'temperature', 'humidity']

@app.route("/predict_yield", methods=["POST"])
def predict_yield():
    try:
        data = request.json
        features = np.array([[data["Soil_Temp"], data["N"], data["P"], data["K"], 
                              data["Moisture"], data["Humidity"], data["Air_Temp"]]])
        
        # Apply scaling using the loaded scaler
        scaled_features = yield_scaler.transform(features)
        
        # Make prediction
        prediction = yield_model.predict(scaled_features)[0]
        
        return jsonify({"yield": prediction})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict_crop', methods=['POST'])
def predict_crop():
    try:
        data = request.json
        input_features = [data[feature] for feature in crop_feature_names]
        
        # Get probabilities for each crop
        probabilities = crop_model.predict_proba([input_features])[0]

        # Get indices of top 3 crops
        top_3_indices = np.argsort(probabilities)[-3:][::-1]

        # Get the names and probabilities of the top 3 crops
        top_3_crops_with_probabilities = [
            {
                "crop": crop_model.classes_[i], 
                "probability": probabilities[i] * 100
            } for i in top_3_indices
        ]

        return jsonify({'predictions': top_3_crops_with_probabilities})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=5001)