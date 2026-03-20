import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../appwriteClient';
import { fetchProfileByUserId } from '../api/profiles.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        const session = await account.get();
        if (!isMounted) return;
        setUser(session);
        const p = await fetchProfileByUserId(session.$id);
        if (isMounted) setProfile(p);
      } catch {
        if (!isMounted) return;
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!user?.$id) return;
      try {
        const p = await fetchProfileByUserId(user.$id);
        if (isMounted) setProfile(p);
      } catch {
        if (isMounted) setProfile(null);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.$id]);

  const refreshProfile = async () => {
    if (!user?.$id) return null;
    const p = await fetchProfileByUserId(user.$id);
    setProfile(p);
    return p;
  };

  const value = {
    user,
    profile,
    isLoading,
    setUser,
    setProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

