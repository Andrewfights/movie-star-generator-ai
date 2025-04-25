
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const GENRES = [
  "Action",
  "Sci-Fi",
  "Romance",
  "Horror",
  "Fantasy",
  "Comedy"
];

const MoviePosterGenerator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !selectedGenre) {
      toast({
        title: "Missing information",
        description: "Please upload a photo and select a genre",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    // TODO: Implement actual API call here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratedImage("/placeholder.svg");
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'movie-poster.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-950 text-white animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Become the Star of Your Own Movie!
          </h1>
          <p className="text-gray-400">
            Upload your photo, pick a genre, and let AI create your movie poster
          </p>
        </header>

        <div className="space-y-6">
          <div className="space-y-4">
            <label
              htmlFor="photo-upload"
              className="block p-8 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-500 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <div className="mt-2">
                  <input
                    id="photo-upload"
                    name="photo-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                  {selectedFile ? (
                    <p className="text-sm text-gray-300">
                      Selected: {selectedFile.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Click to upload or drag and drop
                    </p>
                  )}
                </div>
              </div>
            </label>

            <Select onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full bg-gray-900 border-gray-800">
                <SelectValue placeholder="Choose a genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFile || !selectedGenre}
            >
              {isGenerating ? "Generating..." : "Generate My Movie Poster"}
            </Button>
          </div>

          {generatedImage && (
            <div className="space-y-4 animate-fade-in">
              <div className="aspect-[2/3] relative bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={generatedImage}
                  alt="Generated movie poster"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Download Poster
                </Button>
                <Button
                  onClick={() => setGeneratedImage("")}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviePosterGenerator;
