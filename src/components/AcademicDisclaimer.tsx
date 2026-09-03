import React from 'react';
import { GraduationCap, ShieldAlert } from 'lucide-react';

export const AcademicDisclaimer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#CC9E33]/20 bg-[#0B0B0F]/90 backdrop-blur-md py-6 px-4 sm:px-8 mt-16 text-center text-xs text-[#CC9E33]/70 font-mono relative z-10">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 text-[#E7C226]">
          <GraduationCap className="w-4 h-4" />
          <span className="font-semibold uppercase tracking-wider">
            Academic Research Prototype — Civic Technology
          </span>
        </div>
        <p className="text-neutral-400 text-[11px] leading-relaxed">
          HIVE is developed as an academic, open-source societal inquiry prototype evaluating digital feedback mechanisms in local municipal governance. This system is a simulated community tool and is not operated by or affiliated with an official state municipal agency.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] text-[#CC9E33]/50 pt-1">
          <span>Local Governance Research Initiative</span>
          <span>•</span>
          <span>Semester 3 Field-Study Framework</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
};
