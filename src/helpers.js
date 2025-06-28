import {useState, useEffect} from "react"

export function formatTime(ms) {
  if (ms < 0) ms = 0;

  // 1. Beräkna alla tidsenheter
  const totalSeconds = Math.floor(ms / 1000);
  
  // Det finns 86400 sekunder på en dag (24 * 60 * 60)
  const days = Math.floor(totalSeconds / 86400);
  
  // Timmar inom den nuvarande dagen (resten efter hela dagar)
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  
  // Minuter inom den nuvarande timmen
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  // Sekunder inom den nuvarande minuten
  const seconds = totalSeconds % 60;

  // 2. Bygg ihop strängarna baserat på värdena

  let dayPart = "";
  if (days > 0) {
    // Hantera singular/plural och lägg till ett mellanrum
    dayPart = `${days} ${days === 1 ? 'day' : 'days'} `;
  }

  let timePart = "";
  if (days > 0) {
    // Om dagar visas, visa alltid tid i formatet HH:MM:SS för tydlighet
    timePart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (hours > 0) {
    // Om inga dagar men timmar finns, använd det gamla formatet
    timePart = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    // Annars, visa bara minuter och sekunder
    timePart = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // 3. Slå ihop delarna och returnera
  return dayPart + timePart;
}

export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key, state]);

  return [state, setState];
}

export function useUniqueId() {
  if (crypto.randomUUID) {
    return () => crypto.randomUUID()
  }
  return () => Date.now().toString(36) + Math.random().toString(36).slice(2)
}
