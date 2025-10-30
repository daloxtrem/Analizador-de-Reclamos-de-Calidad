
import { useState, useCallback } from 'react';
import type { Claim, Version, ComparisonResult, ClaimDiff } from '../types';

const STORAGE_KEYS = {
    CURRENT_ID: 'claims_currentVersionId',
    VERSIONS: 'claims_versions',
};

// Helper to get data from localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
    }
};

// Helper to set data to localStorage
const setInStorage = (key: string, value: any) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
    }
};


export const useVersionedData = (initialData: Claim[], previousData?: Claim[]) => {
    const [versions, setVersions] = useState<Record<string, Version>>(() => {
        const storedVersions = getFromStorage<Record<string, Version>>(STORAGE_KEYS.VERSIONS, {});
        if (Object.keys(storedVersions).length > 0) {
            return storedVersions;
        }

        // Initialize with mock data if storage is empty
        const initialVersions: Record<string, Version> = {};
        const currentId = `v_${Date.now()}`;
        
        initialVersions[currentId] = {
            id: currentId,
            timestamp: Date.now(),
            metadata: { name: 'Datos de Demostración (Actual)', rows: initialData.length },
            data: initialData
        };
        
        if (previousData) {
            const previousId = `v_${Date.now() - 10000}`;
            initialVersions[previousId] = {
                id: previousId,
                timestamp: Date.now() - 10000,
                metadata: { name: 'Datos de Demostración (Anterior)', rows: previousData.length },
                data: previousData
            };
            setInStorage(STORAGE_KEYS.CURRENT_ID, { current: currentId, previous: previousId });
        } else {
             setInStorage(STORAGE_KEYS.CURRENT_ID, { current: currentId, previous: null });
        }

        setInStorage(STORAGE_KEYS.VERSIONS, initialVersions);
        return initialVersions;
    });

    const [versionIds, setVersionIds] = useState<{ current: string | null, previous: string | null }>(() => {
        return getFromStorage(STORAGE_KEYS.CURRENT_ID, { current: null, previous: null });
    });

    const saveNewVersion = useCallback((data: Claim[], metadata: { name: string, rows: number }) => {
        const newId = `v_${Date.now()}`;
        const newVersion: Version = {
            id: newId,
            timestamp: Date.now(),
            metadata,
            data
        };

        setVersions(prev => {
            const updatedVersions = { ...prev, [newId]: newVersion };
            setInStorage(STORAGE_KEYS.VERSIONS, updatedVersions);
            return updatedVersions;
        });

        setVersionIds(prev => {
            const newIds = { current: newId, previous: prev.current };
            setInStorage(STORAGE_KEYS.CURRENT_ID, newIds);
            return newIds;
        });
    }, []);

    const compareVersions = useCallback((versionAId: string, versionBId: string): ComparisonResult | null => {
        const versionA = versions[versionAId]?.data;
        const versionB = versions[versionBId]?.data;

        if (!versionA || !versionB) return null;

        const mapA = new Map(versionA.map(c => [c.id, c]));
        const mapB = new Map(versionB.map(c => [c.id, c]));

        const added: Claim[] = [];
        const removed: Claim[] = [];
        const modified: ClaimDiff[] = [];

        for (const [id, claimA] of mapA.entries()) {
            if (!mapB.has(id)) {
                added.push(claimA);
            } else {
                const claimB = mapB.get(id)!;
                const changes = [];
                for (const key in claimA) {
                    const typedKey = key as keyof Claim;
                    if (claimA[typedKey] !== claimB[typedKey]) {
                        changes.push({
                            field: typedKey,
                            oldValue: claimB[typedKey],
                            newValue: claimA[typedKey]
                        });
                    }
                }
                if (changes.length > 0) {
                    modified.push({
                        type: 'modified',
                        claimId: id,
                        current: claimA,
                        previous: claimB,
                        changes
                    });
                }
            }
        }

        for (const [id, claimB] of mapB.entries()) {
            if (!mapA.has(id)) {
                removed.push(claimB);
            }
        }

        return { added, removed, modified };
    }, [versions]);

    const history = Object.values(versions).sort((a, b) => b.timestamp - a.timestamp);
    const currentVersion = versionIds.current ? versions[versionIds.current] : null;
    const previousVersion = versionIds.previous ? versions[versionIds.previous] : null;

    return { currentVersion, previousVersion, history, saveNewVersion, compareVersions };
};
