import { Project, DraftChange, Milestone } from '@/types/project';

export interface ProjectWithDrafts extends Project {
  draftStatus?: string;
  draftDescription?: string;
  draftAnticipatedUpdate?: string;
  draftAlgorithmTimeline?: Milestone[];
  draftItDeploymentTimeline?: Milestone[];
}

export function applyDraftsToProject(project: Project, drafts: DraftChange[]): ProjectWithDrafts {
  const projectDrafts = drafts.filter(d => d.projectId === project.id);
  
  if (projectDrafts.length === 0) {
    return project;
  }

  const projectWithDrafts: ProjectWithDrafts = { ...project };

  projectDrafts.forEach(draft => {
    switch (draft.type) {
      case 'status_update':
        projectWithDrafts.draftStatus = draft.data.status;
        break;
        
      case 'description_update':
        projectWithDrafts.draftDescription = draft.data.description;
        break;
        
      case 'anticipated_update':
        projectWithDrafts.draftAnticipatedUpdate = draft.data.nextUpdate;
        break;
        
      case 'milestone_add':
        const newMilestone: Milestone = {
          id: `draft-${draft.id}`,
          title: draft.data.title,
          date: draft.data.date,
          description: draft.data.description || '',
          completed: false
        };
        
        if (draft.data.timeline === 'algorithm') {
          projectWithDrafts.draftAlgorithmTimeline = [
            ...(projectWithDrafts.draftAlgorithmTimeline || project.algorithmTimeline),
            newMilestone
          ];
        } else {
          projectWithDrafts.draftItDeploymentTimeline = [
            ...(projectWithDrafts.draftItDeploymentTimeline || project.itDeploymentTimeline),
            newMilestone
          ];
        }
        break;
        
      case 'milestone_complete':
        const algorithmsToUpdate = projectWithDrafts.draftAlgorithmTimeline || [...project.algorithmTimeline];
        const deploymentsToUpdate = projectWithDrafts.draftItDeploymentTimeline || [...project.itDeploymentTimeline];
        
        if (draft.data.timeline === 'algorithm') {
          const milestone = algorithmsToUpdate.find(m => m.title === draft.data.milestoneTitle);
          if (milestone) {
            milestone.completed = true;
            projectWithDrafts.draftAlgorithmTimeline = algorithmsToUpdate;
          }
        } else {
          const milestone = deploymentsToUpdate.find(m => m.title === draft.data.milestoneTitle);
          if (milestone) {
            milestone.completed = true;
            projectWithDrafts.draftItDeploymentTimeline = deploymentsToUpdate;
          }
        }
        break;
    }
  });

  return projectWithDrafts;
}

export function hasDrafts(project: Project, drafts: DraftChange[]): boolean {
  return drafts.some(d => d.projectId === project.id);
}