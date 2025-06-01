from flask import Flask, jsonify, request
from services.predtion import delay_days_prediction
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/predict_delay", methods=["GET"])
def predict_delay():
    id = request.args.get("id")
    if not id:
        return jsonify({"error": "Missing ID parameter"}), 400

    prediction = delay_days_prediction(id)
    if prediction is None:
        return jsonify({"error": "ID not found or prediction failed"}), 404
    
    return jsonify({"id": id, "predicted_delay_days": f'{prediction} days'})


if __name__ == '__main__':
    app.run(debug=True)
