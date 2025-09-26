import json
import pickle
import numpy as np
import os
import pandas as pd

__crop = None
__data_columns = None
__model = None

# ---------------- Binning functions ----------------
def get_rainfall_bin(rainfall):
    if rainfall < 300:
        return "Rainfall_Bin_Low"
    elif rainfall < 700:
        return "Rainfall_Bin_Medium"
    elif rainfall < 1000:
        return "Rainfall_Bin_High"
    else:
        return "Rainfall_Bin_Very High"

def get_temp_bin(temp):
    if temp < 15:
        return "Temp_Bin_Cold"
    elif temp < 25:
        return "Temp_Bin_Mild"
    elif temp < 30:
        return "Temp_Bin_Warm"
    else:
        return "Temp_Bin_Hot"

def get_harvest_bin(days):
    if days < 90:
        return "Harvest_Bin_Short"
    elif days < 120:
        return "Harvest_Bin_Medium"
    elif days < 150:
        return "Harvest_Bin_Long"
    else:
        return "Harvest_Bin_Very Long"

# ---------------- Yield prediction ----------------
def get_estimated_yield(fertilizer, irrigation, region, soil, crop, weather,
                        rainfall, temperature, harvest_days):
    global __data_columns, __model
    x = np.zeros(len(__data_columns))

    # Boolean features
    x[__data_columns.index('Fertilizer_Used')] = int(fertilizer)
    x[__data_columns.index('Irrigation_Used')] = int(irrigation)

    # Categorical features + binned numeric features
    features = [
        region,
        soil,
        crop,
        weather,
        get_rainfall_bin(rainfall),
        get_temp_bin(temperature),
        get_harvest_bin(harvest_days)
    ]

    for feature in features:
        if feature in __data_columns:
            x[__data_columns.index(feature)] = 1
        else:
            print(f"Warning: {feature} not found in columns.")

    # Convert to DataFrame to match training feature names
    x_df = pd.DataFrame([x], columns=__data_columns)
    return round(__model.predict(x_df)[0], 2)

# ---------------- Utility functions ----------------
def get_crop_names():
    global __crop
    return __crop

def load_saved_artifacts():
    global __data_columns, __crop, __model
    print('Loading saved artifacts...')

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    columns_path = os.path.join(BASE_DIR, "artifacts", "columns.json")
    model_path = os.path.join(BASE_DIR, "artifacts", "yield_prediction_model.pickle")

    with open(columns_path, "r") as f:
        __data_columns = json.load(f)['data_columns']
        __crop = __data_columns[12:18]

    with open(model_path, 'rb') as f:
        __model = pickle.load(f)

    print('Done')

# ---------------- Main ----------------
if __name__ == '__main__':
    load_saved_artifacts()
    print("Available crops:", get_crop_names())

    

    print("Predicted Yield:", get_estimated_yield(
        fertilizer=0,
        irrigation=1,
        region="Region_West",
        soil="Soil_Type_Sandy",
        crop="Crop_Cotton",
        weather="Weather_Condition_Cloudy",
        rainfall=900,
        temperature=28,
        harvest_days=122
    ), "tons/hectare")

    print("Predicted Yield:", get_estimated_yield(
        fertilizer=1,
        irrigation=0,
        region="Region_West",
        soil="Soil_Type_Loam",
        crop="Crop_Barley",
        weather="Weather_Condition_Sunny",
        rainfall=100,
        temperature=20,
        harvest_days=80
    ), "tons/hectare")
