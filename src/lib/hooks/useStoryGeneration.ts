import { useState } from 'react'

interface StoryParams {
  theme: string
  mainCharacter: string
  ageGroup: string
}

interface Story {
  title: string
  content: string
  moralLesson: string
  suggestedIllustrations: string[]
}

interface ErrorResponse {
  error: string
  details?: string | Record<string, string | null>
  type?: string
  rawResponse?: string
}

export function useStoryGeneration() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [story, setStory] = useState<Story | null>(null)

  const generateStory = async (params: StoryParams) => {
    try {
      setIsLoading(true)
      setError(null)
      setStory(null)

      console.log('Sending request with params:', params)

      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      const data = await response.json()
      console.log('Received response:', data)

      if (!response.ok) {
        console.error('Error response:', data)
        throw new Error(JSON.stringify(data))
      }

      if (!data.title || !data.content || !data.moralLesson || !Array.isArray(data.suggestedIllustrations)) {
        console.error('Invalid story data structure:', data)
        throw new Error(JSON.stringify({
          error: 'Invalid story format',
          details: 'The generated story is missing required fields',
          rawResponse: JSON.stringify(data)
        }))
      }

      console.log('Setting story:', data)
      setStory(data)
    } catch (err) {
      console.error('Story generation error:', err)
      try {
        const errorData: ErrorResponse = err instanceof Error ? JSON.parse(err.message) : {
          error: 'An unexpected error occurred',
          details: err instanceof Error ? err.message : 'Unknown error'
        }
        setError(errorData)
      } catch (parseError) {
        console.error('Error parsing error message:', parseError)
        setError({
          error: 'Failed to generate story',
          details: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateStory,
    isLoading,
    error,
    story,
  }
} 