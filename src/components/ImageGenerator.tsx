import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Image, Folder } from "lucide-react";
import ImageUploadForm, { ASPECT_RATIOS } from './movie-poster/ImageUploadForm';
import ImagePreview from './movie-poster/ImagePreview';
import GeneratedImage from './movie-poster/GeneratedPoster';
import GeneratorSelector, { GENERATORS } from './image-generators/GeneratorSelector';
import { ModelId, AspectRatioId, SavedImage } from '@/types/generators';

const MAX_SAVED_IMAGES = 5;
const MAX_IMAGE_SIZE_KB = 300;

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
    const loadSavedImages = () => {
      try {
        const savedImagesData = localStorage.getItem('savedImages');
        if (savedImagesData) {
          const parsedData = JSON.parse(savedImagesData);
          const images = parsedData.map((image: any) => ({
            ...image,
            createdAt: new Date(image.createdAt)
          }));
          setSavedImages(images);
        }
      } catch (error) {
        console.error("Error loading saved images:", error);
        setSavedImages([]);
      }
    };

    loadSavedImages();
  }, []);

  const compressImageUrl = (imageUrl: string): string => {
    if (!imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    
    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      img.onerror = () => {
        console.error("Failed to process image for compression");
      };
      
      const maxDim = 500;
      
      img.src = imageUrl;
      
      if (!img.complete || !img.naturalWidth) {
        return imageUrl;
      }
      
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      if (width > height) {
        if (width > maxDim) {
          height = Math.round(height * maxDim / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round(width * maxDim / height);
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return imageUrl;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (e) {
      console.error("Error compressing image:", e);
      return imageUrl;
    }
  };

  useEffect(() => {
    if (savedImages.length > 0) {
      try {
        const imagesToSave = savedImages.slice(0, MAX_SAVED_IMAGES);
        
        const processedImages = imagesToSave.map(image => ({
          ...image,
          imageUrl: compressImageUrl(image.imageUrl)
        }));
        
        localStorage.setItem('savedImages', JSON.stringify(processedImages));
      } catch (error) {
        console.error("Error saving images to localStorage:", error);
        
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast({
            title: "Storage limit reached",
            description: "Removing oldest image due to storage constraints.",
            variant: "destructive",
          });
          
          if (savedImages.length > 1) {
            setSavedImages(prev => prev.slice(0, prev.length - 1));
          }
        }
      }
    }
  }, [savedImages, toast]);

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
    
    const descriptionText = description.trim() || "An image";
    
    if (generator.id === "movie-poster") {
      return generator.promptTemplate
        .replace('{title}', title)
        .replace('{genre}', selectedGenre)
        .replace('{description}', descriptionText);
    }
    
    return generator.promptTemplate.replace('{description}', descriptionText);
  };

  const handleGenerate = async () => {
    const generator = getCurrentGenerator();
    
    if (!selectedFile || !apiKey || !aspectRatio) {
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
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const prompt = buildPrompt();
        
        const requestBody = {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an AI that transforms people's photos into creative images following specific prompt instructions."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        };
        
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
          });

          const chatData = await response.json();
          
          if (!response.ok) {
            throw new Error(chatData.error?.message || 'Error analyzing the reference image');
          }
          
          const enhancedPrompt = chatData.choices[0].message.content;
          console.log("Enhanced prompt:", enhancedPrompt);
          
          const imageRequestBody = {
            model: selectedModel,
            prompt: enhancedPrompt,
            n: 1,
            user: "ai-image-generator-app-user",
            size: getImageSize(aspectRatio),
            quality: "high",
          };
          
          const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(imageRequestBody)
          });

          const imageData = await imageResponse.json();
          
          if (!imageResponse.ok) {
            throw new Error(imageData.error?.message || 'Error generating image');
          }
          
          let imageUrl;
          if (imageData.data[0].b64_json) {
            imageUrl = `data:image/png;base64,${imageData.data[0].b64_json}`;
          } else if (imageData.data[0].url) {
            imageUrl = imageData.data[0].url;
          } else {
            throw new Error("No image data found in the response");
          }
          
          setGeneratedImage(imageUrl);
          
          if (savedImages.length >= MAX_SAVED_IMAGES) {
            setSavedImages(prev => {
              const updatedImages = [...prev];
              updatedImages.pop();
              return updatedImages;
            });
            
            toast({
              title: "Storage limit reached",
              description: `Removed oldest image to make space for your new ${generator.name.toLowerCase()}`,
            });
          }
          
          const compressedImageUrl = compressImageUrl(imageUrl);
          
          const newImage: SavedImage = {
            id: `image-${Date.now()}`,
            imageUrl: compressedImageUrl,
            title: title || `${generator.name} ${new Date().toLocaleDateString()}`,
            type: generator.id,
            description: description,
            aspectRatio: aspectRatio,
            createdAt: new Date(),
            model: selectedModel
          };
          
          setSavedImages(prev => [newImage, ...prev.slice(0, MAX_SAVED_IMAGES - 1)]);
          
          toast({
            title: "Success!",
            description: `Your ${generator.name.toLowerCase()} has been generated and saved`,
          });
        } catch (error) {
          console.error("Error in API processing:", error);
          toast({
            title: "Generation failed",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      };
      
      reader.onerror = () => {
        setIsGenerating(false);
        toast({
          title: "Image processing failed",
          description: "Could not process the selected image",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(selectedFile);
      
    } catch (error) {
      console.error("Error generating image:", error);
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: "There was a problem connecting to the image generation service",
        variant: "destructive",
      });
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
    <div className="min-h-screen p-4 bg-[#1a1a1a] text-white animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">
            AI Image Generator
          </h1>
          <p className="text-lg text-gray-400 tracking-wide">
            Create amazing AI-generated images with your photos
          </p>
        </header>

        <div className="grid grid-cols-6 gap-4 mb-8">
          {GENERATORS.map((generator) => {
            const IconComponent = generator.icon || Image;
            return (
              <Card 
                key={generator.id}
                className={`generator-card cursor-pointer ${
                  selectedGenerator === generator.id 
                    ? 'bg-primary/20 border-primary/50 text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'hover:bg-black/40'
                }`}
                onClick={() => handleGeneratorChange(generator.id)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                  <IconComponent className="h-8 w-8 mb-2" />
                  <h3 className="font-semibold text-base tracking-wide">{generator.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{generator.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:active-tab"
            >
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Create New {getCurrentGenerator().name}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="gallery"
              className="data-[state=active]:active-tab"
            >
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Saved Images ({savedImages.length})
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="upload-zone">
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
                </div>

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
