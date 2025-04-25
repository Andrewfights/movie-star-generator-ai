
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ApiKeyInput from '../ApiKeyInput';

const GENRES = [
  "Action",
  "Sci-Fi",
  "Romance",
  "Horror",
  "Fantasy",
  "Comedy"
] as const;

const MODELS = [
  { id: "dall-e-3", name: "DALL-E 3", ratio: "1024x1792" },
  { id: "gpt-image-1", name: "GPT-image-1", ratio: "1024x1024" }
] as const;

export type ModelId = typeof MODELS[number]["id"];

interface ImageUploadFormProps {
  onFileSelect: (file: File) => void;
  onGenerate: () => void;
  onApiKeySet: (key: string) => void;
  setMovieTitle: (title: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedModel: (model: ModelId) => void;
  movieTitle: string;
  selectedGenre: string;
  selectedModel: ModelId;
  isGenerating: boolean;
  selectedFile: File | null;
  apiKey: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImageUploadForm = ({
  onFileSelect,
  onGenerate,
  onApiKeySet,
  setMovieTitle,
  setSelectedGenre,
  setSelectedModel,
  movieTitle,
  selectedGenre,
  selectedModel,
  isGenerating,
  selectedFile,
  apiKey,
  fileInputRef,
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

        <Input
          type="text"
          placeholder="Enter your movie title"
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
          className="w-full bg-gray-900 border-gray-800"
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
          onClick={onGenerate}
          disabled={isGenerating || !selectedFile || !selectedGenre || !apiKey || !movieTitle.trim()}
        >
          {isGenerating ? "Generating..." : "Generate My Movie Poster"}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadForm;
