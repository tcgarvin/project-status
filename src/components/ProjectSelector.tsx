'use client';

import { Project } from '@/types/project';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
}

export default function ProjectSelector({ 
  projects, 
  selectedProjectId, 
  onSelectProject 
}: ProjectSelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Project
      </label>
      <select
        id="project-select"
        value={selectedProjectId || ''}
        onChange={(e) => onSelectProject(e.target.value)}
        className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a project...</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}