"use client";

import { StoryForm } from "@/components/story/StoryForm";
import { useStory } from "@/lib/context/StoryContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

// Floating animation component
const FloatingElement = ({ children, delay = 0 }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      delay,
    }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { isLoading, error } = useStory();
  const router = useRouter();

  const handleStoryGenerated = () => {
    router.push("/story/preview");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-lavender-100 to-mint-100 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-20">
            <Image src="/images/star.svg" width={40} height={40} alt="Magical star" />
          </div>
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute top-40 right-40">
            <Image src="/images/cloud.svg" width={60} height={40} alt="Floating cloud" />
          </div>
        </FloatingElement>
        <FloatingElement delay={0.5}>
          <div className="absolute bottom-40 left-1/4">
            <Image src="/images/fairy.svg" width={50} height={50} alt="Magic fairy" />
          </div>
        </FloatingElement>
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-8 py-12 space-y-12">
        {/* Header */}
        <header className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl font-fredoka bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400">
              ✨ Spark Magic ✨
            </h1>
            <p className="text-2xl font-nunito text-purple-700 mt-4">
              Create Bedtime Stories That Make Kids Smile!
            </p>
          </motion.div>

          {/* AI Mascot */}
          <div className="relative w-40 h-40 mx-auto">
            <Image
              src="/images/story-bot.svg"
              layout="fill"
              objectFit="contain"
              alt="StoryBot - Your magical story companion"
            />
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-purple-600 font-nunito text-xl"
            >
              <span className="inline-block animate-bounce mr-2">🌟</span>
              Weaving your magical story...
              <span className="inline-block animate-bounce ml-2">🌟</span>
            </motion.div>
          )}
        </header>

        {/* Story Generation Form */}
        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-6 border-2 border-purple-100"
        >
          <h2 className="text-3xl font-fredoka text-purple-600 flex items-center gap-3">
            <span className="text-4xl">📖</span> Let's Create Your Story!
          </h2>
          <StoryForm onGenerated={handleStoryGenerated} />
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 font-nunito"
            >
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
        </motion.section>

        {/* Sample Stories Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-100"
          >
            <div className="flex items-start gap-4">
              <Image
                src="/images/happy-kid.svg"
                width={60}
                height={60}
                alt="Happy child"
                className="rounded-full"
              />
              <div>
                <h3 className="font-fredoka text-xl text-blue-600">The Flying Turtle Adventure</h3>
                <p className="font-nunito text-gray-600 mt-2">
                  "My daughter couldn't stop giggling at the turtle who learned to fly! Such a magical story!" - Sarah's Mom
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-pink-100"
          >
            <div className="flex items-start gap-4">
              <Image
                src="/images/reading-kid.svg"
                width={60}
                height={60}
                alt="Child reading"
                className="rounded-full"
              />
              <div>
                <h3 className="font-fredoka text-xl text-pink-600">The Magical Forest of Dreams</h3>
                <p className="font-nunito text-gray-600 mt-2">
                  "These stories have become our favorite bedtime routine! The illustrations are beautiful!" - Tom's Dad
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
