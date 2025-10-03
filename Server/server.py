import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from . import util

# Get absolute path to the Client folder
CLIENT_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Client'))

app = Flask(__name__)
CORS(app)

# ---------------- Serve frontend ----------------
@app.route('/')
def serve_index():
    return send_from_directory(CLIENT_FOLDER, 'app.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(CLIENT_FOLDER, filename)

# ---------------- API endpoints ----------------
@app.route('/get_crop_names', methods=['GET'])
def get_crop_names():
    crops = util.get_crop_names()
    return jsonify({'crops': crops})

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

if __name__ == '__main__':
    util.load_saved_artifacts()
    app.run(debug=True)
