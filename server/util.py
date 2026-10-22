import os
import json
import pickle
import numpy as np

__locations = None
__data_columns = None
__model = None

def get_estimated_price(location, sqft, bhk, bath):
    global __data_columns
    global __model

    # Locate the dummy variable index for the requested location
    try:
        loc_index = __data_columns.index(location.lower().strip())
    except ValueError:
        loc_index = -1

    # Feature array layout: [total_sqft, bath, bhk, location_1, location_2, ...]
    x = np.zeros(len(__data_columns))
    x[0] = float(sqft)
    x[1] = float(bath)
    x[2] = int(bhk)
    
    if loc_index >= 0:
        x[loc_index] = 1.0

    return round(float(__model.predict([x])[0]), 2)

def load_saved_artifacts():
    print("loading saved artifacts...start")
    global __data_columns
    global __locations
    global __model

    # Resolve absolute path to the artifacts directory relative to util.py
    base_dir = os.path.dirname(os.path.abspath(__file__))
    artifacts_dir = os.path.join(base_dir, "artifacts")

    # Load data columns config
    columns_path = os.path.join(artifacts_dir, "columns.json")
    with open(columns_path, "r") as f:
        __data_columns = json.load(f)['data columns']
        # Slicing from index 3 extracts only the location names
        __locations = __data_columns[3:]

    # Load trained pickle model
    model_path = os.path.join(artifacts_dir, "banglore_home_prices_model.pickle")
    if __model is None:
        with open(model_path, 'rb') as f:
            __model = pickle.load(f)
            
    print("loading saved artifacts...done")

def get_location_names():
    return __locations

def get_data_columns():
    return __data_columns

if __name__ == '__main__':
    load_saved_artifacts()
    print("Locations loaded:", len(get_location_names()))
    print("Test prediction (1st Phase JP Nagar):", get_estimated_price('1st Phase JP Nagar', 1000, 2, 2))