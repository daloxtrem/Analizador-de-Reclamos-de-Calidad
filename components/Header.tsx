
import React from 'react';
import { ChartBarIcon, CalendarIcon, DocumentTextIcon, CompareIcon } from './Icons';

interface HeaderProps {
    activeView: 'dashboard' | 'yearly' | 'monthly';
    setActiveView: (view: 'dashboard' | 'yearly' | 'monthly') => void;
    onCompareClick: () => void;
    showCompareButton: boolean;
}

const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onCompareClick, showCompareButton }) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 text-primary-600 font-bold text-xl">
                            Analizador de Reclamos
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center space-x-4">
                        <NavButton onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'}>
                            <ChartBarIcon className="mr-2" /> Dashboard
                        </NavButton>
                        <NavButton onClick={() => setActiveView('yearly')} isActive={activeView === 'yearly'}>
                            <CalendarIcon className="mr-2" /> Acumulado Anual
                        </NavButton>
                        <NavButton onClick={() => setActiveView('monthly')} isActive={activeView === 'monthly'}>
                            <DocumentTextIcon className="mr-2" /> Detalle Mensual
                        </NavButton>
                        {showCompareButton && (
                             <button 
                                onClick={onCompareClick}
                                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                            >
                                <CompareIcon className="mr-2" /> Comparar Versiones
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
