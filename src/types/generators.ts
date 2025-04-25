// Existing or new type definitions
export type ModelId = "gpt-image-1";
export type AspectRatioId = "1:1" | "2:3" | "3:2";

export interface GeneratorType {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  examplePrompt: string;
  icon: any;
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
