"use client";

import { StoryForm } from "@/components/story/StoryForm";
import { useStory } from "@/lib/context/StoryContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isLoading, error } = useStory();
  const router = useRouter();

  const handleStoryGenerated = () => {
    router.push("/story/preview");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            StorySparkle
          </h1>
          <p className="text-xl text-gray-600">
            Create magical stories with AI-powered imagination
          </p>
          {isLoading && (
            <div className="text-purple-600 animate-pulse">
              Generating your magical story...
            </div>
          )}
        </header>

        {/* Story Generation Form */}
        <section className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Create Your Story
          </h2>
          <StoryForm onGenerated={handleStoryGenerated} />
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
