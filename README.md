# 🎭 Age Labs AI

> *See your future self or revisit your past with AI-powered age progression & regression* ✨

![TypeScript](https://img.shields.io/badge/TypeScript-94%25-3178c6?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-3.8%25-F7DF1E?style=for-the-badge)
![CSS](https://img.shields.io/badge/CSS-1.2%25-1572B6?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML-1%25-E34C26?style=for-the-badge)

## 🌍 Overview

Age Labs AI is a modern React + TypeScript web app that lets users upload a portrait and transform it with AI to simulate age progression or age regression. The app uses Pollinations.ai to generate the transformed image directly in the browser, supports multiple styles, and includes a multilingual interface, camera capture, history gallery, and responsive theming.

This project is designed as a fast, privacy-conscious local-first experience: the user selects a photo, customizes the transformation, generates the result, and can save or reuse creations from the gallery.

## ✨ Features

- 🤖 **AI-powered age transformation** with Pollinations.ai
- ⏳ **Age progression and regression** with adjustable target age
- 🎨 **Multiple visual styles** such as realistic, oil painting, anime, marble, neon, and custom prompts
- 📸 **Image upload and camera capture** support
- 🌐 **Multi-language interface** with 20+ supported languages
- 🌓 **Theme support** with light, dark, and navy modes
- 🖼️ **Creation history gallery** saved locally in the browser
- 📱 **Responsive mobile-friendly interface** with Android-style bottom navigation
- ⚡ **Fast Vite-based frontend** with real-time UI updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or Bun
- A browser with camera permissions if you want to use the quick-capture flow

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MeowDev1011/Age-Labs-AI.git
   cd Age-Labs-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables (optional)**
   ```bash
   cp .env.example .env.local
   ```

   The app can run without a custom API key because it uses Pollinations.ai directly. The sample file contains optional Gemini variables if future integrations are added.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Open the app**
   Visit `http://localhost:5173` in your browser.

## 💻 How to Use

1. **Upload or capture a photo** 📸
   - Use the upload area or the quick camera option
   - Pick a clear portrait with visible facial features for better results

2. **Choose the transformation** 🎯
   - Select the target age
   - Choose whether you want to age forward or reverse
   - Add a person name if you want the prompt to be more personalized

3. **Select a style** 🎨
   - Use a preset like Realista, Oil Painting, Anime, Marble, Neon, or a custom prompt

4. **Generate the image** ✨
   - Click the transform button and wait for Pollinations.ai to respond

5. **Review and save** 📥
   - Compare the generated result
   - Save it to the gallery or reapply a new style if needed

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS, custom design system, responsive UI
- **AI Generation**: Pollinations.ai image API
- **State & UX**: React hooks, context providers, local history persistence
- **Package Manager**: npm / Bun
- **PWA support**: Vite plugin for progressive web app features

## 📦 Project Structure

```text
Age-Labs-AI/
├── components/          # Reusable UI components
├── constants/           # App constants and style definitions
├── context/             # Theme and i18n providers
├── hooks/               # Custom hooks
├── i18n/                # Language list and translations
├── public/              # Static public assets
├── scripts/             # Project scripts
├── services/            # AI generation and local persistence logic
├── utils/               # Utility helpers
├── App.tsx              # Main application container
├── index.css            # Global styles
├── index.html           # Vite entry point
├── index.tsx            # React bootstrap
├── metadata.json        # App metadata
├── package.json         # Dependencies and scripts
├── .env.example         # Optional environment variables template
├── types.ts             # Shared TypeScript types
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite configuration
├── LICENSE              # License
├── README.md            # Project documentation
└── vite-env.d.ts       # Vite TypeScript definitions
```

## 🔑 Environment Variables

The project includes a sample environment file:

```env
# Optional Gemini API Key (kept for compatibility with future integrations)
GEMINI_API_KEY=
VITE_GEMINI_API_KEY=
```

In the current version, the main image generation flow is handled directly through Pollinations.ai via the frontend service layer, so no API key is strictly required for the default workflow.

## 🧪 Validation & Build

To verify the project still builds correctly:

```bash
npm run build
```

This command checks that the Vite app compiles successfully for production.

## 📖 AI Workflow

The app does not currently use a server-side API route. Instead, it calls the Pollinations.ai image endpoint from the client via the service layer:

- `services/pollinationsService.ts` builds the portrait generation prompt
- `services/geminiService.ts` exposes the AI transform function used by the app
- `App.tsx` orchestrates upload, age settings, image generation, and result handling

This keeps the app simple and allows direct AI transformations without requiring a custom backend.

## 🌍 Supported Languages

The interface supports the following languages:

- 🇪🇸 Spanish
- 🇬🇧 English
- 🇵🇹 Portuguese
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese
- 🇷🇺 Russian
- 🇸🇦 Arabic
- 🇮🇳 Hindi
- 🇹🇷 Turkish
- 🇳🇱 Dutch
- 🇵🇱 Polish
- 🇮🇩 Indonesian
- 🇻🇳 Vietnamese
- 🇹🇭 Thai
- 🇸🇪 Swedish
- 🇬🇷 Greek
- 🇨🇿 Czech
- 🇺🇦 Ukrainian
- 🇷🇴 Romanian
- 🇭🇺 Hungarian
- 🇮🇱 Hebrew
- 🇩🇰 Danish
- 🇳🇴 Norwegian

## 🤝 Contributing

We welcome contributions! 🎉

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Pollinations.ai for the image generation backend
- React and Vite for the frontend foundation
- The open-source community for the awesome libraries and tooling
- All contributors and testers

## 📧 Support & Contact

Have questions or found a bug? 🐛

- 📌 Open an [Issue](https://github.com/MeowDev1011/Age-Labs-AI/issues)
- 💬 Start a [Discussion](https://github.com/MeowDev1011/Age-Labs-AI/discussions)
- 🧑‍💻 Visit the repository: [MeowDev1011/Age-Labs-AI](https://github.com/MeowDev1011/Age-Labs-AI)

## 🚀 Try It Out Now!

**[🌐 Visit Age Labs AI](https://age-labs-ai.ai.studio/)**

---

**Made with ❤️ by [MeowDev1011](https://github.com/MeowDev1011)**

🎯 Follow my Lichess profile: [@GatoChess89](https://lichess.org/@/GatoChess89)

⭐ If you love this project, please give it a star! ⭐
