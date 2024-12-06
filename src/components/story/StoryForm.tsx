"use client";

import { useState } from "react";
import { useStory } from "@/lib/context/StoryContext";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface StoryFormProps {
  onGenerated?: () => void;
}

export function StoryForm({ onGenerated }: StoryFormProps) {
  const { setStory, setIsLoading, setError, isLoading } = useStory();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const [formData, setFormData] = useState({
    // Basic fields
    storyAbout: "",
    settings: "",
    ageRange: "",
    language: "English",
    // Advanced fields
    genre: "",
    tone: "",
    length: "",
    moralLesson: "",
    characters: "",
    plotTwist: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Skip password check in development
    if (process.env.NODE_ENV === 'development') {
      await generateStory();
      return;
    }

    // Show password prompt if not already shown
    if (!showPasswordPrompt) {
      setShowPasswordPrompt(true);
      return;
    }

    // Verify password
    if (password === 'F@ez') {
      await generateStory();
      setShowPasswordPrompt(false);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  // Move the story generation logic to a separate function
  const generateStory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate story");
      }

      setStory(data);
      onGenerated?.();
    } catch (err) {
      console.error("Story generation error:", err);
      setError("Failed to generate story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What&apos;s the story about? *
          </label>
          <textarea
            name="storyAbout"
            value={formData.storyAbout}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="A brief description of your story's main idea"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Story Settings *
          </label>
          <input
            type="text"
            name="settings"
            value={formData.settings}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Where and when does the story take place?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Age Range *
            </label>
            <select
              name="ageRange"
              value={formData.ageRange}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select age range</option>
              <option value="3-5">3-5 years</option>
              <option value="6-8">6-8 years</option>
              <option value="9-12">9-12 years</option>
              <option value="13+">13+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language *
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Dutch">Dutch</option>
              <option value="Russian">Russian</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Arabic">Arabic</option>
              <option value="Hindi">Hindi</option>
              <option value="Bengali">Bengali</option>
              <option value="Malay">Malay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
      >
        {showAdvanced ? (
          <ChevronUpIcon className="w-4 h-4 mr-1" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 mr-1" />
        )}
        Advanced Options
      </button>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., Fantasy, Adventure, Mystery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tone
            </label>
            <input
              type="text"
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., Humorous, Serious, Whimsical"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Story Length
            </label>
            <select
              name="length"
              value={formData.length}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select length</option>
              <option value="short">Short (5 min read)</option>
              <option value="medium">Medium (10 min read)</option>
              <option value="long">Long (15+ min read)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moral Lesson
            </label>
            <input
              type="text"
              name="moralLesson"
              value={formData.moralLesson}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="What should readers learn from this story?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Characters
            </label>
            <textarea
              name="characters"
              value={formData.characters}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Describe the main characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plot Twist
            </label>
            <textarea
              name="plotTwist"
              value={formData.plotTwist}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Any unexpected turns in the story?"
            />
          </div>
        </div>
      )}

      {/* Add password prompt */}
      {showPasswordPrompt && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Enter Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter password to generate story"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md text-white ${
          isLoading
            ? "bg-purple-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {isLoading ? "Generating Story..." : showPasswordPrompt ? "Submit Password" : "Generate Story"}
      </button>
    </form>
  );
}
