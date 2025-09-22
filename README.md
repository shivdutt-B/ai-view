<div style="font-family: Arial, sans-serif;">

<table align="center">
  <tr>
    <td><h1 style="margin: 0; padding-left: 10px;">AI Interview</h1></td>
  </tr>
</table>
<!-- #<br> -->
<div align="center"><h2><code>AI-Powered Mock Interview & Candidate Evaluation Platform</code></h2></div>
<br>

<div align="center">

[![Node.js](https://img.shields.io/badge/Built%20With-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![AssemblyAI](https://img.shields.io/badge/Audio%20Analysis-AssemblyAI-8A2BE2?style=for-the-badge&logo=soundcharts&logoColor=white)](https://www.assemblyai.com/)
[![Docker](https://img.shields.io/badge/Containerized-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![S3](https://img.shields.io/badge/Storage-AWS%20S3-FF9900?style=for-the-badge&logo=amazon-s3&logoColor=white)](https://aws.amazon.com/s3/)
[![GitHub](https://img.shields.io/badge/Code%20Hosted%20On-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/)

</div>

---

## 🌟 Overview

**AI Interview** is an intelligent mock interview platform that combines **text analysis** and **audio analysis** to provide candidates with detailed performance feedback.  
The platform evaluates **technical correctness, clarity, and completeness** of answers along with **tone, pauses, and confidence** in speech delivery.  

> **🎯 Mission**: Help candidates practice real interview scenarios with AI-driven evaluation to improve job readiness.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🧠 **AI Question Generation**
- Job-role specific question generation using **Gemini**
- Optional job description input for tailored questions
- Multiple interview rounds supported

</td>
<td width="50%">

### 📊 **Comprehensive Evaluation**
- **Text Analysis** → Clarity, completeness, technical correctness  
- **Audio Analysis** → Tone, pauses, hesitations, confidence  
- Scored feedback (0–100) across categories  

</td>
</tr>
<tr>
<td width="50%">

### 🎙️ **Real-time Experience**
- Speak answers with **react-speech-recognition**  
- Instant text transcription  
- Audio captured and analyzed asynchronously  

</td>
<td width="50%">

### 🏗️ **Scalable Microservices**
- Main server orchestrates traffic  
- Separate microservices for **text** & **audio** analysis  
- Decoupled architecture with clean separation of concerns  

</td>
</tr>
</table>

---

## 🏛️ Architecture Overview

<div align="center">
<img src="./readme.assets/architecture.png" alt="AI Interview Architecture" width="1100px" height="800px" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</div>

### ⚙️ Microservices Breakdown

| 🎯 Service | Port | 📝 Description | 🔧 Technology |
|------------|------|----------------|---------------|
| **💻 Frontend** | `3000` | Candidate UI for interviews | React, TailwindCSS |
| **🌐 Main Server** | `4001` | Orchestrates requests to analysis services | Node.js, Express |
| **📝 Text Analysis Service** | `4002` | Evaluates clarity, correctness, completeness | Node.js, Gemini API |
| **🎙️ Audio Analysis Service** | `4003` | Analyzes tone, pauses, hesitations | Node.js, AssemblyAI |
| **🗄️ Storage** | — | Stores audio files (Blob/S3) | AWS S3 / Azure Blob |

---

## 🛠️ Technology Stack

### 🖥️ **Backend & Services**
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Orchestrator + API Layer |
| **Gemini API** | Text Question Generation + Text Answer Evaluation |
| **AssemblyAI** | Audio Analysis (tone, pauses, confidence) |
| **Docker** | Containerization for microservices |

### 🎨 **Frontend**
| Technology | Purpose |
|------------|---------|
| **React** | UI framework |
| **TailwindCSS** | Styling |
| **react-speech-recognition** | Real-time speech-to-text |

### 🗄️ **Storage**
| Technology | Purpose |
|------------|---------|
| **AWS S3 / Azure Blob** | Store user audio recordings |

---

## 🚀 Quick Start Guide

### 📋 Prerequisites
- Node.js (v18+)
- npm / pnpm
- Docker
- AssemblyAI + Gemini API keys

### ⚡ Installation

```bash
# 1️⃣ Clone repo
git clone https://github.com/yourusername/ai-interview.git
cd ai-interview

# 2️⃣ Install dependencies
cd main-server && npm install && cd ..
cd text-analysis-service && npm install && cd ..
cd audio-analysis-service && npm install && cd ..
cd client && npm install && cd ..

# 3️⃣ Setup environment files
cp .env.example .env

# 4️⃣ Start services
# Frontend
cd client && npm run dev  # port 3000

# Main Server
cd main-server && npm run dev  # port 4001

# Text Analysis
cd text-analysis-service && npm run dev  # port 4002

# Audio Analysis
cd audio-analysis-service && npm run dev  # port 4003
```