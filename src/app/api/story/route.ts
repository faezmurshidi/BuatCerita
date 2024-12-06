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
2. Story content (with proper paragraphs)
3. Moral lesson
4. Cover Illustrations (be very creative and descriptive, be very specific on the characters physical appearance and the setting and the style of the illustrations)

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

    if (!response.content[0] || !response.content[0].text) {
      throw new Error("Invalid response from Claude API");
    }

    const storyContent = response.content[0].text;

    console.log('storyContent', storyContent);

    // Parse the story content
    const [title, ...rest] = storyContent.split("\n\n");
    const content = rest.join("\n\n");

    // Extract moral lesson and illustrations if they exist
    const moralMatch = content.match(/Moral lesson:(.*?)(?=\n\nSuggested illustrations:|\n\n|$)/i);
    const illustrationsMatch = content.match(/Suggested illustrations:(.*?)$/i);

    const extractedMoralLesson = moralMatch ? moralMatch[1].trim() : "";
    const suggestedIllustrations = illustrationsMatch
      ? illustrationsMatch[1]
          .split("\n")
          .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
          .filter(Boolean)
      : [];

    return NextResponse.json({
      title: title.replace(/^Title:\s*/i, "").trim(),
      content: content
        .replace(/Moral lesson:.*$/i, "")
        .replace(/Suggested illustrations:.*$/i, "")
        .trim(),
      moralLesson: extractedMoralLesson,
      suggestedIllustrations,
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