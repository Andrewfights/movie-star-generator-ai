
import React from 'react';

interface ImagePreviewProps {
  filePreview: string | null;
  selectedFileName?: string;
}

const ImagePreview = ({ filePreview, selectedFileName }: ImagePreviewProps) => {
  if (!filePreview) return null;

  return (
    <div className="flex flex-col items-center">
      <img 
        src={filePreview} 
        alt="Preview" 
        className="max-h-40 max-w-full object-contain rounded"
      />
      {selectedFileName && (
        <p className="text-sm text-gray-300 mt-2">
          Selected: {selectedFileName}
        </p>
      )}
    </div>
  );
};

export default ImagePreview;
