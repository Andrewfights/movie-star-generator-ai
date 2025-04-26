
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface GeneratedImageProps {
  imageUrl: string;
  onDownload: () => void;
  onReset: () => void;
  generatorId?: string;
}

const GeneratedImage = ({ imageUrl, onDownload, onReset, generatorId = "image" }: GeneratedImageProps) => {
  if (!imageUrl) return null;

  const isActionFigure = generatorId === 'bubble-toy';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`aspect-[2/3] relative bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 ${
        isActionFigure ? 'flex items-center justify-center p-2' : ''
      }`}>
        <img
          src={imageUrl}
          alt={`Generated ${generatorId}`}
          className={`${
            isActionFigure 
              ? 'w-full h-full object-contain'
              : 'w-full h-full object-contain'
          }`}
          onError={(e) => {
            console.error("Image failed to load:", imageUrl);
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
          }}
        />
      </div>
      <div className="flex justify-center gap-4">
        <Button
          onClick={onDownload}
          variant="secondary"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default GeneratedImage;

