import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, ShieldAlert, Crown, User, Check, X, Trash2, KeyRound, Sparkles } from 'lucide-react';

export function UserRoleManagerModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('manager');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          return;
        }
      }
    } catch {}

    try {
      const stored = JSON.parse(localStorage.getItem('glitch_users_db') || '[]');
      setUsers(stored);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (isOpen) loadUsers();
  }, [isOpen]);

  const updateUserRole = async (userId, newRoleVal) => {
    try {
      await fetch('/api/auth/update_role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: parseInt(userId, 10),
          new_role: newRoleVal,
          owner_passcode: 'GMX-OWNER-2026',
        }),
      });
    } catch {}

    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRoleVal } : u));
    setUsers(updated);
    localStorage.setItem('glitch_users_db', JSON.stringify(updated));
    setFeedbackMsg(`User role updated to '${newRoleVal}'!`);
    setTimeout(() => setFeedbackMsg(''), 3000);
    window.dispatchEvent(new Event('gmx_roles_updated'));
  };

  const deleteUser = (userId) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    localStorage.setItem('glitch_users_db', JSON.stringify(updated));
    setFeedbackMsg('User removed successfully.');
    setTimeout(() => setFeedbackMsg(''), 3000);
    window.dispatchEvent(new Event('gmx_roles_updated'));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    const userEmail = newEmail.trim() || `${newUsername.toLowerCase().replace(/\s+/g, '')}@glitchmatrix.io`;

    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          email: userEmail,
          password: 'user123456',
          owner_passcode: newRole === 'owner' ? 'GMX-OWNER-2026' : undefined,
        }),
      });
    } catch {}

    const newUser = {
      id: Date.now().toString(),
      username: newUsername.trim(),
      email: userEmail,
      role: newRole,
      createdAt: 'Just now',
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem('glitch_users_db', JSON.stringify(updated));
    setNewUsername('');
    setNewEmail('');
    setFeedbackMsg(`New user '${newUser.username}' (${newRole}) added successfully!`);
    setTimeout(() => setFeedbackMsg(''), 3000);
    window.dispatchEvent(new Event('gmx_roles_updated'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono text-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-emerald-500/40 p-6 shadow-[0_0_50px_rgba(0,255,157,0.2)] text-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(0,255,157,0.3)]">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>GMX Role & Access Control Center</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  OWNER ONLY
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Manage registered user accounts, permissions, and clearance levels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Create New User & Assign Role:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Username..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-emerald-400 focus:outline-none"
              required
            />
            <input
              type="email"
              placeholder="Email / Gmail..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-emerald-400 focus:outline-none"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 text-xs focus:border-emerald-400 focus:outline-none"
            >
              <option value="user">User (Standard Access)</option>
              <option value="manager">Manager (Elevated Access)</option>
              <option value="owner">Owner (Full Clearance)</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(0,255,157,0.4)]"
            >
              + Add User
            </button>
          </div>
        </form>

        {/* Registered Users Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Users ({users.length}):</span>
            <span className="text-emerald-400 font-bold">Owner • Manager • User</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {users.map((u) => {
              const isOwner = u.role === 'owner';
              const isManager = u.role === 'manager';
              const isUser = u.role === 'user';

              return (
                <div
                  key={u.id}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isOwner
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isManager
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{u.username}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                          isOwner
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : isManager
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{u.email}</span>
                    </div>
                  </div>

                  {/* Role Switcher Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => updateUserRole(u.id, 'manager')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isManager
                          ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                          : 'bg-slate-800 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700'
                      }`}
                    >
                      Make Manager
                    </button>
                    <button
                      onClick={() => updateUserRole(u.id, 'user')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isUser
                          ? 'bg-purple-500 text-white font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-slate-800 text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 border border-slate-700'
                      }`}
                    >
                      Set User
                    </button>
                    <button
                      onClick={() => updateUserRole(u.id, 'owner')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isOwner
                          ? 'bg-amber-400 text-slate-950 font-extrabold shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                          : 'bg-slate-800 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700'
                      }`}
                    >
                      Make Owner
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all ml-1"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roles explanation footer */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-sans text-slate-400 space-y-1">
          <p><strong className="text-amber-300 font-mono">👑 OWNER:</strong> Full administrative clearance. Can control the bot, edit .env, run Web Terminal commands, and assign roles.</p>
          <p><strong className="text-cyan-300 font-mono">⚡ MANAGER:</strong> Access to dashboard, telemetry analytics, showcase media, and command references.</p>
          <p><strong className="text-purple-300 font-mono">👤 USER:</strong> Standard member view (3D dashboard showcase and invite link). Bot Controller and sensitive configuration remain strictly locked.</p>
        </div>
      </motion.div>
    </div>
  );
}

export default UserRoleManagerModal;
