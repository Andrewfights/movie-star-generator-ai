import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { GeneratorType } from "@/types/generators";
import { Film, Image, Sticker, Egg, Gift, Box } from "lucide-react";

export const GENERATORS: GeneratorType[] = [
  {
    id: "movie-poster",
    name: "Movie Poster",
    description: "Become the star of your own movie poster!",
    promptTemplate: "Create a movie poster for '{title}' in the {genre} genre featuring this person as the main character, wearing the same outfit/clothing as shown in the reference image. The description is: {description}. Make it look like a professional Hollywood movie poster with appropriate tagline and visual effects for the {genre} genre. The movie title '{title}' should be prominently displayed.",
    examplePrompt: "Create a movie poster for 'Cosmic Journey' in the Sci-Fi genre featuring this person as the main character.",
    icon: Film
  },
  {
    id: "chibi",
    name: "Chibi Character",
    description: "Turn yourself into an adorable chibi character!",
    promptTemplate: "Transform the person in the reference image into a chibi character, maintaining their distinctive features and outfit/clothing style. Create with huge eyes, tiny body, and oversized head. {description} Kawaii anime style, vibrant colors, cute pose, simple background.",
    examplePrompt: "Transform this person into a chibi warrior knight with oversized helmet.",
    icon: Sticker
  },
  {
    id: "cartoon",
    name: "Realistic Cartoon",
    description: "Transform into a Pixar-style character with realistic features!",
    promptTemplate: "Transform the person in the reference image into a semi-realistic cartoon portrait, keeping their facial features, hairstyle, and outfit/clothing exactly as shown. {description} Pixar-meets-reality style with big expressive features but realistic lighting and textures.",
    examplePrompt: "Transform this person into a Pixar-style character on a beach at golden hour.",
    icon: Image
  },
  {
    id: "pixel",
    name: "Pixel Pet",
    description: "Create your own Tamagotchi-inspired pixel pet!",
    promptTemplate: "Transform the person in the reference image into a pixel art Tamagotchi-style pet, incorporating their distinctive features and outfit/clothing colors into the design. {description} Retro pixel style, simple animation frame, inside a vintage handheld game screen.",
    examplePrompt: "Transform this person into a pixel art pet bouncing happily inside a retro game screen.",
    icon: Egg
  },
  {
    id: "plush",
    name: "Plush Toy",
    description: "Transform into an adorable plush toy!",
    promptTemplate: "Transform the person in the reference image into a photorealistic plush toy, maintaining their outfit/clothing colors and style in plush form. {description} Soft fuzzy fabric, stitched details, sitting on a white background with soft lighting.",
    examplePrompt: "Transform this person into a cute plush toy with soft fabric texture.",
    icon: Gift
  },
  {
    id: "bubble-toy",
    name: "Bubble Toy Box",
    description: "Transform into an adorable bubble toy in a clear display box!",
    promptTemplate: "Create a soft focus photograph of a pastel-colored bubble toy inside a clear acrylic box, arranged with other similar toys. Transform the person from the reference image into a small, round, shiny, and smooth bubble toy with a cute minimal cartoon face, maintaining their distinctive features and outfit/clothing colors. {description} Studio lighting with gentle reflections on the acrylic surface, dreamy and polished aesthetic with a softly blurred background highlighting the toys' glossy surfaces. The bubble toy should clearly represent the person's appearance and outfit from the reference image in a cute, miniaturized form.",
    examplePrompt: "Transform this person into a cute bubble toy in an acrylic display box.",
    icon: Box
  }
];

interface GeneratorSelectorProps {
  selectedGenerator: string;
  onSelectGenerator: (generatorId: string) => void;
}

const GeneratorSelector: React.FC<GeneratorSelectorProps> = ({ 
  selectedGenerator, 
  onSelectGenerator 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      {GENERATORS.map((generator) => {
        const IconComponent = generator.icon || Image;
        return (
          <Card 
            key={generator.id}
            className={`generator-card cursor-pointer ${
              selectedGenerator === generator.id 
                ? 'bg-primary border-primary/50 text-primary-foreground' 
                : 'bg-card hover:bg-secondary border-white/5'
            }`}
            onClick={() => onSelectGenerator(generator.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <IconComponent className="h-10 w-10 mb-2" />
              <h3 className="font-semibold text-lg">{generator.name}</h3>
              <p className="text-sm text-muted-foreground">{generator.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GeneratorSelector;
