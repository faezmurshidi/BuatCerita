import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { v4 as uuidv4 } from 'uuid'

export interface SaveStoryInput {
  title: string
  pages: {
    content: string
    image: string
    audioUrl?: string
  }[]
  userId?: string
}

export const storyService = {
  async saveStory({ title, pages, userId }: SaveStoryInput) {
    try {
      // Start a Supabase transaction
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          title,
          user_id: userId,
        })
        .select()
        .single()

      if (storyError) throw storyError

      // Upload images to Supabase Storage
      const pagesWithUrls = await Promise.all(
        pages.map(async (page, index) => {
          // Convert base64/data URL to file
          const imageFile = await fetch(page.image).then((res) => res.blob())
          const imageExt = imageFile.type.split('/')[1]
          const imagePath = `story-images/${story.id}/${index}.${imageExt}`
          
          const { error: imageUploadError, data: imageData } = await supabase.storage
            .from('stories')
            .upload(imagePath, imageFile)

          if (imageUploadError) throw imageUploadError

          const { data: imageUrl } = supabase.storage
            .from('stories')
            .getPublicUrl(imagePath)

          // If audio exists, upload it
          let audioUrl = page.audioUrl
          if (audioUrl) {
            const audioFile = await fetch(audioUrl).then((res) => res.blob())
            const audioPath = `story-audio/${story.id}/${index}.mp3`
            
            const { error: audioUploadError } = await supabase.storage
              .from('stories')
              .upload(audioPath, audioFile)

            if (audioUploadError) throw audioUploadError

            const { data: audioData } = supabase.storage
              .from('stories')
              .getPublicUrl(audioPath)

            audioUrl = audioData.publicUrl
          }

          return {
            story_id: story.id,
            page_number: index,
            content: page.content,
            image_url: imageUrl.publicUrl,
            audio_url: audioUrl,
          }
        })
      )

      // Insert all pages
      const { error: pagesError } = await supabase
        .from('story_pages')
        .insert(pagesWithUrls)

      if (pagesError) throw pagesError

      return { success: true, storyId: story.id }
    } catch (error) {
      console.error('Error saving story:', error)
      return { success: false, error }
    }
  },

  async getStory(storyId: string) {
    try {
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single()

      if (storyError) throw storyError

      const { data: pages, error: pagesError } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', storyId)
        .order('page_number', { ascending: true })

      if (pagesError) throw pagesError

      return {
        success: true,
        story: {
          ...story,
          pages: pages.map(page => ({
            content: page.content,
            image: page.image_url,
            audioUrl: page.audio_url,
          })),
        },
      }
    } catch (error) {
      console.error('Error getting story:', error)
      return { success: false, error }
    }
  },

  async getUserStories(userId: string) {
    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, stories }
    } catch (error) {
      console.error('Error getting user stories:', error)
      return { success: false, error }
    }
  },
} 