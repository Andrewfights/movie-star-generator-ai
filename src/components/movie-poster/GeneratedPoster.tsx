
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface GeneratedPosterProps {
  imageUrl: string;
  onDownload: () => void;
  onReset: () => void;
}

const GeneratedPoster = ({ imageUrl, onDownload, onReset }: GeneratedPosterProps) => {
  if (!imageUrl) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="aspect-[2/3] relative bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Generated movie poster"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex justify-center gap-4">
        <Button
          onClick={onDownload}
          variant="secondary"
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          Download Poster
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

export default GeneratedPoster;
