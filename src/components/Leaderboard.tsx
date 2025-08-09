import { Button } from "./ui/button";
import { useCallback, useMemo, useState } from "react";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Link as LinkIcon,
  Check,
} from "lucide-react";

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
  const isCurrentPlayerInTopTen =
    !!currentPlayerRank && currentPlayerRank <= 10;

  const shareText =
    currentPlayerName && currentPlayerScore !== undefined
      ? `${currentPlayerName} scored ${currentPlayerScore} points! Can you beat me?`
      : "Check out this game!";

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const supportsShare = useMemo(
    () => typeof navigator !== "undefined" && !!(navigator as any).share,
    []
  );

  const [copied, setCopied] = useState(false);

  const handleNativeShare = useCallback(() => {
    (navigator as any)
      .share?.({
        title: "Leaderboard",
        text: shareText,
        url: shareUrl,
      })
      .catch(() => {
        /* ignore */
      });
  }, [shareText, shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  }, [shareText, shareUrl]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl p-8 pt-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
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

        <Button onClick={onPlayAgain} className="w-full text-lg py-3 mb-24">
          Play Again
        </Button>

        {/* Floating circular share toolbar */}
        <div className="sticky bottom-0 left-0 right-0">
          <div className="mx-auto max-w-md">
            <div className="mb-[-0.5rem] flex items-center justify-center">
              <div className="w-full rounded-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg ring-1 ring-black/5 px-3 py-2 flex items-center justify-center gap-3">
                {/* Native share (if available) */}
                {supportsShare && (
                  <Button
                    onClick={handleNativeShare}
                    size="icon"
                    variant="ghost"
                    className="rounded-full shadow-sm hover:shadow"
                    aria-label="Share"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                )}

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${shareText} ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-green-500 hover:bg-green-600 shadow text-white"
                  aria-label="Share on WhatsApp"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>

                {/* Facebook
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 shadow text-white"
                  aria-label="Share on Facebook"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a> */}

                {/* X / Twitter (X logo) */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-black hover:bg-neutral-800 shadow text-white"
                  aria-label="X"
                  title="X (Twitter)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-180 -200 1560 1595"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M714.163 519.284L1160.89 0H1058.64L663.725 450.887L374.873 0H0l459.72 669.275L0 1226.41h102.255l417.61-479.743l305.175 479.743H1200L714.163 519.284zM574.461 682.867l-48.58-73.533L132.021 81.738h186.14l310.86 471.792l48.58 73.533l409.233 620.994H900.693L574.461 682.867z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 shadow text-white"
                  aria-label="Share on LinkedIn"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>

                {/* Telegram #219ed9 */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    shareUrl
                  )}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full shadow text-white"
                  style={{ backgroundColor: "#219ed9" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1d8bbf")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#219ed9")
                  }
                  aria-label="Telegram"
                  title="Telegram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="50 50 150 150"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      d="M81.229,128.772l14.237,39.406s1.78,3.687,3.686,3.687,30.255-29.492,30.255-29.492l31.525-60.89L81.737,118.6Z"
                      fill="#c8daea"
                    />
                    <path
                      d="M100.106,138.878l-2.733,29.046s-1.144,8.9,7.754,0,17.415-15.763,17.415-15.763"
                      fill="#a9c6d8"
                    />
                    <path
                      d="M81.486,130.178,52.2,120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229,2.1-2.2,6.489-4.523,120.106-45.36,120.106-45.36s3.208-1.081,5.1-.362a2.766,2.766,0,0,1,1.885,2.055,9.357,9.357,0,0,1,.254,2.585c-.009.752-.1,1.449-.169,2.542-.692,11.165-21.4,94.493-21.4,94.493s-1.239,4.876-5.678,5.043A8.13,8.13,0,0,1,146.1,172.5c-8.711-7.493-38.819-27.727-45.472-32.177a1.27,1.27,0,0,1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6,53.821-51.492c.108-.379-.3-.566-.848-.4-3.482,1.281-63.844,39.4-70.506,43.607A3.21,3.21,0,0,1,81.486,130.178Z"
                      fill="#fff"
                    />
                  </svg>
                </a>

                {/* LINE */}
                <a
                  href={`https://line.me/R/msg/text/?${encodeURIComponent(
                    `${shareText} ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full shadow text-white"
                  style={{ backgroundColor: "#00c854" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#00b24b")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#00c854")
                  }
                  aria-label="LINE"
                  title="LINE"
                >
                  {/* Inline official LINE SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    // viewBox="50 50 220 220"
                    viewBox="90 80 140 140"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    {/* <path d="M266.66,144.92c0-47.74-47.86-86.58-106.69-86.58S53.28,97.18,53.28,144.92c0,42.8,38,78.65,89.22,85.42,3.48.75,8.21,2.29,9.4,5.26,1.08,2.7.71,6.93.35,9.65,0,0-1.25,7.53-1.52,9.13-.47,2.7-2.15,10.55,9.24,5.76s61.44-36.18,83.82-61.95h0C259.25,181.24,266.66,164,266.66,144.92Z" /> */}

                    <path
                      d="M231.16,172.49h-30a2,2,0,0,1-2-2v0h0V123.94h0v0a2,2,0,0,1,2-2h30a2,2,0,0,1,2,2v7.57a2,2,0,0,1-2,2H210.79v7.85h20.37a2,2,0,0,1,2,2V151a2,2,0,0,1-2,2H210.79v7.86h20.37a2,2,0,0,1,2,2v7.56A2,2,0,0,1,231.16,172.49Z"
                      // fill="#00c854"
                    />

                    <path
                      d="M120.29,172.49a2,2,0,0,0,2-2v-7.56a2,2,0,0,0-2-2H99.92v-37a2,2,0,0,0-2-2H90.32a2,2,0,0,0-2,2v46.53h0v0a2,2,0,0,0,2,2h30Z"
                      // fill="#00c854"
                    />

                    <rect
                      x="128.73"
                      y="121.85"
                      width="11.64"
                      height="50.64"
                      rx="2.04"
                      // fill="#00c854"
                    />

                    <path
                      d="M189.84,121.85h-7.56a2,2,0,0,0-2,2v27.66l-21.3-28.77a1.2,1.2,0,0,0-.17-.21v0l-.12-.12,0,0-.11-.09-.06,0-.11-.08-.06,0-.11-.06-.07,0-.11,0-.07,0-.12,0-.08,0-.12,0h-.08l-.11,0h-7.71a2,2,0,0,0-2,2v46.56a2,2,0,0,0,2,2h7.57a2,2,0,0,0,2-2V142.81l21.33,28.8a2,2,0,0,0,.52.52h0l.12.08.06,0,.1.05.1,0,.07,0,.14,0h0a2.42,2.42,0,0,0,.54.07h7.52a2,2,0,0,0,2-2V123.89A2,2,0,0,0,189.84,121.85Z"
                      // fill="#00c854"
                    />
                  </svg>
                </a>

                {/* KakaoTalk */}
                {/* <a
                  href={`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(
                    `${shareText} ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full shadow"
                  style={{ backgroundColor: "#000000" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e5cf00")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#000000")
                  }
                  aria-label="KakaoTalk"
                  title="KakaoTalk"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="50 43 155 155"
                    className="w-5 h-5"
                  >
                    <path
                      fill="#FFE812"
                      d="M70.5 146.625c-3.309 0-6-2.57-6-5.73V105.25h-9.362c-3.247 0-5.888-2.636-5.888-5.875s2.642-5.875 5.888-5.875h30.724c3.247 0 5.888 2.636 5.888 5.875s-2.642 5.875-5.888 5.875H76.5v35.645c0 3.16-2.691 5.73-6 5.73zM123.112 146.547c-2.502 0-4.416-1.016-4.993-2.65l-2.971-7.778-18.296-.001-2.973 7.783c-.575 1.631-2.488 2.646-4.99 2.646a9.155 9.155 0 0 1-3.814-.828c-1.654-.763-3.244-2.861-1.422-8.52l14.352-37.776c1.011-2.873 4.082-5.833 7.99-5.922 3.919.088 6.99 3.049 8.003 5.928l14.346 37.759c1.826 5.672.236 7.771-1.418 8.532a9.176 9.176 0 0 1-3.814.827c-.001 0 0 0 0 0zm-11.119-21.056L106 108.466l-5.993 17.025h11.986zM138 145.75c-3.171 0-5.75-2.468-5.75-5.5V99.5c0-3.309 2.748-6 6.125-6s6.125 2.691 6.125 6v35.25h12.75c3.171 0 5.75 2.468 5.75 5.5s-2.579 5.5-5.75 5.5H138zM171.334 146.547c-3.309 0-6-2.691-6-6V99.5c0-3.309 2.691-6 6-6s6 2.691 6 6v12.896l16.74-16.74c.861-.861 2.044-1.335 3.328-1.335 1.498 0 3.002.646 4.129 1.772 1.051 1.05 1.678 2.401 1.764 3.804.087 1.415-.384 2.712-1.324 3.653l-13.673 13.671 14.769 19.566a5.951 5.951 0 0 1 1.152 4.445 5.956 5.956 0 0 1-2.328 3.957 5.94 5.94 0 0 1-3.609 1.211 5.953 5.953 0 0 1-4.793-2.385l-14.071-18.644-2.082 2.082v13.091a6.01 6.01 0 0 1-6.002 6.003z"
                    />
                  </svg>
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
