import React from 'react';

interface FileUploadProps {
  isLoading: boolean;
  selectedFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  isLoading,
  selectedFile,
  handleFileChange,
  handleSubmit,
}) => (
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
);

export default FileUpload;
