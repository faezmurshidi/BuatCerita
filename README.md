# StorySparkle 📚✨

StorySparkle is an AI-powered children's story generator that creates engaging, personalized stories with beautiful illustrations.

## Features

- 🤖 AI-powered story generation using Claude API
- 🎨 DALL-E generated illustrations
- 🗣️ Text-to-speech narration using ElevenLabs
- 📱 Responsive, modern UI
- 📖 Book-style story presentation
- 💾 PDF download with illustrations

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Claude API for story generation
- DALL-E API for illustrations
- ElevenLabs API for text-to-speech

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/BuatCerita.git
cd BuatCerita
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your API keys:

```env
CLAUDE_API_KEY=your_claude_api_key
DALLE_API_KEY=your_dalle_api_key
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `CLAUDE_API_KEY`: Anthropic Claude API key for story generation
- `DALLE_API_KEY`: OpenAI DALL-E API key for illustrations
- `ELEVEN_LABS_API_KEY`: ElevenLabs API key for text-to-speech

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
