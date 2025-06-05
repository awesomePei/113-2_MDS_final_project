// delay_prediction.tsx
import React, { useState } from 'react';

const DelayPrediction = () => {
  // State to hold the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State to manage messages from the backend (e.g., success or error)
  const [message, setMessage] = useState<string>('');
  // State to indicate loading status during upload
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handler for when a file is selected
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage(''); // Clear previous messages
    } else {
      setSelectedFile(null);
    }
  };

  // Handler for form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior (page reload)

    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
        setMessage('Please upload a CSV file.');
        return;
    }

    setIsLoading(true); // Set loading state
    setMessage('Uploading...');

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', selectedFile); // 'file' must match the name expected by your Flask backend (request.files['file'])

    try {
      // Make the POST request to your Flask backend
      // Assuming your Flask app is running on http://localhost:5000
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData, // FormData automatically sets the correct Content-Type header
      });

      if (response.ok) { // Check if the response status is 2xx
        const result = await response.text(); // Get the response text from Flask
        setMessage(`Upload successful: ${result}`);
        setSelectedFile(null); // Clear the selected file input
      } else {
        const errorText = await response.text(); // Get error message from Flask
        setMessage(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false); // Reset loading state
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
          name="csvFile" // This name doesn't matter for Flask, only 'file' in formData.append
          accept=".csv" // Suggests only CSV files in the file picker
          onChange={handleFileChange}
          disabled={isLoading} // Disable input during upload
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        <button
          type="submit"
          disabled={!selectedFile || isLoading} // Disable button if no file selected or uploading
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

      {selectedFile && (
        <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#555' }}>
          Selected file: {selectedFile.name} ({selectedFile.size} bytes)
        </p>
      )}
    </div>
  );
};

export default DelayPrediction;