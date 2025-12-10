
import React, { useState } from 'react';
import { BatchResult } from '../types';
import EmailPreview from './EmailPreview';
import { CheckCircle2, CircleDashed, AlertCircle, RefreshCw, Send, MailCheck, MessageSquarePlus, Clock } from 'lucide-react';

interface BulkResultViewerProps {
  results: BatchResult[];
  onReset: () => void;
  onMarkSent: (id: string) => void;
  onGenerateFollowUp: (id: string) => void;
  onSchedule: (id: string, date: Date) => void;
}

const BulkResultViewer: React.FC<BulkResultViewerProps> = ({ results, onReset, onMarkSent, onGenerateFollowUp, onSchedule }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedResult = results[selectedIndex];
  
  // Calculate stats
  const sentCount = results.filter(r => r.isSent).length;
  const successCount = results.filter(r => r.status === 'success').length;

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
      
      {/* Sidebar List */}
      <div className="w-full lg:w-1/3 border-r border-slate-200 flex flex-col h-[300px] lg:h-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800">Campaign Results</h3>
            <p className="text-xs text-slate-500">{sentCount} sent / {successCount} generated</p>
          </div>
          <button onClick={onReset} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
             <RefreshCw className="w-3 h-3" /> New List
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {results.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center gap-3 relative ${
                selectedIndex === idx ? 'bg-indigo-50/70' : ''
              } ${item.isSent ? 'bg-slate-50 opacity-75' : ''}`}
            >
               {/* Left Status Indicator */}
              <div className="flex-shrink-0">
                {item.status === 'pending' && <CircleDashed className="w-5 h-5 text-slate-400 animate-spin" />}
                {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                
                {item.status === 'success' && (
                    item.isSent 
                    ? <MailCheck className="w-5 h-5 text-emerald-500" /> 
                    : item.scheduledDate
                        ? <Clock className="w-5 h-5 text-blue-500" />
                        : <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start">
                    <p className={`text-sm font-medium truncate ${item.isSent ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {item.profile.name}
                    </p>
                    {selectedIndex === idx && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5"></div>}
                </div>
                <div className="flex justify-between items-center mt-0.5">
                     <p className="text-xs text-slate-500 truncate">
                        {item.scheduledDate 
                            ? `Scheduled: ${item.scheduledDate.toLocaleDateString()}` 
                            : item.profile.handle
                        }
                     </p>
                     {item.followUpEmail && (
                       <span title="Follow-up ready">
                         <MessageSquarePlus className="w-3 h-3 text-indigo-400" />
                       </span>
                     )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="w-full lg:w-2/3 h-full overflow-hidden bg-slate-100 relative">
        {selectedResult && selectedResult.status === 'success' && selectedResult.generatedEmail ? (
          <div className="h-full p-4 overflow-y-auto">
             <EmailPreview 
                initialEmail={selectedResult.generatedEmail} 
                followUpEmail={selectedResult.followUpEmail}
                profile={selectedResult.profile} 
                isSent={selectedResult.isSent}
                scheduledDate={selectedResult.scheduledDate}
                onSend={() => onMarkSent(selectedResult.id)}
                onSchedule={(date) => onSchedule(selectedResult.id, date)}
                onGenerateFollowUp={() => onGenerateFollowUp(selectedResult.id)}
                isGeneratingFollowUp={false} // Loading state for specific item is not granularly tracked here for simplicity, but action is fast
             />
          </div>
        ) : selectedResult?.status === 'pending' ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <CircleDashed className="w-10 h-10 animate-spin mb-4" />
            <p>Generating personalized email...</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-red-400 p-8 text-center">
            <AlertCircle className="w-10 h-10 mb-4" />
            <p>Failed to generate email.</p>
            <p className="text-xs mt-2 text-slate-500">{selectedResult?.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkResultViewer;
