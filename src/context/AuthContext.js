// AI-assisted: see docs/AI_LOG.md #16 #19
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser, } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../service/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // usuario de Firebase Auth
  const [driver, setDriver] = useState(null); // documento drivers/{uid}
  const [loading, setLoading] = useState(true);

  // 1) Sesión de Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setLoading(true); // esperar el documento del conductor
      } else {
        setDriver(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // 2) Documento del conductor en tiempo real: si cambias status a "Aprobado"
  //    en la consola de Firestore, la app lo detecta sin reiniciar.
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

  // Antes de salir, marcar al conductor como no disponible (después de cerrar
  // sesión Firestore ya no permitiría la escritura).
  const logout = useCallback(async () => {
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'drivers', auth.currentUser.uid), { isAvailable: false });
      }
    } catch (e) {
      console.log('AuthContext: no se pudo marcar no disponible al salir', e);
    }
    await signOut(auth);
  }, []);

  // Crea la cuenta y el perfil. El documento usa el uid como id.
  // La contraseña NUNCA se guarda en Firestore: la maneja Firebase Auth.
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
      // Evita dejar una cuenta de Auth sin perfil
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