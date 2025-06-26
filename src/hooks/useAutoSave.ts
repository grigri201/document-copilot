import { useEffect, useState, useCallback, useRef } from 'react';
import type { CustomEditor } from '@/types/editor';

const STORAGE_KEY = 'document-copilot-content';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const MIN_INDICATOR_DISPLAY_TIME = 2000; // 2 seconds

interface UseAutoSaveOptions {
  editor: CustomEditor | null;
  getContent: () => string;
}

export function useAutoSave({ editor, getContent }: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const indicatorTimeoutRef = useRef<NodeJS.Timeout>();

  const saveToStorage = useCallback(async () => {
    if (!editor) return;

    setIsSaving(true);
    
    try {
      const content = getContent();
      localStorage.setItem(STORAGE_KEY, content);
      
      // Ensure the indicator is shown for at least 2 seconds
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
      
      indicatorTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
      }, MIN_INDICATOR_DISPLAY_TIME);
    } catch (error) {
      console.error('Failed to save content:', error);
      setIsSaving(false);
    }
  }, [editor, getContent]);

  const loadFromStorage = useCallback(() => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      return savedContent || '';
    } catch (error) {
      console.error('Failed to load content:', error);
      return '';
    }
  }, []);

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }, []);

  // Set up auto-save interval
  useEffect(() => {
    if (!editor) return;

    // Initial save after a short delay
    saveTimeoutRef.current = setTimeout(saveToStorage, 5000);

    // Set up recurring auto-save
    const intervalId = setInterval(saveToStorage, AUTO_SAVE_INTERVAL);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
      clearInterval(intervalId);
    };
  }, [editor, saveToStorage]);

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editor) {
        const content = getContent();
        localStorage.setItem(STORAGE_KEY, content);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editor, getContent]);

  return {
    isSaving,
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
}