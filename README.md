# Healthy Harvest – Groundnut Advisory Platform

Healthy Harvest is a digital advisory platform designed to support groundnut farmers with AI-powered tools, expert advice, and smart agricultural solutions. The platform uses vision AI (Qwen, DeepSeek, and NVIDIA Nemotron) to analyze plant images and provide instant disease diagnosis with treatment recommendations.

## 🌾 Features

- **AI Disease Diagnosis:** Upload plant images for instant disease detection and treatment recommendations using multi-provider AI fallback.
- **Weather Advisory:** Access real-time weather forecasts and historical data to plan farming activities.
- **Market Analysis:** Get AI-driven insights on market trends and prices for groundnut and related crops.
- **Expert Advice:** Connect with agricultural experts for personalized guidance.
- **Notifications:** Receive timely alerts about weather, pests, diseases, and market changes.
- **Glossary:** Learn agricultural terms and best practices.
- **Farm Management:** Track crops, manage farm inventory, and view farm history.

## 🏗️ Design Principles

- **DRY (Don't Repeat Yourself):** Code is structured to avoid duplication and promote maintainability.
- **SOLID Principles:** Both frontend and backend are designed for modularity, extensibility, and single responsibility.
- **Modularity & Reusability:** All code (frontend and backend) is organized into modules and utilities for maximum reuse and easy maintenance.
- **Frontend UI/UX Patterns:** Consistent event handling, state management, and template rendering are used for a modern, maintainable UI.
- **Backend Best Practices:** Follows modular Express.js structure, with middleware, routers, and error handling separated for clarity and scalability.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jobakure77-gif/health-harvest.git
   cd health-harvest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in the root directory:
     ```bash
     cp .env.example .env
     ```
   - Add your API keys for AI providers:
     ```env
     # Qwen API (OpenRouter)
     QWEN_API_KEY=your_qwen_key_here
     QWEN_API_BASE=https://openrouter.ai/api/v1
     QWEN_MODEL=qwen/qwen-2.5-vl-72b-instruct

     # NVIDIA Nemotron
     NEMOTRON_API_KEY=your_nvidia_key_here
     NEMOTRON_API_BASE=https://integrate.api.nvidia.com/v1
     NEMOTRON_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning

     # DeepSeek (Optional)
     DEEPSEEK_API_KEY=your_deepseek_key_here
     ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with hot-reload:
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Open `http://localhost:5000` in your browser

## 📁 Project Structure

```
healthy-harvest/
├── public/                 # Frontend HTML/CSS/JS
│   ├── index.html         # Home page
│   ├── dashboard.html     # User dashboard
│   ├── diagnose.html      # Image diagnosis page
│   ├── style.css          # Main stylesheet
│   ├── script.js          # Global scripts
│   └── frontend/          # Frontend utilities
│       ├── api-client.js  # API communication
│       ├── form-utils.js  # Form handling
│       └── ui-utils.js    # UI components
├── backend/               # Backend logic
│   ├── modular-server.js # Express app setup
│   ├── plantAgent.js     # Plant detection AI
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   └── routes/           # API routes
│       ├── api.js        # Main API router
│       └── plant.js      # Plant diagnosis routes
├── server.js              # Entry point
├── package.json           # Dependencies
├── railway.json           # Railway deployment config
└── README.md             # This file
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` – Server health status (used by Railway)

### Plant Diagnosis
- `POST /api/plant/check` – Validate if image contains a plant
- `POST /api/plant/diagnose` – Analyze plant image and diagnose diseases
- `POST /api/plant/check/nemotron` – Plant validation using NVIDIA Nemotron
- `POST /api/plant/diagnose/nemotron` – Disease diagnosis using NVIDIA Nemotron

## 🧠 AI Providers

The platform supports multiple vision AI providers with automatic fallback:

1. **Qwen VL (OpenRouter)** – Primary provider
2. **NVIDIA Nemotron** – Fallback with reasoning capability
3. **DeepSeek** – Additional fallback option

The system automatically tries providers in order and falls back if one is unavailable or rejects the image.

## 🚢 Deployment on Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected

### Steps
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard:
   - `QWEN_API_KEY`
   - `NEMOTRON_API_KEY`
   - `NODE_ENV=production` (optional)

3. Railway automatically detects `railway.json` and deploys using:
   - **Builder:** Nixpacks
   - **Build Command:** `npm install --omit=optional`
   - **Start Command:** `node server.js`
   - **Health Check:** `/api/health` (30s timeout)

The application will be live at `https://your-app.up.railway.app`

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Responsive design for mobile and desktop
- Real-time form validation

**Backend:**
- Node.js with Express.js
- Multer for image uploads
- Axios for HTTP requests
- dotenv for environment configuration

**AI & Vision:**
- Qwen VL (via OpenRouter)
- NVIDIA Nemotron 3
- DeepSeek Vision

**Deployment:**
- Railway.app (recommended)
- Node.js runtime

## 👥 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request with a clear description

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 📞 Contact & Support

- **Email:** support@healthyharvest.ug
- **Phone:** +256 768 103 829
- **GitHub:** [jobakure77-gif/health-harvest](https://github.com/jobakure77-gif/health-harvest)

## 🙏 Acknowledgments

- Agricultural experts and farmers who contributed insights
- AI providers: OpenRouter, NVIDIA, DeepSeek
- Open source community for excellent tools and libraries

---

**Made with ❤️ for African farmers**
