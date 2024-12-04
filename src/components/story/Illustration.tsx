import { useState } from "react";
import Image from "next/image";

interface IllustrationProps {
  prompt: string;
  onIllustrationGenerated?: (url: string) => void;
}

const STYLE_PROMPT = `Create a digital children's book illustration with soft watercolor textures. 
Use warm, inviting lighting with soft shadows. 
The color palette should be vibrant but harmonious with pastel undertones. 
Keep the background clean and simple, focusing on the main elements. 
The overall mood should be cheerful and welcoming. 
The scene should be viewed from an eye-level perspective that's engaging for children.

Specific scene to illustrate: `;

export function Illustration({
  prompt,
  onIllustrationGenerated,
}: IllustrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateIllustration = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/illustration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: STYLE_PROMPT + prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate illustration");
      }

      setImageUrl(data.url);
      onIllustrationGenerated?.(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {!imageUrl && !isLoading && (
        <button
          onClick={generateIllustration}
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-500">Generate Illustration</span>
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
            <span className="text-sm text-gray-500 animate-pulse">
              Creating your illustration...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 rounded-lg p-4">
          <p className="text-red-600 text-sm text-center mb-2">{error}</p>
          <button
            onClick={generateIllustration}
            className="text-red-600 hover:text-red-700 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      {imageUrl && (
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="Story illustration"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <button
            onClick={generateIllustration}
            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-gray-600 rounded-full p-2 shadow-lg backdrop-blur-sm transform hover:scale-110 transition-all"
            title="Regenerate illustration"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
