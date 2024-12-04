import { useState, useRef } from "react";
import { Illustration } from "./Illustration";
import jsPDF from "jspdf";

interface Story {
  title: string;
  content: string;
  moralLesson: string;
  suggestedIllustrations: Array<{
    page: string;
    scene: string;
    style: string;
    mood: string;
    colorPalette: string;
  }>;
}

interface StoryPreviewProps {
  story: Story | null;
}

export function StoryPreview({ story }: StoryPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    Record<number, string>
  >({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!story) {
    return (
      <div className="text-gray-600 text-center py-12">
        Your magical story will appear here...
      </div>
    );
  }

  // Split content into sections
  const sections = story.content
    .split(/---\s*Page\s*\d+\s*---/)
    .filter(Boolean)
    .map((content) => content.trim());

  const handleIllustrationGenerated = (index: number, url: string) => {
    setGeneratedImages((prev) => ({
      ...prev,
      [index]: url,
    }));
  };

  const generateSpeech = async () => {
    try {
      setIsGeneratingSpeech(true);

      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Clean up the text for speech
      const cleanText = story.content.replace(
        /---\s*Page\s*\d+\s*---/g,
        "Page "
      );

      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      });

      setCurrentAudio(audio);
      audioRef.current = audio;

      // Start playing
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to generate speech:", error);
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const togglePlayback = async () => {
    if (!currentAudio) {
      await generateSpeech();
      return;
    }

    if (isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      await currentAudio.play();
      setIsPlaying(true);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);

      // Create PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set font sizes
      const titleSize = 24;
      const headingSize = 16;
      const textSize = 12;

      // Add title
      pdf.setFontSize(titleSize);
      pdf.text(story.title, 105, 20, { align: "center" });

      let currentY = 40;
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const textWidth = pageWidth - 2 * margin;

      // Function to add text with line breaks
      const addText = (text: string, fontSize: number) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, textWidth);

        lines.forEach((line: string) => {
          if (currentY > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += fontSize * 0.5;
        });
        currentY += 10;
      };

      // Add each section with its illustration
      for (let i = 0; i < sections.length; i++) {
        // Add section text
        addText(sections[i], textSize);

        // Add illustration if available
        const imageUrl = generatedImages[i];
        if (imageUrl) {
          try {
            // Fetch image and convert to base64
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            // Add image to PDF
            if (currentY > pageHeight - 100) {
              pdf.addPage();
              currentY = margin;
            }

            const imgWidth = 170;
            const imgHeight = 100;
            pdf.addImage(
              base64,
              "PNG",
              (pageWidth - imgWidth) / 2,
              currentY,
              imgWidth,
              imgHeight
            );
            currentY += imgHeight + 20;
          } catch (error) {
            console.error("Failed to add image to PDF:", error);
          }
        }

        // Add page break between sections
        if (i < sections.length - 1) {
          pdf.addPage();
          currentY = margin;
        }
      }

      // Add moral lesson
      pdf.addPage();
      currentY = margin;
      pdf.setFontSize(headingSize);
      pdf.text("Moral of the Story", margin, currentY);
      currentY += 20;
      addText(story.moralLesson, textSize);

      // Save the PDF
      pdf.save(`${story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{story.title}</h1>
      </div>

      {/* Audio Controls */}
      <div className="flex justify-center">
        <button
          onClick={togglePlayback}
          disabled={isGeneratingSpeech}
          className={`flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 px-4 font-medium transition-all ${
            isGeneratingSpeech
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-90 hover:scale-105"
          }`}
        >
          {isGeneratingSpeech ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating Audio...
            </span>
          ) : (
            <>
              {isPlaying ? (
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
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <span>{isPlaying ? "Pause" : "Listen to Story"}</span>
            </>
          )}
        </button>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 space-y-12">
          {sections.map((content, index) => (
            <div key={index} className="space-y-8">
              {/* Text Content */}
              <div className="prose prose-lg max-w-none">
                {content.split("\n").map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Illustration */}
              {story.suggestedIllustrations[index] && (
                <div className="h-80 relative rounded-lg overflow-hidden shadow-md">
                  <Illustration
                    prompt={story.suggestedIllustrations[index].scene}
                    onIllustrationGenerated={(url) =>
                      handleIllustrationGenerated(index, url)
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Moral Lesson */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-2">
          Moral of the Story
        </h2>
        <p className="text-purple-800">{story.moralLesson}</p>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 px-4 font-medium transition-all ${
            isDownloading
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-90 hover:scale-105"
          }`}
        >
          {isDownloading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating PDF...
            </span>
          ) : (
            "Download Story (PDF)"
          )}
        </button>
      </div>
    </div>
  );
}
