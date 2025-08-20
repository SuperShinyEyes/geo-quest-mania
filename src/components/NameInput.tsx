import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface NameInputProps {
  score: number;
  onSubmit: (name: string) => void;
}

export const NameInput = ({ score, onSubmit }: NameInputProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">Good Game!</h2>
          <p className="text-xl text-gray-600 mb-1">Your final score:</p>
          <p className="text-4xl font-bold text-primary">{score}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="playerName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your name:
            </label>
            <Input
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="text-center"
              autoFocus
              maxLength={20}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Submit Score
          </Button>
        </form>
      </div>
    </div>
  );
};
