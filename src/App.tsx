import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Globe, HelpCircle, Layers, CheckCircle2, 
  ChevronRight, Database, Search, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { 
  SADCCountry, 
  FoundDocument,
  IDClaim,
  AuditLog,
  SADC_COUNTRIES,
  INITIAL_DOCUMENTS,
  INITIAL_CLAIMS,
  INITIAL_LOGS,
  SADC_CountryCode
} from './types';
import LandingHero from './components/LandingHero';
import CountryPortal from './components/CountryPortal';

export default function App() {
  // CORE DATABASE STATE (Persisted in LocalStorage)
  const [documents, setDocuments] = useState<FoundDocument[]>([]);
  const [claims, setClaims] = useState<IDClaim[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Navigation state
  const [selectedCountry, setSelectedCountry] = useState<SADCCountry | null>(null);

  // Global search modal/results state on home
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<FoundDocument[]>([]);
  const [showGlobalResults, setShowGlobalResults] = useState(false);
  const [searchedCountryCode, setSearchedCountryCode] = useState<SADC_CountryCode | undefined>(undefined);

  // Load state from local storage or seed initial data
  useEffect(() => {
    const cachedDocs = localStorage.getItem('sadc_secure_docs');
    const cachedClaims = localStorage.getItem('sadc_secure_claims');
    const cachedLogs = localStorage.getItem('sadc_secure_logs');

    if (cachedDocs) {
      setDocuments(JSON.parse(cachedDocs));
    } else {
      setDocuments(INITIAL_DOCUMENTS);
      localStorage.setItem('sadc_secure_docs', JSON.stringify(INITIAL_DOCUMENTS));
    }

    if (cachedClaims) {
      setClaims(JSON.parse(cachedClaims));
    } else {
      setClaims(INITIAL_CLAIMS);
      localStorage.setItem('sadc_secure_claims', JSON.stringify(INITIAL_CLAIMS));
    }

    if (cachedLogs) {
      setLogs(JSON.parse(cachedLogs));
    } else {
      setLogs(INITIAL_LOGS);
      localStorage.setItem('sadc_secure_logs', JSON.stringify(INITIAL_LOGS));
    }
  }, []);

  // Save State Helpers
  const saveDocuments = (newDocs: FoundDocument[]) => {
    setDocuments(newDocs);
    localStorage.setItem('sadc_secure_docs', JSON.stringify(newDocs));
  };

  const saveClaims = (newClaims: IDClaim[]) => {
    setClaims(newClaims);
    localStorage.setItem('sadc_secure_claims', JSON.stringify(newClaims));
  };

  const saveLogs = (newLogs: AuditLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('sadc_secure_logs', JSON.stringify(newLogs));
  };

  // State mutation actions
  const handleAddDocument = (newDoc: Omit<FoundDocument, 'id' | 'status'>) => {
    const freshDoc: FoundDocument = {
      ...newDoc,
      id: `SADC-DOC-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Unclaimed'
    };
    const updated = [...documents, freshDoc];
    saveDocuments(updated);
  };

  const handleUpdateDocumentStatus = (id: string, status: FoundDocument['status']) => {
    const updated = documents.map(doc => doc.id === id ? { ...doc, status } : doc);
    saveDocuments(updated);
  };

  const handleSubmitClaim = (claimDetail: Omit<IDClaim, 'id' | 'trackingCode' | 'status' | 'submittedAt'>) => {
    const trackingCode = `SADC-CLAIM-${Math.floor(1000 + Math.random() * 9000)}-${claimDetail.documentId.split('-')[0] || 'REG'}`;
    const newClaim: IDClaim = {
      ...claimDetail,
      id: `CLM-${Math.floor(5000 + Math.random() * 5000)}`,
      trackingCode,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    };
    
    // Auto change document status to Claim Pending for processing
    handleUpdateDocumentStatus(claimDetail.documentId, 'Claim Pending');
    
    const updated = [...claims, newClaim];
    saveClaims(updated);
    return trackingCode;
  };

  const handleUpdateClaimStatus = (id: string, status: IDClaim['status'], reviewerNotes?: string) => {
    const updated = claims.map(clm => 
      clm.id === id 
        ? { ...clm, status, reviewedAt: new Date().toISOString(), reviewerNotes } 
        : clm
    );
    saveClaims(updated);
  };

  const handleAddAuditLog = (action: string, role: AuditLog['userRole'], details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      action,
      userRole: role,
      details,
      countryCode: selectedCountry?.code || 'SWZ'
    };
    const updated = [...logs, newLog];
    saveLogs(updated);
  };

  // Global search capability
  const handleGlobalSearch = (searchNum: string, countryCode?: SADC_CountryCode) => {
    setGlobalQuery(searchNum);
    setSearchedCountryCode(countryCode);
    
    const query = searchNum.toLowerCase().trim();
    const results = documents.filter(doc => {
      const matchNum = doc.documentNumber.toLowerCase().includes(query);
      const matchName = doc.holderName.toLowerCase().includes(query);
      const matchCountry = countryCode ? doc.countryCode === countryCode : true;
      return (matchNum || matchName) && matchCountry;
    });

    setGlobalResults(results);
    setShowGlobalResults(true);

    // Create system log
    const nationSummary = countryCode ? `${countryCode} state node` : 'all states';
    const logDetails = `Global search query processed for key: "${searchNum}" across ${nationSummary}`;
    
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      action: 'Federated Global Query',
      userRole: 'Citizen',
      details: logDetails,
      countryCode: countryCode || 'SWZ'
    };
    saveLogs([...logs, newLog]);
  };

  // Switch clean seed backup tool
  const handleResetStorage = () => {
    if (window.confirm('Are you absolutely sure you want to reset database keys to factory defaults? All newly added cases and logs will be archived.')) {
      localStorage.removeItem('sadc_secure_docs');
      localStorage.removeItem('sadc_secure_claims');
      localStorage.removeItem('sadc_secure_logs');
      setDocuments(INITIAL_DOCUMENTS);
      setClaims(INITIAL_CLAIMS);
      setLogs(INITIAL_LOGS);
      setSelectedCountry(null);
      setShowGlobalResults(false);
      alert('Database refactored successfully.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      
      {/* SADC Secure Network Global Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCountry(null)}>
            {/* SADC Emblem design placeholder: Gold ring with active SADC letters */}
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <span className="text-amber-500 font-extrabold text-sm tracking-tighter">SADC</span>
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight leading-none block">
                ID4AFRICA
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-amber-500 font-bold block pt-0.5">
                Southern Africa SecID Platform
              </span>
            </div>
          </div>

          {/* Quick status lights */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-slate-400 font-semibold text-slate-300">SYSTEM NODES ACCREDITED: <span className="text-amber-500">16/16</span></span>
            </div>

            <button
              onClick={handleResetStorage}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition text-[10px] uppercase tracking-wide font-mono hover:border-red-500/30 cursor-pointer"
              title="Reset Database to original seeding records"
            >
              🔄 Cold-Reset State
            </button>
          </div>
        </div>
      </header>

      {/* Primary Page Canvas Grid */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {!selectedCountry ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Conditional Global Query Result Board */}
              {showGlobalResults && (
                <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl relative space-y-4 shadow-2xl">
                  <div 
                    onClick={() => setShowGlobalResults(false)}
                    className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer"
                  >
                    [ Clear Results ✕ ]
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
                      <ShieldCheck className="w-5 h-5 text-amber-500" /> FEDERATED NETWORK SEARCH RESULTS
                    </h2>
                    <p className="text-xs text-slate-400">
                      Matches matching <span className="font-mono text-amber-400 font-semibold">"{globalQuery}"</span> across accredited SADC registries:
                    </p>
                  </div>

                  {globalResults.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-white">No Matched Registers Found</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Ensure you printed details correctly. Try checking with regional police desk officers if matching takes extensive delays.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {globalResults.map(doc => {
                        const originalCountry = SADC_COUNTRIES.find(c => c.code === doc.countryCode);
                        return (
                          <div 
                            key={doc.id}
                            className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-mono uppercase bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                                {doc.documentType}
                              </span>
                              <span className="text-xl shrink-0" title={originalCountry?.name}>{originalCountry?.flag}</span>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] text-slate-500 uppercase block">Holder Signature Name:</span>
                              <strong className="text-white font-mono text-xs uppercase tracking-wide block">
                                {doc.holderName.replace(/(?!^)\w/g, '*')} {/* Encrypt full display for global viewer protection */}
                              </strong>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] text-slate-500 uppercase block">Secure Masked ID:</span>
                              <strong className="text-amber-500 font-mono text-xs tracking-widest block font-bold">
                                {doc.documentNumber.slice(0, 4)}*******
                              </strong>
                            </div>

                            <button
                              onClick={() => {
                                if (originalCountry) {
                                  setSelectedCountry(originalCountry);
                                  setShowGlobalResults(false);
                                }
                              }}
                              className="w-full mt-2 bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold tracking-wide text-[10px] py-1.5 rounded uppercase transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              Transition to Portal to Claim <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <LandingHero 
                onSelectCountry={setSelectedCountry}
                allDocuments={documents}
                onGlobalSearch={handleGlobalSearch}
              />
            </motion.div>
          ) : (
            <motion.div
              key="portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CountryPortal 
                country={selectedCountry}
                onBack={() => setSelectedCountry(null)}
                documents={documents}
                onAddDocument={handleAddDocument}
                onUpdateDocumentStatus={handleUpdateDocumentStatus}
                claims={claims}
                onSubmitClaim={handleSubmitClaim}
                onUpdateClaimStatus={handleUpdateClaimStatus}
                logs={logs}
                onAddAuditLog={handleAddAuditLog}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SADC Secure Network Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="leading-relaxed">
            © 2026 <strong className="text-slate-400 font-medium">ID4Africa – Southern Africa Centralised Security Hubs</strong>. All identity hashes cryptographically sealed under state cooperation protocols.
          </p>
          <div className="flex gap-4">
            <span className="font-semibold text-[10px] uppercase font-mono tracking-widest text-[#f59e0b] bg-amber-950/20 border border-amber-900/40 px-3 py-1 rounded-full">
              SADC Protocol Standard (v3.2)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
