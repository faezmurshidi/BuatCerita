import { useState, useRef } from "react";
import {
  pageTurnSound,
  bookOpenSound,
  bookCloseSound,
} from "@/lib/utils/sound";
import { Illustration } from "./Illustration";

interface Story {
  title: string;
  content: string;
  moralLesson: string;
  suggestedIllustrations: string[];
}

interface StoryBookProps {
  story: Story;
}

export function StoryBook({ story }: StoryBookProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flippedPages, setFlippedPages] = useState<number[]>([]);
  const [hoverPage, setHoverPage] = useState<number | null>(null);
  const [illustrations, setIllustrations] = useState<Record<number, string>>(
    {}
  );
  const bookRef = useRef<HTMLDivElement>(null);

  // Split content into pages (2 paragraphs per page)
  const paragraphs = story.content.split("\n").filter((p) => p.trim() !== "");
  const pages = paragraphs.reduce((acc, paragraph, i) => {
    const pageIndex = Math.floor(i / 2);
    if (!acc[pageIndex]) acc[pageIndex] = [];
    acc[pageIndex].push(paragraph);
    return acc;
  }, [] as string[][]);

  const totalPages = pages.length;
  const totalSpreads = Math.ceil(totalPages / 2);

  const handlePageFlip = (pageIndex: number) => {
    pageTurnSound.play();
    const newSpread = Math.floor(pageIndex / 2);

    if (flippedPages.includes(pageIndex)) {
      setFlippedPages(flippedPages.filter((p) => p < pageIndex));
      setCurrentSpread(newSpread);
    } else {
      const newFlippedPages = Array.from(
        { length: pageIndex + 1 },
        (_, i) => i
      ).filter((p) => !flippedPages.includes(p));
      setFlippedPages([...flippedPages, ...newFlippedPages]);
      setCurrentSpread(newSpread + 1);
    }
  };

  const handleBookOpen = () => {
    bookOpenSound.play();
    setIsOpen(true);
    setCurrentSpread(0);
    setFlippedPages([]);
  };

  const handleBookClose = () => {
    bookCloseSound.play();
    setIsOpen(false);
    setCurrentSpread(0);
    setFlippedPages([]);
  };

  const isPageVisible = (pageIndex: number) => {
    const pageSpread = Math.floor(pageIndex / 2);
    return pageSpread === currentSpread || pageSpread === currentSpread - 1;
  };

  const getPageNumbers = (pageIndex: number) => {
    if (pageIndex === 0) {
      return { front: 1, back: 2 };
    }
    return {
      front: pageIndex * 2 + 1,
      back: pageIndex * 2 + 2,
    };
  };

  const handleIllustrationGenerated = (pageIndex: number, url: string) => {
    setIllustrations((prev) => ({
      ...prev,
      [pageIndex]: url,
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Book Cover */}
      <div
        className={`transform transition-all duration-1000 perspective-1000 ${
          isOpen
            ? "rotate-y-180 opacity-0 pointer-events-none absolute"
            : "rotate-y-0"
        }`}
      >
        <div
          className="bg-gradient-to-br from-purple-700 to-pink-600 rounded-lg shadow-2xl p-4 sm:p-8 aspect-[3/4] max-w-sm sm:max-w-2xl mx-auto flex flex-col items-center justify-center cursor-pointer transform preserve-3d backface-hidden hover:scale-105 transition-transform"
          onClick={handleBookOpen}
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-white text-center mb-4 sm:mb-8">
            {story.title}
          </h1>
          <div className="w-2/3 aspect-square bg-white/10 rounded-lg flex items-center justify-center text-white/70 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative z-10 text-sm sm:text-base text-center p-2">
              [Cover Illustration Coming Soon]
            </div>
          </div>
          <div className="mt-4 sm:mt-8 text-white/80 text-sm animate-bounce">
            Click to Open
          </div>
        </div>
      </div>

      {/* Open Book */}
      <div
        ref={bookRef}
        className={`book transform transition-all duration-1000 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none absolute"
        }`}
      >
        <div className="relative book-shadow">
          {/* Close Button */}
          <button
            onClick={handleBookClose}
            className="absolute -top-4 right-0 sm:-right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
          >
            ×
          </button>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-4 sm:mb-0 sm:absolute sm:-bottom-12 sm:left-0 sm:right-0 sm:justify-center sm:gap-4">
            <button
              onClick={() => {
                if (currentSpread > 0) {
                  const lastPageInPrevSpread = currentSpread * 2 - 1;
                  handlePageFlip(lastPageInPrevSpread);
                }
              }}
              disabled={currentSpread === 0}
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-all ${
                currentSpread === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600 text-sm sm:text-base">
              {currentSpread + 1} of {totalSpreads}
            </span>
            <button
              onClick={() => {
                if (currentSpread < totalSpreads - 1) {
                  const firstPageInNextSpread = currentSpread * 2;
                  handlePageFlip(firstPageInNextSpread);
                }
              }}
              disabled={currentSpread === totalSpreads - 1}
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-all ${
                currentSpread === totalSpreads - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              Next
            </button>
          </div>

          <div className="flex bg-white rounded-lg shadow-2xl relative">
            {/* Book Container */}
            <div className="w-full aspect-[3/4] sm:aspect-[2/1.4] relative">
              {/* Book Spine */}
              <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-4 book-spine" />

              {/* Pages */}
              {pages.map((content, index) => {
                const pageNumbers = getPageNumbers(index);
                return (
                  <div
                    key={index}
                    className={`page absolute inset-0 ${
                      flippedPages.includes(index) ? "flipped" : ""
                    } ${hoverPage === index ? "hover-effect" : ""} ${
                      isPageVisible(index) ? "z-10" : "-z-10"
                    }`}
                    onClick={() => handlePageFlip(index)}
                    onMouseEnter={() => setHoverPage(index)}
                    onMouseLeave={() => setHoverPage(null)}
                  >
                    {/* Front of the page */}
                    <div className="page-front p-4 sm:p-8 bg-white">
                      <div className="prose prose-sm sm:prose-lg h-full overflow-y-auto">
                        {content.map((paragraph, pIndex) => (
                          <p key={pIndex} className="text-gray-700 mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      <div className="page-number page-number-right text-xs sm:text-sm">
                        {pageNumbers.front}
                      </div>
                      <div className="hidden sm:block page-turn-hint">→</div>
                      <div className="page-shadow" />
                    </div>

                    {/* Back of the page */}
                    <div className="page-back p-4 sm:p-8 bg-gray-50">
                      {index === totalPages - 1 ? (
                        <div className="mt-4 sm:mt-8 bg-purple-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">
                            Moral of the Story
                          </h3>
                          <p className="text-purple-700 text-sm sm:text-base">
                            {story.moralLesson}
                          </p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="aspect-video w-full max-w-[200px] sm:max-w-md">
                            <Illustration
                              prompt={story.suggestedIllustrations[index]}
                              onIllustrationGenerated={(url) =>
                                handleIllustrationGenerated(index, url)
                              }
                            />
                          </div>
                        </div>
                      )}
                      <div className="page-number page-number-left text-xs sm:text-sm">
                        {pageNumbers.back}
                      </div>
                      <div className="hidden sm:block page-turn-hint rotate-180">
                        →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
