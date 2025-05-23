'use client';

import { useState, useEffect } from 'react';
import { Project, DraftChange, Milestone, RecentUpdate } from '@/types/project';
import { storage, initializeSampleData } from '@/utils/storage';
import { applyDraftsToProject, hasDrafts } from '@/utils/draftUtils';
import ProjectSelector from '@/components/ProjectSelector';
import ProjectOverview from '@/components/ProjectOverview';
import Timeline from '@/components/Timeline';
import VoiceInput from '@/components/VoiceInput';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftChange[]>([]);

  useEffect(() => {
    initializeSampleData();
    setProjects(storage.getProjects());
    setDrafts(storage.getDrafts());
    
    const storedProjects = storage.getProjects();
    if (storedProjects.length > 0) {
      setSelectedProjectId(storedProjects[0].id);
    }
  }, []);

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  const projectWithDrafts = selectedProject ? applyDraftsToProject(selectedProject, drafts) : null;

  const handleToolCall = async (toolCall: any) => {
    if (!selectedProject) return;

    console.log('Handling tool call:', toolCall);
    
    try {
      const args = JSON.parse(toolCall.arguments);
      
      switch (toolCall.name) {
        case 'update_project_status':
          createDraft({
            type: 'status_update',
            projectId: selectedProject.id,
            data: { status: args.status }
          });
          break;
          
        case 'add_milestone':
          createDraft({
            type: 'milestone_add',
            projectId: selectedProject.id,
            data: {
              title: args.title,
              timeline: args.timeline,
              date: args.date,
              description: args.description || '',
              completed: false
            }
          });
          break;
          
        case 'add_recent_update':
          createDraft({
            type: 'project_update',
            projectId: selectedProject.id,
            data: { updateContent: args.content }
          });
          break;
          
        case 'update_next_anticipated':
          createDraft({
            type: 'anticipated_update',
            projectId: selectedProject.id,
            data: { nextUpdate: args.nextUpdate }
          });
          break;
          
        case 'update_project_description':
          createDraft({
            type: 'description_update',
            projectId: selectedProject.id,
            data: { description: args.description }
          });
          break;
          
        case 'complete_milestone':
          createDraft({
            type: 'milestone_complete',
            projectId: selectedProject.id,
            data: { 
              milestoneTitle: args.milestoneTitle,
              timeline: args.timeline 
            }
          });
          break;
          
        default:
          console.warn('Unknown tool call:', toolCall.name);
      }
    } catch (error) {
      console.error('Error handling tool call:', error);
    }
  };

  const createDraft = (draftData: Omit<DraftChange, 'id' | 'timestamp'>) => {
    const draft: DraftChange = {
      ...draftData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    const newDrafts = [...drafts, draft];
    setDrafts(newDrafts);
    storage.saveDrafts(newDrafts);
  };

  const handleAcceptDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft || !selectedProject) return;

    let updatedProject = { ...selectedProject };

    switch (draft.type) {
      case 'status_update':
        updatedProject.status = draft.data.status;
        updatedProject.recentUpdates.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content: `Status updated to: ${draft.data.status}`
        });
        break;
      case 'milestone_add':
        const newMilestone: Milestone = {
          id: Date.now().toString(),
          ...draft.data
        };
        if (draft.data.timeline === 'algorithm') {
          updatedProject.algorithmTimeline.push(newMilestone);
        } else {
          updatedProject.itDeploymentTimeline.push(newMilestone);
        }
        updatedProject.recentUpdates.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content: `Added milestone: ${draft.data.title} to ${draft.data.timeline} timeline`
        });
        break;
      case 'project_update':
        updatedProject.recentUpdates.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content: draft.data.updateContent
        });
        break;
      case 'anticipated_update':
        updatedProject.anticipatedNextUpdate = draft.data.nextUpdate;
        updatedProject.recentUpdates.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content: `Updated anticipated next update: ${draft.data.nextUpdate}`
        });
        break;
      case 'description_update':
        updatedProject.description = draft.data.description;
        updatedProject.recentUpdates.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content: `Updated project description`
        });
        break;
      case 'milestone_complete':
        const targetTimeline = draft.data.timeline === 'algorithm' 
          ? updatedProject.algorithmTimeline 
          : updatedProject.itDeploymentTimeline;
        const milestone = targetTimeline.find(m => m.title === draft.data.milestoneTitle);
        if (milestone) {
          milestone.completed = true;
          updatedProject.recentUpdates.unshift({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            content: `Completed milestone: ${draft.data.milestoneTitle}`
          });
        }
        break;
    }

    storage.updateProject(updatedProject);
    setProjects(storage.getProjects());
    handleRejectDraft(draftId);
  };

  const handleRejectDraft = (draftId: string) => {
    const newDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(newDrafts);
    storage.saveDrafts(newDrafts);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI-First Project Management</h1>
        
        {drafts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Pending Changes ({drafts.length})
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  You have draft changes highlighted below. Say "accept changes" or "reject changes" to confirm or cancel them.
                </div>
              </div>
            </div>
          </div>
        )}
        
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
        
        {projectWithDrafts ? (
          <div className="space-y-8">
            <ProjectOverview project={projectWithDrafts} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Timeline
                title="Algorithm Development"
                milestones={projectWithDrafts.draftAlgorithmTimeline || projectWithDrafts.algorithmTimeline}
                color="bg-blue-500"
                originalMilestones={projectWithDrafts.algorithmTimeline}
              />
              <Timeline
                title="IT Deployment"
                milestones={projectWithDrafts.draftItDeploymentTimeline || projectWithDrafts.itDeploymentTimeline}
                color="bg-green-500"
                originalMilestones={projectWithDrafts.itDeploymentTimeline}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a project to view details</p>
          </div>
        )}
      </div>
      
      <VoiceInput
        onToolCall={handleToolCall}
        selectedProjectId={selectedProjectId}
        drafts={drafts}
        onAcceptDraft={handleAcceptDraft}
        onRejectDraft={handleRejectDraft}
      />
    </div>
  );
}
