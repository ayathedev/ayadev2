import React from 'react';
import VisionaryRootApp from './src/App';

export const VisionaryApp: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-slate-100">
      <VisionaryRootApp />
    </div>
  );
};
