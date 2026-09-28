import type { Creation } from '../types';

const HISTORY_KEY = 'ageLabesHistory';

export const getHistory = (): Creation[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    if (!historyJson) return [];
    const list: Creation[] = JSON.parse(historyJson);
    return list.map((item) => ({
      ...item,
      personName: item.personName || 'Persona',
      name: item.name || `${item.personName || 'Persona'} (${item.targetAge || 30} años)`,
      timestamp: item.timestamp || item.createdAt || Date.now(),
      createdAt: item.createdAt || item.timestamp || Date.now(),
      styleId: item.styleId || 'realista',
      styleName: item.styleName || 'Ultra Realista',
    }));
  } catch (error) {
    console.error('Error al leer el historial:', error);
    return [];
  }
};

const saveHistory = (creations: Creation[]): void => {
  try {
    creations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(creations));
  } catch (error) {
    console.error('Error al guardar el historial:', error);
  }
};

export const addCreation = (
  item: Omit<Creation, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
): Creation => {
  const pName = item.personName?.trim() || 'Persona';
  const newCreation: Creation = {
    ...item,
    personName: pName,
    name: item.name || `${pName} (${item.targetAge} años)`,
    id: item.id || `creation_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: item.createdAt || Date.now(),
    timestamp: item.createdAt || Date.now(),
    styleId: item.styleId || 'realista',
    styleName: item.styleName || 'Ultra Realista',
  };
  const history = getHistory();
  const updatedHistory = [newCreation, ...history];
  saveHistory(updatedHistory);
  return newCreation;
};

export const removeCreation = (id: string): Creation[] => {
  const history = getHistory();
  const updatedHistory = history.filter((c) => c.id !== id);
  saveHistory(updatedHistory);
  return updatedHistory;
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error al limpiar el historial:', error);
  }
};
