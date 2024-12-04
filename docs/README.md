# 🐻 StorySparkle: AI-Powered Children's Book Generator

## 📘 Project Overview

StorySparkle is an innovative web application that leverages generative AI to create personalized, engaging children's stories with custom illustrations.

## 🚀 Tech Stack

- **Frontend**: Next.js 14
- **AI Text Generation**: Claude (Anthropic)
- **AI Illustration**: DALL-E 3 / Midjourney
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Deployment**: Vercel

## 🛠 Core Features

- Interactive story generation interface
- AI-powered narrative creation
- Dynamic illustration generation
- Customizable story parameters
- Downloadable story outputs

## 📦 Prerequisites

- Node.js (v18+)
- npm/yarn
- Anthropic API Key
- OpenAI/Midjourney API Key

## 🔧 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/storysparkle.git
cd storysparkle
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create `.env.local` with:

```
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_dalle_api_key
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

## 🌐 API Integration

- **Text Generation**: Claude API
- **Illustration**: DALL-E 3 API
- Custom prompt engineering for consistent output

## 📋 Key Components

- `components/StoryGenerator.tsx`: Main generation interface
- `lib/aiService.ts`: AI API interaction logic
- `hooks/useStoryGeneration.ts`: Generation state management

## 🔒 Usage Considerations

- Ensure age-appropriate content filtering
- Monitor API usage and costs
- Implement proper error handling

## 🚧 Roadmap

- [ ] Enhanced illustration customization
- [ ] Multi-language support
- [ ] Offline story saving
- [ ] Expanded genre options

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## 📄 License

MIT License

## 💬 Support

File issues on GitHub repository
