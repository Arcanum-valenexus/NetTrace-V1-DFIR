import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Globe, 
  Bell, 
  Eye, 
  ShieldCheck, 
  Trash2,
  RotateCcw,
  Check, 
  CheckCircle2, 
  AlertTriangle,
  LayoutTemplate,
  FileSpreadsheet,
  Clock,
  Save,
  Database,
  Code2,
  Info,
  X,
  Sparkles,
  Zap,
  CheckSquare,
  Square,
  FolderSync
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { 
  PlatformPreferences, 
  NotificationTypeKey, 
  ActiveTab 
} from '../../types';

export const SettingsPage: React.FC = () => {
  const { 
    platformPreferences, 
    updatePlatformPreferences, 
    resetPlatformPreferences, 
    clearTemporaryCache,
    showToast 
  } = useInvestigation();

  // Local state initialized from context
  const [localPrefs, setLocalPrefs] = useState<PlatformPreferences>(platformPreferences);
  const [savedMsg, setSavedMsg] = useState<string>('');
  const [isCacheModalOpen, setIsCacheModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isJsonPreviewOpen, setIsJsonPreviewOpen] = useState<boolean>(false);

  // Sync context changes to localPrefs if platformPreferences changes externally
  React.useEffect(() => {
    setLocalPrefs(platformPreferences);
  }, [platformPreferences]);

  const handleUpdate = (fields: Partial<PlatformPreferences>) => {
    const updated = { ...localPrefs, ...fields };
    setLocalPrefs(updated);
    
    // Auto-save immediately if autoSaveEnabled is true
    if (updated.autoSaveEnabled) {
      updatePlatformPreferences(fields);
      setSavedMsg('Preferences auto-saved');
      setTimeout(() => setSavedMsg(''), 2500);
    }
  };

  const handleNotificationToggle = (
    key: NotificationTypeKey, 
    channel: 'inApp' | 'email'
  ) => {
    const currentChannel = localPrefs.notificationPreferences[key] || { inApp: true, email: true };
    const updatedNotificationMap = {
      ...localPrefs.notificationPreferences,
      [key]: {
        ...currentChannel,
        [channel]: !currentChannel[channel]
      }
    };

    handleUpdate({ notificationPreferences: updatedNotificationMap });
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updatePlatformPreferences(localPrefs);
    setSavedMsg('Platform preferences updated successfully');
    showToast('Platform preferences saved successfully', 'success');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleConfirmClearCache = () => {
    clearTemporaryCache();
    setIsCacheModalOpen(false);
  };

  const handleConfirmResetDefaults = () => {
    resetPlatformPreferences();
    setIsResetModalOpen(false);
  };

  const notificationCategories: { key: NotificationTypeKey; label: string; desc: string }[] = [
    { 
      key: 'criticalThreatAlerts', 
      label: 'Critical Threat Alerts', 
      desc: 'High & Critical severity ransomware or exfiltration incidents detected' 
    },
    { 
      key: 'pcapAnalysisCompleted', 
      label: 'PCAP Analysis Completed', 
      desc: 'Packet dissection & protocol extraction finished for uploaded captures' 
    },
    { 
      key: 'evidenceVerificationCompleted', 
      label: 'Evidence Verification Completed', 
      desc: 'SHA256 cryptographic hash match & chain of custody validation' 
    },
    { 
      key: 'iocDetectionCompleted', 
      label: 'IOC Detection Completed', 
      desc: 'Threat intelligence feed correlation & high confidence indicator extraction' 
    },
    { 
      key: 'forensicReportGenerated', 
      label: 'Forensic Report Generated', 
      desc: 'Official DFIR executive and technical reports compiled' 
    },
    { 
      key: 'investigationAssigned', 
      label: 'Investigation Assigned', 
      desc: 'Case dispatch, analyst assignment, or severity escalation notifications' 
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans selection:bg-cyan-500 selection:text-black pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 font-mono-code flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <span>NetTrace Platform Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Application configuration center. Control UI themes, localization, notifications, accessibility, and platform behaviors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsJsonPreviewOpen(!isJsonPreviewOpen)}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl font-mono-code text-xs text-slate-300 flex items-center space-x-1.5 transition-all"
            title="Preview FastAPI & Supabase JSON Schema"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Backend Schema</span>
          </button>

          <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono-code text-xs flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">Mode:</span>
            <strong className="text-cyan-300 font-bold">App Config Center</strong>
          </div>
        </div>
      </div>

      {/* Save Toast Banner */}
      {savedMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-mono-code flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">Local Storage Synced</span>
        </div>
      )}

      {/* Optional FastAPI / Supabase JSON Blueprint Drawer */}
      {isJsonPreviewOpen && (
        <div className="bg-slate-950 border border-cyan-900/60 rounded-2xl p-4 font-mono-code text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Database className="w-4 h-4" />
              <span className="font-bold">FastAPI & Supabase Preferences Payload Schema</span>
            </div>
            <button 
              type="button" 
              onClick={() => setIsJsonPreviewOpen(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{JSON.stringify({
  user_id: "usr-alex-01",
  theme: localPrefs.theme,
  language: localPrefs.language,
  timezone: localPrefs.timezone,
  beginner_mode: localPrefs.beginnerMode,
  notification_preferences: localPrefs.notificationPreferences,
  accessibility_preferences: localPrefs.accessibilityPreferences,
  privacy_preferences: localPrefs.privacyPreferences,
  default_landing_page: localPrefs.defaultLandingPage,
  default_export_format: localPrefs.defaultExportFormat,
  time_format: localPrefs.timeFormat,
  auto_save_enabled: localPrefs.autoSaveEnabled,
  updated_at: new Date().toISOString()
}, null, 2)}
          </pre>
          <p className="text-[11px] text-slate-500 italic">
            This structured payload maps directly to the Supabase <code className="text-cyan-400">user_settings</code> table and FastAPI backend API endpoints.
          </p>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 1: THEME & APPEARANCE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>1. Theme & Appearance</span>
          </h2>

          <div className="space-y-4 text-xs font-mono-code">
            <div>
              <label className="block text-slate-400 mb-2">Color Theme Selection</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdate({ theme: 'cyber-dark' })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    localPrefs.theme === 'cyber-dark' 
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md ring-1 ring-cyan-500/50' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Dark Theme
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate({ theme: 'light' })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    localPrefs.theme === 'light' 
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md ring-1 ring-cyan-500/50' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Light Theme
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate({ theme: 'high-contrast' })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    localPrefs.theme === 'high-contrast' 
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md ring-1 ring-cyan-500/50' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  High Contrast
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate({ theme: 'system' })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    localPrefs.theme === 'system' 
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md ring-1 ring-cyan-500/50' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  System Theme
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <div>
                <p className="text-slate-200 font-bold">Beginner Guidance Banner</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Display onboarding tips & workflow guidance on main dashboard
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdate({ beginnerMode: !localPrefs.beginnerMode })}
                className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all shrink-0 ${
                  localPrefs.beginnerMode 
                    ? 'bg-cyan-950 border-cyan-700 text-cyan-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {localPrefs.beginnerMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: LANGUAGE & LOCALIZATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>2. Language & Localization</span>
          </h2>

          <div className="space-y-4 text-xs font-mono-code">
            <div>
              <label className="block text-slate-400 mb-1.5">Platform Display Language</label>
              <select
                value={localPrefs.language}
                onChange={(e) => handleUpdate({ language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish (Español)">Spanish (Español)</option>
                <option value="German (Deutsch)">German (Deutsch)</option>
                <option value="French (Français)">French (Français)</option>
                <option value="Japanese (日本語)">Japanese (日本語)</option>
                <option value="Chinese (中文)">Chinese (中文)</option>
                <option value="Portuguese (Português)">Portuguese (Português)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">System Timezone</label>
              <select
                value={localPrefs.timezone}
                onChange={(e) => handleUpdate({ timezone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="UTC (ISO-8601 Default)">UTC (ISO-8601 Forensic Standard) [Default]</option>
                <option value="America/New_York (EST/EDT)">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles (PST/PDT)">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London (GMT/BST)">Europe/London (GMT/BST)</option>
                <option value="Europe/Frankfurt (CET/CEST)">Europe/Frankfurt (CET/CEST)</option>
                <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
                <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-[11px] leading-relaxed">
              <span className="text-cyan-400 font-bold">UTC ISO-8601 Standard:</span> All forensic logs, chain-of-custody timestamps, and export reports use UTC as the primary immutable baseline.
            </div>
          </div>
        </div>

        {/* SECTION 3: NOTIFICATIONS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>3. Notifications Preferences</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono-code">
              Configure delivery channels for event alerts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-code">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Event Type & Description</th>
                  <th className="py-2.5 px-3 text-center w-32">In-App Alert</th>
                  <th className="py-2.5 px-3 text-center w-32">Email Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {notificationCategories.map(({ key, label, desc }) => {
                  const prefs = localPrefs.notificationPreferences[key] || { inApp: true, email: true };
                  return (
                    <tr key={key} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-200">{label}</p>
                        <p className="text-[11px] text-slate-400">{desc}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleNotificationToggle(key, 'inApp')}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all inline-flex items-center space-x-1 ${
                            prefs.inApp 
                              ? 'bg-cyan-950 border-cyan-800 text-cyan-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {prefs.inApp ? <Check className="w-3 h-3 text-cyan-400" /> : null}
                          <span>{prefs.inApp ? 'Enabled' : 'Off'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleNotificationToggle(key, 'email')}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all inline-flex items-center space-x-1 ${
                            prefs.email 
                              ? 'bg-emerald-950 border-emerald-800 text-emerald-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {prefs.email ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                          <span>{prefs.email ? 'Enabled' : 'Off'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: ACCESSIBILITY */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>4. Accessibility</span>
          </h2>

          <div className="space-y-3 text-xs font-mono-code">
            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
              <div>
                <p className="font-bold text-slate-200">Reduce Motion & Animations</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Disables keyframe animations, glowing effects, and smooth transitions
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.accessibilityPreferences.reduceMotion}
                onChange={(e) => handleUpdate({
                  accessibilityPreferences: {
                    ...localPrefs.accessibilityPreferences,
                    reduceMotion: e.target.checked
                  }
                })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
              <div>
                <p className="font-bold text-slate-200">Enhanced High Contrast Mode</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Increases text contrast, border lines, and keyboard focus outlines
                </p>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.accessibilityPreferences.highContrastMode}
                onChange={(e) => handleUpdate({
                  accessibilityPreferences: {
                    ...localPrefs.accessibilityPreferences,
                    highContrastMode: e.target.checked
                  }
                })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SECTION 5: PRIVACY & DATA HANDLING */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>5. Privacy & Data Handling</span>
          </h2>

          <div className="space-y-3 text-xs font-mono-code">
            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <div>
                <p className="font-bold text-slate-200">Zero Local PCAP Telemetry Collection</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Prevents external analytics or telemetry gathering on packet captures
                </p>
              </div>
              <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[10px] font-bold">
                ENFORCED
              </span>
            </label>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-[11px] leading-relaxed">
              <span className="text-emerald-400 font-bold">Data Privacy Guarantee:</span> NetTrace never uploads raw PCAP data without explicit user action. All packet analysis remains strictly local in-browser or within your isolated sandbox backend environment.
            </div>
          </div>
        </div>

        {/* SECTION 7: DEFAULT PREFERENCES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
          <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <LayoutTemplate className="w-4 h-4 text-cyan-400" />
            <span>7. Default Application Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono-code">
            <div>
              <label className="block text-slate-400 mb-1.5">Default Landing Page</label>
              <select
                value={localPrefs.defaultLandingPage}
                onChange={(e) => handleUpdate({ defaultLandingPage: e.target.value as ActiveTab })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="dashboard">Overview Dashboard</option>
                <option value="incidents">Investigation Cases</option>
                <option value="pcap">Packet Analyzer</option>
                <option value="evidence">Evidence Vault</option>
                <option value="reports">Forensic Reports</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">Report Export Format</label>
              <select
                value={localPrefs.defaultExportFormat}
                onChange={(e) => handleUpdate({ defaultExportFormat: e.target.value as 'PDF' | 'Markdown' | 'JSON' })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="PDF">PDF (Executive / Court Ready)</option>
                <option value="Markdown">Markdown (.md Technical)</option>
                <option value="JSON">JSON (Machine Readable API)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">Time Format Display</label>
              <select
                value={localPrefs.timeFormat}
                onChange={(e) => handleUpdate({ timeFormat: e.target.value as '12 Hour' | '24 Hour' })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="24 Hour">24 Hour (14:30:15 UTC)</option>
                <option value="12 Hour">12 Hour (02:30:15 PM UTC)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">Auto-Save Preferences</label>
              <button
                type="button"
                onClick={() => handleUpdate({ autoSaveEnabled: !localPrefs.autoSaveEnabled })}
                className={`w-full p-2.5 rounded-xl border text-center font-bold transition-all ${
                  localPrefs.autoSaveEnabled 
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {localPrefs.autoSaveEnabled ? 'Auto-Save Enabled' : 'Manual Save Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 6: CACHE MANAGEMENT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Trash2 className="w-4 h-4 text-amber-400" />
            <span>6. Cache & Temporary Data</span>
          </h2>

          <div className="space-y-3 text-xs font-mono-code">
            <div>
              <p className="font-bold text-slate-200">Clear Temporary Analysis Cache</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Removes temporary packet analysis cache and browser memory. Does <strong className="text-emerald-400 font-bold">NOT</strong> delete Investigation Cases, Evidence Vault items, Reports, or Database Records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCacheModalOpen(true)}
              className="px-4 py-2 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 rounded-xl font-bold flex items-center space-x-2 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Clear Analysis Cache</span>
            </button>
          </div>
        </div>

        {/* SECTION 8: RESET SETTINGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold font-mono-code text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>8. Restore Platform Defaults</span>
          </h2>

          <div className="space-y-3 text-xs font-mono-code">
            <div>
              <p className="font-bold text-slate-200">Reset Application Preferences</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Resets application preferences to platform factory defaults. Does <strong className="text-emerald-400 font-bold">NOT</strong> remove Cases, Evidence, Reports, or User Profile data.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-bold flex items-center space-x-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restore Defaults</span>
            </button>
          </div>
        </div>

      </div>

      {/* Global Save Preferences Action Bar */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 font-mono-code hidden sm:block">
          NetTrace V1.0 • Platform Configuration Engine
        </p>

        <button
          type="button"
          onClick={() => handleSaveAll()}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono-code font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all ml-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Cache Clear Confirmation Modal */}
      {isCacheModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono-code animate-fadeIn">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Clear Temporary Analysis Cache?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will purge in-memory packet parsing buffers and session cache. Your active investigation cases, evidence vault items, and reports will remain completely safe.
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-400">
              ✓ Investigation Cases: Safe<br />
              ✓ Evidence Vault Records: Safe<br />
              ✓ Forensic Reports: Safe
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCacheModalOpen(false)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearCache}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold"
              >
                Confirm Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Defaults Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono-code animate-fadeIn">
            <div className="flex items-center space-x-3 text-cyan-400">
              <RotateCcw className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Restore Platform Defaults?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset all themes, language choices, notification rules, accessibility modes, and landing defaults back to factory settings?
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
              Note: This will not alter your user account profile, login credentials, or investigation data.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetDefaults}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-extrabold"
              >
                Confirm Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
