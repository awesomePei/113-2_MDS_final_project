import React, { useState } from 'react';

const DelayPrediction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setMessage(null);
    setPreview(null);
    setColumns([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("請先選擇一個 CSV 檔案！");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("伺服器回應失敗");

      const data = await res.json();
      setMessage(`✅ 成功上傳！共 ${data.rows} 筆資料`);
      setPreview(data.preview);
      setColumns(data.columns);
    } catch (err: any) {
      setMessage(`❌ 上傳失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 新增：取得資料按鈕的 handler
  const handleGetData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/data", {
        method: "GET",
      });

      if (!res.ok) throw new Error("伺服器回應失敗");

      const data = await res.json();
      setMessage(`📥 成功取得資料！共 ${data.rows} 筆`);
      setPreview(data.preview);
      setColumns(data.columns);
    } catch (err: any) {
      setMessage(`❌ 取得資料失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Delay Prediction - 上傳 CSV</h2>

      <label className="block mb-4">
        <span className="text-gray-700 font-medium">選擇 CSV 檔案</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
      </label>

      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white font-medium transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "上傳中..." : "上傳"}
        </button>

        <button
          onClick={handleGetData}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white font-medium transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? "讀取中..." : "取得資料"}
        </button>
      </div>

      {message && (
        <div className="mt-4 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-md">
          {message}
        </div>
      )}

      {/* 預覽表格 */}
      {preview && preview.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">預覽前 5 筆資料</h3>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full table-auto border-collapse text-sm text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-3 py-2 border">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    {columns.map((col, j) => (
                      <td key={j} className="px-3 py-2 border">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelayPrediction;
