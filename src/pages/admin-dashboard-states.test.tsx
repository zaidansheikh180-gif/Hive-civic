// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { authService } from '../services/authService';
import { suggestionService } from '../services/suggestionService';
import { AdminDashboard } from './AdminDashboard';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const admin = { id: 'admin-id', email: 'admin@example.gov', full_name: 'Test Administrator', role: 'admin' as const };
const empty = { total: 0, submitted: 0, under_review: 0, accepted: 0, planned: 0, implemented: 0, rejected: 0, categoryCounts: {}, recentUpdatesCount: 0 };

describe('admin dashboard data states', () => {
  it('does not show loading counts as zero and then explains empty data', async () => {
    vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(admin);
    vi.spyOn(suggestionService, 'getDashboardStats').mockResolvedValue(empty);
    vi.spyOn(suggestionService, 'getSuggestions').mockResolvedValue([]);
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('No proposals to show by category yet.')).toBeTruthy());
    expect(screen.getByText('No proposals to show by status yet.')).toBeTruthy();
    expect(screen.getByText('No recent proposals yet.')).toBeTruthy();
  });
  it('keeps errors distinct from empty data', async () => {
    vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(admin);
    vi.spyOn(suggestionService, 'getDashboardStats').mockRejectedValue(new Error('unavailable'));
    vi.spyOn(suggestionService, 'getSuggestions').mockRejectedValue(new Error('unavailable'));
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Statistics could not be loaded.')).toBeTruthy());
    expect(screen.getByText('Recent proposals could not be loaded.')).toBeTruthy();
    expect(screen.queryByText('No recent proposals yet.')).toBeNull();
  });
});
