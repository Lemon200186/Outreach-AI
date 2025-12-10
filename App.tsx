
import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import EmailPreview from './components/EmailPreview';
import BulkResultViewer from './components/BulkResultViewer';
import { InfluencerProfile, GeneratedEmail, BatchResult } from './types';
import { generateOutreachEmail, generateFollowUpEmail } from './services/geminiService';
import { ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<'input' | 'single-result' | 'bulk-result'>('input');
  
  // Single Result State
  const [singleProfile, setSingleProfile] = useState<InfluencerProfile | null>(null);
  const [singleEmail, setSingleEmail] = useState<GeneratedEmail | null>(null);
  const [singleFollowUpEmail, setSingleFollowUpEmail] = useState<GeneratedEmail | null>(null);
  const [singleScheduledDate, setSingleScheduledDate] = useState<Date | null>(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  
  // Bulk Result State
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSingleGenerate = async (data: InfluencerProfile, template?: string) => {
    setIsLoading(true);
    setError(null);
    setSingleProfile(data);
    setSingleFollowUpEmail(null); // Reset follow-up
    setSingleScheduledDate(null); // Reset schedule
    
    try {
      const email = await generateOutreachEmail(data, template);
      setSingleEmail(email);
      setMode('single-result');
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleFollowUpGenerate = async () => {
    if (!singleProfile) return;
    setIsGeneratingFollowUp(true);
    try {
        const email = await generateFollowUpEmail(singleProfile);
        setSingleFollowUpEmail(email);
    } catch (err) {
        console.error(err);
        alert("Failed to generate follow-up");
    } finally {
        setIsGeneratingFollowUp(false);
    }
  };

  const handleSingleSchedule = (date: Date) => {
    setSingleScheduledDate(date);
  };

  const handleBulkGenerate = async (profiles: InfluencerProfile[], template?: string) => {
    setIsLoading(true);
    setError(null);
    
    // Initialize batch results
    const initialResults: BatchResult[] = profiles.map((p, idx) => ({
        id: `batch-${idx}-${Date.now()}`,
        profile: p,
        generatedEmail: null,
        status: 'pending',
        isSent: false,
        scheduledDate: null
    }));
    
    setBatchResults(initialResults);
    setMode('bulk-result');

    // Process one by one to avoid rate limits and show progress
    for (let i = 0; i < initialResults.length; i++) {
        const item = initialResults[i];
        try {
            const email = await generateOutreachEmail(item.profile, template);
            
            setBatchResults(prev => prev.map(res => 
                res.id === item.id 
                ? { ...res, generatedEmail: email, status: 'success' } 
                : res
            ));
        } catch (err: any) {
             setBatchResults(prev => prev.map(res => 
                res.id === item.id 
                ? { ...res, status: 'error', error: err.message } 
                : res
            ));
        }
    }
    
    setIsLoading(false);
  };

  const handleBulkFollowUpGenerate = async (id: string) => {
     // Find the item
     const item = batchResults.find(r => r.id === id);
     if (!item || !item.profile) return;

     try {
         const email = await generateFollowUpEmail(item.profile);
         setBatchResults(prev => prev.map(res => 
            res.id === id ? { ...res, followUpEmail: email } : res
         ));
     } catch (err) {
         console.error(err);
         alert("Failed to generate follow up");
     }
  };

  const handleBulkSchedule = (id: string, date: Date) => {
      setBatchResults(prev => prev.map(res => 
        res.id === id ? { ...res, scheduledDate: date } : res
      ));
  };

  const handleMarkAsSent = (id: string) => {
    setBatchResults(prev => prev.map(res => 
      res.id === id ? { ...res, isSent: true } : res
    ));
  };

  const handleReset = () => {
    setMode('input');
    setSingleEmail(null);
    setSingleFollowUpEmail(null);
    setSingleProfile(null);
    setSingleScheduledDate(null);
    setBatchResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
          
          {/* Left Column: Input (Only visible in Input Mode or Desktop Single Mode) */}
          <div className={`lg:col-span-5 transition-all duration-500 ${mode !== 'input' ? 'hidden lg:block' : 'lg:col-start-4 lg:col-span-6'}`}>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Connect with Creators</h1>
              <p className="text-slate-600">
                Turn your observations into high-conversion outreach emails in seconds.
              </p>
            </div>
            
            {/* Input Form handles its own "Single" vs "Bulk" tabs internally */}
            <InputForm 
                onSingleSubmit={handleSingleGenerate} 
                onBulkSubmit={handleBulkGenerate}
                isLoading={isLoading} 
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          {mode === 'single-result' && singleEmail && singleProfile && (
            <>
              <div className="hidden lg:flex lg:col-span-1 items-center justify-center h-full pt-32 text-slate-300">
                <ArrowRight className="w-8 h-8" />
              </div>
              <div className="lg:col-span-6 h-full min-h-[600px]">
                <EmailPreview 
                  initialEmail={singleEmail} 
                  followUpEmail={singleFollowUpEmail}
                  profile={singleProfile} 
                  scheduledDate={singleScheduledDate}
                  onReset={handleReset} 
                  onSend={() => {}}
                  onSchedule={handleSingleSchedule}
                  onGenerateFollowUp={handleSingleFollowUpGenerate}
                  isGeneratingFollowUp={isGeneratingFollowUp}
                />
              </div>
            </>
          )}

          {mode === 'bulk-result' && (
             <>
               <div className="hidden lg:flex lg:col-span-1 items-center justify-center h-full pt-32 text-slate-300">
                <ArrowRight className="w-8 h-8" />
              </div>
              <div className="lg:col-span-6 h-[800px]">
                  <BulkResultViewer 
                    results={batchResults}
                    onReset={handleReset}
                    onMarkSent={handleMarkAsSent}
                    onSchedule={handleBulkSchedule}
                    onGenerateFollowUp={handleBulkFollowUpGenerate}
                  />
              </div>
             </>
          )}

        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} OutreachAI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
