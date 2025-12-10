import React from 'react';
import { Mail, Globe2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Globe2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">OutreachAI</h1>
              <p className="text-xs text-slate-500 font-medium">Global Influencer Connection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                <Mail className="w-4 h-4 mr-2" />
                <span>Marketing Manager Mode</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;