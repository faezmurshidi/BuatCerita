import { useState, FormEvent } from "react";
import { useStory } from "@/lib/context/StoryContext";

interface Character {
  name: string;
  species: string;
  traits: string[];
  specialAbility: string;
}

const SAMPLE_PLACEHOLDERS = {
  environment: {
    description:
      "A hidden valley nestled between glowing crystal mountains, where mushroom houses dot the landscape and fireflies create dancing patterns in the twilight sky.",
  },
  character: {
    name: "Luna Brightwhisker",
    species: "Magical Fox",
    traits: ["Curious", "Kind", "Resourceful"],
    specialAbility:
      "Can create small light orbs that guide the way in darkness",
  },
  plotCore: {
    objective:
      "Find the lost Moonstone to restore magic to the valley before the eternal night falls",
    obstacles: [
      "The treacherous Crystal Caves where the Moonstone was last seen",
      "The riddles of the Ancient Tree Guardian that must be solved",
      "Fear of the dark that must be overcome",
    ],
    emotionalJourney:
      "Learning to believe in oneself and discovering that true courage means facing your fears to help others",
  },
};

export function StoryForm() {
  const { setStory, setIsLoading, setError, isLoading } = useStory();
  const [formData, setFormData] = useState({
    environment: {
      type: "magical" as const,
      description: "",
    },
    characters: [] as Character[],
    plotCore: {
      objective: "",
      obstacles: [""],
      emotionalJourney: "",
    },
    parameters: {
      ageRange: "4-6" as const,
      genre: "Fantasy" as const,
      tone: "Heartwarming" as const,
    },
  });

  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [newCharacter, setNewCharacter] = useState<Character>({
    name: "",
    species: "",
    traits: [],
    specialAbility: "",
  });
  const [newTrait, setNewTrait] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setStory(null);

      const requestData = {
        ...(formData.environment.description && {
          environment: formData.environment,
        }),
        ...(formData.characters.length > 0 && {
          characters: formData.characters,
        }),
        ...((formData.plotCore.objective ||
          formData.plotCore.obstacles.length > 0 ||
          formData.plotCore.emotionalJourney) && {
          plotCore: {
            ...formData.plotCore,
            obstacles: formData.plotCore.obstacles.filter(Boolean),
          },
        }),
        parameters: formData.parameters,
      };

      console.log("Sending request with params:", requestData);

      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log("Received response:", data);

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      if (
        !data.title ||
        !data.content ||
        !data.moralLesson ||
        !Array.isArray(data.suggestedIllustrations)
      ) {
        throw new Error("Invalid story format");
      }

      console.log("Setting story:", data);
      setStory(data);
    } catch (err) {
      console.error("Story generation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    field?: string,
    subfield?: string
  ) => {
    const { name, value } = e.target;
    if (field && subfield) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field as keyof typeof prev],
          [subfield]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCharacter = () => {
    if (
      newCharacter.name &&
      newCharacter.species &&
      newCharacter.traits.length > 0 &&
      newCharacter.specialAbility
    ) {
      setFormData((prev) => ({
        ...prev,
        characters: [...prev.characters, { ...newCharacter }],
      }));
      setNewCharacter({
        name: "",
        species: "",
        traits: [],
        specialAbility: "",
      });
      setShowCharacterForm(false);
    }
  };

  const handleAddTrait = () => {
    if (newTrait) {
      setNewCharacter((prev) => ({
        ...prev,
        traits: [...prev.traits, newTrait],
      }));
      setNewTrait("");
    }
  };

  const handleRemoveCharacter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveTrait = (traitIndex: number) => {
    setNewCharacter((prev) => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== traitIndex),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Environment Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Story Environment</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={formData.environment.type}
              onChange={(e) => handleChange(e, "environment", "type")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="magical">Magical</option>
              <option value="real-world">Real World</option>
              <option value="fantasy">Fantasy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.environment.description}
              onChange={(e) => handleChange(e, "environment", "description")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
              rows={3}
              placeholder={SAMPLE_PLACEHOLDERS.environment.description}
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional: Describe your story&apos;s setting
            </p>
          </div>
        </div>
      </div>

      {/* Characters Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Characters</h3>
            <p className="text-sm text-gray-500">
              Optional: Add characters to your story
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCharacterForm(true)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            + Add Character
          </button>
        </div>

        {showCharacterForm && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <input
              type="text"
              value={newCharacter.name}
              onChange={(e) =>
                setNewCharacter((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={SAMPLE_PLACEHOLDERS.character.name}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
            <input
              type="text"
              value={newCharacter.species}
              onChange={(e) =>
                setNewCharacter((prev) => ({
                  ...prev,
                  species: e.target.value,
                }))
              }
              placeholder={SAMPLE_PLACEHOLDERS.character.species}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                placeholder={SAMPLE_PLACEHOLDERS.character.traits[0]}
                className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
              />
              <button
                type="button"
                onClick={handleAddTrait}
                className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg text-sm hover:bg-purple-200"
              >
                Add Trait
              </button>
            </div>
            {newCharacter.traits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newCharacter.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {trait}
                    <button
                      type="button"
                      onClick={() => handleRemoveTrait(index)}
                      className="hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={newCharacter.specialAbility}
              onChange={(e) =>
                setNewCharacter((prev) => ({
                  ...prev,
                  specialAbility: e.target.value,
                }))
              }
              placeholder={SAMPLE_PLACEHOLDERS.character.specialAbility}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCharacterForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCharacter}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Add Character
              </button>
            </div>
          </div>
        )}

        {formData.characters.length === 0 && !showCharacterForm && (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            <p>No characters added yet.</p>
            <p className="text-sm mt-2">
              Example: {SAMPLE_PLACEHOLDERS.character.name} -{" "}
              {SAMPLE_PLACEHOLDERS.character.species}
            </p>
          </div>
        )}

        {formData.characters.length > 0 && (
          <div className="space-y-2">
            {formData.characters.map((char, index) => (
              <div
                key={index}
                className="flex items-start justify-between bg-white p-3 rounded-lg border border-gray-200"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-800">{char.name}</h4>
                  <p className="text-sm text-gray-600">{char.species}</p>
                  <div className="flex flex-wrap gap-1">
                    {char.traits.map((trait, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Special Ability:</span>{" "}
                    {char.specialAbility}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCharacter(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plot Core Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Plot Core</h3>
          <p className="text-sm text-gray-500">
            Optional: Define your story&apos;s plot
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Main Objective
            </label>
            <textarea
              value={formData.plotCore.objective}
              onChange={(e) => handleChange(e, "plotCore", "objective")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
              rows={2}
              placeholder={SAMPLE_PLACEHOLDERS.plotCore.objective}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Obstacles
            </label>
            <textarea
              value={formData.plotCore.obstacles.join("\n")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  plotCore: {
                    ...prev.plotCore,
                    obstacles: e.target.value.split("\n").filter(Boolean),
                  },
                }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
              rows={3}
              placeholder={SAMPLE_PLACEHOLDERS.plotCore.obstacles.join("\n")}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add each obstacle on a new line
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Emotional Journey
            </label>
            <textarea
              value={formData.plotCore.emotionalJourney}
              onChange={(e) => handleChange(e, "plotCore", "emotionalJourney")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
              rows={2}
              placeholder={SAMPLE_PLACEHOLDERS.plotCore.emotionalJourney}
            />
          </div>
        </div>
      </div>

      {/* Story Parameters Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Story Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age Range
            </label>
            <select
              value={formData.parameters.ageRange}
              onChange={(e) => handleChange(e, "parameters", "ageRange")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="4-6">4-6 years</option>
              <option value="7-9">7-9 years</option>
              <option value="10-12">10-12 years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Genre
            </label>
            <select
              value={formData.parameters.genre}
              onChange={(e) => handleChange(e, "parameters", "genre")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="Fantasy">Fantasy</option>
              <option value="Adventure">Adventure</option>
              <option value="Educational">Educational</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              value={formData.parameters.tone}
              onChange={(e) => handleChange(e, "parameters", "tone")}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="Heartwarming">Heartwarming</option>
              <option value="Funny">Funny</option>
              <option value="Mysterious">Mysterious</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-3 px-6 font-medium transition-opacity ${
          isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
        }`}
      >
        {isLoading ? "Generating Story..." : "Generate Story"}
      </button>
    </form>
  );
}
