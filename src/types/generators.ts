
export type ModelId = "gpt-image-1";

export type AspectRatioId = "1:1" | "2:3" | "3:2";

export interface AspectRatioOption {
  id: AspectRatioId;
  name: string;
  size: string;
}

export interface GeneratorType {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  examplePrompt: string;
  icon?: React.ElementType;
}

export interface SavedImage {
  id: string;
  imageUrl: string;
  title: string;
  type: string;
  description: string;
  aspectRatio: AspectRatioId;
  createdAt: Date;
  model: ModelId;
}
