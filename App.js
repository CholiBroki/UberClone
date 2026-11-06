// AI-assisted: see docs/AI_LOG.md #7
import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login' o 'register'

  if (screen === 'register') {
    return <RegisterScreen />;
  }

  return (
    <LoginScreen
      onGoToRegister={() => setScreen('register')}
    />
  );
}