import React from 'react';
import { SuggestionStatus, SuggestionStatusHistory } from '../types';
import { Check, Clock, AlertTriangle, X } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: SuggestionStatus;
  history?: SuggestionStatusHistory[];
}

const ORDERED_STEPS: { key: SuggestionStatus; label: string; desc: string }[] = [
  { key: 'submitted', label: 'Submitted', desc: 'Received & registered into HIVE database' },
  { key: 'under_review', label: 'Under Review', desc: 'Assigned to municipal engineers for evaluation' },
  { key: 'accepted', label: 'Accepted', desc: 'Approved for civic intervention & budget staging' },
  { key: 'planned', label: 'Planned', desc: 'Scheduled into public works calendar & contractor queue' },
  { key: 'implemented', label: 'Implemented', desc: 'Resolution executed and verified on site' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  history = [],
}) => {
  const isRejected = currentStatus === 'rejected';
  const currentIndex = ORDERED_STEPS.findIndex((s) => s.key === currentStatus);

  const getHistoryForStatus = (statusKey: SuggestionStatus) => {
    return history.find((h) => h.new_status === statusKey);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Spatial Linear Stepper */}
      <div className="relative">
        {/* Step Rail Track */}
        <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-white/10 z-0">
          <div
            className="h-full bg-gradient-to-r from-[#10B981] via-[#E7C226] to-[#E7C226] transition-all duration-700"
            style={{
              width: isRejected
                ? '25%'
                : `${Math.max(0, Math.min(100, (currentIndex / (ORDERED_STEPS.length - 1)) * 100))}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          {ORDERED_STEPS.map((step, idx) => {
            const isPassed = !isRejected && currentIndex > idx;
            const isCurrent = !isRejected && currentIndex === idx;
            const stepHistory = getHistoryForStatus(step.key);

            return (
              <div
                key={step.key}
                className={`flex md:flex-col items-center md:items-center text-left md:text-center gap-3 md:gap-2 p-2 rounded-lg transition-all ${
                  isCurrent ? 'bg-[#E7C226]/10 border border-[#E7C226]/40 shadow-[0_0_15px_rgba(231,194,38,0.2)]' : ''
                }`}
              >
                {/* Step Node Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-[#E7C226] text-black font-bold shadow-[0_0_20px_rgba(231,194,38,0.6)] animate-pulse'
                      : isPassed
                      ? 'bg-[#10B981] text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-white/10 text-neutral-400 border border-white/20'
                  }`}
                >
                  {isPassed ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="text-xs font-mono font-black">{idx + 1}</span>
                  ) : (
                    <span className="text-xs font-mono">{idx + 1}</span>
                  )}
                </div>

                {/* Step Info */}
                <div className="space-y-0.5 flex-1 md:flex-initial">
                  <div
                    className={`text-xs font-mono uppercase font-bold tracking-wider ${
                      isCurrent
                        ? 'text-[#E7C226]'
                        : isPassed
                        ? 'text-[#10B981]'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] text-neutral-400 hidden sm:block">
                    {step.desc}
                  </div>
                  {stepHistory && (
                    <div className="text-[10px] font-mono text-[#CC9E33] pt-0.5">
                      {new Date(stepHistory.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Alternate Terminal State Banner if REJECTED */}
      {isRejected && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 flex items-start gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400">
            <X className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-red-300 font-mono">
              Status: Suggestion Rejected
            </div>
            <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
              This proposal was assessed by municipal coordinators and could not be progressed under current administrative guidelines or statutory regulations.
            </p>
          </div>
        </div>
      )}

      {/* 3. Detailed Audit History Log */}
      {history.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#CC9E33] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Administrative Timeline Log</span>
          </h4>

          <div className="space-y-2">
            {history.map((hist) => (
              <div
                key={hist.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-semibold text-white uppercase font-mono mr-2">
                    [{hist.new_status.replace('_', ' ')}]
                  </span>
                  <span className="text-neutral-300">{hist.note}</span>
                  {hist.changed_by && (
                    <span className="text-neutral-400 block sm:inline sm:ml-2 text-[11px]">
                      — by {hist.changed_by}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#CC9E33]/70 flex-shrink-0">
                  {new Date(hist.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
