"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [controlImage, setControlImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleControlImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setControlImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          controlImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your image description..."
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={4}
        />

        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleControlImage}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-4 rounded-md text-white bg-gray-500 hover:bg-gray-600"
          >
            Upload Control Image
          </button>
          {controlImage && (
            <div className="mt-2">
              <Image
                src={controlImage}
                alt="Control image"
                width={256}
                height={256}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        <button
          onClick={generateImage}
          disabled={loading || !prompt}
          className={`w-full py-2 px-4 rounded-md text-white ${
            loading || !prompt ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {image && (
          <div className="mt-4">
            <Image
              src={image}
              alt="Generated image"
              width={512}
              height={512}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
