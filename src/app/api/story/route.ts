import { NextResponse } from "next/server";
import { generateObject } from 'ai';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';

if (!process.env.CLAUDE_API_KEY) {
  throw new Error("Missing CLAUDE_API_KEY environment variable");
}


export async function POST(request: Request) {
  try {
    const {
      storyAbout,
      settings,
      ageRange,
      language = "English",
      genre = "Fantasy",
      tone = "Heartwarming",
      length = "medium",
      moralLesson = "Moral Lesson",
      characters = "Main Characters",
      plotTwist = "Plot Twist",
    } = await request.json();

    // Construct the prompt
    const prompt = `Create a children's story in ${language} with the following details:
    
Main Story:
- Core Idea: ${storyAbout}
- Setting: ${settings}
- Target Age: ${ageRange}
- Pages: 10

${genre ? `Genre: ${genre}` : ''}
${tone ? `Tone: ${tone}` : ''}
${length ? `Length: ${length}` : ''}
${moralLesson ? `Moral Lesson: ${moralLesson}` : ''}
${characters ? `Main Characters: ${characters}` : ''}
${plotTwist ? `Plot Twist: ${plotTwist}` : ''}

LANGUAGE REQUIREMENTS:

- Use simple vocabulary (age appropriate)
- Sentences: 10-15 words long
- Maintain child-friendly tone
- Include engaging descriptive elements
- Expressive intonation - include descriptive expressions and clear line breaks

LEARNING OBJECTIVE:

- Subtle moral lesson
- Positive value to be taught

FINAL STORY REQUIREMENTS:

- Compelling title
- Coherent narrative
- Positive, uplifting ending
- Age-appropriate complexity

Cover Illustration sample prompt: This is a digital illustration depicting a scene of a young boy and three foxes in a whimsical woodland setting. The illustration is characterized by a flat design style, which uses solid colors and clean lines to create a playful and fantastical atmosphere. The focus is on the boy, who is dressed in blue denim overalls with two pockets on each side and red shoes. His expression is one of concern or wonderment. The foxes, in shades of orange and red, are perched on tree branches, creating a sense of curiosity or investigation. The boy stands on a dirt path, surrounded by a variety of greenery including trees, bushes, and foliage. The overall color palette is soft and pastel-like, enhancing the sense of fantasy and warmth in the scene.

Please provide the story in the following JSONformat:
1. Title
2. Content - (with proper paragraphs)
3. MoralLesson
4. CoverIllustration - (be very creative and descriptive, be very specific on the characters physical appearance and the setting and the style of the illustration, should be in English)

Make the story engaging and appropriate for the target age group. The entire story, including title and moral lesson, should be in ${language}.`;

    // Call Claude API
    const { object } = await generateObject({
      model: anthropic('claude-3-haiku-20240307'),
      prompt,
      schema: z.object({
        title: z.string(),
        content: z.string(),
        moralLesson: z.string(),
        CoverIllustration: z.string(),
      }),
    });

    return NextResponse.json(object);

  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
} 