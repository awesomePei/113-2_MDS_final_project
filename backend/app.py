from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({"error": "沒有檔案"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "檔案名稱為空"}), 400

    try:
        df = pd.read_csv(file)
        preview_df = df.head().fillna(value='')
        print(preview_df)
        preview = preview_df.to_dict(orient='records')
        columns = list(preview_df.columns)

        return jsonify({
            "message": "接收成功",
            "rows": len(df),
            "preview": preview,
            "columns": columns
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


import sqlite3
import pandas as pd
from flask import jsonify

@app.route('/data', methods=['GET'])
def get_data():
    conn = sqlite3.connect('data.db')

    df = pd.read_sql_query("SELECT * FROM records LIMIT 5", conn)
    conn.close()

    preview = df.fillna(value='').to_dict(orient='records')

    return jsonify({
        'message': '讀取成功',
        'data': preview
    })



if __name__ == '__main__':
    app.run(debug=True)
