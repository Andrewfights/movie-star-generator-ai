
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
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
          className="flex-1 bg-gray-950 border-gray-800"
        />
        <Button onClick={handleSaveKey} disabled={!apiKey.trim()}>
          Save Key
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
