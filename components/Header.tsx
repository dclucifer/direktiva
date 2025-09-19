import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppContextType, Page } from '../types';
import Button from './ui/Button';
import Toggle from './ui/Toggle';
import { useTranslation } from '../hooks/useTranslation';

const Header: React.FC = () => {
    const { currentPage, setCurrentPage, theme, toggleTheme, language, setLanguage } = useContext(AppContext) as AppContextType;
    const { t } = useTranslation();

    const navItems: { page: Page; labelKey: string }[] = [
        { page: 'generator', labelKey: 'generator' },
        { page: 'image_generator', labelKey: 'image_generator' },
        { page: 'history', labelKey: 'history' },
        { page: 'settings', labelKey: 'settings' },
        { page: 'manual', labelKey: 'manual' },
    ];

    return (
        <header className="bg-component-background/60 dark:bg-component-background/70 backdrop-blur-lg sticky top-0 z-40 w-full border-b border-border-color">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('generator')}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-600">
                                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor" fillOpacity="0.1"></path>
                                <path d="M15.5 12L10 9V15L15.5 12Z" fill="currentColor"></path>
                                <path d="M8.15311 4.23223C8.66579 3.32433 9.77975 2.92381 10.6877 3.43649L11.082 3.65403C11.5358 3.90013 12 4.36449 12 4.89873V4.89873C12 5.72911 11.325 6.40411 10.4946 6.40411H7.83209C6.82067 6.40411 6.00911 5.59255 6.00911 4.58113V4.58113C6.00911 4.02018 6.3134 3.50423 6.78689 3.22014L8.15311 4.23223Z" fill="currentColor" transform="rotate(20, 12, 12)"></path>
                                <path d="M15.8469 19.7678C15.3342 20.6757 14.2202 21.0762 13.3123 20.5635L12.918 20.346C12.4642 20.0999 12 19.6355 12 19.1013V19.1013C12 18.2709 12.675 17.5959 13.5054 17.5959H16.1679C17.1793 17.5959 17.9909 18.4075 17.9909 19.4189V19.4189C17.9909 19.9798 17.6866 20.4958 17.2131 20.7799L15.8469 19.7678Z" fill="currentColor" transform="rotate(20, 12, 12)"></path>
                            </svg>
                            <h1 className="text-2xl font-bold tracking-tight font-clash">Direktiva Studio</h1>
                        </div>
                        <nav className="hidden md:flex items-center space-x-6">
                            {navItems.map(item => (
                                <button
                                    key={item.page}
                                    onClick={() => setCurrentPage(item.page)}
                                    className={`relative px-1 py-2 text-md font-medium transition-colors duration-300 ${
                                        currentPage === item.page
                                            ? 'text-primary-600'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-basetext'
                                    }`}
                                >
                                    {t(item.labelKey)}
                                    {currentPage === item.page && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-5">
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${language === 'en' ? 'text-basetext' : 'text-gray-400'}`}>EN</span>
                            <Toggle enabled={language === 'id'} onChange={() => setLanguage(lang => lang === 'en' ? 'id' : 'en')} srText="Language toggle" />
                            <span className={`text-sm font-medium ${language === 'id' ? 'text-basetext' : 'text-gray-400'}`}>ID</span>
                        </div>
                        <div className="w-px h-6 bg-border-color"></div>
                        <div className="flex items-center space-x-3">
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {theme === 'light' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                    </svg>
                                )}
                            </button>
                            <Button variant="secondary" size="md" onClick={() => setCurrentPage('account')}>
                                {t('account')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;