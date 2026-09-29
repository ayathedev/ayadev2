import React from 'react';
import OlaveRootApp from './src/App';

export const OlaveApp: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-slate-950 text-slate-100">
      <OlaveRootApp />
    </div>
  );
};
