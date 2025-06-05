import React, { useState } from 'react';

const DelayPrediction = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<number[] | null>(null); // Classification predictions
  const [regressionResults, setRegressionResults] = useState<number[] | null>(null); // Regression predictions
  const [fileBaseName, setFileBaseName] = useState<string>(''); // Extracted file name without extension

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPredictions(null);
      setRegressionResults(null);
      setMessage('');
      const baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
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
      console.error('Error uploading file:', error);
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
      console.error('Error fetching prediction:', error);
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
      console.error('Error fetching regression prediction:', error);
      setMessage(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CSV File Upload for Delay Prediction</h1>
      <p>Upload a CSV file to get predictions.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '20px 0' }}>
        <label htmlFor="csvFile" style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
          Choose CSV File:
        </label>
        <input
          type="file"
          id="csvFile"
          name="csvFile"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em'
          }}
        >
          {isLoading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      <button
        onClick={handlePredict}
        disabled={!fileBaseName || isLoading}
        style={{
          padding: '10px 15px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1em',
          marginTop: '10px'
        }}
      >
        {isLoading ? 'Predicting...' : 'Get Predictions'}
      </button>

      <button
        onClick={handleRegression}
        disabled={!fileBaseName || isLoading}
        style={{
          padding: '10px 15px',
          backgroundColor: '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1em',
          marginTop: '10px'
        }}
      >
        {isLoading ? 'Predicting (regression)...' : 'Get Regression Predictions'}
      </button>

      {message && (
        <p style={{
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: message.includes('successful') ? '#e6ffe6' : '#ffe6e6',
          color: message.includes('successful') ? '#338833' : '#aa3333'
        }}>
          {message}
        </p>
      )}

      {predictions && (
        <div style={{ marginTop: '20px' }}>
          <h3>Classification Predictions:</h3>
          <ul>
            {predictions.map((pred, index) => (
              <li key={index}>Row {index + 1}: {pred}</li>
            ))}
          </ul>
        </div>
      )}

      {regressionResults && (
        <div style={{ marginTop: '20px' }}>
          <h3>Regression Predictions:</h3>
          <ul>
            {regressionResults.map((pred, index) => (
              <li key={index}>Row {index + 1}: {pred.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DelayPrediction;