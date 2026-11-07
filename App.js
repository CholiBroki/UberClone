// App.js
import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login', 'register' o 'home'

  if (screen === 'register') {
    return <RegisterScreen onBack={() => setScreen('login')} />;
  }

  return (
    <LoginScreen
      onLogin={() => {
        // Por ahora no navega a ninguna pantalla según indicaste
      }}
      onNavigateRegister={() => setScreen('register')}
    />
  );
}