export interface Milestone {
  id: string;
  title: string;
  date: string;
  description?: string;
  completed: boolean;
}

export interface RecentUpdate {
  id: string;
  timestamp: string;
  content: string;
  isDraft?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  recentUpdates: RecentUpdate[];
  anticipatedNextUpdate: string;
  algorithmTimeline: Milestone[];
  itDeploymentTimeline: Milestone[];
}

export interface DraftChange {
  id: string;
  type: 'project_update' | 'milestone_add' | 'milestone_update' | 'status_update';
  projectId: string;
  data: any;
  timestamp: string;
}