import { Button } from "./ui/button";
import { useCallback } from "react";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react"; // Install if needed

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

interface LeaderboardProps {
  scores: LeaderboardEntry[];
  currentPlayerRank?: number;
  currentPlayerName?: string;
  currentPlayerScore?: number;
  onPlayAgain: () => void;
}

export const Leaderboard = ({
  scores,
  currentPlayerRank,
  currentPlayerName,
  currentPlayerScore,
  onPlayAgain,
}: LeaderboardProps) => {
  const topTen = scores.slice(0, 10);
  const isCurrentPlayerInTopTen = currentPlayerRank && currentPlayerRank <= 10;

  const shareText =
    currentPlayerName && currentPlayerScore !== undefined
      ? `${currentPlayerName} scored ${currentPlayerScore} points! Can you beat me?`
      : "Check out this game!";

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleNativeShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: "Leaderboard",
          text: shareText,
          url: shareUrl,
        })
        .catch(console.error);
    }
  }, [shareText, shareUrl]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">
            🏆 Leaderboard
          </h2>
          <p className="text-gray-600">Top 10 Players</p>
        </div>

        <div className="space-y-2 mb-6">
          {topTen.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.player_name === currentPlayerName &&
                entry.score === currentPlayerScore
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg w-8">
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `#${index + 1}`}
                </span>
                <span className="font-medium">{entry.player_name}</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {entry.score}
              </span>
            </div>
          ))}
        </div>

        {!isCurrentPlayerInTopTen &&
          currentPlayerRank &&
          currentPlayerName &&
          currentPlayerScore !== undefined && (
            <div className="border-t pt-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your ranking:</p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border-2 border-primary">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">
                    #{currentPlayerRank}
                  </span>
                  <span className="font-medium">{currentPlayerName}</span>
                </div>
                <span className="text-xl font-bold text-primary">
                  {currentPlayerScore}
                </span>
              </div>
            </div>
          )}

        <Button onClick={onPlayAgain} className="w-full text-lg py-3 mb-4">
          Play Again
        </Button>

        {/* Share buttons with icons */}
        <div className="flex justify-center gap-3">
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              variant="outline"
              size="icon"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          )}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              shareText + " " + shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-green-500 hover:bg-green-600"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700"
            title="Facebook"
          >
            <Facebook className="w-5 h-5 text-white" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-sky-500 hover:bg-sky-600"
            title="X / Twitter"
          >
            <Twitter className="w-5 h-5 text-white" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-blue-700 hover:bg-blue-800"
            title="LinkedIn"
          >
            <Linkedin className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
};
