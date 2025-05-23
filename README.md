# AI-First Project Management Tool

A voice-first project management application built with Next.js that allows you to manage AI/algorithm development and IT deployment projects through natural voice commands.

## Features

- **Voice-First Interface**: Uses OpenAI's Realtime API for natural conversation
- **Dual Timeline Management**: Separate timelines for Algorithm Development and IT Deployment
- **Draft Review Workflow**: All voice-initiated changes require explicit approval
- **Project Overview**: Comprehensive project status, recent updates, and milestone tracking
- **Real-time Updates**: Instant UI updates with localStorage persistence

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure OpenAI API**
   - Copy `.env.local` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   - You need access to the `gpt-4o-realtime-preview` model

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Allow microphone permissions when prompted
   - Select a project and click the voice button to start

## Voice Commands

The AI assistant can help you with:

- **Update project status**: "Set the status to In Progress"
- **Add milestones**: "Add a milestone called 'Model baseline complete' to the algorithm timeline for next Friday"
- **Recent updates**: "Add an update that we completed the data preprocessing"
- **Next anticipated update**: "Set the next anticipated update to June 1st for the architecture review"
- **Complete milestones**: "Mark the baseline model milestone as completed"
- **Update descriptions**: "Update the project description to include the new requirements"

## Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Voice Processing**: OpenAI Realtime API with WebRTC
- **Data Storage**: localStorage (MVP - can be upgraded to backend)
- **State Management**: React hooks (no external state library)
- **Timeline Visualization**: Custom SVG components

## Project Structure

```
src/
├── app/
│   ├── api/session/       # OpenAI session management
│   └── page.tsx           # Main application
├── components/
│   ├── DraftReview.tsx    # Draft approval interface
│   ├── ProjectOverview.tsx # Project details display
│   ├── ProjectSelector.tsx # Project dropdown
│   ├── Timeline.tsx       # Timeline visualization
│   └── VoiceInput.tsx     # Voice interface with WebRTC
├── lib/
│   └── projectTools.ts    # AI tool definitions
├── types/
│   └── project.ts         # TypeScript interfaces
└── utils/
    └── storage.ts         # localStorage utilities
```

## Development

- The app initializes with sample data if localStorage is empty
- All voice commands create drafts that require explicit approval
- WebRTC connection handles real-time audio streaming
- Tool calls from the AI are processed and converted to draft changes

## Requirements

- Modern browser with WebRTC support (Chrome, Edge, Firefox)
- Microphone access
- OpenAI API key with Realtime API access
- Node.js 18+ for development
