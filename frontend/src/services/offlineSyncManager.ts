import { useState, useEffect } from 'react';

export interface QueuedAction {
  id: string;
  type: 'DONATION_CREATE' | 'STATUS_UPDATE' | 'TEMPERATURE_LOG' | 'HANDOFF_SCAN' | 'COMMUNITY_CRITERIA';
  description: string;
  payload: any;
  timestamp: string;
  synced: boolean;
}

const STORAGE_KEY = 'mealmesh_offline_queue';
const SIMULATED_OFFLINE_KEY = 'mealmesh_simulated_offline';

export const getQueuedActions = (): QueuedAction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const queueAction = (type: QueuedAction['type'], description: string, payload: any): QueuedAction => {
  const actions = getQueuedActions();
  const newAction: QueuedAction = {
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    type,
    description,
    payload,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  actions.unshift(newAction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  window.dispatchEvent(new Event('mealmesh_offline_updated'));
  return newAction;
};

export const clearSyncedActions = () => {
  const actions = getQueuedActions().filter(a => !a.synced);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  window.dispatchEvent(new Event('mealmesh_offline_updated'));
};

export const syncOfflineQueue = async (apiBaseUrl: string = ''): Promise<{ success: boolean; count: number }> => {
  const actions = getQueuedActions().filter(a => !a.synced);
  if (actions.length === 0) return { success: true, count: 0 };

  try {
    const res = await fetch(`${apiBaseUrl}/api/sync/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actions.map(a => ({
        clientTxId: a.id,
        type: a.type,
        payload: a.payload,
        createdAt: a.timestamp
      }))),
    });

    if (res.ok) {
      const all = getQueuedActions().map(a => ({ ...a, synced: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event('mealmesh_offline_updated'));
      return { success: true, count: actions.length };
    }
  } catch (err) {
    console.warn('Sync failed: Network still unreachable', err);
  }
  return { success: false, count: 0 };
};

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const sim = localStorage.getItem(SIMULATED_OFFLINE_KEY);
    return sim === 'true' ? false : navigator.onLine;
  });
  const [queued, setQueued] = useState<QueuedAction[]>(getQueuedActions());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const refreshQueue = () => setQueued(getQueuedActions());
    const handleOnline = () => {
      const sim = localStorage.getItem(SIMULATED_OFFLINE_KEY);
      if (sim !== 'true') setIsOnline(true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('mealmesh_offline_updated', refreshQueue);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mealmesh_offline_updated', refreshQueue);
    };
  }, []);

  const toggleSimulatedOffline = () => {
    const currentSim = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
    const nextState = !currentSim;
    localStorage.setItem(SIMULATED_OFFLINE_KEY, nextState.toString());
    setIsOnline(!nextState && navigator.onLine);
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    const result = await syncOfflineQueue();
    setIsSyncing(false);
    return result;
  };

  const pendingCount = queued.filter(q => !q.synced).length;

  return {
    isOnline,
    pendingCount,
    queued,
    isSyncing,
    queueAction,
    triggerSync,
    toggleSimulatedOffline,
    clearSyncedActions,
  };
};
