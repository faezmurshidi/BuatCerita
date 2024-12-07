import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

if (!process.env.CLAUDE_API_KEY) {
  throw new Error("Missing CLAUDE_API_KEY environment variable");
}

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

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

Please provide the story in the following JSONformat:
1. Title
2. Story - (with proper paragraphs)
3. MoralLesson
4. CoverIllustrations - (be very creative and descriptive, be very specific on the characters physical appearance and the setting and the style of the illustrations)

Make the story engaging and appropriate for the target age group. The entire story, including title and moral lesson, should be in ${language}.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      temperature: 0.7,
      system:
        "You are a award-winningtalented multilingual children's book author. Create engaging, age-appropriate stories with clear moral lessons. Use simple language and vivid descriptions appropriate for the requested language.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response.content[0] || !('text' in response.content[0])) {
      throw new Error("Invalid response from Claude API");
    }

    const storyContent = response.content[0].text;

    console.log('storyContent', storyContent);

    // Parse the story content
    // Find the first occurrence of '{' and parse from there
const jsonStartIndex = storyContent.indexOf('{');
const jsonContent = storyContent.slice(jsonStartIndex);
    // Extract moral lesson and illustrations if they exist
    const parsedContent = JSON.parse(jsonContent);
  
  return NextResponse.json({
    title: parsedContent.Title,
    content: parsedContent.Story,
    moralLesson: parsedContent.MoralLesson,
    suggestedIllustrations: [parsedContent.CoverIllustrations],
    language
  });

  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
} 