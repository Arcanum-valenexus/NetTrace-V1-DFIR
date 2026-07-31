import React, { useState, useRef, useEffect } from 'react';
import { Server, Monitor, Database, Globe, Lock, ChevronDown, Check, ShieldAlert, Zap } from 'lucide-react';
import { ImpactedAsset } from '../../types';

interface ExtendedAsset extends ImpactedAsset {
  typeLabel?: string;
  icon?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
}

interface AssetSelectorProps {
  assets: ImpactedAsset[];
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
  className?: string;
}

const defaultAssets: ExtendedAsset[] = [
  {
    id: 'asset-1',
    hostname: 'DC-01',
    ipAddress: '10.0.1.5',
    os: 'Windows Server 2022',
    status: 'Active',
    assetType: 'Domain Controller',
    owner: 'IT Infra Team',
    typeLabel: 'Domain Controller',
    icon: 'server',
    priority: 'Critical'
  },
  {
    id: 'asset-2',
    hostname: 'WKSTN-09',
    ipAddress: '10.0.10.88',
    os: 'Windows 11 Pro',
    status: 'Active',
    assetType: 'Workstation',
    owner: 'R. Davis (Finance)',
    typeLabel: 'Employee Laptop',
    icon: 'monitor',
    priority: 'Medium'
  },
  {
    id: 'asset-3',
    hostname: 'DB-02',
    ipAddress: '10.0.5.14',
    os: 'Ubuntu Linux 22.04 LTS',
    status: 'Active',
    assetType: 'Database',
    owner: 'Data Ops Team',
    typeLabel: 'Database Server',
    icon: 'database',
    priority: 'Critical'
  },
  {
    id: 'asset-4',
    hostname: 'PROXY-01',
    ipAddress: '10.0.1.1',
    os: 'Debian 12 Linux',
    status: 'Active',
    assetType: 'Server',
    owner: 'SecOps Network Team',
    typeLabel: 'Perimeter Proxy',
    icon: 'globe',
    priority: 'High'
  },
  {
    id: 'asset-5',
    hostname: 'IDP-MAIN',
    ipAddress: '10.0.1.12',
    os: 'Windows Server 2022',
    status: 'Active',
    assetType: 'Server',
    owner: 'IAM Security Team',
    typeLabel: 'Auth Server',
    icon: 'lock',
    priority: 'Critical'
  }
];

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Merge provided assets with default metadata formatting
  const formattedAssets: ExtendedAsset[] = (assets.length > 0 ? assets : defaultAssets).map(a => {
    const match = defaultAssets.find(da => da.hostname === a.hostname || da.id === a.id);
    return {
      ...a,
      typeLabel: match?.typeLabel || (a.hostname.startsWith('DC') ? 'Domain Controller' : a.hostname.startsWith('WKSTN') ? 'Employee Workstation' : a.hostname.startsWith('DB') ? 'Database Server' : 'Enterprise Server'),
      icon: match?.icon || (a.hostname.startsWith('DC') ? 'server' : a.hostname.startsWith('WKSTN') ? 'monitor' : a.hostname.startsWith('DB') ? 'database' : 'server'),
      priority: match?.priority || (a.hostname.startsWith('DC') || a.hostname.startsWith('DB') ? 'Critical' : 'High')
    };
  });

  const selectedAsset = formattedAssets.find(a => a.id === selectedAssetId) || formattedAssets[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAssetIcon = (iconName?: string) => {
    switch (iconName) {
      case 'server': return <Server className="w-4 h-4 text-cyan-400" />;
      case 'monitor': return <Monitor className="w-4 h-4 text-blue-400" />;
      case 'database': return <Database className="w-4 h-4 text-purple-400" />;
      case 'globe': return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'lock': return <Lock className="w-4 h-4 text-amber-400" />;
      default: return <Server className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-950 text-red-400 border-red-800';
      case 'High': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'Medium': return 'bg-blue-950 text-blue-400 border-blue-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="text-[11px] font-mono-code text-slate-400 block mb-1 font-bold">
        Select Target Asset for Host Containment:
      </label>

      {/* Selected Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-500 rounded-xl p-3 flex items-center justify-between text-xs font-mono-code transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
            {getAssetIcon(selectedAsset?.icon)}
          </div>
          <div className="text-left truncate">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100">{selectedAsset?.typeLabel || 'Host Asset'}</span>
              <span className="text-cyan-400 font-bold">{selectedAsset?.hostname}</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span>{selectedAsset?.ipAddress}</span>
              <span>•</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] border font-bold ${getPriorityBadge(selectedAsset?.priority)}`}>
                {selectedAsset?.priority || 'High'}
              </span>
              <span>•</span>
              <span className={selectedAsset?.status === 'Isolated' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {selectedAsset?.status}
              </span>
            </div>
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800/80">
          {formattedAssets.map((asset) => {
            const isSelected = asset.id === selectedAssetId;
            return (
              <div
                key={asset.id}
                onClick={() => {
                  onSelectAsset(asset.id);
                  setIsOpen(false);
                }}
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-xs font-mono-code ${
                  isSelected ? 'bg-cyan-950/80 border-l-4 border-l-cyan-500' : 'hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    {getAssetIcon(asset.icon)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100">{asset.typeLabel}</span>
                      <span className="text-cyan-300 font-bold">{asset.hostname}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{asset.ipAddress}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] border font-bold ${getPriorityBadge(asset.priority)}`}>
                        {asset.priority}
                      </span>
                      <span>•</span>
                      <span className={asset.status === 'Isolated' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {asset.status}
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
