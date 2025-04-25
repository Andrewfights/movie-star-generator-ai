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

  const isButtonDisabled = isGenerating || !selectedFile || !apiKey || 
    (showGenreSelector && !selectedGenre) || 
    (showTitleInput && !movieTitle.trim());

  return (
    <div className="space-y-8">
      <ApiKeyInput onKeySet={onApiKeySet} />
      
      <div className="space-y-6">
        <div>
          <p className="step-label">① Upload Your Image</p>
          <label
            htmlFor="photo-upload"
            className="block p-8 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-secondary/50"
          >
            <div className="text-center">
              <input
                id="photo-upload"
                name="photo-upload"
                type="file"
                className="sr-only"
                onChange={handleFileUpload}
                accept="image/*"
                ref={fileInputRef}
              />
              <p className="text-base text-muted-foreground">
                Click to upload or drag and drop
              </p>
            </div>
          </label>
        </div>

        {showTitleInput && (
          <div>
            <p className="step-label">② Enter Title</p>
            <Input
              type="text"
              placeholder="Enter a title"
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              className="form-input w-full"
            />
          </div>
        )}

        <div>
          <p className="step-label">{showTitleInput ? "③" : "②"} Add Description (Optional)</p>
          <Textarea
            placeholder={`Describe your ${generatorId === "movie-poster" ? "movie poster" : "image"} (optional)`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input w-full min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="step-label">{showTitleInput ? "④" : "③"} Choose Model</p>
            <Select onValueChange={(value: ModelId) => setSelectedModel(value)} value={selectedModel}>
              <SelectTrigger className="form-input w-full">
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
          </div>

          <div>
            <p className="step-label">Choose Aspect Ratio</p>
            <Select onValueChange={(value: AspectRatioId) => setAspectRatio(value)} value={aspectRatio}>
              <SelectTrigger className="form-input w-full">
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
          </div>
        </div>

        {showGenreSelector && (
          <div>
            <p className="step-label">⑤ Select Genre</p>
            <Select onValueChange={setSelectedGenre} value={selectedGenre}>
              <SelectTrigger className="form-input w-full">
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
          </div>
        )}

        <Button
          className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90"
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
