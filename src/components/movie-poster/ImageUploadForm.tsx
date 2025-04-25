
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import ApiKeyInput from '../ApiKeyInput';
import { ModelId, AspectRatioId } from '@/types/generators';

const GENRES = [
  "Action",
  "Sci-Fi",
  "Romance",
  "Horror",
  "Fantasy",
  "Comedy"
] as const;

export const MODELS = [
  { id: "gpt-image-1" as ModelId, name: "GPT-image-1", ratio: "1024x1024" }
] as const;

export const ASPECT_RATIOS = [
  { id: "1:1", name: "Square (1:1)", size: "1024x1024" },
  { id: "2:3", name: "Portrait (2:3)", size: "1024x1536" },
  { id: "3:2", name: "Landscape (3:2)", size: "1536x1024" },
] as const;

interface ImageUploadFormProps {
  onFileSelect: (file: File) => void;
  onGenerate: () => void;
  onApiKeySet: (key: string) => void;
  setMovieTitle: (title: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedModel: (model: ModelId) => void;
  setDescription: (description: string) => void;
  setAspectRatio: (ratio: AspectRatioId) => void;
  movieTitle: string;
  selectedGenre: string;
  selectedModel: ModelId;
  description: string;
  aspectRatio: AspectRatioId;
  isGenerating: boolean;
  selectedFile: File | null;
  apiKey: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  generatorId: string;
  showGenreSelector?: boolean;
  showTitleInput?: boolean;
}

const ImageUploadForm = ({
  onFileSelect,
  onGenerate,
  onApiKeySet,
  setMovieTitle,
  setSelectedGenre,
  setSelectedModel,
  setDescription,
  setAspectRatio,
  movieTitle,
  selectedGenre,
  selectedModel,
  description,
  aspectRatio,
  isGenerating,
  selectedFile,
  apiKey,
  fileInputRef,
  generatorId,
  showGenreSelector = true,
  showTitleInput = true,
}: ImageUploadFormProps) => {
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
      }
    }
  };

  const buttonText = () => {
    if (isGenerating) return "Generating...";
    
    switch (generatorId) {
      case "movie-poster": return "Generate My Movie Poster";
      case "chibi": return "Generate Chibi Character";
      case "cartoon": return "Generate Cartoon Portrait";
      case "pixel": return "Generate Pixel Pet";
      case "plush": return "Generate Plush Toy";
      default: return "Generate Image";
    }
  };

  const isButtonDisabled = isGenerating || !selectedFile || !apiKey || !description.trim() || !aspectRatio || 
    (showGenreSelector && !selectedGenre) || 
    (showTitleInput && !movieTitle.trim());

  return (
    <div className="space-y-6">
      <ApiKeyInput onKeySet={onApiKeySet} />
      
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
              <p className="text-sm text-gray-400">
                Click to upload or drag and drop
              </p>
            </div>
          </div>
        </label>

        {showTitleInput && (
          <Input
            type="text"
            placeholder="Enter a title"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            className="w-full bg-gray-900 border-gray-800"
          />
        )}

        <Textarea
          placeholder={`Enter a description for your ${generatorId === "movie-poster" ? "movie poster" : "image"}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-900 border-gray-800 min-h-[100px]"
        />

        <Select onValueChange={(value: ModelId) => setSelectedModel(value)} value={selectedModel}>
          <SelectTrigger className="w-full bg-gray-900 border-gray-800">
            <SelectValue placeholder="Choose an AI model" />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value: AspectRatioId) => setAspectRatio(value)} value={aspectRatio}>
          <SelectTrigger className="w-full bg-gray-900 border-gray-800">
            <SelectValue placeholder="Choose aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((ratio) => (
              <SelectItem key={ratio.id} value={ratio.id}>
                {ratio.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showGenreSelector && (
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
        )}

        <Button
          className="w-full"
          onClick={onGenerate}
          disabled={isButtonDisabled}
        >
          {buttonText()}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadForm;
