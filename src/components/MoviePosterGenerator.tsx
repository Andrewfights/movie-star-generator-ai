import React, { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import ImageUploadForm from './movie-poster/ImageUploadForm';
import ImagePreview from './movie-poster/ImagePreview';
import GeneratedPoster from './movie-poster/GeneratedPoster';
import type { ModelId } from './movie-poster/ImageUploadForm';

const MoviePosterGenerator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>("dall-e-3");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedFile || !selectedGenre || !apiKey || !movieTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload a photo, select a genre, provide a movie title, and an API key",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Create a movie poster for "${movieTitle}" in the ${selectedGenre} genre featuring this person as the main character. Make it look like a professional Hollywood movie poster with appropriate tagline and visual effects for the ${selectedGenre} genre. The movie title "${movieTitle}" should be prominently displayed.`;
      
      // Create request body based on the selected model
      let requestBody: any = {
        model: selectedModel,
        prompt: prompt,
        n: 1,
        quality: "standard", // Updated to a supported value
        user: "movieposter-app-user",
      };
      
      // Add model-specific parameters
      if (selectedModel === "dall-e-3") {
        requestBody.size = "1024x1792";
        requestBody.response_format = "url";
        requestBody.style = "vivid"; // Only DALL-E 3 supports the style parameter
      } else if (selectedModel === "gpt-image-1") {
        requestBody.size = "1024x1024";
      }
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedImage(data.data[0].url);
        toast({
          title: "Success!",
          description: "Your movie poster has been generated",
        });
      } else {
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
    setMovieTitle("");
    setSelectedModel("dall-e-3");
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

        <ImageUploadForm
          onFileSelect={handleFileSelect}
          onGenerate={handleGenerate}
          onApiKeySet={setApiKey}
          setMovieTitle={setMovieTitle}
          setSelectedGenre={setSelectedGenre}
          setSelectedModel={setSelectedModel}
          movieTitle={movieTitle}
          selectedGenre={selectedGenre}
          selectedModel={selectedModel}
          isGenerating={isGenerating}
          selectedFile={selectedFile}
          apiKey={apiKey}
          fileInputRef={fileInputRef}
        />

        <ImagePreview
          filePreview={filePreview}
          selectedFileName={selectedFile?.name}
        />

        <GeneratedPoster
          imageUrl={generatedImage}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default MoviePosterGenerator;
