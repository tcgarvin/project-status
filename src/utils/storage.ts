import { Project, DraftChange } from '@/types/project';

const PROJECTS_KEY = 'project-status-projects';
const DRAFTS_KEY = 'project-status-drafts';

export const storage = {
  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveProjects: (projects: Project[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  getDrafts: (): DraftChange[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(DRAFTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveDrafts: (drafts: DraftChange[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  },

  getProject: (id: string): Project | null => {
    const projects = storage.getProjects();
    return projects.find(p => p.id === id) || null;
  },

  updateProject: (updatedProject: Project): void => {
    const projects = storage.getProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.push(updatedProject);
    }
    storage.saveProjects(projects);
  },

  deleteProject: (id: string): void => {
    const projects = storage.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    storage.saveProjects(filtered);
  },

  addDraft: (draft: DraftChange): void => {
    const drafts = storage.getDrafts();
    drafts.push(draft);
    storage.saveDrafts(drafts);
  },

  removeDraft: (id: string): void => {
    const drafts = storage.getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    storage.saveDrafts(filtered);
  },

  clearDrafts: (): void => {
    storage.saveDrafts([]);
  }
};

// Initialize with sample project if empty
export const initializeSampleData = (): void => {
  const projects = storage.getProjects();
  if (projects.length === 0) {
    const sampleProject: Project = {
      id: '1',
      name: 'AI Model Deployment Project',
      description: 'Developing and deploying a new recommendation algorithm for production use.',
      status: 'In Progress',
      recentUpdates: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          content: 'Project initialized with baseline requirements'
        }
      ],
      anticipatedNextUpdate: '2025-06-01 - Architecture review meeting',
      algorithmTimeline: [
        {
          id: '1',
          title: 'Baseline model trained',
          date: '2025-05-30',
          description: 'Initial model training completed',
          completed: false
        }
      ],
      itDeploymentTimeline: [
        {
          id: '1',
          title: 'Dev environment setup',
          date: '2025-05-25',
          description: 'Development infrastructure configured',
          completed: true
        }
      ]
    };
    storage.saveProjects([sampleProject]);
  }
};