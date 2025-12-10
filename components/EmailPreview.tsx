
import React, { useState, useEffect } from 'react';
import { GeneratedEmail, InfluencerProfile } from '../types';
import { Copy, Check, Mail as MailIcon, ExternalLink, RefreshCw, Send, Plus, Sparkles, Globe, Link as LinkIcon, Calendar, Clock } from 'lucide-react';

interface EmailPreviewProps {
  initialEmail: GeneratedEmail;
  followUpEmail?: GeneratedEmail | null;
  profile: InfluencerProfile;
  scheduledDate?: Date | null;
  onReset?: () => void;
  onSend?: () => void; // Callback when user clicks a send action
  onSchedule?: (date: Date) => void;
  isSent?: boolean;
  onGenerateFollowUp?: () => void;
  isGeneratingFollowUp?: boolean;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ 
  initialEmail, 
  followUpEmail, 
  profile, 
  scheduledDate,
  onReset, 
  onSend, 
  onSchedule,
  isSent,
  onGenerateFollowUp,
  isGeneratingFollowUp
}) => {
  const [activeTab, setActiveTab] = useState<'initial' | 'followUp'>('initial');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Switch to follow-up tab automatically when it's created
  useEffect(() => {
    if (followUpEmail) {
      setActiveTab('followUp');
    }
  }, [followUpEmail]);

  const activeEmail = activeTab === 'initial' ? initialEmail : followUpEmail;

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'subject') {
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleMailTo = () => {
    if (!activeEmail) return;
    const subject = encodeURIComponent(activeEmail.subject);
    const body = encodeURIComponent(activeEmail.body);
    const mailToLink = `mailto:${profile.email || ''}?subject=${subject}&body=${body}`;
    window.location.href = mailToLink;
    if (onSend && activeTab === 'initial') onSend();
  };

  const handleGmailLink = () => {
    if (!activeEmail) return;
    const subject = encodeURIComponent(activeEmail.subject);
    const body = encodeURIComponent(activeEmail.body);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email || ''}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
    if (onSend && activeTab === 'initial') onSend();
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value && onSchedule) {
          onSchedule(new Date(e.target.value));
          setShowDatePicker(false);
      }
  };

  // Status Color Logic
  const getHeaderColor = () => {
      if (isSent && activeTab === 'initial') return 'bg-emerald-600';
      if (scheduledDate && activeTab === 'initial') return 'bg-blue-600';
      return 'bg-indigo-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden h-full flex flex-col">
      
      {/* Header with Status and Tabs */}
      <div className={`p-4 text-white transition-colors flex flex-col gap-4 ${getHeaderColor()}`}>
        <div className="flex justify-between items-start">
            <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
                {isSent && activeTab === 'initial' ? <Check className="w-6 h-6" /> : 
                 scheduledDate && activeTab === 'initial' ? <Clock className="w-6 h-6" /> :
                 <MailIcon className="w-6 h-6" />
                }
                {activeTab === 'initial' ? (
                    isSent ? 'Email Sent' : 
                    scheduledDate ? 'Email Scheduled' : 
                    'Initial Draft'
                ) : 'Follow-up Draft'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
                {activeTab === 'initial' 
                 ? (isSent 
                    ? `You marked this as sent to ${profile.name}` 
                    : scheduledDate 
                        ? `Scheduled for ${scheduledDate.toLocaleString()}`
                        : `Ready to send to ${profile.name}`)
                 : `Follow-up for ${profile.name}`
                }
            </p>
            </div>
            {onReset && (
                <button 
                onClick={onReset}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="Start Over"
                >
                <RefreshCw className="w-5 h-5" />
                </button>
            )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-2">
            <button
                onClick={() => setActiveTab('initial')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'initial' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'bg-black/20 text-white hover:bg-black/30'
                }`}
            >
                1. Initial Email
            </button>
            
            {followUpEmail ? (
                 <button
                 onClick={() => setActiveTab('followUp')}
                 className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                     activeTab === 'followUp' 
                     ? 'bg-white text-indigo-700 shadow-sm' 
                     : 'bg-black/20 text-white hover:bg-black/30'
                 }`}
                >
                 2. Follow-up
                </button>
            ) : (
                <button
                onClick={onGenerateFollowUp}
                disabled={isGeneratingFollowUp}
                className="flex-1 py-2 text-sm font-medium rounded-lg bg-black/20 text-white/90 hover:bg-black/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {isGeneratingFollowUp ? (
                        <span className="animate-pulse">Writing...</span>
                    ) : (
                        <><Plus className="w-4 h-4" /> Draft Follow-up</>
                    )}
                </button>
            )}
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto relative">
        {activeEmail ? (
            <>
                {/* Subject Line Section */}
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Line</label>
                    <button 
                    onClick={() => copyToClipboard(activeEmail.subject, 'subject')}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                    >
                    {copiedSubject ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedSubject ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 font-medium">
                    {activeEmail.subject}
                </div>
                </div>

                {/* Body Section */}
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Body</label>
                    <button 
                    onClick={() => copyToClipboard(activeEmail.body, 'body')}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                    >
                    {copiedBody ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedBody ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base">
                    {activeEmail.body}
                </div>
                </div>

                {/* Sources Section */}
                {activeEmail.sources && activeEmail.sources.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-3">
                            <Globe className="w-3 h-3" /> Verified Sources (Used for Personalization)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {activeEmail.sources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors border border-slate-200"
                                >
                                    <LinkIcon className="w-3 h-3 text-slate-400" />
                                    <span className="truncate max-w-[200px]">{source.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </>
        ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Sparkles className="w-10 h-10 mb-2 text-indigo-200" />
                <p>Select "Draft Follow-up" to generate.</p>
             </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
        {activeEmail && (
            <>
                <div className="flex gap-2">
                    <button
                    onClick={handleGmailLink}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                    <MailIcon className="w-5 h-5" />
                    Send via Gmail
                    </button>
                    <button
                    onClick={handleMailTo}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                    <ExternalLink className="w-5 h-5" />
                    Default App
                    </button>
                    {onSchedule && activeTab === 'initial' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`h-full aspect-square flex items-center justify-center rounded-xl border border-slate-300 font-semibold transition-all shadow-sm ${
                                    scheduledDate ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                                title="Schedule Send"
                            >
                                <Calendar className="w-5 h-5" />
                            </button>
                            {showDatePicker && (
                                <div className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-lg shadow-xl border border-slate-200 z-10 w-64">
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Pick Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        onChange={handleDateChange}
                                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                        defaultValue={scheduledDate ? new Date(scheduledDate.getTime() - (scheduledDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <p className="text-center text-xs text-slate-400">
                "Send via Gmail" opens a pre-filled draft. "Schedule" marks it in your tracker.
                </p>
            </>
        )}
      </div>
    </div>
  );
};

export default EmailPreview;
