**AI-First Project Management Tool – MVP Requirements Document**

---

### Overview

This document outlines the minimum viable product (MVP) requirements for a lightweight, single-page, AI-first project management web application. The application is intended for managing the lifecycle of projects with a focus on AI/algorithm development and IT deployment. All project updates and data edits are made through real-time voice interaction with an LLM-powered assistant using OpenAI's real-time API.

---

### Core Features

#### 1. **Navigation**

* **Project Selector**

  * Dropdown or minimal UI element to switch between existing projects.
  * No nested navigation or pages.

#### 2. **Project Overview Screen**

* **Fields**

  * **Project Name** (read-only, editable via voice)
  * **Short Description** (1–2 sentence summary)
  * **Status** (free-form string: "planning", "blocked", "in review", etc.)
  * **Recent Updates** (timestamped log of significant events)
  * **Anticipated Next Update** (free-form or structured: "2025-06-01 - Review meeting")

#### 3. **Timelines**

* **Two Parallel Visual Timelines**

  * **Algorithm Development Timeline**

    * Milestones: e.g., "Model baseline achieved", "Experiment X concluded"
  * **IT Deployment Timeline**

    * Milestones: e.g., "Deployed to Dev", "Architecture Review scheduled"
  * Milestones can include:

    * Title
    * Date (target or actual)
    * Optional description

#### 4. **AI-First Interaction**

* **Voice Input System**

  * Utilizes OpenAI real-time voice API.
  * Button to toggle AI listening (visual indicator: on/off state).
  * Optional keyboard shortcut to start/stop listening (configurable).

* **Voice Command Handling**

  * Natural language processed into structured update commands.
  * Agent tools include:

    * Update project status
    * Add or revise description
    * Add recent update (with timestamp)
    * Add/modify milestone (date, title, description, timeline)
    * Update anticipated next update
  * **Draft Review Workflow**:

    * Most edits initiated by voice commands will appear as "drafts" in the UI (e.g., highlighted or struck-through).
    * The user must explicitly accept each draft change (e.g., via a small "accept" button, a hotkey, or a voice command) before it becomes part of the project record.
    * This ensures clarity and control while maintaining a natural, conversational input style.

#### 5. **Data Storage**

* For MVP: localStorage or simple backend with REST/GraphQL for persistence.
* Real-time updates reflected in UI.

---

### Non-Functional Requirements

* **Responsiveness**: Works on both desktop and tablet.
* **Accessibility**: Basic keyboard and screen reader support.
* **Minimalist Aesthetic**: Focus on content and voice interaction; uncluttered layout.

---

### Future Enhancements (Post-MVP, Not Required Now)

* Authentication and user accounts
* Project sharing and permissions
* Timeline zooming and filtering
* Integration with calendars or task boards
* Voice-to-text logs / history playback

---

### MVP Goal

Enable project leads to track high-level progress and plans using only voice input, reducing UI friction and centralizing critical project visibility in one simple interface.

---

### Example User Stories

#### **User Story 1: Add an Algorithm Milestone**

**As** a project lead,
**I want** to add a milestone to the algorithm development timeline via voice command,
**so that** I can quickly document progress during stand-up meetings.

**Voice Input**: "Add a milestone to the algorithm timeline called 'Baseline model trained' for next Friday."

**Outcome**:

* A new milestone appears under the Algorithm Development timeline:

  * **Title**: Baseline model trained
  * **Date**: \[Next Friday's date]
  * **Timeline**: Algorithm Development
  * **Description**: (left blank unless provided)

#### **User Story 2: Update Project Status and Next Anticipated Update**

**As** a technical program manager,
**I want** to update the status and expected next update using my voice,
**so that** the team can see what's coming up without logging into another tool.

**Voice Input**: "Set the status to 'In review' and note that the next anticipated update is on June 3rd when we meet with the architecture team."

**Immediate UI Response (Draft State)**:

* **Status**: ~~Planning~~ → **In review** (marked as draft)
* **Anticipated Next Update**: ~~None~~ → **June 3 – Meeting with architecture team** (marked as draft)
* A draft entry appears in **Recent Updates**:

  * **Timestamp**: \[current time]
  * **Entry**: Draft – Status updated to 'In review'. Next update scheduled for June 3.

**AI Prompt**: "I’ve drafted the following updates. Would you like to apply them?"

**User Voice Confirmation**: "Yes, apply the updates."

**Final UI State (Committed)**:

* **Status**: In review
* **Anticipated Next Update**: June 3 – Meeting with architecture team
* A confirmed entry appears in **Recent Updates**:

  * **Timestamp**: \[current time]
  * **Entry**: Status updated to 'In review'. Next update scheduled for June 3.

### Tech Stack

* Single Page App
* Might as well be react, using npm to manage dependencies
* REally want to keep things simple.  No state management libraries, etc.
* OpenAI Realtime API.
* Timelines should be SVG, open to suggestions for libraries there.  D3 JS is a personal favorite, but it doesn't really need to be fancy.
* Storage can be localStorage.  We can update it later if need be.
