import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import GeneratorPage from './pages/GeneratorPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';
import ManualPage from './pages/ManualPage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import { Page, Theme, Toast as ToastType } from './types';
import { AppContext } from './contexts/AppContext';
import Toast from './components/ui/Toast';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('generator');
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<'en' | 'id'>('id');
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return newTheme;
    });
  }, []);
  
  const addToast = useCallback((message: string, type: ToastType['type'] = 'success') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Set initial theme on component mount
  React.useEffect(() => {
      document.documentElement.classList.add('dark');
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    language,
    setLanguage,
    currentPage,
    setCurrentPage,
    addToast
  }), [theme, toggleTheme, language, currentPage, addToast]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme}`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className={currentPage === 'generator' ? '' : 'hidden'}>
            <GeneratorPage />
          </div>
          <div className={currentPage === 'image_generator' ? '' : 'hidden'}>
            <ImageGeneratorPage />
          </div>
          <div className={currentPage === 'history' ? '' : 'hidden'}>
            <HistoryPage />
          </div>
          <div className={currentPage === 'settings' ? '' : 'hidden'}>
            <SettingsPage />
          </div>
          <div className={currentPage === 'account' ? '' : 'hidden'}>
            <AccountPage />
          </div>
          <div className={currentPage === 'manual' ? '' : 'hidden'}>
            <ManualPage />
          </div>
        </main>
         <div className="fixed bottom-5 right-5 z-50 space-y-3 w-full max-w-sm">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
