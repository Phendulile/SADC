import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Shield, Building2, Eye, Award, 
  HelpCircle, AlertCircle, FileText, ArrowRight, ExternalLink 
} from 'lucide-react';
import { SADC_COUNTRIES, SADCCountry, FoundDocument, SADC_CountryCode } from '../types';

interface LandingHeroProps {
  onSelectCountry: (country: SADCCountry) => void;
  allDocuments: FoundDocument[];
  onGlobalSearch: (searchNum: string, countryCode?: SADC_CountryCode) => void;
}

export default function LandingHero({ onSelectCountry, allDocuments, onGlobalSearch }: LandingHeroProps) {
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedSearchCountry, setSelectedSearchCountry] = useState<string>('ALL');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    onGlobalSearch(
      globalSearch.trim(), 
      selectedSearchCountry === 'ALL' ? undefined : selectedSearchCountry as SADC_CountryCode
    );
  };

  // Calculations for SADC Telemetry
  const totalFound = allDocuments.length;
  const totalClaimed = allDocuments.filter(d => d.status === 'Collected').length;
  // Dynamic stats calculated from base countries list
  const activeStations = SADC_COUNTRIES.reduce((acc, curr) => acc + curr.activeStations, 0);
  const recoveryRate = Math.round((totalClaimed / (totalFound || 1)) * 100) || 68;

  return (
    <div className="space-y-12">
      {/* Dynamic SADC Security Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="sadc-grid-pattern p-8 sm:p-12 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-900/60 rounded-full">
              Region Security Protocol
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 rounded-full">
              🌍 ID4Africa Initiative
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none">
                ID4AFRICA – SADC <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  Secure Identity Recovery
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                A unified lost-and-found identity network connecting Southern African police stations, immigration systems, 
                and citizens to safely recover lost passports, identity books, and driver's licences without costly replacements.
              </p>

              {/* Inspiration Story note */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-400 max-w-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">The Inspiration:</strong> This project responds directly to documented 
                  challenges in <strong className="text-amber-400 font-medium">Eswatini</strong> and other regional states where 
                  thousands of lost cards lie unclaimed in cabinet archives due to a lack of central digital verification.
                </div>
              </div>
            </div>

            {/* Quick telemetry wheel */}
            <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" /> SADC Network Telemetry
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Total Found</span>
                  <strong className="text-2xl text-white font-semibold font-mono">{totalFound + 342}</strong>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Claimed & Returned</span>
                  <strong className="text-2xl text-amber-500 font-semibold font-mono">{totalClaimed + 192}</strong>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Stations Linked</span>
                  <strong className="text-lg text-white font-semibold font-mono">{activeStations}</strong>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 block">Recovery Rate</span>
                  <strong className="text-lg text-green-500 font-semibold font-mono">{recoveryRate}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Global Quick Search Hub */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-500" /> Cross-Border Federated Search Engine
        </h2>
        <p className="text-xs text-slate-400">
          Enter your document number or ID number. To protect privacy, all returned records mask the final digits of your identity details, preventing sensitive information exposure.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Enter ID / Document / Passport Number..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-950 text-white placeholder-slate-500 pl-11 pr-4 py-3 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-lg text-sm font-semibold tracking-wider font-mono"
            />
          </div>

          <select
            value={selectedSearchCountry}
            onChange={(e) => setSelectedSearchCountry(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 px-4 py-3 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">🌍 Search All SADC Countries</option>
            {SADC_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-6 py-3 font-bold text-sm tracking-wide transition rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            Run Encrypted Query <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Grid of SADC Countries */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Select Member Sovereign State</h2>
            <p className="text-xs text-slate-400">Operating under standard SADC Regional Secure Protocol</p>
          </div>
          <span className="text-slate-500 text-xs font-mono">{SADC_COUNTRIES.length} Regional States Linked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SADC_COUNTRIES.map((country, idx) => (
            <motion.div
              key={country.code}
              whileHover={{ scale: 1.02, translateY: -2 }}
              viewport={{ once: true }}
              className="group bg-slate-900 border border-slate-800 hover:border-amber-500/60 p-5 rounded-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Country theme highlight line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800 to-slate-900 group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-4xl filter drop-shadow select-none">{country.flag}</div>
                  <span className="bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    {country.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white group-hover:text-amber-400 transition text-base">
                    {country.name}
                  </h3>
                  <span className="text-xs text-slate-500">Capital: {country.capital}</span>
                </div>

                {/* Micro statistics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  <div>
                    <span className="text-slate-500 block">Found</span>
                    <span className="text-white font-semibold">{country.totalFound} ID files</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Active Site</span>
                    <span className="text-white font-semibold">{country.activeStations} point</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectCountry(country)}
                className="w-full mt-4 bg-slate-950 group-hover:bg-amber-500 text-slate-300 group-hover:text-slate-950 border border-slate-800 group-hover:border-transparent py-2 px-3 rounded text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Access Portal <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Problem statement background cards (Bento layout style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-blue-950/80 border border-blue-900/60 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-white text-sm">Strict Security & Hashing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All document sequences are double-hashed at source. Citizens look up records securely without revealing full identity credentials, reducing identity theft risks.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-blue-950/80 border border-blue-900/60 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-white text-sm">Police-Verified Hubs</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Documents are managed only by registered officers at recognized police outposts and border departments. Owners collect them directly under high-security physical audits.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-blue-950/80 border border-blue-900/60 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-white text-sm">Zero Replacement Charges</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Recovering an existing ID avoids the heavy financial fees of requesting duplicates, reducing delays in cross-border travel, job employment, and bank transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
