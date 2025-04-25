import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import ImageUploadForm from './movie-poster/ImageUploadForm';
import ImagePreview from './movie-poster/ImagePreview';
import GeneratedPoster from './movie-poster/GeneratedPoster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { ModelId, AspectRatioId } from '@/types/generators';

interface SavedPoster {
  id: string;
  imageUrl: string;
  title: string;
  genre: string;
  description: string;
  aspectRatio: AspectRatioId;
  createdAt: Date;
  model: ModelId;
}

const MoviePosterGenerator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [movieTitle, setMovieTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("2:3");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-image-1");
  const [savedPosters, setSavedPosters] = useState<SavedPoster[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedPostersData = localStorage.getItem('savedPosters');
    if (savedPostersData) {
      try {
        const parsedData = JSON.parse(savedPostersData);
        const posters = parsedData.map((poster: any) => ({
          ...poster,
          createdAt: new Date(poster.createdAt)
        }));
        setSavedPosters(posters);
      } catch (error) {
        console.error("Error loading saved posters:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (savedPosters.length > 0) {
      localStorage.setItem('savedPosters', JSON.stringify(savedPosters));
    }
  }, [savedPosters]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getImageSize = (aspectRatio: AspectRatioId) => {
    switch (aspectRatio) {
      case "1:1":
        return "1024x1024";
      case "2:3":
        return "1024x1536";
      case "3:2":
        return "1536x1024";
      default:
        return "1024x1024";
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !selectedGenre || !apiKey || !movieTitle.trim() || !description.trim() || !aspectRatio) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Create a movie poster for "${movieTitle}" in the ${selectedGenre} genre featuring this person as the main character. The description is: ${description}. Make it look like a professional Hollywood movie poster with appropriate tagline and visual effects for the ${selectedGenre} genre. The movie title "${movieTitle}" should be prominently displayed.`;
      
      let requestBody: any = {
        model: selectedModel,
        prompt: prompt,
        n: 1,
        user: "movieposter-app-user",
      };
      
      if (selectedModel === "gpt-image-1") {
        requestBody.size = getImageSize(aspectRatio);
        requestBody.quality = "high";
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
        let imageUrl;
        if (selectedModel === "gpt-image-1") {
          if (data.data[0].b64_json) {
            imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
          } else if (data.data[0].url) {
            imageUrl = data.data[0].url;
          } else {
            throw new Error("No image data found in the response");
          }
        }
        
        setGeneratedImage(imageUrl);
        
        const newPoster: SavedPoster = {
          id: `poster-${Date.now()}`,
          imageUrl: imageUrl,
          title: movieTitle,
          genre: selectedGenre,
          description: description,
          aspectRatio: aspectRatio,
          createdAt: new Date(),
          model: selectedModel
        };
        
        setSavedPosters(prev => [newPoster, ...prev]);
        
        toast({
          title: "Success!",
          description: "Your movie poster has been generated and saved",
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

  const handleDownload = (imageUrl: string, title: string) => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-movie-poster.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setGeneratedImage("");
    setMovieTitle("");
    setSelectedModel("gpt-image-1");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedGenre("");
  };
  
  const handleDeletePoster = (posterId: string) => {
    setSavedPosters(prev => prev.filter(poster => poster.id !== posterId));
    toast({
      title: "Poster deleted",
      description: "The poster has been removed from your saved posters",
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-950 text-white animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Become the Star of Your Own Movie!
          </h1>
          <p className="text-gray-400">
            Upload your photo, pick a genre, and let AI create your movie poster
          </p>
        </header>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New Poster</TabsTrigger>
            <TabsTrigger value="gallery">Saved Posters ({savedPosters.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-8 mt-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <ImageUploadForm
                  onFileSelect={handleFileSelect}
                  onGenerate={handleGenerate}
                  onApiKeySet={setApiKey}
                  setMovieTitle={setMovieTitle}
                  setSelectedGenre={setSelectedGenre}
                  setSelectedModel={setSelectedModel}
                  setDescription={setDescription}
                  setAspectRatio={setAspectRatio}
                  movieTitle={movieTitle}
                  selectedGenre={selectedGenre}
                  selectedModel={selectedModel}
                  description={description}
                  aspectRatio={aspectRatio}
                  isGenerating={isGenerating}
                  selectedFile={selectedFile}
                  apiKey={apiKey}
                  fileInputRef={fileInputRef}
                  generatorId="movie-poster"
                />

                <ImagePreview
                  filePreview={filePreview}
                  selectedFileName={selectedFile?.name}
                />
              </div>
              
              <div>
                <GeneratedPoster
                  imageUrl={generatedImage}
                  onDownload={() => handleDownload(generatedImage, movieTitle)}
                  onReset={handleReset}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPosters.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-400">No posters saved yet. Generate some posters to see them here!</p>
                </div>
              ) : (
                savedPosters.map((poster) => (
                  <Card key={poster.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 space-y-4">
                      <div className="aspect-[2/3] relative bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={poster.imageUrl}
                          alt={`Movie poster for ${poster.title}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{poster.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{poster.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {poster.genre} • {poster.model} • {poster.aspectRatio}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(poster.createdAt)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleDownload(poster.imageUrl, poster.title)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeletePoster(poster.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MoviePosterGenerator;
