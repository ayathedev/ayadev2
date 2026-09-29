import React from 'react';
import AdminOSRootApp from './src/App';

export const AdminOSApp: React.FC = () => {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-slate-100 text-slate-900">
      <AdminOSRootApp />
    </div>
  );
};
