
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ApiKeyInput from './ApiKeyInput';

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
  const [apiKey, setApiKey] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        
        // Create a preview of the selected image
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
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
    if (!selectedFile || !selectedGenre || !apiKey) {
      toast({
        title: "Missing information",
        description: "Please upload a photo, select a genre, and provide an API key",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get the image as a data URL
      const imageDataUrl = await readFileAsDataURL(selectedFile);
      
      // Create the prompt including user's genre
      const prompt = `Create a movie poster in the ${selectedGenre} genre featuring this person as the main character. Make it look like a professional Hollywood movie poster with appropriate title, tagline, and visual effects for the ${selectedGenre} genre.`;
      
      // Call OpenAI API to generate image
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1792", // Typical movie poster ratio
          response_format: "url",
          quality: "hd",
          style: "vivid",
          user: "movieposter-app-user",
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedImage(data.data[0].url);
        toast({
          title: "Success!",
          description: "Your movie poster has been generated",
        });
      } else {
        // Handle API error
        const errorMessage = data.error?.message || 'An error occurred during image generation';
        toast({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("OpenAI API error:", data);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Generation failed",
        description: "There was a problem connecting to the image generation service",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

  const handleReset = () => {
    setGeneratedImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedGenre("");
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
          <ApiKeyInput onKeySet={setApiKey} />
          
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
                    ref={fileInputRef}
                  />
                  {filePreview ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="max-h-40 max-w-full object-contain rounded"
                      />
                      <p className="text-sm text-gray-300 mt-2">
                        Selected: {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Click to upload or drag and drop
                    </p>
                  )}
                </div>
              </div>
            </label>

            <Select onValueChange={setSelectedGenre} value={selectedGenre}>
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
              disabled={isGenerating || !selectedFile || !selectedGenre || !apiKey}
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
                  onClick={handleReset}
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
