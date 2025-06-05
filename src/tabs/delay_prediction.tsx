// pages/DelayPrediction.tsx
import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import MapWithMarkers from '../components/MapWithMarkers';
import UploadPreview from '../components/UploadPreview';
import Dashboard from '../components/dashBoard';

const DelayPrediction = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<number[] | null>(null);
  const [regressionResults, setRegressionResults] = useState<number[] | null>(null);
  const [uploadedData, setUploadedData] = useState<Record<string, string>[]>([]);
  const [fileBaseName, setFileBaseName] = useState<string>(''); // ✅ NEW

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPredictions(null);
      setRegressionResults(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !selectedFile ||
      (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv'))
    ) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // 上傳檔案
      const uploadResponse = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        await uploadResponse.text();
        return;
      }

      const uploaded = await uploadResponse.json();
      setUploadedData(uploaded);
      setSelectedFile(null);

      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setFileBaseName(baseName); // ✅ NEW

      // 呼叫分類預測 API
      const predictionResponse = await fetch('http://localhost:5001/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: baseName }),
      });

      if (!predictionResponse.ok) {
        await predictionResponse.text();
        return;
      }

      const predictionData = await predictionResponse.json();
      setPredictions(predictionData.predictions);

      // 呼叫回歸預測 API
      const regressionResponse = await fetch('http://localhost:5001/regression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_name: baseName }),
      });

      if (!regressionResponse.ok) {
        await regressionResponse.text();
        return;
      }

      const regressionData = await regressionResponse.json();
      setRegressionResults(regressionData.predictions);
    } catch (error) {
      console.error('處理過程出錯:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl w-full max-w-4xl p-10 text-gray-900 flex flex-col gap-10">
        {/* 上傳區塊 */}
        {uploadedData.length === 0 && (
          <div className="bg-white/90 rounded-2xl shadow-md p-6 flex flex-col justify-center">
            <FileUpload
              isLoading={isLoading}
              selectedFile={selectedFile}
              handleFileChange={handleFileChange}
              handleSubmit={handleSubmit}
            />
          </div>
        )}

        {/* 預覽與地圖區塊 */}
        {uploadedData.length > 0 && (
          <>
            <div className="mt-6 max-h-[400px] overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white">
              <UploadPreview
                uploadedData={uploadedData}
                predictions={predictions}
                regressionResults={regressionResults}
              />
            </div>

            <MapWithMarkers
              data={uploadedData}
              predictions={predictions}
              regressionResults={regressionResults}
            />
          </>
        )}
      </div>
      {/* <Heatmap filename={fileBaseName} /> */}
    </div>
          <Dashboard filename={fileBaseName}/>
    </div>
  );
};

export default DelayPrediction;
