# Data and large assets

Most of this project is committed. Three assets are not, because of size or because they carry credentials.

| Asset | Size | Why it is external | Link |
|---|---|---|---|
| `disease_model.pth` | 343 MB | Exceeds GitHub's file limit | [Download](https://drive.google.com/file/d/14-23-b4YtxMpg_rnom65whN3rbz6rsCI/view) |
| Chilli leaf images | 69 MB | Large, and only needed to retrain | [Download](https://drive.google.com/drive/folders/1HrhfqsVodF_xJw6OT49loYei_nRlDOTd) |
| ESP32 firmware | — | Contains Wi-Fi and ThingSpeak credentials | [View](https://docs.google.com/document/d/1QhVWsExaii1ppKIEPD_oWN_gtc14UCqahXl2J7_BAZU/edit) |

## Setup

Disease detection is the only feature needing an external file. Download the weights and place them in `models/`:

```
models/
├── disease_model.pth          ← from Drive
├── recommendation_model.pkl   ← committed
└── yield_model.pkl            ← committed
```

To retrain the disease model, download the image dataset and extract it so that `chilli_plant_images/{train,val,test}/<class>/` sits at the repository root — the layout [`Disease Prediction.ipynb`](../ml/notebooks/Disease%20Prediction.ipynb) expects.

## Committed datasets

In [`ml/data/`](../ml/data/):

| File | Rows | Contents |
|---|---|---|
| `all_crops_data.csv` | 2,934 | Crop recommendation training set — N, P, K, temperature, humidity, label (23 crops) |
| `Crop_recommendation.csv` | 2,200 | Public source dataset, 22 crops, additionally carries pH and rainfall |
| `chilli_data.xlsx` | 734 | Sensor logs from the chilli deployment — the yield model's inputs |
| `corn.csv` | 3,053 | Sensor logs from the earlier firmware-validation run on a corn crop |

`corn.csv` is not training data. It comes from the first field run, made on a
corn plot to confirm that the firmware, the RS485 polling loop and the
ThingSpeak uplink worked against a real crop. By the time the node was reliable
the corn season had ended, so the production deployment moved to chilli and
`chilli_data.xlsx` became the yield model's input. Both files share the same
seven-channel schema, which is what makes them directly comparable.

The dataset used by the survey-paper notebook (`crop yield data sheet.xlsx`) is a
third-party sample cited in the paper and is not included here.

`all_crops_data.csv` is `Crop_recommendation.csv` reduced to the five features the hardware could measure, with 734 rows of our own chilli readings appended. That append is the source of the class imbalance noted in [models.md](models.md#limitations).

## Committed models

| File | Size | Contents |
|---|---|---|
| `yield_model.pkl` | 43 KB | Tuple of `(KNeighborsRegressor, StandardScaler)` |
| `recommendation_model.pkl` | 5.7 MB | `RandomForestClassifier`, 100 trees, 23 classes |

Both were pickled with **scikit-learn 1.6.1** and will not load reliably on another version. Pickles execute code on load — only unpickle files you trust.
