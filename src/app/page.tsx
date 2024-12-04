"use client";

import { StoryForm } from "@/components/story/StoryForm";
import { StoryPreview } from "@/components/story/StoryPreview";
import { useStory } from "@/lib/context/StoryContext";

export default function Home() {
  const { story, isLoading, error } = useStory();

  const mockStory = {
    title: "Akido's Brave Heart",
    content:
      "Once upon a time, in a small village in Japan, there lived a brave little boy named Akido. He was known for his kind heart and his love for his family and friends.\n\nOne day, Akido's village faced a great challenge. The world was at war, and many people were struggling to find food and shelter. Akido saw that his friends and neighbors were sad and hungry. He wanted to help them, but he didn't know how.\n\nAkido thought long and hard. Finally, he had an idea. He remembered that his grandfather had taught him how to grow vegetables in their small garden. Akido decided to share his knowledge with the other villagers.\n\nEvery day, Akido worked hard in his garden, planting seeds and caring for the growing vegetables. He invited his friends to help him, and soon, the whole village was working together to grow food. They shared the vegetables with each other, making sure that everyone had enough to eat.\n\nAkido's bravery and kindness inspired the villagers. They faced their challenges together, helping one another through the difficult times. Slowly but surely, life in the village began to get better.\n\nIn the end, Akido's small act of kindness had made a big difference. He showed everyone that even in the darkest of times, a brave and loving heart can bring hope and happiness to those around them.",
    moralLesson:
      "Even small acts of kindness and bravery can make a big difference in helping others during difficult times.",
    suggestedIllustrations: [
      "Akido working in his garden, planting seeds with a determined look on his face.",
      "Akido and his friends sharing vegetables with the villagers, everyone smiling.",
      "The villagers working together in the gardens, with a sense of community and hope.",
    ],
  };

  console.log("Home component story state:", story);

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
          <StoryForm />
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </section>

        {/* Story Preview Section */}
        <section className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Story Preview
          </h2>
          <StoryPreview story={story} />
        </section>
      </div>
    </main>
  );
}
