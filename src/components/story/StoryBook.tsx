'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Save } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useAudioPlayer } from '@/lib/hooks/useAudioPlayer'
import { useAudioGeneration } from '@/lib/hooks/useAudioGeneration'
import { useRouter } from 'next/navigation'
import { storyService } from '@/lib/services/story.service'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'sonner'

interface Page {
  content: string
  image: string
  audioUrl?: string
}

interface StoryBookProps {
  pages: Page[]
  title: string
}

export default function StoryBook({ pages, title }: StoryBookProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(-1)
  const [direction, setDirection] = useState(0)
  const { generateAudio, isGenerating } = useAudioGeneration()
  const [pageAudios, setPageAudios] = useState<string[]>([])
  const audioPlayer = useAudioPlayer(pageAudios[currentPage])
  const [isSaving, setIsSaving] = useState(false)

  // Generate audio for current page
  useEffect(() => {
    const generatePageAudio = async () => {
      if (currentPage >= 0 && !pageAudios[currentPage] && pages[currentPage]) {
        const audioUrl = await generateAudio(pages[currentPage].content)
        setPageAudios(prev => {
          const newAudios = [...prev]
          newAudios[currentPage] = audioUrl
          return newAudios
        })
      }
    }

    generatePageAudio()
  }, [currentPage, pages, pageAudios, generateAudio])

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      if (audioPlayer?.pause) audioPlayer.pause()
      setDirection(1)
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > -1) {
      if (audioPlayer?.pause) audioPlayer.pause()
      setDirection(-1)
      setCurrentPage(currentPage - 1)
    }
  }

  const AudioControls = () => (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/90 p-4 rounded-full shadow-lg">
      <Button
        variant="outline"
        size="icon"
        onClick={audioPlayer?.togglePlayPause}
        disabled={isGenerating || !pageAudios[currentPage]}
        className="w-12 h-12 rounded-full"
      >
        {isGenerating ? (
          <span className="animate-spin">⏳</span>
        ) : audioPlayer?.isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={audioPlayer?.resetAudio}
        disabled={isGenerating || !pageAudios[currentPage]}
        className="w-12 h-12 rounded-full"
      >
        <RotateCcw className="h-6 w-6" />
      </Button>

      {pageAudios[currentPage] && (
        <div className="w-48">
          <div className="bg-secondary h-2 rounded-full">
            <motion.div 
              className="bg-primary h-full rounded-full"
              style={{ width: `${audioPlayer?.progress ?? 0}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{formatTime(audioPlayer?.currentTime ?? 0)}</span>
            <span>{formatTime(audioPlayer?.duration ?? 0)}</span>
          </div>
        </div>
      )}
    </div>
  )

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const result = await storyService.saveStory({
        title,
        pages: pages.map((page, index) => ({
          content: page.content,
          image: page.image,
          audioUrl: pageAudios[index],
        })),
        userId: user?.id
      })

      if (result.success) {
        toast.success('Story saved successfully!')
        // Optionally redirect to the story page
        router.push(`/stories/${result.storyId}`)
      } else {
        toast.error('Failed to save story')
      }
    } catch (error) {
      console.error('Error saving story:', error)
      toast.error('Failed to save story')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="relative overflow-hidden bg-white shadow-xl rounded-2xl border-4 border-sky-200">
          <div className="relative h-[calc(100vh-8rem)]">
            <AnimatePresence mode="wait" initial={false}>
              {currentPage === -1 ? (
                <motion.div
                  key="cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-400"
                >
                  <div className="relative h-full">
                    <img
                      src={pages[0]?.image || ''}
                      alt="Book cover"
                      className="w-full h-full object-cover opacity-50"
                    />
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6"
                    >
                      <h1 className="text-5xl md:text-7xl font-bold mb-4 text-shadow-lg">
                        {title}
                      </h1>
                      <Button 
                        onClick={goToNextPage}
                        size="lg"
                        className="bg-white text-indigo-600 hover:bg-indigo-50 text-xl px-8 py-6 rounded-full shadow-xl transition-transform hover:scale-105"
                      >
                        Start Reading
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-full"
                >
                  <div className="flex flex-col h-full">
                    <motion.div
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-sky-400 p-4 text-white text-center"
                    >
                      <h2 className="text-2xl md:text-3xl font-bold text-shadow">{title}</h2>
                    </motion.div>

                    <div className="flex flex-col md:flex-row flex-1">
                      <div className="w-full md:w-1/2 p-6 bg-gradient-to-br from-sky-50 to-indigo-50">
                        <div className="h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-sky-200">
                          <img
                            src={pages[currentPage]?.image}
                            alt={`Illustration for page ${currentPage + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center bg-white">
                        <p className="text-2xl md:text-3xl leading-relaxed text-indigo-700 font-medium text-center w-full font-['Comic_Sans_MS',_'Comic_Sans',_cursive] tracking-wide">
                          {pages[currentPage]?.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 p-4 bg-white">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={goToPreviousPage}
                        disabled={currentPage === -1}
                        className="rounded-full h-14 w-14 p-0 hover:bg-sky-50 bg-white border-2 border-sky-200 shadow-lg transition-transform hover:scale-110"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-8 w-8 text-sky-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={goToNextPage}
                        disabled={currentPage === pages.length - 1}
                        className="rounded-full h-14 w-14 p-0 hover:bg-sky-50 bg-white border-2 border-sky-200 shadow-lg transition-transform hover:scale-110"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-8 w-8 text-sky-600" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentPage >= 0 && <AudioControls />}

          {currentPage >= 0 && (
            <div className="h-3 bg-sky-100">
              <div 
                className="h-full bg-sky-400 transition-all duration-300 ease-in-out rounded-r-full"
                style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
              />
            </div>
          )}

          {currentPage >= 0 && (
            <div className="absolute bottom-4 right-4">
              <Button
                variant="default"
                size="lg"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full shadow-lg transition-transform hover:scale-105 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                Save Story
              </Button>
            </div>
          )}
        </Card>

        {currentPage >= 0 && (
          <p className="text-center mt-4 text-sky-600 font-medium text-lg">
            Page {currentPage + 1} of {pages.length}
          </p>
        )}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
