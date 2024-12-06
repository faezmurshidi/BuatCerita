import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/lib/hooks/useAudioPlayer';
import { useAudioGeneration } from '@/lib/hooks/useAudioGeneration';

interface StoryPreviewProps {
  title: string;
  content: string;
  moralLesson: string;
  language?: string;
}

export function StoryPreview({ title, content, moralLesson, language = 'en' }: StoryPreviewProps) {
  const { generateAudio, isGenerating, audioUrl } = useAudioGeneration();
  const audioPlayer = useAudioPlayer(audioUrl);

  const handleGenerateAudio = async () => {
    await generateAudio(content, language);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-xl"
    >
      <motion.h1 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-4xl font-bold text-center mb-8 text-primary"
      >
        {title}
      </motion.h1>

      {!audioUrl ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex justify-center"
        >
          <Button
            onClick={handleGenerateAudio}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate Audio
              </>
            )}
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={audioPlayer.togglePlayPause}
            className="w-12 h-12 rounded-full"
          >
            {audioPlayer.isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={audioPlayer.resetAudio}
            className="w-12 h-12 rounded-full"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>

          <div className="w-full max-w-md">
            <div className="bg-secondary h-2 rounded-full">
              <motion.div 
                className="bg-primary h-full rounded-full"
                style={{ width: `${audioPlayer.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{formatTime(audioPlayer.currentTime)}</span>
              <span>{formatTime(audioPlayer.duration)}</span>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="prose prose-lg max-w-none"
      >
        {content?.split('\n\n').map((paragraph, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="text-xl leading-relaxed mb-6 text-gray-700"
          >
            {paragraph}
          </motion.p>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-primary/5 rounded-lg"
      >
        <h2 className="text-2xl font-semibold mb-3 text-primary">Moral of the Story</h2>
        <p className="text-lg text-gray-700">{moralLesson}</p>
      </motion.div>
    </motion.div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
