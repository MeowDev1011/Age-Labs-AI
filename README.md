# 🎭 Age Labs AI

> *See your future self or revisit your past with AI-powered age progression & regression* ✨

![TypeScript](https://img.shields.io/badge/TypeScript-93.3%25-3178c6?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-4.3%25-F7DF1E?style=for-the-badge)
![CSS](https://img.shields.io/badge/CSS-1.3%25-1572B6?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML-1.1%25-E34C26?style=for-the-badge)

## 🌍 Overview

Age Labs AI is a cutting-edge web application powered by Google's **Gemini API** that generates realistic images showing how you might look in the future or how you looked in the past. With support for **10+ languages** and multiple filters, this app brings age progression and regression technology to your fingertips! 🚀

## ✨ Features

- 🤖 **AI-Powered Image Generation** - Uses Google Gemini API for realistic age transformations
- 🌐 **Multi-Language Support** - 10+ languages for global accessibility
- 🎨 **Advanced Filters** - Customize your transformation with various filter options
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Fast Processing** - Quick image generation with optimized performance
- 🎯 **User-Friendly Interface** - Intuitive controls for easy navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Google Gemini API key ([Get one here](https://ai.google.dev/))

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
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000` 🎉

## 💻 How to Use

1. **Upload a Photo** 📸
   - Click the upload button and select a clear facial photo
   - Ensure good lighting for best results

2. **Select Your Preference** 🎯
   - Choose between:
     - ⏳ **Age Progression**: See yourself older
     - ⏮️ **Age Regression**: See yourself younger
   - Select the number of years to transform

3. **Apply Filters** (Optional) 🎨
   - Choose from various filter options to customize the look
   - Preview changes in real-time

4. **Generate Image** ✨
   - Click "Generate" and wait for the AI magic ✨
   - The transformed image will appear on screen

5. **Download or Share** 📥
   - Save your transformed image
   - Share on social media

## 🛠️ Technology Stack

- **Frontend**: TypeScript, React, Next.js
- **Styling**: CSS, Tailwind CSS (if applicable)
- **API**: Google Gemini API
- **Package Manager**: npm/yarn

## 📦 Project Structure

```
Age-Labs-AI/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   ├── styles/          # CSS files
│   └── utils/           # Utility functions
├── .env.example         # Environment variables template
├── package.json         # Project dependencies
└── README.md           # This file
```

## 🔑 Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 🧪 Testing

To test the application:

1. Visit the live demo: [🌐 Age Labs AI](https://github.com/MeowDev1011/Age-Labs-AI) 
2. Upload a photo and try different age transformations
3. Test various filters and preferences

## 📖 API Documentation

### Generate Image Endpoint

```
POST /api/generate
Content-Type: application/json

{
  "imageBase64": "base64_encoded_image",
  "ageYears": 10,
  "mode": "progression" | "regression",
  "filters": ["filter1", "filter2"],
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "generated_image_url",
  "timestamp": "2026-09-28T00:00:00Z"
}
```

## 🌍 Supported Languages

- 🇬🇧 English
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese (Simplified & Traditional)
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- *(and more!)*

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

- Google Gemini API for powerful AI capabilities
- All contributors and testers
- The open-source community

## 📧 Support & Contact

Have questions or found a bug? 🐛

- 📌 Open an [Issue](https://github.com/MeowDev1011/Age-Labs-AI/issues)
- 💬 Start a [Discussion](https://github.com/MeowDev1011/Age-Labs-AI/discussions)
- 📮 Reach out via email

## 🚀 Try It Out Now!

**[🌐 Visit Age Labs AI](https://github.com/MeowDev1011/Age-Labs-AI)**

---

**Made with ❤️ by [MeowDev1011](https://github.com/MeowDev1011)**

🎯 Follow my Lichess profile: [@GatoChess89](https://lichess.org/@/GatoChess89)

⭐ If you love this project, please give it a star! ⭐
