import React from 'react';
import { UserAccount } from '../types/brsr';
import { ChevronDown, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  currentTab: 'overview' | 'entry' | 'analyst';
  onSelectTab: (tab: 'overview' | 'entry' | 'analyst') => void;
  currentUser: UserAccount;
  onOpenAuthModal: () => void;
  isFilingLocked: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  isFilingLocked
}) => {
  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'reporter':
        return 'Corporate Reporter (Edit Access)';
      case 'analyst':
        return 'Lead ESG Analyst (Analysis Access)';
      case 'auditor':
        return 'Board Auditor (Sign-off)';
      case 'public':
        return 'Public Viewer (Read-Only)';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
              BR
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              BRSR Corporate ESG
            </span>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              type="button"
              onClick={() => onSelectTab('overview')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
                currentTab === 'overview'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Executive Overview
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('entry')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
                currentTab === 'entry'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              BRSR Data Entry & Rechange
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('analyst')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
                currentTab === 'analyst'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Analyst Review & Recalculation
            </button>
          </nav>

          {/* Zone 3: Authenticated User Controller */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="group flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              title="Click to switch or authenticate user"
            >
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-xs border border-slate-200">
                {currentUser.avatarInitials}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-xs leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {getRoleLabel()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-4 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => onSelectTab('overview')}
            className={`whitespace-nowrap px-2 py-1 ${
              currentTab === 'overview' ? 'text-slate-900 font-semibold' : 'text-slate-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('entry')}
            className={`whitespace-nowrap px-2 py-1 ${
              currentTab === 'entry' ? 'text-slate-900 font-semibold' : 'text-slate-500'
            }`}
          >
            Data Entry
          </button>
          <button
            onClick={() => onSelectTab('analyst')}
            className={`whitespace-nowrap px-2 py-1 ${
              currentTab === 'analyst' ? 'text-slate-900 font-semibold' : 'text-slate-500'
            }`}
          >
            Analyst Review
          </button>
        </div>
      </div>
    </header>
  );
};
