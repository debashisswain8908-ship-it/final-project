import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types/brsr';
import { INITIAL_USERS } from '../data/initialData';
import { X, Shield, KeyRound, Check, Lock, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div 
        className="bg-white rounded-xl max-w-xl w-full border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Role-Based Authentication & Permissions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only authorized personnel can edit corporate ESG disclosures or certify analytical adjustments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {INITIAL_USERS.map((user) => {
            const isSelected = currentUser.id === user.id;

            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-800 shrink-0">
                      {user.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {user.name}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-medium text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded">
                            Active Session
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {user.title} · {user.organization}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    {user.role.toUpperCase()}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.digitalKeyId}</span>
                    </div>
                    {user.password && (
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        Pass: {user.password} | PIN: {user.securityPin}
                      </span>
                    )}
                  </div>
                  <span>
                    {user.role === 'reporter' && 'Permission: Edit Raw ESG Disclosures'}
                    {user.role === 'analyst' && 'Permission: Recalculate & Adjust Analytics'}
                    {user.role === 'auditor' && 'Permission: Sign & Lock Final Filing'}
                    {user.role === 'public' && 'Permission: Read-Only (Cannot Edit)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Security Protocol: FIPS 180-4 SHA-256 Cryptographic Audit Seals</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
