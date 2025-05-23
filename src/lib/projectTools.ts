export const PROJECT_TOOLS = [
  {
    type: "function",
    name: "update_project_status",
    description: "Update the status of the current project",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "The new status for the project (e.g., 'In Progress', 'Blocked', 'Planning', 'In Review')"
        }
      },
      required: ["status"]
    }
  },
  {
    type: "function", 
    name: "add_milestone",
    description: "Add a new milestone to either the algorithm development or IT deployment timeline",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the milestone"
        },
        timeline: {
          type: "string",
          enum: ["algorithm", "deployment"],
          description: "Which timeline to add the milestone to"
        },
        date: {
          type: "string",
          description: "The target date for the milestone in YYYY-MM-DD format"
        },
        description: {
          type: "string",
          description: "Optional description for the milestone"
        }
      },
      required: ["title", "timeline", "date"]
    }
  },
  {
    type: "function",
    name: "add_recent_update", 
    description: "Add an entry to the recent updates log",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The update content to add to the recent updates"
        }
      },
      required: ["content"]
    }
  },
  {
    type: "function",
    name: "update_next_anticipated",
    description: "Update the anticipated next update field",
    parameters: {
      type: "object", 
      properties: {
        nextUpdate: {
          type: "string",
          description: "The anticipated next update (e.g., '2025-06-01 - Review meeting')"
        }
      },
      required: ["nextUpdate"]
    }
  },
  {
    type: "function",
    name: "update_project_description",
    description: "Update the project description",
    parameters: {
      type: "object",
      properties: {
        description: {
          type: "string", 
          description: "The new description for the project"
        }
      },
      required: ["description"]
    }
  },
  {
    type: "function",
    name: "complete_milestone",
    description: "Mark a milestone as completed",
    parameters: {
      type: "object",
      properties: {
        milestoneTitle: {
          type: "string",
          description: "The title of the milestone to mark as completed"
        },
        timeline: {
          type: "string",
          enum: ["algorithm", "deployment"],
          description: "Which timeline the milestone is on"
        }
      },
      required: ["milestoneTitle", "timeline"]
    }
  },
  {
    type: "function",
    name: "accept_draft_changes",
    description: "Accept all pending draft changes when the user confirms",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "reject_draft_changes", 
    description: "Reject all pending draft changes when the user declines",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
];

export const PROJECT_INSTRUCTIONS = `
You are an AI assistant helping manage software development projects, specifically focused on AI/algorithm development and IT deployment timelines.

You can help users:
- Update project status and descriptions
- Add milestones to algorithm development or IT deployment timelines
- Add entries to the recent updates log
- Update anticipated next updates
- Mark milestones as completed

When users mention adding milestones, ask which timeline they want (algorithm development or IT deployment) if not specified.

For dates, if the user says relative terms like "next Friday", "in two weeks", or "end of month", convert them to specific YYYY-MM-DD format dates.

Always create drafts for changes that require user approval - don't assume you should make changes immediately. The draft system allows users to review and approve changes before they become permanent.

When you make changes, they will appear highlighted in the interface as drafts. After making changes, ask the user if they want to accept or reject them. When they say "yes", "accept", "approve", or similar confirmation, use the accept_draft_changes tool. When they say "no", "reject", "cancel", or similar rejection, use the reject_draft_changes tool.

Be conversational and helpful, and confirm what actions you're taking. When you update something, briefly summarize what you changed and ask for confirmation.

Respond concisely and naturally. If you need clarification on dates or which timeline to use, ask for it.
`;

export const MODEL = "gpt-4o-realtime-preview";
export const BASE_URL = "https://api.openai.com/v1/realtime";
export const VOICE = "coral";