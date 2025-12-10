import React, { useState } from 'react';
import { SocialPlatform, InfluencerProfile } from '../types';
import { Send, Sparkles, User, AtSign, Package, Briefcase, Users, FileText, Upload, AlertCircle } from 'lucide-react';

interface InputFormProps {
  onSingleSubmit: (profile: InfluencerProfile, template?: string) => void;
  onBulkSubmit: (profiles: InfluencerProfile[], template?: string) => void;
  isLoading: boolean;
}

type Mode = 'single' | 'bulk';

const InputForm: React.FC<InputFormProps> = ({ onSingleSubmit, onBulkSubmit, isLoading }) => {
  const [mode, setMode] = useState<Mode>('single');
  
  // Common State
  const [senderName, setSenderName] = useState('');
  const [brandInfo, setBrandInfo] = useState('');
  const [template, setTemplate] = useState(''); // Custom template

  // Single Mode State
  const [singleProfile, setSingleProfile] = useState({
    name: '',
    email: '',
    platform: SocialPlatform.YOUTUBE,
    handle: '',
    description: ''
  });

  // Bulk Mode State
  const [csvInput, setCsvInput] = useState('');

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSingleProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullProfile: InfluencerProfile = {
      ...singleProfile,
      senderName,
      brandInfo
    };
    onSingleSubmit(fullProfile, template);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple CSV Parser: Name, Handle, Email, Notes
    const lines = csvInput.trim().split('\n');
    const profiles: InfluencerProfile[] = [];

    lines.forEach(line => {
      // Basic comma split, but respecting minimal complexity
      // Format: Name, Handle, Email, Notes
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
         // Try to map flexibly. If 4 parts: Name, Handle, Email, Notes
         // If 3 parts: Name, Handle, Notes (Assume no email)
         const name = parts[0];
         const handle = parts[1];
         let email = '';
         let description = '';

         if (parts.length >= 4) {
             email = parts[2];
             description = parts.slice(3).join(','); // Join remaining in case notes had commas
         } else if (parts.length === 3) {
             // Check if part 2 looks like an email
             if (parts[2].includes('@')) {
                 email = parts[2];
             } else {
                 description = parts[2];
             }
         }

         if (name && handle) {
             profiles.push({
                 senderName,
                 brandInfo,
                 name,
                 handle,
                 email,
                 platform: SocialPlatform.YOUTUBE, // Default for bulk, can be changed later or parsed if needed
                 description: description || "General outreach"
             });
         }
      }
    });

    if (profiles.length === 0) {
        alert("Could not parse any valid profiles. Please check format.");
        return;
    }

    onBulkSubmit(profiles, template);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Campaign Setup
          </h2>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              mode === 'single' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Single
          </button>
          <button
             onClick={() => setMode('bulk')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              mode === 'bulk' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Batch Import
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        
        {/* GLOBAL: Sender Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. My Information (Sender)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <User className="w-4 h-4" /> Your Name
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> Brand / Product <span className="text-slate-400 font-normal ml-1">(Optional)</span>
              </label>
              <input
                type="text"
                value={brandInfo}
                onChange={(e) => setBrandInfo(e.target.value)}
                placeholder="Name or Description"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* GLOBAL: Template */}
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> Base Email Template <span className="text-slate-400 font-normal ml-1">(Optional)</span></span>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">AI will adapt this</span>
           </label>
           <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={4}
              placeholder="Paste an existing email template here. The AI will preserve your structure/CTA but rewrite the intro to match the influencer's analysis."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono bg-slate-50"
            />
        </div>

        {/* MODE SPECIFIC */}
        {mode === 'single' ? (
           <form onSubmit={handleSingleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
             <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. Target Influencer
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Influencer Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={singleProfile.name}
                    onChange={handleSingleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Platform</label>
                  <select
                    name="platform"
                    value={singleProfile.platform}
                    onChange={handleSingleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {Object.values(SocialPlatform).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Handle / URL</label>
                    <input
                    type="text"
                    name="handle"
                    required
                    value={singleProfile.handle}
                    onChange={handleSingleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                    type="email"
                    name="email"
                    value={singleProfile.email}
                    onChange={handleSingleChange}
                    placeholder="influencer@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> My Notes / Analysis</span>
                </label>
                <textarea
                  name="description"
                  required
                  value={singleProfile.description}
                  onChange={handleSingleChange}
                  rows={4}
                  placeholder="What caught your eye? E.g. 'Loved their editing style in the latest Japan vlog.'"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium transition-all shadow-md ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? <span className="animate-pulse">Generating...</span> : <><Send className="w-4 h-4" /> Generate Email</>}
            </button>
           </form>
        ) : (
            <form onSubmit={handleBulkSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            2. Paste Data (CSV)
                        </h3>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Format: Name, Handle, Email, Notes
                        </span>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 mb-2">
                        <p className="font-medium mb-1">Example:</p>
                        <code className="block bg-white p-2 rounded border border-slate-200 text-xs text-slate-500">
                            Marques, @mkbhd, mkbhd@gmail.com, Loves clean desk setups<br/>
                            Casey, @caseyneistat, casey@nyc.com, High energy vlogs
                        </code>
                    </div>

                    <textarea
                        required
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                        rows={10}
                        placeholder="Paste your list here..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    />
                </div>

                <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium transition-all shadow-md ${
                    isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                >
                {isLoading ? <span className="animate-pulse">Processing Batch...</span> : <><Upload className="w-4 h-4" /> Generate Batch Emails</>}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default InputForm;
