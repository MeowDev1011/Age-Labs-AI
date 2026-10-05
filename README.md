# 🎭 Age Labs AI

> *See your future self or revisit your past with AI-powered age progression & regression* ✨

![TypeScript](https://img.shields.io/badge/TypeScript-94%25-3178c6?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-3.8%25-F7DF1E?style=for-the-badge)
![CSS](https://img.shields.io/badge/CSS-1.2%25-1572B6?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML-1%25-E34C26?style=for-the-badge)

## 🌍 Overview

Age Labs AI is a modern React + TypeScript web app that lets users upload a portrait and transform it with AI to simulate age progression or age regression. The app uses a multi-engine image pipeline that tries Google Gemini first, then Puter.js, and finally Pollinations.ai to generate realistic or stylized portraits based on age transformations, custom prompts, and visual filters.

This project is designed as a fast, privacy-conscious local-first experience: the user selects a photo, customizes the transformation, generates the result, and can save or reuse creations from their own browser gallery.

## ✨ Features

- 🤖 **AI-powered age transformation** with a multi-provider pipeline
- ⏳ **Age progression and regression** with adjustable target age
- 🎨 **Multiple visual styles** such as ultra realistic, ceramic, cabin, robotic, oil painting, anime, marble, noir, watercolor, and neon
- 📸 **Image upload, camera capture, and HEIC image handling** support
- 🌐 **Multi-language interface** with 25+ supported languages
- 🌓 **Theme support** with light, dark, and navy modes
- 🖼️ **Creation history gallery** saved locally in the browser
- 📱 **Responsive mobile-friendly interface** with Android-style bottom navigation
- ⚡ **Fast Vite-based frontend** with real-time UI updates
- 📦 **PWA-ready setup** for installable app behavior

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

   The app can run without a custom API key because it falls back between multiple AI providers. The sample file includes optional Gemini variables for compatibility with the primary generation engine.

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
   - Use a preset like Ultra Realista, Painting, Anime, Marble, Neon, or a custom prompt

4. **Generate the image** ✨
   - Click the transform button and wait for the AI pipeline to respond

5. **Review and save** 📥
   - Compare the generated result
   - Save it to the gallery or reapply a new style if needed

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS, custom design system, responsive UI
- **AI Generation**: Google GenAI, Puter.js, and Pollinations.ai
- **Image handling**: HEIC conversion support via `heic2any`
- **State & UX**: React hooks, context providers, local history persistence
- **Package Manager**: npm / Bun
- **PWA support**: Vite plugin for progressive web app features
- **Icons**: `lucide-react`

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
│   ├── geminiService.ts # Primary AI transformation pipeline
│   ├── puterService.ts  # Puter.js fallback generator
│   ├── pollinationsService.ts # Pollinations fallback generator
│   └── historyService.ts # Local gallery persistence
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
# Optional Gemini API Key (used by the primary AI generation engine)
GEMINI_API_KEY=
VITE_GEMINI_API_KEY=
```

In the current version, the app tries multiple generation providers in sequence. If Gemini is unavailable or missing a key, the flow falls back to Puter.js and then Pollinations.ai.

## 🧪 Validation & Build

To verify the project still builds correctly:

```bash
npm run build
```

This command checks that the Vite app compiles successfully for production.

## 📖 AI Workflow

The app does not rely on a single backend route. Instead, the transformation flow is handled from the frontend service layer in `services/geminiService.ts`:

- Google Gemini is attempted first with `@google/genai`
- Puter.js is used as a fallback if Gemini is unavailable
- Pollinations.ai is the final fallback for image generation
- `App.tsx` orchestrates upload, age settings, image generation, and result handling

This keeps the app lightweight while supporting multiple AI backends and letting the user keep working without a custom server-side API requirement.

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

- Google Gemini for the primary AI generation path
- Puter.js and Pollinations.ai for additional generation fallback support
- React and Vite for the frontend foundation
- The open-source community for the awesome libraries and tooling
- All contributors and testers

## 📧 Support & Contact

Have questions or found a bug? 🐛

- 📌 Open an [Issue](https://github.com/MeowDev1011/Age-Labs-AI/issues)
- 💬 Start a [Discussion](https://github.com/MeowDev1011/Age-Labs-AI/discussions)
- 🧑‍💻 Visit the repository: [MeowDev1011/Age-Labs-AI](https://github.com/MeowDev1011/Age-Labs-AI)

## 🚀 Try It Out Now!

**[🌐 Visit Age Labs AI](https://age-labs.ai.studio/)**

---

**Made with ❤️ by [MeowDev1011](https://github.com/MeowDev1011)**

🎯 Follow my Lichess profile: [@GatoChess89](https://lichess.org/@/GatoChess89)

⭐ If you love this project, please give it a star! ⭐
