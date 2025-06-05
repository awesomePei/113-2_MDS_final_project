import os
import pandas as pd
from flask import Flask, request, render_template, redirect, url_for, jsonify 
from werkzeug.utils import secure_filename
from flask_cors import CORS # Import CORS
import joblib
from utils.preprocess import preprocess_uploaded_dataframe
import numpy as np

app = Flask(__name__)
CORS(app)

CORS(app) 

# Configure the upload folder
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'uploads'))
ALLOWED_EXTENSIONS = {'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CLASSIFICATION_MODEL_PATH = './backend/model/delay_prediction_pipeline.joblib'

try:
    model = joblib.load(CLASSIFICATION_MODEL_PATH)
except Exception as e:
    model = None
    print(f"Failed to load model: {e}")
# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('upload.html')

from flask import jsonify

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part in the request.", 400

    file = request.files['file']

    if file.filename == '':
        return "No selected file.", 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        name, ext = os.path.splitext(filename)
        processed_filename = f"{name}_processed{ext}"
        filepath_processed = os.path.join(app.config['UPLOAD_FOLDER'], processed_filename)

        try:
            file.save(filepath)

            # 讀取上傳的 CSV 檔案
            df = pd.read_csv(filepath)
            # 擷取指定欄位資料
            columns_to_return = ['Shipping Mode', 'order date (DateOrders)', 'Customer City', 'Customer Country', 'Latitude', 'Longitude']
            selected_df = df[columns_to_return]
            # 前處理資料
            preprocessed_df = preprocess_uploaded_dataframe(df, encoder_path='./backend/model/one_hot_encoder.joblib')
            preprocessed_df.to_csv(filepath_processed, index=False)
            print(f"File '{filename}' uploaded and preprocessed successfully.")

            # 回傳 JSON 給前端
            return jsonify(selected_df.to_dict(orient='records'))

        except pd.errors.EmptyDataError:
            print("empty")
            return "Uploaded CSV file is empty.", 400
        except pd.errors.ParserError as e:
            print("parser")
            return f"Error parsing CSV file: {e}", 400
        except Exception as e:
            print(e)
            return f"An error occurred during file processing: {e}", 500
    else:
        return 'Invalid file type. Only CSV files are allowed.', 400



@app.route('/prediction', methods=['POST'])
def prediction():
    from joblib import load

    # Get filename from JSON body or query param
    data = request.get_json() or request.args
    file_name = data.get('file_name')

    if not file_name:
        return jsonify({'error': 'Missing file_name parameter'}), 400

    file_path = os.path.join('./backend/uploads', f"{file_name}_processed.csv")

    if not os.path.isfile(file_path):
        return jsonify({'error': f"File not found: {file_path}"}), 404

    # Load model (if not already loaded globally)
    try:
        model = load('./backend/model/delay_prediction_pipeline.joblib')
    except Exception as e:
        return jsonify({'error': f'Model could not be loaded: {e}'}), 500

    try:
        # Load the processed CSV
        df = pd.read_csv(file_path)

        # Make predictions
        predictions = model.predict_proba(df)

        predictions = predictions[:, 1]
        # Add prediction results to a new column
        result_df = df.copy()
        result_df['PredictedValue'] = predictions

        # Keep only 'Order Id' and 'PredictedValue' columns
        result_df = result_df[['Order Id', 'PredictedValue']]

        # Save to ./backend/Classification_prediction/<file_name>_prediction.csv
        output_dir = './backend/Classification_prediction'
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{file_name}_prediction.csv")
        result_df.to_csv(output_path, index=False)

        return jsonify({
            'predictions': predictions.tolist(),
            'saved_to': output_path
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/regression', methods=['POST'])
def regression_prediction():
    from joblib import load

    # Get filename from JSON body or query param
    data = request.get_json() or request.args
    file_name = data.get('file_name')

    if not file_name:
        return jsonify({'error': 'Missing file_name parameter'}), 400

    file_path = os.path.join('./backend/uploads', f"{file_name}_processed.csv")

    if not os.path.isfile(file_path):
        return jsonify({'error': f"File not found: {file_path}"}), 404

    # Load regression model
    try:
        model = load('./backend/model/shipping_real_regression_pipeline.joblib')
    except Exception as e:
        return jsonify({'error': f'Model could not be loaded: {e}'}), 500

    try:
        # Load processed data
        df = pd.read_csv(file_path)
        # Perform regression prediction
        predictions = model.predict(df)

        # Add prediction results to a new column
        result_df = df.copy()
        result_df['PredictedValue'] = predictions

        # Keep only 'Order Id' and 'PredictedValue' columns
        result_df = result_df[['Order Id', 'PredictedValue']]

        # Save result to Regression_prediction directory
        output_dir = './backend/Regression_prediction'
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{file_name}_prediction.csv")
        result_df.to_csv(output_path, index=False)

        return jsonify({
            'predictions': predictions.tolist(),
            'saved_to': output_path
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/dashboard/<filename>', methods=['GET'])
def dashboard_data(filename):
    PREDICTION_FOLDER = './backend/Classification_prediction'
    try:
        data_path = os.path.join(UPLOAD_FOLDER, f'{filename}.csv')
        processed_path = os.path.join(UPLOAD_FOLDER, f'{filename}_processed.csv')
        pred_path = os.path.join(PREDICTION_FOLDER, f'{filename}_prediction.csv')

        df = pd.read_csv(data_path)
        pred_df = pd.read_csv(pred_path)
        processed_df = pd.read_csv(processed_path)

        # Merge with prediction
        merged = pd.merge(df, pred_df, on='Order Id', how='left')
        merged['predicted_late'] = merged['PredictedValue'] > 0.5

        # 1. Delays by Category
        delay_by_category = (
            merged.groupby('Category Name')['predicted_late']
            .mean()
            .sort_values(ascending=False)
            .round(2)
            .to_dict()
        )

        # 2. Shipment Delay Overview
        shipment_overview = {
            'Late': int(merged['predicted_late'].sum()),
            'On Time': int((~merged['predicted_late']).sum())
        }


        xgb_model = model.named_steps['xgb']

        # Get feature importances
        feature_importances = xgb_model.feature_importances_

        # Get feature names from the training data
        feature_names = processed_df.columns

        # Create a pandas Series for better visualization
        feature_importances_series = pd.Series(feature_importances, index=feature_names)

        # Sort feature importances in descending order
        sorted_feature_importances = feature_importances_series.sort_values(ascending=False)

        top_10_features = sorted_feature_importances.sort_values(ascending=False).head(10)

        feature_importance_dict = {
            str(k): float(v) for k, v in top_10_features.items()
        }
        #     'Shipping Mode': 0.22,
        #     'Order Item Discount': 0.18,
        #     'Order Region': 0.16,
        #     'Product Category Id': 0.12,
        #     'Order Item Quantity': 0.09,
        #     'Customer Segment': 0.07,
        #     'Sales per customer': 0.06,
        #     'Order Profit Per Order': 0.05,
        #     'Order Hour': 0.05
        # }

        return jsonify({
            'delayByCategory': delay_by_category,
            'shipmentOverview': shipment_overview,
            'featureImportance': feature_importance_dict
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) # Listens on all public IPs at port 5000