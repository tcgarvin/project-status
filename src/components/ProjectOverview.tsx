'use client';

import { ProjectWithDrafts } from '@/utils/draftUtils';

interface ProjectOverviewProps {
  project: ProjectWithDrafts;
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
          
          {/* Description with draft highlighting */}
          <div className="mb-4">
            {project.draftDescription !== undefined ? (
              <div>
                <p className="text-gray-400 line-through text-sm mb-1">{project.description}</p>
                <p className="text-gray-600 bg-yellow-100 px-2 py-1 rounded border-l-4 border-yellow-400">
                  {project.draftDescription}
                  <span className="text-xs text-yellow-700 ml-2">(draft)</span>
                </p>
              </div>
            ) : (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
          
          {/* Status with draft highlighting */}
          <div className="mb-4">
            {project.draftStatus !== undefined ? (
              <div className="space-y-1">
                <span className="inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-medium line-through">
                  {project.status}
                </span>
                <div>
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border-2 border-yellow-400">
                    {project.draftStatus}
                    <span className="text-xs ml-1">(draft)</span>
                  </span>
                </div>
              </div>
            ) : (
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {project.status}
              </span>
            )}
          </div>
          
          {/* Anticipated Next Update with draft highlighting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Anticipated Next Update</h3>
            {project.draftAnticipatedUpdate !== undefined ? (
              <div>
                <p className="text-gray-400 line-through text-sm mb-1">
                  {project.anticipatedNextUpdate || 'No update scheduled'}
                </p>
                <p className="text-gray-700 bg-yellow-100 px-2 py-1 rounded border-l-4 border-yellow-400">
                  {project.draftAnticipatedUpdate}
                  <span className="text-xs text-yellow-700 ml-2">(draft)</span>
                </p>
              </div>
            ) : (
              <p className="text-gray-700">{project.anticipatedNextUpdate || 'No update scheduled'}</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Updates</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {project.recentUpdates.length > 0 ? (
              project.recentUpdates.map((update) => (
                <div 
                  key={update.id} 
                  className={`p-3 rounded-md border-l-4 ${
                    update.isDraft ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                    {update.isDraft && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{update.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent updates</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}