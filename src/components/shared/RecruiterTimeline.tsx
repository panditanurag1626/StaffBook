import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiCalendar, FiCheck } from 'react-icons/fi';
import { THEME } from '@/styles/theme';

interface TimelineStep {
  completed: boolean;
  date?: string;
}

interface RecruiterTimelineProps {
  steps: {
    profileScreening: TimelineStep;
    downloadResume: TimelineStep;
    scheduleMeet: TimelineStep;
  };
  isVisible: boolean;
}

const RecruiterTimeline: React.FC<RecruiterTimelineProps> = ({ steps, isVisible }) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && timelineRef.current) {
      // Animate container height
      gsap.fromTo(
        timelineRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.5, ease: "power2.out" }
      );

      // Animate steps
      const stepElements = timelineRef.current.querySelectorAll('.timeline-step');
      gsap.fromTo(
        stepElements,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.15, ease: "power2.out", delay: 0.1 }
      );
      
      // Animate line
      const line = timelineRef.current.querySelector('.timeline-line');
      if (line) {
         gsap.fromTo(
          line,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.6, ease: "power2.out", transformOrigin: "top" }
        );
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const timelineSteps = [
    {
      key: 'profileScreening',
      label: 'Profile Screening',
      data: steps.profileScreening,
    },
    {
      key: 'downloadResume',
      label: 'Download Resume',
      data: steps.downloadResume,
    },
    {
      key: 'scheduleMeet',
      label: 'Schedule Meet',
      data: steps.scheduleMeet,
    },
  ];

  return (
    <div ref={timelineRef} className="mt-6 relative overflow-hidden pl-2">
      {/* Vertical Line */}
      <div 
        className={`timeline-line absolute left-[19px] top-3 bottom-10 w-[2px] bg-gray-200`}
        style={{ transformOrigin: 'top' }}
      >
        <div 
            className={`absolute top-0 left-0 w-full bg-gradient-to-b ${THEME.colors.gradient.start} ${THEME.colors.gradient.end} transition-all duration-1000`}
            style={{ 
                height: steps.scheduleMeet.completed ? '100%' : steps.downloadResume.completed ? '50%' : '0%' 
            }}
        />
      </div>

      <div className="space-y-6 relative z-10">
        {timelineSteps.map((step, index) => (
          <div key={step.key} className="timeline-step flex items-start group relative">
            {/* Step Indicator */}
            <div
              className={`
                relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0
                ${step.data.completed 
                  ? `bg-white border-[${THEME.colors.primary}] shadow-md scale-110` 
                  : 'bg-white border-gray-300'
                }
              `}
            >
              {step.data.completed && (
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${THEME.colors.gradient.start} ${THEME.colors.gradient.end}`} />
              )}
            </div>

            {/* Step Content */}
            <div className="ml-4 flex-1 pt-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h4
                  className={`font-bold text-sm transition-colors duration-300 ${
                    step.data.completed ? `text-indigo-300` : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </h4>
                {step.data.completed && step.data.date && (
                  <span className={`${THEME.components.typography.caption} text-xs mt-1 sm:mt-0`}>
                    {step.data.date}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {steps.scheduleMeet.completed && (
        <div className="timeline-step mt-6 ml-10 pt-4 border-t border-gray-100">
          <button className={`${THEME.components.button.primary} px-4 py-2 text-xs flex items-center gap-2 shadow-sm hover:shadow-md transition-all`}>
            <FiCalendar size={14} />
            View Meeting Details
          </button>
        </div>
      )}
    </div>
  );
};

export default RecruiterTimeline;
