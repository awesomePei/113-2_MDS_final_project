import os
import pandas as pd
from flask import Flask, request, render_template, redirect, url_for, jsonify 
from werkzeug.utils import secure_filename
from flask_cors import CORS # Import CORS
import joblib
from utils.preprocess import preprocess_uploaded_dataframe

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

            # --- Read the saved CSV into a DataFrame ---
            # Use 'engine="python"' or 'low_memory=False' if you encounter DtypeWarning
            df = pd.read_csv(filepath)
            # --- Call your preprocessing function ---
            preprocessed_df = preprocess_uploaded_dataframe(df, encoder_path='./backend/model/one_hot_encoder.joblib')
            preprocessed_df.to_csv(filepath_processed, index=False)
            # --- Now you can work with preprocessed_df ---
            # For demonstration, let's just show its new shape and columns
            print(f"File '{filename}' uploaded and preprocessed successfully.")

            # You might want to save the preprocessed_df, or pass it to a model
            # For now, let's just return a success message.
            return f'File "{filename}" uploaded and preprocessed successfully! New shape: {preprocessed_df.shape}'

        except pd.errors.EmptyDataError:
            return "Uploaded CSV file is empty.", 400
        except pd.errors.ParserError as e:
            return f"Error parsing CSV file: {e}", 400
        except Exception as e:
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
        predictions = model.predict(df)

        # Copy original DataFrame and add predictions
        result_df = df.copy()
        result_df['Prediction'] = predictions

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) # Listens on all public IPs at port 5000