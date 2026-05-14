import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Summary {
  bullets: string[];
  keywords: string[];
  examNotes: string;
  simpleExplanation: string;
}

export interface MCQItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface FlashcardItem {
  question: string;
  answer: string;
}

export interface VivaItem {
  question: string;
  answer: string;
  level: "beginner" | "intermediate" | "advanced";
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  noteText: string;
  createdAt: number;
  summary?: Summary;
  mcqs?: MCQItem[];
  flashcards?: FlashcardItem[];
  vivaQuestions?: VivaItem[];
}

interface NotesContextType {
  notes: Note[];
  streak: number;
  isLoading: boolean;
  saveNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  updateStreak: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | null>(null);

const NOTES_KEY = "notegenius_notes";
const STREAK_KEY = "notegenius_streak";
const LAST_STUDY_KEY = "notegenius_last_study";

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [notesData, streakData, lastStudyData] = await Promise.all([
        AsyncStorage.getItem(NOTES_KEY),
        AsyncStorage.getItem(STREAK_KEY),
        AsyncStorage.getItem(LAST_STUDY_KEY),
      ]);

      if (notesData) {
        setNotes(JSON.parse(notesData));
      }

      if (streakData && lastStudyData) {
        const lastStudy = new Date(lastStudyData);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = lastStudy.toDateString() === today.toDateString();
        const isYesterday = lastStudy.toDateString() === yesterday.toDateString();

        if (isToday || isYesterday) {
          setStreak(parseInt(streakData, 10));
        } else {
          setStreak(0);
          await AsyncStorage.setItem(STREAK_KEY, "0");
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const saveNote = useCallback(async (note: Note) => {
    setNotes((prev) => {
      const existing = prev.findIndex((n) => n.id === note.id);
      const updated = existing >= 0 ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
      AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getNoteById = useCallback(
    (id: string) => notes.find((n) => n.id === id),
    [notes]
  );

  const updateStreak = useCallback(async () => {
    try {
      const today = new Date().toISOString();
      const lastStudy = await AsyncStorage.getItem(LAST_STUDY_KEY);

      if (lastStudy) {
        const last = new Date(lastStudy);
        const todayDate = new Date();
        const isToday = last.toDateString() === todayDate.toDateString();
        if (isToday) return;
      }

      const newStreak = streak + 1;
      setStreak(newStreak);
      await AsyncStorage.setItem(STREAK_KEY, newStreak.toString());
      await AsyncStorage.setItem(LAST_STUDY_KEY, today);
    } catch {
      // ignore
    }
  }, [streak]);

  return (
    <NotesContext.Provider value={{ notes, streak, isLoading, saveNote, deleteNote, getNoteById, updateStreak }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
