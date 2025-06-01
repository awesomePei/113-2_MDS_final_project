import React, { useState } from 'react';

const DelayPrediction = () => {
  const [inputId, setInputId] = useState('');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrediction(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/predict_delay?id=${inputId}`);
      if (!res.ok) {
        throw new Error('ID not found');
      }
      const data = await res.json();
      console.log(data)
      setPrediction(data.predicted_delay_days);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Delay Prediction</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="Enter ID"
          className="border px-3 py-2 w-full rounded mb-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Predict
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">❌ {error}</p>}
      {prediction !== null && (
        <p className="text-green-600 font-semibold">
          ✅ Predicted Delay Days: {prediction}
        </p>
      )}
    </div>
  );
};

export default DelayPrediction;
