// AI-assisted: see docs/AI_LOG.md #16
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser,} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../service/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    
  const [driver, setDriver] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setLoading(true); 
      } else {
        setDriver(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);


  useEffect(() => {
    if (!user) return undefined;

    const unsubscribe = onSnapshot(
      doc(db, 'drivers', user.uid),
      (snap) => {
        setDriver(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      (error) => {
        console.log('AuthContext: error escuchando drivers/', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const login = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email.trim(), password),
    []
  );

  const logout = useCallback(() => signOut(auth), []);

  const registerDriver = useCallback(async (email, password, driverData) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    try {
      await setDoc(doc(db, 'drivers', cred.user.uid), {
        ...driverData,
        email: email.trim(),
        status: 'Pendiente',
        balance: 0,
        registeredAt: serverTimestamp(),
      });
    } catch (error) {
      await deleteUser(cred.user).catch(() => {});
      throw error;
    }
    return cred.user;
  }, []);

  const value = useMemo(
    () => ({ user, driver, loading, login, logout, registerDriver }),
    [user, driver, loading, login, logout, registerDriver]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};