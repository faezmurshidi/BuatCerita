import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import testData from './test.json'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || "",
})

// Token estimation for a children's story
const MAX_TOKENS = 5000

interface Character {
  name: string
  species: string
  traits: string[]
  specialAbility: string
}

interface StoryRequest {
  environment?: {
    type: 'magical' | 'real-world' | 'fantasy'
    description: string
  }
  characters?: Character[]
  plotCore?: {
    objective: string
    obstacles: string[]
    emotionalJourney: string
  }
  parameters?: {
    ageRange: '4-6' | '7-9' | '10-12'
    genre: 'Fantasy' | 'Adventure' | 'Educational'
    tone: 'Heartwarming' | 'Funny' | 'Mysterious'
  }
}

interface StoryResponse {
  title: string
  content: string
  moralLesson: string
  suggestedIllustrations: Array<{
    page: string
    scene: string
    style: string
    mood: string
    colorPalette: string
  }>
}

function cleanJsonString(str: string): string {
  // Find the JSON boundaries
  const jsonStart = str.indexOf('{')
  const jsonEnd = str.lastIndexOf('}') + 1

  if (jsonStart === -1 || jsonEnd <= jsonStart) {
    throw new Error('Invalid JSON structure: Missing opening or closing braces')
  }

  const jsonStr = str.slice(jsonStart, jsonEnd)
  let result = ''
  let currentIndex = 0
  let inString = false
  let inContent = false
  let escapeNext = false
  const contentMarker = '"content": "'

  while (currentIndex < jsonStr.length) {
    const char = jsonStr[currentIndex]
    const nextChar = jsonStr[currentIndex + 1] || ''
    const remainingStr = jsonStr.slice(currentIndex)

    // Check if we're entering content property
    if (!inString && remainingStr.startsWith(contentMarker)) {
      inContent = true
      result += contentMarker
      currentIndex += contentMarker.length
      inString = true
      continue
    }

    // Handle string boundaries
    if (char === '"' && !escapeNext) {
      if (inString) {
        if (inContent) {
          inContent = false
        }
        inString = false
      } else {
        inString = true
      }
    }

    // Handle escape sequences
    if (char === '\\') {
      escapeNext = true
      result += char
      currentIndex++
      continue
    }

    // Process characters
    if (inContent && char === '\n') {
      // Replace literal newlines with \n in content
      result += '\\n'
    } else if (inContent && char === '"' && nextChar === '"') {
      // Handle double quotes in content
      result += '\\"'
      currentIndex++
    } else {
      // Keep other characters as is
      result += char
    }

    escapeNext = false
    currentIndex++
  }

  return result
}

export async function POST(request: NextRequest) {
  try {
    const storyRequest = (await request.json()) as StoryRequest

    const characterDescriptions = (storyRequest.characters || [])
      .map((char, index) => `${index === 0 ? 'Main Character' : 'Supporting Character'}:
- Name: ${char.name}
- Species/Type: ${char.species}
- Key Traits: ${char.traits.join(', ')}
- Special Ability: ${char.specialAbility}`)
      .join("\n\n")

    const prompt = `Create a children's story with the following parameters:

STORY CONTEXT:
- Target Age Range: ${storyRequest.parameters?.ageRange || '4-6'} years
- Genre: ${storyRequest.parameters?.genre || 'Fantasy'}
- Emotional Tone: ${storyRequest.parameters?.tone || 'Heartwarming'}

ENVIRONMENT:
Type: ${storyRequest.environment?.type || 'magical'}
${storyRequest.environment?.description || 'A magical world filled with wonder and possibilities'}

CHARACTERS:
${characterDescriptions || 'Create appropriate characters for the story that children will love'}

MAIN PLOT:
${storyRequest.plotCore ? `Core Objective: ${storyRequest.plotCore.objective}
Key Obstacles: ${storyRequest.plotCore.obstacles.join(', ')}
Emotional Journey: ${storyRequest.plotCore.emotionalJourney}` : 'Create an engaging plot with clear objectives, meaningful challenges, and emotional growth'}

STORY REQUIREMENTS:
- Write in clear, simple language for children
- Include engaging dialogue and descriptions
- Create natural breaks between story sections using "--- Page X ---" format
- Total length: approximately 2,500 words
- Include a clear moral lesson

ILLUSTRATION SUGGESTIONS:
For 4 key moments in the story, provide illustration suggestions that:
1. Show pivotal moments in the story
2. Include main characters in dynamic poses
3. Capture the emotional tone of the scene
4. Use consistent character designs throughout

Format the response as a JSON object with this structure:
{
  "title": "The story title",
  "content": "The story text with page breaks using '--- Page X ---' format",
  "moralLesson": "A clear, simple moral lesson",
  "suggestedIllustrations": [
    {
      "page": "1",
      "scene": "Detailed scene description",
      "style": "Digital children's book illustration with soft watercolor textures",
      "mood": "The emotional atmosphere",
      "colorPalette": "Specific colors to use"
    }
  ]
}`

    console.log('Sending prompt to Claude:', prompt)

    let storyData: StoryResponse

    // Use test data in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Using test data in development mode')
      storyData = testData as StoryResponse
    } else {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        system:
          "You are a talented children's book author. Create engaging, age-appropriate stories with clear moral lessons. Use simple language and vivid descriptions. Always return properly formatted JSON matching the requested structure exactly.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      console.log('Raw Claude response:', message)

      if (!message.content[0] || message.content[0].type !== 'text') {
        throw new Error('Invalid response format from Claude API')
      }

      const responseText = message.content[0].text
      console.log('Claude response text:', responseText)

      try {
        // Clean and parse the response
        const cleanedJson = cleanJsonString(responseText)
        console.log('Cleaned JSON:', cleanedJson)
        storyData = JSON.parse(cleanedJson)
        console.log('Parsed story data:', storyData)
      } catch (error) {
        console.error("Failed to parse story response:", error)
        throw error
      }
    }

    return NextResponse.json(storyData)
  } catch (error) {
    console.error("Story generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate story",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
} 