# Models

Three models, trained independently and served from a single Flask API. All training code is in [`ml/notebooks/`](../ml/notebooks/); datasets are in [`ml/data/`](../ml/data/).

> **Scope.** The results below describe the system in this repository, which was
> never published. The team's [survey paper](../report/Precision_Agriculture_Survey_Paper.pdf)
> is a separate review of precision-agriculture techniques; its own yield
> benchmark uses a different, third-party dataset and lives in
> [`ml/notebooks/survey-paper/`](../ml/notebooks/survey-paper/).

| Module | Model | Metric | Training data |
|---|---|---|---|
| Crop recommendation | Random Forest (100 trees) | 96.42% accuracy | 2,934 rows, 23 crops |
| Yield prediction | KNN regressor (k=5) | 0.975 R² | 734 rows, 7 features |
| Disease detection | ViT-Base, fine-tuned | 94.0% accuracy | 1,150 images, 5 classes |

---

## Crop recommendation

**Notebook:** [`Crop Recommendation.ipynb`](../ml/notebooks/Crop%20Recommendation.ipynb) · **Data:** [`all_crops_data.csv`](../ml/data/all_crops_data.csv)

Given soil nutrients and local climate, return the three most suitable crops with confidence scores.

### Features

| Feature | Unit | Range |
|---|---|---|
| N | mg/kg | 0 – 255 |
| P | mg/kg | 5 – 145 |
| K | mg/kg | 5 – 205 |
| temperature | °C | 8.8 – 49.0 |
| humidity | % | 13.3 – 100.0 |

### Benchmarks

80/20 train-test split, `random_state=42`.

| Model | Accuracy |
|---|---|
| **Random Forest** | **96.42%** |
| Gaussian Naive Bayes | 96.02% |
| Decision Tree | 94.37% |
| K-Nearest Neighbors | 94.20% |
| SVC (linear) | 88.41% |
| Logistic Regression | 84.51% |

Random Forest was deployed. Rather than returning a single label it exposes `predict_proba`, and the API returns the top 3 classes by probability — more useful to a farmer than one answer, and honest about the model's uncertainty.

### Limitations

- **Class imbalance.** The dataset combines a public 22-crop set (100 rows each) with 734 rows of our own chilli field readings. Chilli is therefore 25% of all training data, and the headline accuracy is correspondingly optimistic for the other 22 crops.
- **No pH or rainfall.** The source dataset ([`Crop_recommendation.csv`](../ml/data/Crop_recommendation.csv)) includes both, but our sensor could measure neither, so the deployed model was trained on the five features the hardware could actually supply. This traded accuracy for a model that works with real inputs.
- **A single split.** No cross-validation, so the reported figure carries no variance estimate.

---

## Yield prediction

**Notebook:** [`Chilli Yield Prediction.ipynb`](../ml/notebooks/Chilli%20Yield%20Prediction.ipynb) · **Data:** [`chilli_data.xlsx`](../ml/data/chilli_data.xlsx)

Estimate chilli yield in kg/acre from a full sensor reading.

### Features

734 readings logged by the deployed node.

| Feature | Unit | Range |
|---|---|---|
| Soil temperature | °C | 20.4 – 44.0 |
| N | mg/kg | 20 – 255 |
| P | mg/kg | 14 – 49 |
| K | mg/kg | 21 – 68 |
| Moisture | % | 43 – 136 |
| Air humidity | % | 13.3 – 77.3 |
| Air temperature | °C | 25.4 – 49.0 |

<a name="yield-target"></a>

### The target variable is simulated

**This is the most important caveat in the project and it should be read before the numbers below.**

No ground-truth harvest data was collected — measuring true yield requires harvesting and weighing the plot, which was outside what the project could do. The target was therefore generated from the input features by a hand-specified linear formula:

```python
yield = (3200
         + 2.0 * soil_temp
         - 1.5 * N
         + 3.0 * P
         + 3.0 * K
         + 1.2 * moisture
         - 2.0 * humidity
         + 2.0 * air_temp
         + normal(0, 15))          # clipped to [3000, 3500]
```

The coefficients encode plausible agronomic direction — phosphorus and potassium help, excess nitrogen hurts vegetative-to-fruit ratio — but they were chosen, not fitted.

**What this means for the results:** any model scoring above 97% here is recovering a deterministic function through a thin layer of noise. That is precisely what happened, and it is why *every* regressor tested, including plain linear regression, scored above 92%. These numbers measure the pipeline, not agronomy.

**What the module does demonstrate:** an end-to-end path from a physical soil probe through cloud ingestion to a served prediction, with real sensor inputs at one end and a working API at the other.

**What would fix it:** harvest and weigh a measured plot, and pair those weights with the sensor logs already collected. That is the single highest-value extension of this work.

### Benchmarks

70/30 split, `random_state=42`, features standardised for the distance- and gradient-based models.

| Model | R² |
|---|---|
| **K-Nearest Neighbors (k=5)** | **97.53%** |
| Gradient Boosting | 97.48% |
| Random Forest | 97.26% |
| Linear Regression | 92.50% |
| MLP Regressor | 78.00% |
| SVR (RBF) | 66.21% |

Read the spread, not the winner: the 5-point gap between the top three and linear regression, and the collapse of SVR, reflect how each model handles a clipped linear target — not their agronomic merit.

The deployed artefact is `(KNeighborsRegressor, StandardScaler)` pickled together, so the scaler fitted at training time travels with the model.

---

## Disease detection

**Notebook:** [`Disease Prediction.ipynb`](../ml/notebooks/Disease%20Prediction.ipynb) · **Dataset:** 69 MB, [via Drive](DATA.md)

Classify a photograph of a chilli leaf into one of five conditions.

### Data

| Split | Images |
|---|---|
| Train | 1,150 |
| Validation | 50 |
| Test | 50 |

Five balanced classes: `healthy`, `leaf curl`, `leaf spot`, `whitefly`, `yellowish`.

### Training

`google/vit-base-patch16-224-in21k` fine-tuned with a fresh 5-class head.

| Setting | Value |
|---|---|
| Optimiser | AdamW, lr 2e-5 |
| Loss | Cross-entropy |
| Epochs | 5 |
| Batch size | 32 |
| Input | 224×224, ImageNet normalisation |
| Augmentation | Random horizontal flip |

### Benchmarks

| Model | Accuracy |
|---|---|
| **Vision Transformer (ViT-Base)** | **94.00%** |
| MobileNetV2 | 78.00% |
| EfficientNet | 68.00% |
| ResNet50 | 64.00% |

The 16-point margin over the best CNN is the most interesting result in the project: with roughly 230 images per class, the attention-based model generalised substantially better than convolutional architectures of comparable size.

### Per-class performance

| Class | Precision | Recall | F1 |
|---|---|---|---|
| healthy | 1.00 | 0.80 | 0.89 |
| leaf curl | 0.77 | 1.00 | 0.87 |
| leaf spot | 1.00 | 1.00 | 1.00 |
| whitefly | 1.00 | 1.00 | 1.00 |
| yellowish | 1.00 | 0.90 | 0.95 |

All three errors are the same failure: healthy and yellowish leaves misread as leaf curl. Nothing diseased was ever called healthy — the safer direction for a diagnostic tool, though with 50 test images that is as likely to be luck as design.

### Limitations

- **50 test images.** 94% is 47/50; one image moves the figure two points. Treat it as indicative.
- **Chilli only**, and only these five conditions. Severity is not graded.
- **Field conditions vary.** Images were captured under similar lighting; robustness to weather, shadow and phone-camera variation is untested.
- **No cross-validation** and no confidence calibration — the softmax score is returned as a confidence but was never validated as one.
