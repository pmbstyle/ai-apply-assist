# AI Apply Assistant

A full-stack web application that helps users track job applications and optimize their resumes using AI.

## Features

- 📄 **Resume Management**: Upload and manage PDF/text resumes with editing capabilities
- 🎯 **Job Opportunity Tracking**: Track applications across 4 stages (Applied, Interview, Accepted, Rejected)
- 🤖 **Multi-Provider AI Integration**: Support for multiple AI providers:
  - **OpenAI** (GPT-series models)
  - **Ollama** (Local LLMs)
  - **LM Studio** (Local inference server)
  - **Custom APIs** (OpenAI-compatible endpoints)
- 🎨 **Drag & Drop**: Move opportunities between stages with intuitive drag-and-drop
- 📊 **Skills Analysis**: Automatically extract hard and soft skills from job descriptions
- 🔍 **Resume Optimization Diff**: Side-by-side comparison showing exactly what was changed in optimized resumes
- ⚙️ **Flexible Setup**: Configure AI providers through an intuitive settings interface
- 💾 **Local Storage**: All data stored locally with SQLite

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
- **Diff Visualization**: diff2html

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details