export interface Story {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id?: string
}

export interface StoryPage {
  id: string
  story_id: string
  page_number: number
  content: string
  image_url: string
  audio_url?: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      stories: {
        Row: Story
        Insert: Omit<Story, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Story, 'id'>>
      }
      story_pages: {
        Row: StoryPage
        Insert: Omit<StoryPage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<StoryPage, 'id'>>
      }
    }
  }
} 