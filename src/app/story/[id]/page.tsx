"use client";

import { StoryPreview } from "@/components/story/StoryPreview";
import { useStory } from "@/lib/context/StoryContext";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import ImageGenerator from "@/components/ImageGenerator";

function LoadingStory() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export default function StoryPage() {
  const { story, isLoading } = useStory();
  const router = useRouter();

  if (!story && !isLoading) {
    router.push("/");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Your Story
          </h1>
        </header>

        <section className="bg-white rounded-2xl shadow-xl p-8">
          <Suspense fallback={<LoadingStory />}>
            <ImageGenerator />
            {story ? <StoryPreview story={story} /> : <LoadingStory />}
          </Suspense>
        </section>
      </div>
    </main>
  );
}
