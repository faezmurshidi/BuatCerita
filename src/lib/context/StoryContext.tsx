import { createContext, useContext, useState, ReactNode } from "react";

interface Story {
  title: string;
  content: string;
  moralLesson: string;
  suggestedIllustrations: string[];
}

interface StoryContextType {
  story: Story | null;
  setStory: (story: Story | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: any;
  setError: (error: any) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  return (
    <StoryContext.Provider
      value={{
        story,
        setStory,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error("useStory must be used within a StoryProvider");
  }
  return context;
}
