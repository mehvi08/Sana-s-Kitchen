import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../api/profiles.js';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    fullname: '',
    mobile: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setForm({
      fullname: profile?.fullname || '',
      mobile: profile?.mobile || '',
      address: profile?.address || '',
    });
  }, [profile]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      if (!user) throw new Error('Please login first.');
      if (!profile?.$id) throw new Error('Profile not found.');
      await updateProfile(profile.$id, {
        fullname: form.fullname,
        mobile: form.mobile,
        address: form.address,
      });
      await refreshProfile();
      setMsg('Profile updated.');
    } catch (e2) {
      setErr(e2?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-serif font-bold text-brand-maroon mb-6">
          Your Profile
        </h1>

        <form
          onSubmit={handleSave}
          className="bg-white/70 border-2 border-brand-maroon rounded-2xl p-6 space-y-4"
        >
          <Input
            label="Full Name"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            required
          />
          <Input
            label="Mobile"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-brand-maroon mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="flex w-full rounded-md border border-brand-maroon/30 bg-white/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon min-h-[100px]"
            />
          </div>

          {err && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{err}</p>
          )}
          {msg && (
            <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
              {msg}
            </p>
          )}

          <Button type="submit" isLoading={saving} className="w-full">
            Save Changes
          </Button>
        </form>
      </main>
    </div>
  );
}

