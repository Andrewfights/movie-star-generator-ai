import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { GeneratorType } from "@/types/generators";
import { Film, Image, Sticker, Egg, Gift } from "lucide-react";

export const GENERATORS: GeneratorType[] = [
  {
    id: "movie-poster",
    name: "Movie Poster",
    description: "Become the star of your own movie poster!",
    promptTemplate: "Create a movie poster for '{title}' in the {genre} genre featuring this person as the main character. The description is: {description}. Make it look like a professional Hollywood movie poster with appropriate tagline and visual effects for the {genre} genre. The movie title '{title}' should be prominently displayed.",
    examplePrompt: "Create a movie poster for 'Cosmic Journey' in the Sci-Fi genre featuring this person as the main character.",
    icon: Film
  },
  {
    id: "chibi",
    name: "Chibi Character",
    description: "Turn yourself into an adorable chibi character!",
    promptTemplate: "A chibi version of {description}, with huge eyes, tiny body, oversized head. Kawaii anime style, vibrant colors, cute pose, simple background.",
    examplePrompt: "A chibi version of a warrior knight, oversized helmet, tiny sword, huge shiny eyes, bright blue armor, standing in a magical meadow.",
    icon: Sticker
  },
  {
    id: "cartoon",
    name: "Realistic Cartoon",
    description: "Transform into a Pixar-style character with realistic features!",
    promptTemplate: "A semi-realistic cartoon portrait of {description}. Pixar-meets-reality style with big expressive features but realistic lighting and textures.",
    examplePrompt: "A semi-realistic cartoon portrait of a surfer boy, wavy blonde hair, tan skin, big expressive eyes, standing on a beach at golden hour.",
    icon: Image
  },
  {
    id: "pixel",
    name: "Pixel Pet",
    description: "Create your own Tamagotchi-inspired pixel pet!",
    promptTemplate: "A pixel art Tamagotchi-style pet of {description}. Retro pixel style, simple animation frame, inside a vintage handheld game screen.",
    examplePrompt: "A pixel art tamagotchi-style dragon pet, bright red with tiny pixel fire breath, bouncing happily inside a retro 90s-style egg screen.",
    icon: Egg
  },
  {
    id: "plush",
    name: "Plush Toy",
    description: "Transform into an adorable plush toy!",
    promptTemplate: "A photorealistic plush toy of {description}. Soft fuzzy fabric, stitched details, sitting on a white background with soft lighting.",
    examplePrompt: "A photorealistic plush toy of a baby otter, fluffy brown fur, stitched black nose, holding a tiny felt fish.",
    icon: Gift
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
