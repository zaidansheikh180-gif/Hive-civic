// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authService } from '../services/authService';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ProfilePage } from './ProfilePage';
import { Navbar } from '../components/Navbar';

const admin = { id: 'admin-1', email: 'admin@example.com', full_name: 'Citizen', role: 'admin' as const };
const citizen = { id: 'citizen-1', email: 'citizen@example.com', full_name: 'Citizen', role: 'citizen' as const };

beforeEach(() => {
  vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(admin);
  vi.spyOn(authService, 'onAuthStateChange').mockImplementation(() => () => {});
  vi.spyOn(authService, 'updateDisplayName').mockImplementation(async () => {
    const updated = { ...admin, full_name: 'Morgan Rivera' };
    window.dispatchEvent(new CustomEvent('hive:profile-updated', { detail: updated }));
    return { user: updated };
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const openProfile = (path: string) => render(<MemoryRouter initialEntries={[path]}>
  <Navbar />
  <Routes>
    <Route path="/admin/profile" element={<ProtectedRoute requireAdmin><ProfilePage /></ProtectedRoute>} />
    <Route path="/app/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/admin/login" element={<div>Admin sign-in</div>} />
  </Routes>
</MemoryRouter>);

describe('profile pages', () => {
  it('lets an admin save only a display name, and refreshes the navigation name', async () => {
    openProfile('/admin/profile');
    const input = await screen.findByLabelText('Display name') as HTMLInputElement;
    expect(input.value).toBe('Citizen');
    expect(screen.getByText('admin@example.com')).toBeTruthy();
    expect(screen.getAllByText('admin').length).toBeGreaterThan(0);
    fireEvent.change(input, { target: { value: '  Morgan Rivera  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    await screen.findByText('Name saved.');
    expect(authService.updateDisplayName).toHaveBeenCalledWith('  Morgan Rivera  ');
    expect(input.value).toBe('Morgan Rivera');
    expect(screen.getByTitle('Authenticated as Morgan Rivera (admin)')).toBeTruthy();
    expect(screen.queryByLabelText('Account role')).toBeNull(); // role displayed, never editable
  });

  it('provides the same name editor to citizens without an admin route', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(citizen);
    openProfile('/app/profile');
    expect((await screen.findByLabelText('Display name') as HTMLInputElement).value).toBe('Citizen');
    expect(screen.getByText('citizen@example.com')).toBeTruthy();
    expect(screen.getByText('Back to civic feed')).toBeTruthy();
    expect(screen.queryByText('Admin sign-in')).toBeNull();
  });

  it('keeps citizens out of the admin profile', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(citizen);
    openProfile('/admin/profile');
    await waitFor(() => expect(screen.getByText('Access Restricted')).toBeTruthy());
    expect(screen.queryByLabelText('Display name')).toBeNull();
  });

  it('shows backend failures rather than claiming success', async () => {
    vi.mocked(authService.updateDisplayName).mockResolvedValue({ user: null, error: 'Update not permitted' });
    openProfile('/admin/profile');
    const input = await screen.findByLabelText('Display name');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Update not permitted');
    expect(screen.queryByText('Name saved.')).toBeNull();
  });
});
