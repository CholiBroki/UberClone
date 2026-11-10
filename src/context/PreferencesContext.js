// AI-assisted: see docs/AI_LOG.md #17
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const KEY_LANGUAGE = 'pref:language';
const KEY_AVAILABILITY = 'pref:lastAvailability';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [language, setLanguageState] = useState('es');
  const [lastAvailability, setLastAvailabilityState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pairs = await AsyncStorage.multiGet([KEY_LANGUAGE, KEY_AVAILABILITY]);
        const lang = pairs[0][1];
        const avail = pairs[1][1];
        if (cancelled) return;
        if (lang === 'es' || lang === 'en') setLanguageState(lang);
        setLastAvailabilityState(avail === 'true');
      } catch (e) {
        console.log('PreferencesContext: no se pudieron leer las preferencias', e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(KEY_LANGUAGE, lang);
    } catch (e) {
      console.log('PreferencesContext: error guardando idioma', e);
    }
  }, []);

  const setLastAvailability = useCallback(async (value) => {
    setLastAvailabilityState(!!value);
    try {
      await AsyncStorage.setItem(KEY_AVAILABILITY, value ? 'true' : 'false');
    } catch (e) {
      console.log('PreferencesContext: error guardando disponibilidad', e);
    }
  }, []);

  // t('clave') o t('clave', { step: 4 }) para reemplazar {step}
  const t = useCallback(
    (key, params) => {
      let text = translations[language]?.[key] ?? translations.es[key] ?? key;
      if (params) {
        Object.keys(params).forEach((p) => {
          text = text.replace(`{${p}}`, String(params[p]));
        });
      }
      return text;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, lastAvailability, setLastAvailability, loaded, t }),
    [language, setLanguage, lastAvailability, setLastAvailability, loaded, t]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences debe usarse dentro de <PreferencesProvider>');
  return ctx;
};