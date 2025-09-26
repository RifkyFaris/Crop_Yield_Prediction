from flask import Flask, request, jsonify
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

# ---------------- Endpoint to get crop names ----------------
@app.route('/get_crop_names', methods=['GET'])
def get_crop_names():
    crops = util.get_crop_names()
    return jsonify({'crops': crops})

# ---------------- Endpoint to predict crop yield ----------------
@app.route('/predict_yield', methods=['POST'])
def predict_yield():
    data = request.get_json()

    try:
        fertilizer = int(data['fertilizer'])
        irrigation = int(data['irrigation'])
        region = data['region']
        soil = data['soil']
        crop = data['crop']
        weather = data['weather']
        rainfall = float(data['rainfall'])
        temperature = float(data['temperature'])
        harvest_days = int(data['harvest_days'])

        estimated_yield = util.get_estimated_yield(
            fertilizer=fertilizer,
            irrigation=irrigation,
            region=region,
            soil=soil,
            crop=crop,
            weather=weather,
            rainfall=rainfall,
            temperature=temperature,
            harvest_days=harvest_days
        )

        return jsonify({'estimated_yield': estimated_yield})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ---------------- Main ----------------
if __name__ == "__main__":
    print("Starting Python Flask Server For Crop Yield Prediction...")
    util.load_saved_artifacts()
    app.run(debug=True)
