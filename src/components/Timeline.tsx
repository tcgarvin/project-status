'use client';

import { Milestone } from '@/types/project';

interface TimelineProps {
  title: string;
  milestones: Milestone[];
  color: string;
  originalMilestones?: Milestone[];
}

export default function Timeline({ title, milestones, color, originalMilestones }: TimelineProps) {
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const isDraftMilestone = (milestone: Milestone): boolean => {
    return milestone.id.startsWith('draft-');
  };

  const isModifiedMilestone = (milestone: Milestone): boolean => {
    if (!originalMilestones) return false;
    const original = originalMilestones.find(m => m.id === milestone.id);
    return original ? original.completed !== milestone.completed : false;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      
      {sortedMilestones.length === 0 ? (
        <p className="text-gray-500 text-sm">No milestones added yet</p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${color}`}></div>
          
          {/* Milestones */}
          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => {
              const isDraft = isDraftMilestone(milestone);
              const isModified = isModifiedMilestone(milestone);
              
              return (
                <div key={milestone.id} className={`relative flex items-start ${
                  isDraft ? 'bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400' : 
                  isModified ? 'bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400' : ''
                }`}>
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-8 h-8 rounded-full border-4 border-white shadow ${
                    milestone.completed ? color.replace('bg-', 'bg-') : 'bg-gray-300'
                  } flex items-center justify-center ${
                    isDraft ? 'ring-2 ring-yellow-400' : isModified ? 'ring-2 ring-blue-400' : ''
                  }`}>
                    {milestone.completed && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Milestone content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-lg font-medium ${
                        milestone.completed ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {milestone.title}
                        {isDraft && (
                          <span className="text-xs text-yellow-700 ml-2 font-normal">(draft)</span>
                        )}
                        {isModified && (
                          <span className="text-xs text-blue-700 ml-2 font-normal">(modified)</span>
                        )}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {new Date(milestone.date).toLocaleDateString()}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}