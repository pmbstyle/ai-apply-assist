![image](https://github.com/user-attachments/assets/6a96f685-1b4f-4abc-a22e-3ac9db83ed37)

# Work In Progress 🏗️

A full-stack web application that helps users track job applications and optimize their resumes using AI.

## Features

### Core Features
- 📄 **Resume Management**: Upload and manage PDF/text resumes with rich markdown editing capabilities
- 🎯 **Job Opportunity Tracking**: Track applications across 4 stages (Applied, Interview, Accepted, Rejected)
- 🤖 **Multi-Provider AI Integration**: Support for multiple AI providers:
  - **OpenAI** (GPT-series models)
  - **Ollama** (Local LLMs)
  - **LM Studio** (Local inference server)
  - **Custom APIs** (OpenAI-compatible endpoints)
- 🎨 **Drag & Drop**: Move opportunities between stages with intuitive drag-and-drop
- 💾 **Local Storage**: All data stored locally with SQLite

### Advanced Resume Features
- ✨ **Rich Text Editor**: Markdown-based resume editing with live preview
- 🔍 **Enhanced Diff System**: Granular word-level change detection with accept/reject functionality
- 📝 **Change Management**: Accept or reject individual AI-suggested changes
- 📤 **Multi-Format Export**: Export resumes as TXT, PDF, or DOCX

### Skills & Analysis
- 📊 **Skills Extraction**: Automatically extract hard and soft skills from job descriptions
- 🎯 **Skill Gap Analysis**: Visual skill matching with percentage scores and recommendations
- 📈 **Match Indicators**: Real-time skill matching against your resume content
- 💡 **Smart Suggestions**: AI-powered recommendations for improving skill alignment

### Interview Management
- 📅 **Interview Tracking**: Complete CRUD operations for interview scheduling
- ⏰ **Smart Scheduling**: Date/time management with relative date formatting
- 📝 **Interview Notes**: Detailed notes and preparation tracking
- 🔔 **Visual Indicators**: Upcoming/past interview status with color coding

### User Experience
- 🏗️ **Modular Architecture**: Clean, component-based interface
- 📱 **Collapsible Sections**: Streamlined view with expandable content sections
- ⚙️ **Flexible Setup**: Configure AI providers through an intuitive settings interface
- 🎨 **Modern UI**: Tailwind CSS + DaisyUI with responsive design

## Tech Stack

### Backend
- **Framework**: Fastify + TypeScript
- **Database**: SQLite with Drizzle ORM
- **AI**: Multi-provider system (OpenAI, Ollama, LM Studio, Custom APIs)
- **File Processing**: PDF parsing with pdf-parse

### Frontend
- **Framework**: Vue 3 + Vite + TypeScript
- **State Management**: Pinia
- **UI**: Tailwind CSS + DaisyUI
- **Drag & Drop**: SortableJS
- **Rich Text**: Markdown editor with live preview
- **Diff Visualization**: diff2html + diff-match-patch for granular changes
- **Charts**: Radial progress indicators for skill matching

## Setup Instructions

### Prerequisites
- Node.js 18+
- An AI provider (choose one):
  - OpenAI API key
  - Ollama running locally
  - LM Studio with local server enabled
  - Custom OpenAI-compatible API

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

**Note**: If you get a "no such table" error when testing the API, make sure you've run the database migrations above.

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`


## License

MIT License - see LICENSE file for details
