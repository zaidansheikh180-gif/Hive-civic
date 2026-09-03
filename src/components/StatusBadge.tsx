import React from 'react';
import { SuggestionStatus } from '../types';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  Sparkles,
  XCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: SuggestionStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getMeta = () => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          color: '#CC9E33',
          bg: 'bg-[#CC9E33]/15',
          border: 'border-[#CC9E33]/40',
          text: 'text-[#CC9E33]',
          icon: Clock,
        };
      case 'under_review':
        return {
          label: 'Under Review',
          color: '#E7C226',
          bg: 'bg-[#E7C226]/15',
          border: 'border-[#E7C226]/50',
          text: 'text-[#E7C226]',
          icon: AlertCircle,
        };
      case 'accepted':
        return {
          label: 'Accepted',
          color: '#38BDF8',
          bg: 'bg-[#38BDF8]/15',
          border: 'border-[#38BDF8]/40',
          text: 'text-[#38BDF8]',
          icon: Sparkles,
        };
      case 'planned':
        return {
          label: 'Planned',
          color: '#818CF8',
          bg: 'bg-[#818CF8]/15',
          border: 'border-[#818CF8]/40',
          text: 'text-[#818CF8]',
          icon: CalendarClock,
        };
      case 'implemented':
        return {
          label: 'Implemented',
          color: '#10B981',
          bg: 'bg-[#10B981]/20',
          border: 'border-[#10B981]/50',
          text: 'text-[#10B981]',
          icon: CheckCircle2,
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: '#EF4444',
          bg: 'bg-[#EF4444]/20',
          border: 'border-[#EF4444]/40',
          text: 'text-[#EF4444]',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: '#CC9E33',
          bg: 'bg-white/10',
          border: 'border-white/20',
          text: 'text-white',
          icon: Clock,
        };
    }
  };

  const meta = getMeta();
  const Icon = meta.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium tracking-wide uppercase rounded-full border ${meta.bg} ${meta.border} ${meta.text} ${sizeClasses}`}
      style={{
        boxShadow: status === 'under_review' || status === 'implemented' ? `0 0 10px ${meta.color}25` : undefined,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{meta.label}</span>
    </span>
  );
};
