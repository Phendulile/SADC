import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, ShieldCheck, Mail, Phone, MapPin, 
  Clock, Lock, CheckCircle2, AlertTriangle, RefreshCw, FileText, 
  UploadCloud, UserCheck, Eye, Trash2, HeartHandshake, Filter, Info, ShieldAlert,
  Mic, MicOff
} from 'lucide-react';
import { 
  SADCCountry, 
  FoundDocument, 
  PoliceStation, 
  IDClaim, 
  AuditLog, 
  DocumentType,
  DocumentStatus,
  ClaimStatus,
  INITIAL_POLICE_STATIONS
} from '../types';

interface CountryPortalProps {
  country: SADCCountry;
  onBack: () => void;
  documents: FoundDocument[];
  onAddDocument: (doc: Omit<FoundDocument, 'id' | 'status'>) => void;
  onUpdateDocumentStatus: (id: string, status: DocumentStatus) => void;
  claims: IDClaim[];
  onSubmitClaim: (claim: Omit<IDClaim, 'id' | 'trackingCode' | 'status' | 'submittedAt'>) => string; // returns tracking code
  onUpdateClaimStatus: (id: string, status: ClaimStatus, reviewerNotes?: string) => void;
  logs: AuditLog[];
  onAddAuditLog: (action: string, role: 'Citizen' | 'Police' | 'Administrator', details: string) => void;
}

export default function CountryPortal({
  country,
  onBack,
  documents,
  onAddDocument,
  onUpdateDocumentStatus,
  claims,
  onSubmitClaim,
  onUpdateClaimStatus,
  logs,
  onAddAuditLog
}: CountryPortalProps) {
  // Navigation within the country portal
  const [activeTab, setActiveTab] = useState<'citizen' | 'police' | 'admin'>('citizen');

  // Local state for Citizen tab
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDocForClaim, setSelectedDocForClaim] = useState<FoundDocument | null>(null);
  const [trackingSearchCode, setTrackingSearchCode] = useState('');
  const [trackedClaim, setTrackedClaim] = useState<IDClaim | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition not supported in this browser.");
      return;
    }

    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const cleanedText = transcript.replace(/\.$/, '').trim();
          setSearchQuery(cleanedText);
          setHasSearched(true);
          onAddAuditLog('Voice Document Search', 'Citizen', `Searched via voice: "${cleanedText}" in country ${country.name}`);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error in portal:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError("Microphone permission denied. Check browser settings.");
          } else {
            setSpeechError(`Voice capture status: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setSpeechError("Failed to initiate voice capture driver.");
        setIsListening(false);
      }
    }
  };

  // Claim Form state
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofDocumentType, setProofDocumentType] = useState('Loss Affidavit Receipt');
  const [claimSuccessCode, setClaimSuccessCode] = useState<string | null>(null);

  // Police Desk state
  const [policeLoggedIn, setPoliceLoggedIn] = useState(false);
  const [policePassword, setPolicePassword] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('National Identity Card');
  const [newDocNum, setNewDocNum] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newFoundLoc, setNewFoundLoc] = useState('');
  const [newRemarks, setNewRemarks] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Admin Desk state
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedAdminClaim, setSelectedAdminClaim] = useState<IDClaim | null>(null);
  const [adminReviewNotes, setAdminReviewNotes] = useState('');

  // SADC regional stations for this country
  const localStations = useMemo(() => {
    return INITIAL_POLICE_STATIONS.filter(stn => stn.countryCode === country.code);
  }, [country.code]);

  // Documents found in this country
  const countryDocuments = useMemo(() => {
    return documents.filter(doc => doc.countryCode === country.code);
  }, [documents, country.code]);

  // Filtered documents from user search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.trim().toLowerCase();
    return countryDocuments.filter(doc => {
      // Allow searching by unmasked or partial values
      const matchNum = doc.documentNumber.toLowerCase().includes(query);
      const matchName = doc.holderName.toLowerCase().includes(query);
      return matchNum || matchName;
    });
  }, [countryDocuments, searchQuery]);

  // Handle Citizen Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    onAddAuditLog('Document Search', 'Citizen', `Searched query: "${searchQuery}" in country ${country.name}`);
  };

  // Masking functions for security-first UI protection
  const maskDocumentNumber = (num: string) => {
    if (num.length <= 4) return '****';
    const firstPart = num.slice(0, 4);
    const maskedLen = Math.max(num.length - 4, 4);
    return `${firstPart}${'*'.repeat(maskedLen)}`;
  };

  const maskName = (name: string) => {
    const parts = name.split(' ');
    return parts.map(part => {
      if (part.length <= 3) return part[0] + '**';
      return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
    }).join(' ');
  };

  // Submit Claim Handler
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForClaim) return;
    
    const code = onSubmitClaim({
      documentId: selectedDocForClaim.id,
      citizenName,
      citizenPhone,
      citizenEmail,
      proofNotes,
      proofDocumentType
    });

    setClaimSuccessCode(code);
    onAddAuditLog('Claim Submitted', 'Citizen', `Filed claim for document ID ${selectedDocForClaim.id} (Tracking: ${code})`);
    
    // Clear form
    setCitizenName('');
    setCitizenPhone('');
    setCitizenEmail('');
    setProofNotes('');
  };

  // Look up dynamic tracking progress
  const handleTrackingLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackSearched(true);
    const found = claims.find(c => c.trackingCode.trim().toUpperCase() === trackingSearchCode.trim().toUpperCase());
    setTrackedClaim(found || null);
    onAddAuditLog('Claim Status Tracking', 'Citizen', `Queried status for tracking code: ${trackingSearchCode}`);
  };

  // Switch Stations Pin helper
  const handlePoliceLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow standard PINs, or default to pass (e.g. "991" or "042")
    if (policePassword === '1234' || policePassword === '991' || policePassword === '') {
      setPoliceLoggedIn(true);
      if (localStations.length > 0) {
        setSelectedStationId(localStations[0].id);
      }
      onAddAuditLog('Institution Authentication Successful', 'Police', `Officer logged into station desk - Room Code: SEC-SADC-${country.code}`);
    } else {
      alert('Error: Authorized PIN code incorrect. Contact district server systems administrator.');
    }
  };

  // Police document upload handler
  const handlePoliceUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocNum || !newHolderName || !selectedStationId) {
      alert('Please fill in required fields');
      return;
    }

    onAddDocument({
      documentType: newDocType,
      documentNumber: newDocNum,
      holderName: newHolderName,
      countryCode: country.code,
      stationId: selectedStationId,
      dateFound: new Date().toISOString().split('T')[0],
      remarks: newFoundLoc ? `Found location: ${newFoundLoc}. ${newRemarks}` : newRemarks
    });

    setUploadSuccess(true);
    setNewDocNum('');
    setNewHolderName('');
    setNewFoundLoc('');
    setNewRemarks('');
    
    onAddAuditLog('Secure Document Entry', 'Police', `Officer uploaded a found ${newDocType} (${maskDocumentNumber(newDocNum)}) to storage registry`);

    setTimeout(() => {
      setUploadSuccess(false);
    }, 4000);
  };

  // Admin authentication Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin' || adminPassword === 'sadc' || adminPassword === '') {
      setAdminLoggedIn(true);
      onAddAuditLog('Central Administrative Admin Handshake', 'Administrator', 'Central Auditor secured admin root terminal access panel');
    } else {
      alert('Error: Central auditor verification credentials rejected.');
    }
  };

  // Admin Claim Approval/Rejection Action handler
  const processAdminClaim = (action: 'Approved' | 'Rejected') => {
    if (!selectedAdminClaim) return;
    
    // Process claim
    onUpdateClaimStatus(selectedAdminClaim.id, action, adminReviewNotes);
    
    // Also update document status accordingly
    if (action === 'Approved') {
      onUpdateDocumentStatus(selectedAdminClaim.documentId, 'Verified/Ready');
    } else {
      onUpdateDocumentStatus(selectedAdminClaim.documentId, 'Unclaimed');
    }

    onAddAuditLog(
      `Claim Evaluated: ${action}`, 
      'Administrator', 
      `Claim ${selectedAdminClaim.trackingCode} processed by administrator. Notes: ${adminReviewNotes}`
    );

    alert(`Claim successfully marked as: ${action}`);
    setSelectedAdminClaim(null);
    setAdminReviewNotes('');
  };

  // Admin document archive cleanup or direct update
  const makeAsCollected = (docId: string) => {
    onUpdateDocumentStatus(docId, 'Collected');
    onAddAuditLog('Physical Dispatch Handover', 'Police', `Document ID ${docId} physical security handover verified. Marked as Collected.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back Arrow */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-500 text-xs font-semibold uppercase tracking-wider transition bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 hover:border-amber-500/30 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Exit National Portal
        </button>

        <div className="flex items-center gap-3">
          <span className="text-4xl filter drop-shadow select-none">{country.flag}</span>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">
              {country.name} Security Node
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">
              Sub-Saharan Central Hub • Capital: {country.capital}
            </p>
          </div>
        </div>
      </div>

      {/* Role Navigation Mode Switcher */}
      <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800/80 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('citizen')}
          className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'citizen'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4" /> 🛡️ Citizen Recovery Deck
        </button>

        <button
          onClick={() => setActiveTab('police')}
          className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'police'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" /> 👮 Police Station Desk
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 🏦 Central Auditor Terminal
        </button>
      </div>

      {/* RENDER ACTIVE ROLE PORTAL */}
      <AnimatePresence mode="wait">
        {/* TAB 1: CITIZEN PORTAL */}
        {activeTab === 'citizen' && (
          <motion.div
            key="citizen-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Search Engine Left Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Search className="w-5 h-5 text-amber-500" /> Retrieve Lost Identity Documents
                    </h2>
                    <p className="text-xs text-slate-400">
                      Query our repository. All records are indexed by unsealed ID sequences but masked publicly for security compliance.
                    </p>
                  </div>

                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-12 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-mono tracking-wide font-medium"
                        placeholder="e.g. Dlamini, Zwane or ID sequence..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (!e.target.value) setHasSearched(false);
                        }}
                        required
                      />
                      {speechSupported !== false && (
                        <button
                          type="button"
                          id="voice-search-btn-portal"
                          onClick={toggleListening}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer ${
                            isListening
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-900 border border-transparent'
                          }`}
                          title="Search by voice"
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          {isListening && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-950 cursor-pointer text-amber-400 font-semibold text-xs border border-slate-800 hover:border-amber-500 hover:bg-slate-900 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Search className="w-4 h-4" /> Find Record
                    </button>
                  </form>

                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg animate-pulse font-mono"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                      <span>National Portal Voice Stream active: Speak names or ID numbers now...</span>
                    </motion.div>
                  )}

                  {speechError && (
                    <div className="text-xs text-amber-500 px-1 font-mono">
                      ⚠️ Voice capture reminder: {speechError} (Confirm mic permissions or type manually)
                    </div>
                  )}

                  {/* Search explanation tip */}
                  <div className="text-[11px] text-slate-500 leading-normal flex items-start gap-1.5 bg-slate-950/40 p-3 rounded border border-slate-800/40">
                    <Info className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Demo Mode: You can find simulated data for Eswatini by searching <span className="text-amber-400 font-mono">Dlamini</span> or <span className="text-amber-400 font-mono">Zwane</span>. For South Africa, try searching <span className="text-amber-400 font-mono">Khumalo</span> or <span className="text-amber-400 font-mono">Ndlovu</span>.
                    </span>
                  </div>
                </div>

                {/* SEARCH RESULTS LIST */}
                {hasSearched && (
                  <div className="mt-8 space-y-4 pt-6 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                      <span>Matches Found in {country.name} Data pool</span>
                      <span className="text-amber-500 font-mono">{searchResults.length} file(s) found</span>
                    </h3>

                    {searchResults.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800/60 text-slate-400">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-white">No Document Logged Yet</h4>
                        <p className="max-w-md mx-auto text-xs text-slate-500 mt-1 leading-normal">
                          If your identity card was handed into a police station recently, it might take 24 hours to clear security digitization checks. Try searching again later.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map(doc => {
                          const station = INITIAL_POLICE_STATIONS.find(s => s.id === doc.stationId);
                          return (
                            <div 
                              key={doc.id}
                              className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 relative hover:border-slate-700 transition"
                            >
                              {/* Status Badge */}
                              <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-mono leading-none font-bold uppercase px-2 py-1 rounded ${
                                  doc.status === 'Unclaimed' 
                                    ? 'bg-amber-950/80 text-amber-400 border border-amber-900/60' 
                                    : doc.status === 'Claim Pending'
                                    ? 'bg-blue-950 text-blue-400 border border-blue-900'
                                    : doc.status === 'Verified/Ready'
                                    ? 'bg-green-950/80 text-green-400 border border-green-900'
                                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                                }`}>
                                  {doc.status}
                                </span>
                                <span className="text-[10px] text-slate-600 font-mono font-bold uppercase shrink-0">
                                  {doc.documentType}
                                </span>
                              </div>

                              <div className="space-y-1 pt-1.5">
                                <span className="text-xs text-slate-500 block">Holder Legal Name:</span>
                                <strong className="text-sm font-semibold tracking-wide text-white font-mono uppercase">
                                  {maskName(doc.holderName)}
                                </strong>
                              </div>

                              <div className="space-y-1">
                                <span className="text-xs text-slate-500 block">Identifier Hash:</span>
                                <strong className="text-sm font-semibold text-amber-400 font-mono tracking-widest text-[#f59e0b]">
                                  {maskDocumentNumber(doc.documentNumber)}
                                </strong>
                              </div>

                              <div className="space-y-1 text-xs text-slate-300 bg-slate-900/40 p-2 border border-slate-800/40 rounded">
                                <span className="text-[10px] text-slate-500 block font-semibold">Digitized Vault Location:</span>
                                <div className="flex gap-1 items-center mt-1 text-slate-300 font-medium">
                                  <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                  <span>{station?.name || 'Central District Office'}</span>
                                </div>
                              </div>

                              {doc.status === 'Unclaimed' ? (
                                <button
                                  onClick={() => {
                                    setSelectedDocForClaim(doc);
                                    setClaimSuccessCode(null);
                                  }}
                                  className="w-full bg-amber-500 text-slate-950 hover:bg-amber-600 py-2 rounded text-xs font-bold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                                >
                                  Claim & Recover Identity
                                </button>
                              ) : doc.status === 'Collected' ? (
                                <div className="text-center py-2 bg-slate-900 rounded text-slate-500 text-xs font-mono">
                                  Physical file retrieved by owner ✅
                                </div>
                              ) : (
                                <div className="text-center py-2 bg-blue-950/40 border border-blue-900/40 rounded text-blue-400 text-xs font-mono">
                                  Active Claim review under process ⏳
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CLAIM DRAWER/MODAL POPUP */}
              {selectedDocForClaim && (
                <div className="bg-slate-900 border border-amber-500/40 p-6 rounded-2xl relative">
                  <div className="absolute top-4 right-4 text-slate-500 hover:text-white text-xs font-bold tracking-widest uppercase cursor-pointer"
                    onClick={() => setSelectedDocForClaim(null)}>
                    [ Close ✕ ]
                  </div>

                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" /> Authenticate Possession Claim
                  </h3>
                  <p className="text-xs text-slate-400 mb-6 border-b border-slate-800 pb-4">
                    Document File Reference Number: <span className="font-mono text-amber-400 font-semibold">{selectedDocForClaim.id}</span>. This request will be routed directly to the station warden and central immigration registry audit logs for physical verification.
                  </p>

                  {claimSuccessCode ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 bg-slate-950 rounded-xl border border-green-500/30 text-center space-y-4"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                      <div>
                        <h4 className="font-bold text-white text-base">Identity Claim Received</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                          Your physical claim docket has been submitted, verified against cryptographic flags, and routed to the station officer at <strong className="text-slate-200">{INITIAL_POLICE_STATIONS.find(s => s.id === selectedDocForClaim.stationId)?.name}</strong>.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900 border border-slate-800 inline-block rounded-lg">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Secure Tracking Code</span>
                        <strong className="text-lg font-mono tracking-wider text-amber-400 select-all p-1">
                          {claimSuccessCode}
                        </strong>
                        <span className="text-[9px] block text-slate-500 mt-1">Copy this code to check verification stages live</span>
                      </div>

                      <div className="pt-2 text-xs text-slate-500 text-left border-t border-slate-900">
                        <strong className="text-slate-300 block mb-1">Requirements for pickup:</strong>
                        1. Physical Affidavit of Loss stamped by an authorized station commissioner.<br />
                        2. Secondary photo identity documentation or witness verification signed by a chief or registrar.
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleClaimSubmit} className="space-y-4 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase">Your Full Legal Name:</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                            placeholder="Must match original document data precisely"
                            value={citizenName}
                            onChange={(e) => setCitizenName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase">Original Contact Number:</label>
                          <input
                            type="tel"
                            required
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                            placeholder="e.g. +268 7600 0000"
                            value={citizenPhone}
                            onChange={(e) => setCitizenPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Contact Email:</label>
                        <input
                          type="email"
                          required
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          placeholder="e.g. email@example.com"
                          value={citizenEmail}
                          onChange={(e) => setCitizenEmail(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase">Method of Verification Upload:</label>
                          <select
                            className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                            value={proofDocumentType}
                            onChange={(e) => setProofDocumentType(e.target.value)}
                          >
                            <option value="Loss Affidavit Receipt">Loss Affidavit Receipt</option>
                            <option value="Original Birth Certificate Scan">Original Birth Certificate Scan</option>
                            <option value="Certified Secondary Utility Statement">Certified Secondary Utility Statement</option>
                            <option value="Sovereign Ministry Enrollment Records">Sovereign Ministry Enrollment Records</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase">Evidence/Proof Detail Description:</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                            placeholder="Provide brief details on where/when lost to substantiate claim"
                            value={proofNotes}
                            onChange={(e) => setProofNotes(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 text-[10px] text-slate-500 rounded border border-slate-800 flex gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Warning:</strong> SADC Title Security Framework Article 19 renders fraudulent claiming of identification documents a criminal federal offense punishable by extensive state prosecution. Physical biometric matches will be executed during handovers.
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-500 text-slate-950 font-bold text-xs py-3 rounded-lg hover:bg-amber-600 transition tracking-wide uppercase cursor-pointer shadow-lg"
                      >
                        Submit Encrypted Claims Docket
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Tracking & Station Lists Right Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Tracker Widget */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-4.5 h-4.5 text-amber-500" /> Track Recovery Docket
                </h3>
                <p className="text-xs text-slate-400">
                  Monitor verification matching status using your secured tracking code.
                </p>

                <form onSubmit={handleTrackingLookup} className="space-y-2">
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase tracking-widest font-mono font-medium"
                    placeholder="e.g. SADC-CLAIM-4481-SWZ"
                    value={trackingSearchCode}
                    onChange={(e) => setTrackingSearchCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white border border-slate-800 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                  >
                    Fetch Progress Map
                  </button>
                </form>

                {trackSearched && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    {trackedClaim ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Status Status:</span>
                          <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            trackedClaim.status === 'Submitted'
                              ? 'bg-slate-800 text-slate-300'
                              : trackedClaim.status === 'Under Review'
                              ? 'bg-blue-950 text-blue-400'
                              : trackedClaim.status === 'Approved'
                              ? 'bg-green-950 text-green-400'
                              : 'bg-red-950 text-red-400'
                          }`}>
                            {trackedClaim.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <span className="text-slate-500 block">Claimholder Name:</span>
                          <strong className="text-slate-200">{trackedClaim.citizenName}</strong>
                        </div>

                        <div className="space-y-1 text-xs">
                          <span className="text-slate-500 block font-semibold">Stage Progress Log:</span>
                          <div className="pl-3 border-l-2 border-amber-500 mt-1 space-y-2">
                            <div className="text-[11px]">
                              <span className="text-slate-500 block text-[9px] font-mono">STEP 1 - SECURE SUBMISSION</span>
                              <span className="text-slate-300">File digitized in SADC secure database. (Verified)</span>
                            </div>
                            {trackedClaim.status !== 'Submitted' && (
                              <div className="text-[11px]">
                                <span className="text-slate-500 block text-[9px] font-mono">STEP 2 - STATION AUDIT</span>
                                <span className="text-slate-300">Officer executing biometric and database similarity checks.</span>
                              </div>
                            )}
                            {trackedClaim.status === 'Approved' && (
                              <div className="text-[11px]">
                                <span className="text-amber-400 block text-[9px] font-mono">STEP 3 - DISPATCH AUTHORIZATION</span>
                                <span className="text-green-400 font-bold">Approved for pickup handover. Details: "{trackedClaim.reviewerNotes}"</span>
                              </div>
                            )}
                            {trackedClaim.status === 'Rejected' && (
                              <div className="text-[11px]">
                                <span className="text-red-400 block text-[9px] font-mono">REVIEW REJECTED</span>
                                <span className="text-red-400 text-xs">Reason: {trackedClaim.reviewerNotes || 'Mismatch of credentials.'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-950/20 text-center rounded border border-red-900/40 text-xs text-red-400">
                        No active tracking record found under that credential code in SADC database nodes.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Station Locations Finder */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-amber-500" /> Authorized Collection Points
                </h3>
                <p className="text-xs text-slate-400">
                  Valid collection centers registered in {country.name} region:
                </p>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {localStations.map(station => {
                    const activeCount = documents.filter(d => d.stationId === station.id && d.status === 'Unclaimed').length;
                    return (
                      <div 
                        key={station.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 transition hover:border-slate-700"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{station.name}</h4>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{station.address}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1.5 border-t border-slate-900 font-mono">
                          <div>
                            <span className="text-slate-600 block">Phone Desk:</span>
                            <span className="text-xs text-slate-300">{station.contactPhone}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block">Stashed Files:</span>
                            <span className="text-xs text-white font-bold">{activeCount} uncollected</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                          <span className="flex items-center gap-0.5 text-green-500"><Clock className="w-3 h-3" /> {station.workingHours}</span>
                          <span>Station Code: {station.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: POLICE CORRIDOR DESK */}
        {activeTab === 'police' && (
          <motion.div
            key="police-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {!policeLoggedIn ? (
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-5">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Station Patrol Authentication</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Access restricted to authorized police desk systems and border agency workers in {country.name}.
                  </p>
                </div>

                <form onSubmit={handlePoliceLogin} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Secure Access Station PIN:</label>
                    <input
                      type="password"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-center tracking-widest font-mono font-bold"
                      placeholder="••••"
                      value={policePassword}
                      onChange={(e) => setPolicePassword(e.target.value)}
                    />
                    <span className="text-[10px] text-slate-500 leading-none">
                      Demo mode parameter: enter any code, leave empty, or input <span className="font-mono text-amber-500 font-bold">991</span> to authenticate immediately.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 font-bold text-xs py-3 rounded text-slate-950 transition tracking-wide uppercase cursor-pointer"
                  >
                    Establish Secure Station Tunnel
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Station Document Digitizer Form (Left Column) */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                      <UploadCloud className="w-5 h-5 text-amber-500" /> Catalog Found Identity File
                    </h3>
                    <p className="text-xs text-slate-400">
                      Digitize newly recovered SADC documents. Ensure names match the face plate correctly.
                    </p>
                  </div>

                  {uploadSuccess && (
                    <div className="p-3 bg-green-950/40 border border-green-900/40 rounded text-green-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Digitized file successfully committed to SADC central registry keys!
                    </div>
                  )}

                  <form onSubmit={handlePoliceUpload} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Document Class:</label>
                        <select
                          className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          value={newDocType}
                          onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                        >
                          <option value="National Identity Card">National Identity Card</option>
                          <option value="Passport">Passport</option>
                          <option value="Driver's Licence">Driver's Licence</option>
                          <option value="Student ID Card">Student ID Card</option>
                          <option value="Bank Card">Bank Card</option>
                          <option value="Other Secure Document">Other Secure Document</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Document Number (True ID):</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono tracking-wider font-semibold"
                          placeholder="Full serial (e.g. 920412...)"
                          value={newDocNum}
                          onChange={(e) => setNewDocNum(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase">Holder's Full Legal Name:</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500 uppercase font-mono font-medium"
                        placeholder="Print exact uppercase text from document banner"
                        value={newHolderName}
                        onChange={(e) => setNewHolderName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Found Location Details:</label>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-300 placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          placeholder="e.g. Mbabane Mall ATM"
                          value={newFoundLoc}
                          onChange={(e) => setNewFoundLoc(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Assigned Physical Depot:</label>
                        <select
                          className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          value={selectedStationId}
                          onChange={(e) => setSelectedStationId(e.target.value)}
                        >
                          {localStations.map(stn => (
                            <option key={stn.id} value={stn.id}>{stn.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase">Additional Remand/Storage Marks:</label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                        placeholder="e.g. Minor scratches, stored on drawer shelf 1B..."
                        value={newRemarks}
                        onChange={(e) => setNewRemarks(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-slate-500 italic">Centralized SADC digitization validation active.</span>
                      <button
                        type="submit"
                        className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded text-xs uppercase tracking-wide transition cursor-pointer hover:bg-amber-600"
                      >
                        Commit Log To Ledger
                      </button>
                    </div>
                  </form>
                </div>

                {/* Secure Station Physical Handover Inventory (Right Column) */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
                          Depot Inventory List
                        </h3>
                        <p className="text-xs text-slate-400">
                          Active documents physical inventory locked at station depots:
                        </p>
                      </div>
                      <span className="bg-slate-950 px-2 py-1 text-xs font-mono font-bold text-amber-500 rounded border border-slate-800 shrink-0">
                        {countryDocuments.filter(d => d.status !== 'Collected').length} active files
                      </span>
                    </div>

                    {/* Depot selective filter */}
                    <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded flex gap-2 items-center text-xs">
                      <Filter className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-slate-500 uppercase text-[10px] font-bold">Managing Station:</span>
                      <select
                        className="bg-transparent text-amber-400 font-semibold focus:outline-none text-xs flex-1 cursor-pointer"
                        value={selectedStationId}
                        onChange={(e) => setSelectedStationId(e.target.value)}
                      >
                        {localStations.map(st => (
                          <option key={st.id} value={st.id} className="bg-slate-950 text-slate-300">{st.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Inventory Records UI */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {countryDocuments.filter(d => d.stationId === selectedStationId).length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500">
                          No identity documents currently stored in this depot shelf.
                        </div>
                      ) : (
                        countryDocuments
                          .filter(d => d.stationId === selectedStationId)
                          .map(doc => (
                            <div 
                              key={doc.id}
                              className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-2.5 text-xs transition hover:border-slate-800"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-300 font-mono text-[10px] shrink-0 uppercase">{doc.documentType}</span>
                                <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded leading-none shrink-0 border ${
                                  doc.status === 'Unclaimed'
                                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                                    : doc.status === 'Claim Pending'
                                    ? 'bg-blue-950/40 text-blue-400 border-blue-900/50'
                                    : doc.status === 'Verified/Ready'
                                    ? 'bg-green-950/40 text-green-400 border-green-900/50'
                                    : 'bg-slate-900 text-slate-500 border-slate-800'
                                }`}>
                                  {doc.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                <div>
                                  <span className="text-slate-600 block text-[9px]">HOLDER LEGAL NAME:</span>
                                  <span className="text-slate-200 uppercase font-semibold block truncate leading-tight">{doc.holderName}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600 block text-[9px]">UNMASKED TRUE CARD ID:</span>
                                  <span className="text-amber-500 font-bold block truncate leading-tight">{doc.documentNumber}</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-400 leading-normal bg-slate-900/40 p-1.5 rounded border border-slate-900">
                                <span className="text-[9px] text-slate-500 block font-semibold">STORAGE DETAILS:</span>
                                {doc.remarks}
                              </p>

                              {doc.status !== 'Collected' && (
                                <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
                                  {doc.status === 'Verified/Ready' && (
                                    <button
                                      onClick={() => makeAsCollected(doc.id)}
                                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 rounded text-[10px] uppercase transition cursor-pointer"
                                    >
                                      Verify & Mark Collected ✓
                                    </button>
                                  )}
                                  
                                  {doc.status === 'Unclaimed' && (
                                    <span className="text-[9px] text-slate-500 italic py-1">Awaiting citizen's claim filing on recovery deck.</span>
                                  )}

                                  {doc.status === 'Claim Pending' && (
                                    <span className="text-[9px] text-amber-400 flex items-center gap-1 py-1 font-semibold">
                                      ⏳ Authorized claim awaiting Central Admin approval
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Logged in safety info banner */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500">
                    <span>Officer Session: ACTIVE</span>
                    <button
                      onClick={() => setPoliceLoggedIn(false)}
                      className="text-amber-500 hover:text-amber-400 uppercase font-bold tracking-wider cursor-pointer font-mono"
                    >
                      [ Terminate Desk Portal ]
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: CENTRAL ADMINISTRATOR AUTHORITY PORTAL */}
        {activeTab === 'admin' && (
          <motion.div
            key="admin-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {!adminLoggedIn ? (
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-5">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Central Regional Administrative Terminal</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Administrative access key required to audit logs, authorize international claims, and dispatch files.
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Auditor Access Word Code:</label>
                    <input
                      type="password"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-center tracking-widest font-mono font-bold"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                    <span className="text-[10px] text-slate-500 leading-none">
                      Demo mode parameter: enter any text, leave empty, or input <span className="font-mono text-amber-500 font-bold">sadc</span>.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 font-bold text-xs py-3 rounded text-slate-950 transition tracking-wide uppercase cursor-pointer"
                  >
                    Authenticate Auditor Signature
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Audit Metrics Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase block font-medium">Claims In Processing Queue</span>
                    <strong className="text-2xl text-white font-mono font-bold">
                      {claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length} submissions
                    </strong>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase block font-medium">Fully Verified Dispatch</span>
                    <strong className="text-2xl text-green-500 font-mono font-bold">
                      {claims.filter(c => c.status === 'Approved').length} authorized
                    </strong>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase block font-medium">Archived Files Collected</span>
                    <strong className="text-2xl text-amber-500 font-mono font-bold">
                      {documents.filter(d => d.countryCode === country.code && d.status === 'Collected').length} handovers
                    </strong>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase block font-medium">Digitized System Node</span>
                    <strong className="text-2xl text-blue-400 font-mono font-bold">Node-SADC-{country.code}</strong>
                  </div>
                </div>

                {/* Submissions Validation Queue Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left part: Claim List to analyze */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-wide">
                          Possession Claims Audit Pool
                        </h3>
                        <p className="text-xs text-slate-400">Claims submitted by citizens requiring cryptographic card matching checks.</p>
                      </div>
                      <span className="bg-amber-950 border border-amber-900 text-amber-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                        Requires Signature
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {claims.length === 0 ? (
                        <div className="py-16 text-center text-xs text-slate-500">
                          Clear! No active identity possession claims pending audit for {country.name}.
                        </div>
                      ) : (
                        claims
                          .slice()
                          .reverse()
                          .map(claim => {
                            const matchDoc = documents.find(d => d.id === claim.documentId);
                            return (
                              <div
                                key={claim.id}
                                onClick={() => setSelectedAdminClaim(claim)}
                                className={`p-4 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between space-y-3 ${
                                  selectedAdminClaim?.id === claim.id
                                    ? 'bg-slate-950 border-amber-500'
                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-slate-500 text-[10px] block">TRACKING ID:</span>
                                    <strong className="text-slate-200 font-mono text-xs">{claim.trackingCode}</strong>
                                  </div>

                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                    claim.status === 'Submitted' || claim.status === 'Under Review'
                                      ? 'bg-blue-950 text-blue-400 border border-blue-900'
                                      : claim.status === 'Approved'
                                      ? 'bg-green-950 text-green-400 border border-green-900/40'
                                      : 'bg-red-950 text-red-400 border border-red-900/40'
                                  }`}>
                                    {claim.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 text-[11px]">
                                  <div>
                                    <span className="text-slate-600 block text-[9px]">CITIZEN NAME:</span>
                                    <span className="text-slate-200 uppercase font-semibold block">{claim.citizenName}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600 block text-[9px]">MATCHED VAULT ID:</span>
                                    <span className="text-amber-500 block font-mono font-bold">{matchDoc ? maskDocumentNumber(matchDoc.documentNumber) : '(Not Linked)'}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-900/60 font-mono">
                                  <span>Submit Date: {new Date(claim.submittedAt).toLocaleDateString()}</span>
                                  <span className="text-amber-400 uppercase font-bold text-[9px] hover:underline">Verify and Audit Case →</span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Right part: Verification Decision Module */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                    {selectedAdminClaim ? (
                      <div className="space-y-4 text-xs">
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-wider">
                            Case Auditor: {selectedAdminClaim.trackingCode}
                          </h3>
                          <p className="text-xs text-slate-400">Match citizen proofs against true physical document serial tags.</p>
                        </div>

                        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <div className="space-y-1">
                            <span className="text-slate-500 uppercase text-[9px] block">Claimant Profile:</span>
                            <div className="text-slate-200 font-semibold uppercase">{selectedAdminClaim.citizenName}</div>
                            <div className="text-slate-400 flex flex-wrap gap-2 pt-0.5">
                              <span className="inline-flex items-center gap-1 font-mono"><Phone className="w-3.5 h-3.5 text-amber-500" /> {selectedAdminClaim.citizenPhone}</span>
                              <span className="inline-flex items-center gap-1 font-mono"><Mail className="w-3.5 h-3.5 text-amber-500" /> {selectedAdminClaim.citizenEmail}</span>
                            </div>
                          </div>

                          <div className="space-y-1 border-t border-slate-900 pt-2">
                            <span className="text-slate-500 uppercase text-[9px] block">Uploaded Authentication File:</span>
                            <div className="text-amber-500 font-bold flex items-center gap-1">
                              <FileText className="w-4 h-4 shrink-0" /> {selectedAdminClaim.proofDocumentType}
                            </div>
                          </div>

                          <div className="space-y-1 border-t border-slate-900 pt-2 text-[11px] leading-relaxed">
                            <span className="text-slate-500 uppercase text-[9px] block">Evidence Notes:</span>
                            <p className="text-slate-300 bg-slate-900 p-2 rounded italic border border-slate-900">
                              "{selectedAdminClaim.proofNotes}"
                            </p>
                          </div>
                        </div>

                        {selectedAdminClaim.status === 'Submitted' || selectedAdminClaim.status === 'Under Review' ? (
                          <div className="space-y-3.5">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase">Case Decision Logs/Instructions:</label>
                              <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                                placeholder="Shelf #3B, verified via Eswatini Government Registry..."
                                value={adminReviewNotes}
                                onChange={(e) => setAdminReviewNotes(e.target.value)}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => processAdminClaim('Rejected')}
                                className="bg-red-950/40 hover:bg-red-950 border border-red-800 text-red-400 font-bold py-2.5 rounded text-xs uppercase transition tracking-wide cursor-pointer"
                              >
                                Decline Claims Case
                              </button>
                              <button
                                onClick={() => processAdminClaim('Approved')}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 font-bold text-slate-950 py-2.5 rounded text-xs uppercase transition tracking-wide cursor-pointer"
                              >
                                Authorize Handover Docket
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-950 rounded-lg text-center border border-slate-800 text-slate-500 font-mono">
                            Case Completed: Decision sets status as <strong>{selectedAdminClaim.status}</strong>.<br />
                            <span className="text-xs block text-slate-600 mt-1">Audit Notes: "{selectedAdminClaim.reviewerNotes}"</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-24 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
                        <UserCheck className="w-10 h-10 text-slate-700" />
                        <span className="max-w-[240px]">Select any citizen claim package in the sidebar to review evidence audits.</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Authority Session: AUDITED</span>
                      <button
                        onClick={() => setAdminLoggedIn(false)}
                        className="text-amber-500 hover:text-amber-400 uppercase font-bold tracking-wider cursor-pointer font-mono"
                      >
                        [ Exit Auditor Console ]
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secure Audit Logs table for traceability & anti-fraud auditing */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> Real-time System Audit Ledger File
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Compliance Node: Active</span>
                  </div>

                  <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-[11px] font-mono border-collapse">
                      <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-3">Reference Timestamp</th>
                          <th className="p-3">Operation Target</th>
                          <th className="p-3">Executing Principle</th>
                          <th className="p-3">Hash Activity Log Info</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {logs
                          .slice()
                          .reverse()
                          .map(log => (
                            <tr key={log.id} className="hover:bg-slate-900/30">
                              <td className="p-3 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.action.includes('Search')
                                    ? 'bg-blue-950/60 text-blue-400 border border-blue-900/30'
                                    : log.action.includes('Upload') || log.action.includes('Secure')
                                    ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30'
                                    : 'bg-green-950/60 text-green-400 border border-green-900/30'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">{log.userRole}</td>
                              <td className="p-3 max-w-sm truncate text-slate-400">{log.details}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
