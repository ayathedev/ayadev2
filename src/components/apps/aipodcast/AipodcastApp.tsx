import React from 'react';
import AipodcastRootApp from './src/App';

export const AipodcastApp: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-slate-900 text-slate-100">
      <AipodcastRootApp />
    </div>
  );
};
