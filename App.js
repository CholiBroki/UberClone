// AI-assisted: see docs/AI_LOG.md #14
import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [screen, setScreen] = useState('login');
  
  const [driverStatus, setDriverStatus] = useState('Aprobado');

  const handleLogin = () => {
    setScreen('home');
  };

  // Navegar a las pestañas de registro
  const handleGoToRegister = () => {
    setScreen('register');
  };

  const handleBackToLogin = () => {
    setScreen('login');
  };

  if (screen === 'register') {
    return <RegisterScreen onBack={handleBackToLogin} />;
  }

  if (screen === 'home') {
    return (
      <HomeScreen 
        driverStatus={driverStatus} 
        onOpenProfile={() => setScreen('login')} 
      />
    );
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onNavigateRegister={handleGoToRegister}
    />
  );
}