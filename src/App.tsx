/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SceneType, SuggestionStatus } from './types';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { AcademicDisclaimer } from './components/AcademicDisclaimer';
import { SceneCanvas } from './three/SceneCanvas';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';

// Public & Welcome
import { WelcomeAbout } from './pages/WelcomeAbout';

// Citizen Auth Pages
import { CitizenLogin } from './pages/CitizenLogin';
import { CitizenRegister } from './pages/CitizenRegister';
import { CitizenForgotPassword } from './pages/CitizenForgotPassword';

// Citizen Application Flow
import { CitizenAppFeed } from './pages/CitizenAppFeed';
import { SubmitSuggestion } from './pages/SubmitSuggestion';
import { SubmissionSuccess } from './pages/SubmissionSuccess';
import { TrackSuggestion } from './pages/TrackSuggestion';
import { MySuggestions } from './pages/MySuggestions';
import { CitizenSuggestionDetails } from './pages/CitizenSuggestionDetails';

// Municipal Admin Area
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminSuggestions } from './pages/AdminSuggestions';
import { SuggestionDetails } from './pages/SuggestionDetails';

const VIDEO_BG_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260717_120352_eb988725-1351-43b3-8095-16e4a1005e3d.mp4';

export default function App() {
  const location = useLocation();
  const [currentTrackStatus, setCurrentTrackStatus] = useState<SuggestionStatus>('under_review');

  // Determine current 3D scene from URL pathname
  const getSceneType = (path: string): SceneType => {
    if (path === '/') return 'home';
    if (path === '/app/submit' || path === '/submit') return 'submit';
    if (path.startsWith('/app/submitted') || path.startsWith('/submitted')) return 'success';
    if (path.startsWith('/app/track') || path.startsWith('/track')) return 'track';
    if (path === '/admin/login' || path.startsWith('/auth')) return 'admin';
    if (path === '/admin') return 'admin';
    if (path === '/admin/suggestions' || path === '/app/suggestions') return 'suggestions';
    if (path.startsWith('/admin/suggestions/') || path.startsWith('/app/suggestions/')) return 'workspace';
    if (path.startsWith('/app')) return 'home';
    return 'home';
  };

  const sceneType = getSceneType(location.pathname);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-[#0B0B0F] text-white selection:bg-[#E7C226] selection:text-[#0B0B0F] font-helvetica overflow-x-hidden flex flex-col justify-between">
      {/* 1. Subtle Background Atmospheric Video Layer */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="video-bg absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-50"
          src={VIDEO_BG_URL}
        />
      </div>

      {/* 2. Reusable High-Performance 3D Scene System */}
      <SceneCanvas sceneType={sceneType} currentStatus={currentTrackStatus} />

      {/* 3. Custom Precision Cursor */}
      <CustomCursor />

      {/* 4. Global Fixed Navbar */}
      <Navbar />

      {/* 5. Main Route View */}
      <main id="active-page-content" className="relative z-10 flex-1">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<WelcomeAbout />} />

          {/* AUTH (If already authenticated, redirects to /app) */}
          <Route
            path="/auth/login"
            element={
              <PublicOnlyRoute>
                <CitizenLogin />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth/register"
            element={
              <PublicOnlyRoute>
                <CitizenRegister />
              </PublicOnlyRoute>
            }
          />
          <Route path="/auth/forgot-password" element={<CitizenForgotPassword />} />

          {/* CITIZEN APPLICATION */}
          <Route path="/app" element={<CitizenAppFeed />} />
          <Route path="/app/submit" element={<SubmitSuggestion />} />
          <Route path="/app/submitted" element={<SubmissionSuccess />} />
          <Route
            path="/app/track"
            element={<TrackSuggestion onStatusChange={setCurrentTrackStatus} />}
          />
          <Route
            path="/app/suggestions"
            element={
              <ProtectedRoute>
                <MySuggestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/suggestions/:id"
            element={
              <ProtectedRoute>
                <CitizenSuggestionDetails />
              </ProtectedRoute>
            }
          />

          {/* ADMIN PORTAL */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suggestions"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSuggestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suggestions/:id"
            element={
              <ProtectedRoute requireAdmin>
                <SuggestionDetails />
              </ProtectedRoute>
            }
          />

          {/* COMPATIBILITY ALIASES */}
          <Route path="/submit" element={<Navigate to="/app/submit" replace />} />
          <Route path="/submitted" element={<Navigate to="/app/submitted" replace />} />
          <Route path="/track" element={<Navigate to="/app/track" replace />} />

          {/* 404 CATCH-ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 6. Academic Research Prototype Disclaimer */}
      <AcademicDisclaimer />
    </div>
  );
}
