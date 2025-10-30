import React, { useState, useMemo, useCallback } from 'react';
import { useVersionedData } from './hooks/useVersionedData';
import type { Claim, Version, DataWithErrors } from './types';
import { MOCK_DATA } from './data/mockData';
import { MOCK_PREVIOUS_VERSION_DATA } from './data/mockSnapshots';
import { processRawData } from './services/dataParser';
import UploadManager from './components/UploadManager';
import Dashboard from './components/Dashboard';
import VersionComparator from './components/VersionComparator';
import YearlyView from './components/YearlyView';
import MonthlyView from './components/MonthlyView';
import { Header } from './components/Header';
import { InfoIcon, WarningIcon } from './components/Icons';

const App: React.FC = () => {
    const { 
        currentVersion, 
        previousVersion, 
        history, 
        saveNewVersion,
        compareVersions
    } = useVersionedData(MOCK_DATA, MOCK_PREVIOUS_VERSION_DATA);

    const [activeView, setActiveView] = useState<'dashboard' | 'yearly' | 'monthly'>('dashboard');
    const [isComparing, setIsComparing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorSummary, setErrorSummary] = useState<{ count: number, rows: any[] } | null>(null);

    const handleDataUpload = useCallback(async (rawData: any[][]) => {
        setIsLoading(true);
        setErrorSummary(null);
        try {
            // Simulate processing delay for large files
            await new Promise(res => setTimeout(res, 500));
            const processed: DataWithErrors = processRawData(rawData);
            if (processed.data.length > 0) {
                saveNewVersion(processed.data, { name: `Subida ${new Date().toLocaleString()}`, rows: processed.data.length });
            }
            if (processed.errors.length > 0) {
                setErrorSummary({ count: processed.errors.length, rows: processed.errorRows });
            }
        } catch (error) {
            console.error("Error processing data:", error);
            alert("Ocurrió un error al procesar los datos.");
        } finally {
            setIsLoading(false);
        }
    }, [saveNewVersion]);

    const comparisonResult = useMemo(() => {
        if (!currentVersion || !previousVersion) return null;
        return compareVersions(currentVersion.id, previousVersion.id);
    }, [currentVersion, previousVersion, compareVersions]);

    const renderView = () => {
        if (!currentVersion?.data) return null;

        switch (activeView) {
            case 'yearly':
                return <YearlyView data={currentVersion.data} />;
            case 'monthly':
                return <MonthlyView data={currentVersion.data} />;
            case 'dashboard':
            default:
                return <Dashboard 
                    currentData={currentVersion.data} 
                    previousData={previousVersion?.data} 
                    comparisonResult={comparisonResult}
                />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Header 
                activeView={activeView}
                setActiveView={setActiveView}
                onCompareClick={() => setIsComparing(true)}
                showCompareButton={!!previousVersion}
            />

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {isLoading && (
                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="text-lg font-semibold">Procesando datos...</span>
                        </div>
                    </div>
                )}
                
                <UploadManager onUpload={handleDataUpload} />
                
                {errorSummary && (
                    <div className="my-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                        <div className="flex items-center">
                            <WarningIcon className="h-6 w-6 mr-3"/>
                            <div>
                                <p className="font-bold">Se encontraron {errorSummary.count} filas con errores de formato.</p>
                                <p className="text-sm">Estas filas han sido omitidas. Puede revisar los datos de origen.</p>
                            </div>
                        </div>
                    </div>
                )}

                {!currentVersion?.data || currentVersion.data.length === 0 ? (
                    <div className="mt-8 text-center bg-white p-10 rounded-lg shadow-md">
                        <InfoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">No hay datos para mostrar</h2>
                        <p className="text-gray-500 mt-2">Por favor, suba un archivo o pegue los datos de sus reclamos para comenzar el análisis.</p>
                    </div>
                ) : (
                    renderView()
                )}

                {isComparing && comparisonResult && (
                    <VersionComparator
                        isOpen={isComparing}
                        onClose={() => setIsComparing(false)}
                        comparison={comparisonResult}
                        versionA={currentVersion}
                        versionB={previousVersion}
                    />
                )}
            </main>
        </div>
    );
};

export default App;