
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";

const API_KEY_STORAGE_KEY = 'openai_api_key';

interface ApiKeyInputProps {
  onKeySet: (key: string) => void;
}

const ApiKeyInput = ({ onKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      onKeySet(storedKey);
    }
  }, [onKeySet]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      onKeySet(apiKey);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved",
      });
    }
  };

  return (
    <div className="space-y-3 p-4 backdrop-blur-sm bg-black/30 rounded-lg border border-white/10">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Key className="h-4 w-4" />
        <span>Enter your OpenAI API key</span>
      </div>
      <div className="flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="flex-1 bg-black/30 border-white/10"
        />
        <Button 
          onClick={handleSaveKey} 
          disabled={!apiKey.trim()}
          className="bg-primary hover:bg-primary/90"
        >
          Save Key
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
