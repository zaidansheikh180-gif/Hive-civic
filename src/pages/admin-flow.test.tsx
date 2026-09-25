// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authService } from '../services/authService';
import { suggestionService } from '../services/suggestionService';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminDashboard } from './AdminDashboard';
import { AdminSuggestions } from './AdminSuggestions';
import { SuggestionDetails } from './SuggestionDetails';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null, XAxis: () => null, YAxis: () => null, Tooltip: () => null, Cell: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, Pie: () => null,
}));
const admin = { id: 'admin-id', email: 'admin@example.gov', full_name: 'Test Administrator', role: 'admin' as const };
const suggestion = {
  id: 'example-id', reference_id: 'DSB-2026-ABC123', category: 'Roads & Footpaths' as const,
  title: 'Crosswalk', description: 'Add markings', location_text: 'Main St', is_anonymous: false,
  status: 'submitted' as const, support_count: 1, admin_notes: '',
};
vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(admin);
vi.spyOn(authService, 'onAuthStateChange').mockImplementation(() => () => {});
vi.spyOn(suggestionService, 'getDashboardStats').mockResolvedValue({ total: 0, submitted: 0, under_review: 0, accepted: 0, planned: 0, implemented: 0, rejected: 0, categoryCounts: {}, recentUpdatesCount: 0 });
vi.spyOn(suggestionService, 'getSuggestions').mockResolvedValue([]);
vi.spyOn(suggestionService, 'getSuggestionById').mockResolvedValue({ suggestion, history: [] });

afterEach(cleanup);

describe('admin routes after a verified admin session', () => {
  it.each([
    ['/admin', 'Administrative Operations Console'],
    ['/admin/suggestions', 'Suggestion Management'],
    ['/admin/suggestions/example-id', 'Crosswalk'],
  ])('keeps %s open rather than redirecting to login', async (path, expected) => {
    render(<MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/admin/login" element={<div>Admin login page</div>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/suggestions" element={<ProtectedRoute requireAdmin><AdminSuggestions /></ProtectedRoute>} />
      <Route path="/admin/suggestions/:id" element={<ProtectedRoute requireAdmin><SuggestionDetails /></ProtectedRoute>} />
    </Routes></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(expected)).toBeTruthy());
    expect(screen.queryByText('Admin login page')).toBeNull();
  });
});
