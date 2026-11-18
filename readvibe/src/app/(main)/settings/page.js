'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import http from '@/services/http';
import EditProfileModal from '@/components/EditProfileModal';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [email, setEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!user) return <div className="container py-5"><Link href="/login">Sign in to manage your account</Link></div>;
  const reset = (next) => { setAction(next); setCurrentPassword(''); setPassword(''); setConfirmation(''); setEmail(''); setDeleteConfirmation(''); setError(''); };
  const signOut = () => { logout(); router.push('/login'); };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (action === 'password' && password !== confirmation) { setError('Passwords do not match.'); return; }
    if (action === 'delete' && deleteConfirmation !== user.username) { setError('Type your username to confirm account deletion.'); return; }
    setBusy(true); setError('');
    try {
      if (action === 'password') await http.put('/api/auth/password', { currentPassword, password });
      else if (action === 'email') await http.patch('/api/auth/account', { currentPassword, email });
      else await http.delete('/api/auth/account', { data: { currentPassword } });
      signOut();
    } catch (failure) { setError(failure.message); setBusy(false); }
  };
  return <div className="container py-4 pb-5" style={{ maxWidth: '850px' }}>
    <Link href="/profile">← My Profile</Link><h1 className="my-4">Account settings</h1>
    <section className="card p-4 mb-4"><h2 className="h5">Your profile</h2><p>{user.name} · @{user.username}</p><p>{user.email}</p><button className="btn btn-rv-plum align-self-start" onClick={() => setEditing(true)}>Edit profile</button></section>
    <section className="card p-4 mb-4"><h2 className="h5">Account security</h2><div className="d-flex flex-wrap gap-2 mb-4">
      <button disabled={busy} className={`btn ${action === 'password' ? 'btn-rv-plum' : 'btn-outline-secondary'}`} onClick={() => reset('password')}>Change password</button>
      <button disabled={busy} className={`btn ${action === 'email' ? 'btn-rv-plum' : 'btn-outline-secondary'}`} onClick={() => reset('email')}>Change email</button>
      {user.role === 'Member' && <button disabled={busy} className={`btn ${action === 'delete' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => reset('delete')}>Delete account</button>}
    </div>
    <p className="small text-muted">Changing your email or password ends all active sessions. You will need to sign in again.</p>
    {action === 'delete' && <p className="text-danger">This permanently deletes your account, reading history, reviews and wishlist. This action cannot be undone.</p>}
    <form onSubmit={submit}>
      {error && <div role="alert" className="alert alert-danger">{error}</div>}
      <label htmlFor="account-current-password" className="form-label">Current password</label><input id="account-current-password" className="form-control mb-3" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required disabled={busy} />
      {action === 'password' && <><label htmlFor="account-new-password" className="form-label">New password</label><input id="account-new-password" className="form-control mb-3" type="password" autoComplete="new-password" minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={busy} /><label htmlFor="account-confirm-password" className="form-label">Confirm new password</label><input id="account-confirm-password" className="form-control mb-3" type="password" autoComplete="new-password" minLength={12} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required disabled={busy} /></>}
      {action === 'email' && <><label htmlFor="account-email" className="form-label">New email address</label><input id="account-email" className="form-control mb-3" type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} /></>}
      {action === 'delete' && <><label htmlFor="account-delete-confirmation" className="form-label">Type {user.username} to confirm</label><input id="account-delete-confirmation" className="form-control mb-3" autoComplete="off" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} required disabled={busy} /></>}
      <button className={`btn ${action === 'delete' ? 'btn-danger' : 'btn-rv-plum'}`} disabled={busy || (action === 'delete' && deleteConfirmation !== user.username)}>{busy ? 'Saving…' : action === 'delete' ? 'Permanently delete my account' : 'Save account change'}</button>
    </form></section>
    <section className="card p-4 mb-4"><h2 className="h5">Privacy</h2><p>Reading progress and personal notes are private. Use Edit note on your wishlist to choose each book’s visibility, and Edit review to publish or hide a review.</p><Link href="/wishlist">Manage wishlist visibility</Link><Link href="/finished-reads" className="mt-2">Manage reviews</Link></section>
    <button className="btn btn-outline-secondary" onClick={signOut}>Sign out</button>
    {editing && <EditProfileModal isOpen onClose={() => setEditing(false)} />}
  </div>;
}
