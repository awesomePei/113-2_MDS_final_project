import React, { useState } from 'react';

const DelayPrediction = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<number[] | null>(null);
  const [regressionResults, setRegressionResults] = useState<number[] | null>(null);
  const [fileBaseName, setFileBaseName] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPredictions(null);
      setRegressionResults(null);
      setMessage('');
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setFileBaseName(baseName);
    } else {
      setSelectedFile(null);
      setFileBaseName('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
      setMessage('Please upload a CSV file.');
      return;
    }

    setIsLoading(true);
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        setMessage(`Upload successful: ${result}`);
        setSelectedFile(null);
      } else {
        const errorText = await response.text();
        setMessage(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      setMessage(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!fileBaseName) {
      setMessage('Please upload a file before requesting predictions.');
      return;
    }

    setIsLoading(true);
    setMessage('Fetching predictions...');

    try {
      const response = await fetch('http://localhost:5001/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: fileBaseName }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions);
        setMessage('Prediction successful.');
      } else {
        const errorText = await response.text();
        setMessage(`Prediction failed: ${errorText}`);
      }
    } catch (error) {
      setMessage(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegression = async () => {
    if (!fileBaseName) {
      setMessage('Please upload a file before requesting regression predictions.');
      return;
    }

    setIsLoading(true);
    setMessage('Fetching regression predictions...');

    try {
      const response = await fetch('http://localhost:5001/regression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: fileBaseName }),
      });

      if (response.ok) {
        const data = await response.json();
        setRegressionResults(data.predictions);
        setMessage('Regression prediction successful.');
      } else {
        const errorText = await response.text();
        setMessage(`Regression prediction failed: ${errorText}`);
      }
    } catch (error) {
      setMessage(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg max-w-xl w-full p-8 text-gray-900">
        <h1 className="text-3xl font-bold text-center mb-2">Delay Prediction</h1>
        <p className="text-center text-gray-700 mb-6">Upload a CSV file to get predictions.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="file:px-4 file:py-2 file:border file:border-gray-300 file:rounded-lg file:bg-white/60 file:text-gray-700 hover:file:bg-white/80 transition"
          />

          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className="px-4 py-2 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 shadow-md backdrop-blur-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={handlePredict}
            disabled={!fileBaseName || isLoading}
            className="px-4 py-2 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 shadow-md backdrop-blur-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Predicting...' : 'Get Predictions'}
          </button>

          <button
            onClick={handleRegression}
            disabled={!fileBaseName || isLoading}
            className="px-4 py-2 rounded-lg bg-white/60 hover:bg-white/80 border border-white/40 shadow-md backdrop-blur-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Predicting (regression)...' : 'Get Regression Predictions'}
          </button>
        </div>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg border text-sm ${
              message.includes('successful')
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-red-100 border-red-300 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {predictions && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Classification Predictions:</h3>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              {predictions.map((pred, index) => (
                <li key={index}>Row {index + 1}: {pred}</li>
              ))}
            </ul>
          </div>
        )}

        {regressionResults && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Regression Predictions:</h3>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              {regressionResults.map((pred, index) => (
                <li key={index}>Row {index + 1}: {pred.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelayPrediction;
