# AI Apply Assistant

A full-stack web application that helps users track job applications and optimize their resumes using AI.

## Features

- 📄 **Resume Management**: Upload and manage PDF/text resumes
- 🎯 **Job Opportunity Tracking**: Track applications across 4 stages (Applied, Interview, Accepted, Rejected)
- 🤖 **AI Integration**: Extract skills from job descriptions and optimize resumes using OpenAI
- 🎨 **Drag & Drop**: Move opportunities between stages with intuitive drag-and-drop
- 📊 **Skills Analysis**: Automatically extract hard and soft skills from job descriptions
- 💾 **Local Storage**: All data stored locally with SQLite

## Tech Stack

### Backend
- **Framework**: Fastify + TypeScript
- **Database**: SQLite with Drizzle ORM
- **AI**: OpenAI GPT-3.5-turbo
- **File Processing**: PDF parsing with pdf-parse

### Frontend
- **Framework**: Vue 3 + Vite + TypeScript
- **State Management**: Pinia
- **UI**: Tailwind CSS + DaisyUI
- **Drag & Drop**: SortableJS

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

**Note**: If you get a "no such table" error when testing the API, make sure you've run the database migrations above.

6. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

### 1. Upload Resumes
- Go to the "Resumes" tab
- Upload PDF or text files
- The system will automatically parse the content

### 2. Create Opportunities
- Go to the "Opportunities" tab
- Click "Add Opportunity"
- Fill in company details and job description
- Select a base resume
- Click "Extract Skills & Optimize Resume"
- Review the AI-generated optimized resume
- Create the opportunity

### 3. Manage Applications
- Drag and drop cards between columns (Applied, Interview, Accepted, Rejected)
- View optimized resumes and extracted skills
- Download optimized resumes as text files

## API Endpoints

### Resumes
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get resume by ID
- `DELETE /api/resumes/:id` - Delete resume

### Opportunities
- `POST /api/opportunities` - Create opportunity (with AI processing)
- `GET /api/opportunities` - Get all opportunities
- `GET /api/opportunities/:id` - Get opportunity by ID
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### AI Services
- `POST /api/llm/extract-skills` - Extract skills from job description
- `POST /api/llm/optimize-resume` - Optimize resume for job

## Database Schema

### Resumes
- `id` - Primary key
- `filename` - Original filename
- `originalText` - Parsed text content
- `uploadedAt` - Upload timestamp

### Opportunities
- `id` - Primary key
- `company` - Company name
- `jobDescription` - Job description text
- `url` - Job posting URL
- `salary` - Salary information
- `status` - Application status (applied/interview/accepted/rejected)
- `resumeId` - Foreign key to resumes
- `extractedSkills` - JSON of extracted skills
- `optimizedResume` - AI-optimized resume text
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate database migrations
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run migrations
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details