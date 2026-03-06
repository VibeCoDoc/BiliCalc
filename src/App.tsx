import React, { useState, useEffect } from 'react';
import { differenceInMinutes } from 'date-fns';
import { 
  Calculator, 
  RotateCcw, 
  AlertTriangle,
  Calendar,
  Clock,
  Copy,
  CheckCircle,
  AlertCircle,
  XCircle,
  Check,
  Sun
} from 'lucide-react';
import { motion } from 'motion/react';
import { BiliChart } from './components/BiliChart';
import { calculateBiliRisk, BiliInput, BiliResult } from './utils/biliLogic';

export default function App() {
  // Patient Details
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [gaWeeks, setGaWeeks] = useState<string>('39');
  const [gaDays, setGaDays] = useState<string>('0');

  // Assessment
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [tsb, setTsb] = useState<string>('');
  const [riskFactors, setRiskFactors] = useState<boolean>(false);
  const [guidelineVersion, setGuidelineVersion] = useState<'2004' | '2022'>('2004');
  const [visualizationMode, setVisualizationMode] = useState<'interactive' | 'static'>('interactive');

  // Computed & Results
  const [ageHours, setAgeHours] = useState<number | null>(null);
  const [result, setResult] = useState<BiliResult | null>(null);

  // Auto-calculate hours and risk when inputs change
  useEffect(() => {
    if (birthDate && birthTime && currentDate && currentTime) {
      const birth = new Date(`${birthDate}T${birthTime}`);
      const current = new Date(`${currentDate}T${currentTime}`);
      const diffMinutes = differenceInMinutes(current, birth);
      const hours = diffMinutes / 60;
      
      if (hours >= 0) {
        setAgeHours(parseFloat(hours.toFixed(1)));
        
        if (tsb && gaWeeks) {
          const gaTotalWeeks = parseFloat(gaWeeks) + (parseFloat(gaDays || '0') / 7);
          const input: BiliInput = {
            ageHours: parseFloat(hours.toFixed(1)),
            tsb: parseFloat(tsb),
            gestationalAge: gaTotalWeeks,
            riskFactors,
            guidelineVersion
          };
          const res = calculateBiliRisk(input);
          setResult(res);
        } else {
          setResult(null);
        }
      } else {
        setAgeHours(null);
        setResult(null);
      }
    } else {
      setAgeHours(null);
      setResult(null);
    }
  }, [birthDate, birthTime, currentDate, currentTime, tsb, gaWeeks, gaDays, riskFactors, guidelineVersion]);

  const handleReset = () => {
    setBirthDate('');
    setBirthTime('');
    setGaWeeks('39');
    setGaDays('0');
    setCurrentDate(new Date().toISOString().split('T')[0]);
    setCurrentTime(new Date().toTimeString().slice(0, 5));
    setTsb('');
    setRiskFactors(false);
    setAgeHours(null);
    setResult(null);
  };

  const generateSummaryText = () => {
    if (!result || ageHours === null) return "Incomplete Data";

    const dobFormatted = birthDate.replace(/-/g, '/');
    const photoLevel = parseFloat(tsb) >= (result.phototherapyThreshold || 999) ? 'ABOVE' : 'BELOW';
    const dvetLevel = parseFloat(tsb) >= (result.exchangeThreshold || 999) ? 'ABOVE' : 'BELOW';

    return `DOB: ${dobFormatted}
TOB: ${birthTime}
AOG: ${gaWeeks} weeks ${gaDays} days
HOL: ${ageHours}
${result.neonatalRiskLevel} Risk Neonate

TCB: ${tsb} mg/dL
PHOTOLEVEL: ${photoLevel} (${result.phototherapyThreshold})
DVET level: ${dvetLevel} (${result.exchangeThreshold})
Bhutani Risk Zone: ${result.riskZone} Risk Zone`;
  };

  const handleCopy = () => {
    const text = generateSummaryText();
    if (text !== "Incomplete Data") {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const getRiskColor = (zone: string) => {
    switch (zone) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Low-Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High-Intermediate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Input Section (Top) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Header + Patient Details */}
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
                  <div>
                    <h1 className="font-bold text-2xl text-amber-900 leading-none">BiliCalc</h1>
                    <p className="text-sm text-amber-700/60 font-medium mt-1">Newborn Jaundice Assessment</p>
                  </div>
                </div>
                
                {/* Guideline Switch */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 relative">
                  {['2004', '2022'].map((version) => (
                    <button
                      key={version}
                      onClick={() => setGuidelineVersion(version as '2004' | '2022')}
                      className={`relative z-10 px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-baseline gap-1 ${
                        guidelineVersion === version 
                          ? 'text-amber-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {guidelineVersion === version && (
                        <motion.div
                          layoutId="guideline-pill"
                          className="absolute inset-0 bg-white shadow-sm rounded-md -z-10"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      AAP <span className="text-lg leading-none">{version}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  Patient Details
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Birth Date</label>
                    <input
                      type="date"
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Time</label>
                    <input
                      type="time"
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Gestational Age</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="39"
                        value={gaWeeks}
                        onChange={(e) => setGaWeeks(e.target.value)}
                      />
                      <span className="absolute right-3 top-2 text-xs text-gray-400">wks</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="0"
                        max="6"
                        min="0"
                        value={gaDays}
                        onChange={(e) => setGaDays(e.target.value)}
                      />
                      <span className="absolute right-3 top-2 text-xs text-gray-400">days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Assessment + Reset */}
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Assessment
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Current Date</label>
                  <input
                    type="date"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Time</label>
                  <input
                    type="time"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">TCB / TSB (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="e.g. 8.5"
                  value={tsb}
                  onChange={(e) => setTsb(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <input
                  type="checkbox"
                  id="riskFactors"
                  className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                  checked={riskFactors}
                  onChange={(e) => setRiskFactors(e.target.checked)}
                />
                <label htmlFor="riskFactors" className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold block mb-0.5">Neurotoxicity Risk Factors</span>
                  Isoimmune hemolytic disease, G6PD deficiency, asphyxia, sepsis, acidosis, albumin &lt; 3.0
                </label>
              </div>

              <div className="flex-1"></div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wide transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Output Box */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-amber-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Check className="w-5 h-5 text-white" />
              <span className="font-bold">Generated Output</span>
            </div>
            <button 
              onClick={handleCopy} 
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors border border-amber-600"
            >
              <Copy className="w-3 h-3" />
              Copy Text
            </button>
          </div>

          {/* Content */}
          <div className="p-6 bg-slate-50">
            <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[100px] text-sm font-mono text-gray-600 whitespace-pre-wrap shadow-sm">
              {generateSummaryText()}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">Risk Stratification</div>
              {result ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${getRiskColor(result.riskZone)}`}>
                  {result.riskZone}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">
                  Pending Input
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Calculated HOL</div>
              <div className="text-sm font-bold text-gray-900">
                {ageHours !== null ? `${ageHours} hours` : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {result && ageHours !== null && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Risk Visualization</h3>
              
              {/* Visualization Mode Switch */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 relative">
                {['interactive', 'static'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setVisualizationMode(mode as 'interactive' | 'static')}
                    className={`relative z-10 px-3 py-1.5 text-xs font-bold rounded-md transition-colors capitalize ${
                      visualizationMode === mode 
                        ? 'text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {visualizationMode === mode && (
                      <motion.div
                        layoutId="viz-pill"
                        className="absolute inset-0 bg-white shadow-sm rounded-md -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    {mode} Nomogram
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px]">
              {visualizationMode === 'interactive' ? (
                <BiliChart ageHours={ageHours} tsb={parseFloat(tsb)} result={result} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="text-center p-6">
                    {/* Placeholder for Static Image - User to replace src */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">Static Nomogram Image</p>
                      <p className="text-xs text-gray-400">Replace this placeholder with your image asset</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
