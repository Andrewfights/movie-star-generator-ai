import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import ImageUploadForm from './movie-poster/ImageUploadForm';
import ImagePreview from './movie-poster/ImagePreview';
import GeneratedImage from './movie-poster/GeneratedPoster';
import GeneratorSelector, { GENERATORS } from './image-generators/GeneratorSelector';
import { ModelId, AspectRatioId, SavedImage } from '@/types/generators';

const ImageGenerator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("2:3");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-image-1");
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [selectedGenerator, setSelectedGenerator] = useState("movie-poster");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImagesData = localStorage.getItem('savedImages');
    if (savedImagesData) {
      try {
        const parsedData = JSON.parse(savedImagesData);
        const images = parsedData.map((image: any) => ({
          ...image,
          createdAt: new Date(image.createdAt)
        }));
        setSavedImages(images);
      } catch (error) {
        console.error("Error loading saved images:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (savedImages.length > 0) {
      localStorage.setItem('savedImages', JSON.stringify(savedImages));
    }
  }, [savedImages]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getImageSize = (aspectRatio: AspectRatioId) => {
    const ratio = ASPECT_RATIOS.find(r => r.id === aspectRatio);
    return ratio ? ratio.size : "1024x1024";
  };

  const getCurrentGenerator = () => {
    return GENERATORS.find(g => g.id === selectedGenerator) || GENERATORS[0];
  };

  const buildPrompt = () => {
    const generator = getCurrentGenerator();
    
    if (generator.id === "movie-poster") {
      return generator.promptTemplate
        .replace('{title}', title)
        .replace('{genre}', selectedGenre)
        .replace('{description}', description);
    }
    
    return generator.promptTemplate.replace('{description}', description);
  };

  const handleGenerate = async () => {
    const generator = getCurrentGenerator();
    
    if (!selectedFile || !apiKey || !description.trim() || !aspectRatio) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (generator.id === "movie-poster" && (!selectedGenre || !title.trim())) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a genre",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = buildPrompt();
      
      const requestBody = {
        model: selectedModel,
        prompt: prompt,
        n: 1,
        user: "ai-image-generator-app-user",
        size: getImageSize(aspectRatio),
        quality: "standard"
      };
      
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
        if (data.data[0].b64_json) {
          imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        } else if (data.data[0].url) {
          imageUrl = data.data[0].url;
        } else {
          throw new Error("No image data found in the response");
        }
        
        setGeneratedImage(imageUrl);
        
        const newImage: SavedImage = {
          id: `image-${Date.now()}`,
          imageUrl: imageUrl,
          title: title || `${generator.name} ${new Date().toLocaleDateString()}`,
          type: generator.id,
          description: description,
          aspectRatio: aspectRatio,
          createdAt: new Date(),
          model: selectedModel
        };
        
        setSavedImages(prev => [newImage, ...prev]);
        
        toast({
          title: "Success!",
          description: `Your ${generator.name.toLowerCase()} has been generated and saved`,
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
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-ai-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setGeneratedImage("");
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedGenre("");
    setDescription("");
  };
  
  const handleDeleteImage = (imageId: string) => {
    setSavedImages(prev => prev.filter(image => image.id !== imageId));
    toast({
      title: "Image deleted",
      description: "The image has been removed from your saved images",
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
  
  const handleGeneratorChange = (generatorId: string) => {
    setSelectedGenerator(generatorId);
    setGeneratedImage("");
    setDescription("");
    if (generatorId !== "movie-poster") {
      setSelectedGenre("");
      setTitle("");
    }
  };

  const generator = getCurrentGenerator();

  return (
    <div className="min-h-screen p-4 bg-gray-950 text-white animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Image Generator
          </h1>
          <p className="text-gray-400">
            Create amazing AI-generated images with your photos
          </p>
        </header>

        <GeneratorSelector 
          selectedGenerator={selectedGenerator}
          onSelectGenerator={handleGeneratorChange}
        />

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New {generator.name}</TabsTrigger>
            <TabsTrigger value="gallery">Saved Images ({savedImages.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-8 mt-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <ImageUploadForm
                  onFileSelect={handleFileSelect}
                  onGenerate={handleGenerate}
                  onApiKeySet={setApiKey}
                  setMovieTitle={setTitle}
                  setSelectedGenre={setSelectedGenre}
                  setSelectedModel={setSelectedModel}
                  setDescription={setDescription}
                  setAspectRatio={setAspectRatio}
                  movieTitle={title}
                  selectedGenre={selectedGenre}
                  selectedModel={selectedModel}
                  description={description}
                  aspectRatio={aspectRatio}
                  isGenerating={isGenerating}
                  selectedFile={selectedFile}
                  apiKey={apiKey}
                  fileInputRef={fileInputRef}
                  generatorId={selectedGenerator}
                  showGenreSelector={selectedGenerator === "movie-poster"}
                  showTitleInput={selectedGenerator === "movie-poster"}
                />

                <ImagePreview
                  filePreview={filePreview}
                  selectedFileName={selectedFile?.name}
                />
              </div>
              
              <div>
                <GeneratedImage
                  imageUrl={generatedImage}
                  onDownload={() => handleDownload(generatedImage, title || `${generator.name}`)}
                  onReset={handleReset}
                  generatorId={selectedGenerator}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedImages.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-400">No images saved yet. Generate some images to see them here!</p>
                </div>
              ) : (
                savedImages.map((image) => (
                  <Card key={image.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 space-y-4">
                      <div className="aspect-[2/3] relative bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={`${image.type} - ${image.title}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{image.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{image.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-300">
                            {GENERATORS.find(g => g.id === image.type)?.name || image.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {image.aspectRatio}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(image.createdAt)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleDownload(image.imageUrl, image.title)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.id)}
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

export default ImageGenerator;
