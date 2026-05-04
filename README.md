# 🤖 AI Vision Chat - Multi-Model Chatbot with Image Analysis

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A powerful AI chatbot with vision capabilities, supporting multiple AI models and image analysis.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [API Keys](#-api-keys) • [Deployment](#-deployment)

---

### 🌐 Links

**🚀 Live Demo:** [https://chat.fsu.my.id/](https://chat.fsu.my.id/)  
**📚 API Documentation:** [https://chatfsu.stoplight.io/docs/chatfsu/ugmoyxnath33g-chatbot-ai-vision-api](https://chatfsu.stoplight.io/docs/chatfsu/ugmoyxnath33g-chatbot-ai-vision-api)

</div>

---

## ✨ Features

### 🤖 Multi-Model AI Support
- **11+ AI Models** from multiple providers
- **Resita AI**: 7 free models (ChatGPT, Claude, Gemini, etc.)
- **NekoLabs AI**: 4 GPT models (GPT-4o, GPT-5 Mini/Nano)
- **OpenRouter**: 100+ models (with API key)
- **Google Gemini**: Direct API support

### 🖼️ Image Analysis
- Upload and analyze images with AI vision
- Powered by Google Gemini and OpenRouter
- Support for multiple image formats
- Detailed image descriptions and analysis

### 💬 Advanced Chat Features
- **Real-time streaming** responses
- **Edit messages** without duplicates
- **Regenerate responses** with different models
- **Chat history** with auto-save
- **Export/Import** conversations
- **Search** through chats
- **Star** important conversations

### 🎨 Modern UI/UX
- **Dark/Light mode** support
- **Responsive design** (mobile, tablet, desktop)
- **Markdown rendering** with syntax highlighting
- **Code highlighting** for 100+ languages
- **Smooth animations** and transitions
- **Typing indicators** for better UX

### ⚙️ Customization
- Adjustable temperature, max tokens
- Custom system prompts
- Model-specific settings
- Folder organization for chats

---

## 🎯 Demo

### Chat Interface
![Chat Interface](https://i.ibb.co.com/fd4QVGML/chat-fsu-my-id.png)

### Image Analysis
![Image Analysis](https://i.ibb.co.com/jZv3sQqr/Screenshot-2025-10-11-215940.png)

### Model Selection
![Model Selection](https://i.ibb.co.com/vxSLqcbV/chat-fsu-my-id-1.png)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- API keys (at least one provider)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/firdausmntp/chat-bot-nextjs.git
cd chat-bot-nextjs
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Setup environment variables**
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local and add your API keys
nano .env.local
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open browser**
```
http://localhost:3000
```

---

## 🔑 API Keys

### Get Free API Keys

#### 🌟 Google Gemini (Recommended - Free!)
1. Visit: https://aistudio.google.com/app/apikey
2. Login with Google Account
3. Click "Create API Key"
4. Copy key (format: `AIzaxxxxx`)
5. Add to `.env.local`:
```bash
GOOGLE_CLOUD_API_KEY=AIzaxxxxx_your_key_here
```

#### 🆓 OpenRouter (100+ Models!)
1. Visit: https://openrouter.ai/keys
2. Sign up & verify email
3. Get free credits
4. Copy key (format: `sk-or-xxxxx`)
5. Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-or-xxxxx_your_key_here
```

#### 🤖 OpenAI (Optional)
1. Visit: https://platform.openai.com/api-keys
2. Sign up ($5 free credit for new users)
3. Create new secret key
4. Copy key (format: `sk-proj-xxxxx`)
5. Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-xxxxx_your_key_here
```

#### 🧠 Anthropic Claude (Optional)
1. Visit: https://console.anthropic.com/settings/keys
2. Sign up for account
3. Create key
4. Copy key (format: `sk-ant-xxxxx`)
5. Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx_your_key_here
```

### Environment Variables

Create `.env.local` file:

```bash
# Required (choose at least one)
GOOGLE_CLOUD_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_or_openrouter_key

# Optional
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NODE_ENV=development
PORT=3000
```

---

## 📖 Usage

### Starting a New Chat

1. Click **"New Chat"** button on homepage
2. Select AI model from dropdown
3. Type your message
4. Press Enter or click Send

### Image Analysis

1. Click **📷 Image Analysis** button
2. Upload an image (drag & drop or click)
3. Add optional prompt
4. AI will analyze and describe the image

### Editing Messages

1. Hover over your message
2. Click ✏️ **Edit** icon
3. Modify text and click **Save**
4. AI will generate new response

### Regenerating with Different Models

1. Hover over AI response
2. Click ⟳ **Regenerate** icon
3. Choose from dropdown:
   - Current Model (re-roll)
   - Any other available model
4. AI generates new response with selected model

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Send message
- `Ctrl/Cmd + N` - New chat
- `Ctrl/Cmd + K` - Search chats
- `Ctrl/Cmd + B` - Toggle sidebar
- `Ctrl/Cmd + ,` - Open settings

---

## 🏗️ Project Structure

```
chatbot-ai-vision/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── chat/            # Chat API endpoint
│   │   ├── image-analysis/  # Image analysis endpoint
│   │   └── upload-image/    # Image upload endpoint
│   ├── chat/[chatId]/       # Chat page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── chat/               # Chat components
│   ├── image/              # Image components
│   ├── settings/           # Settings components
│   ├── sidebar/            # Sidebar component
│   └── ui/                 # UI components
├── config/                 # Configuration files
│   └── constants.ts        # App constants & models
├── hooks/                  # Custom React hooks
│   ├── useChat.ts         # Chat logic hook
│   └── useImageAnalysis.ts # Image analysis hook
├── lib/                    # Utilities & stores
│   ├── store/             # Zustand stores
│   ├── env.ts             # Environment config
│   └── utils.ts           # Utility functions
├── types/                  # TypeScript types
│   └── index.ts           # Type definitions
├── public/                 # Static files
│   └── temp/              # Temporary uploads
├── .env.local             # Environment variables (create this!)
├── .env.example           # Example env file
├── next.config.js         # Next.js config
├── tailwind.config.js     # Tailwind CSS config
└── package.json           # Dependencies
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.0** - React framework with App Router
- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Tailwind CSS 3.4** - Styling
- **Zustand 4.5** - State management

### Backend
- **Next.js API Routes** - Serverless functions
- **Axios** - HTTP client
- **Markdown Rendering** - react-markdown, remark-gfm
- **Syntax Highlighting** - highlight.js

### AI Providers
- **OpenRouter** - Multi-model API gateway
- **Google Gemini** - Vision & text models
- **Resita API** - Free AI models
- **NekoLabs API** - GPT models

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### cPanel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2
pm2 start ecosystem.config.js
```

### Docker

```bash
# Build image
docker build -t chatbot-ai-vision .

# Run container
docker run -p 3000:3000 --env-file .env.local chatbot-ai-vision
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run type-check   # TypeScript check
npm run format       # Format code with Prettier
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write clean, documented code
- Test before submitting PR

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

---

## 🎯 Roadmap

- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Chat sharing & collaboration
- [ ] Custom AI model training
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Plugin system
- [ ] Admin dashboard

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Hosting & deployment
- **OpenRouter** - Multi-model API access
- **Google** - Gemini API
- **Anthropic** - Claude API
- **OpenAI** - GPT models

---

## 📞 Support

- **Documentation**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/firdausmntp/chat-bot-nextjs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/firdausmntp/chat-bot-nextjs/discussions)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=firdausmntp/chat-bot-nextjs&type=Date)](https://star-history.com/#firdausmntp/chat-bot-nextjs&Date)

---

<div align="center">

**Made with ❤️ by [Firdaus](https://github.com/firdausmntp)**

If you find this project helpful, please give it a ⭐!

[⭐ Star on GitHub](https://github.com/firdausmntp/chat-bot-nextjs) • [🐛 Report Bug](https://github.com/firdausmntp/chat-bot-nextjs/issues) • [💡 Request Feature](https://github.com/firdausmntp/chat-bot-nextjs/issues)

</div>
