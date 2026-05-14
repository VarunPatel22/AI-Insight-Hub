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

export interface TopicSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  definitions: string[];
  formulas: string[];
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  subjectId?: string;
  noteText: string;
  createdAt: number;
  summary?: Summary;
  topics?: TopicSummary[];
  mcqs?: MCQItem[];
  flashcards?: FlashcardItem[];
  vivaQuestions?: VivaItem[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface PYQQuestion {
  question: string;
  count: number;
  avgMarks: number;
  importance: "very_important" | "high_probability" | "most_repeated" | "frequently_asked";
  topic: string;
}

export interface PYQTopic {
  topic: string;
  repetitions: number;
  avgMarks: number;
  importance: string;
}

export interface PYQTopQuestion {
  question: string;
  type: "long" | "short" | "definition";
  marks: number;
}

export interface PYQAnalysis {
  id: string;
  subjectId?: string;
  subject?: string;
  fileName: string;
  createdAt: number;
  repeatedQuestions: PYQQuestion[];
  importantTopics: PYQTopic[];
  examPredictions: string[];
  topQuestions: PYQTopQuestion[];
}

interface NotesContextType {
  notes: Note[];
  subjects: Subject[];
  pyqAnalyses: PYQAnalysis[];
  streak: number;
  isLoading: boolean;
  saveNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  getNotesForSubject: (subjectId: string) => Note[];
  saveSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubjectById: (id: string) => Subject | undefined;
  savePYQ: (pyq: PYQAnalysis) => Promise<void>;
  deletePYQ: (id: string) => Promise<void>;
  getPYQById: (id: string) => PYQAnalysis | undefined;
  updateStreak: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | null>(null);

const NOTES_KEY = "notegenius_notes";
const SUBJECTS_KEY = "notegenius_subjects";
const PYQ_KEY = "notegenius_pyq";
const STREAK_KEY = "notegenius_streak";
const LAST_STUDY_KEY = "notegenius_last_study";

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pyqAnalyses, setPyqAnalyses] = useState<PYQAnalysis[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [notesData, subjectsData, pyqData, streakData, lastStudyData] = await Promise.all([
        AsyncStorage.getItem(NOTES_KEY),
        AsyncStorage.getItem(SUBJECTS_KEY),
        AsyncStorage.getItem(PYQ_KEY),
        AsyncStorage.getItem(STREAK_KEY),
        AsyncStorage.getItem(LAST_STUDY_KEY),
      ]);

      if (notesData) setNotes(JSON.parse(notesData));
      if (subjectsData) setSubjects(JSON.parse(subjectsData));
      if (pyqData) setPyqAnalyses(JSON.parse(pyqData));

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

  const getNoteById = useCallback((id: string) => notes.find((n) => n.id === id), [notes]);

  const getNotesForSubject = useCallback(
    (subjectId: string) => notes.filter((n) => n.subjectId === subjectId),
    [notes]
  );

  const saveSubject = useCallback(async (subject: Subject) => {
    setSubjects((prev) => {
      const existing = prev.findIndex((s) => s.id === subject.id);
      const updated = existing >= 0 ? prev.map((s) => (s.id === subject.id ? subject : s)) : [subject, ...prev];
      AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    setSubjects((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getSubjectById = useCallback((id: string) => subjects.find((s) => s.id === id), [subjects]);

  const savePYQ = useCallback(async (pyq: PYQAnalysis) => {
    setPyqAnalyses((prev) => {
      const existing = prev.findIndex((p) => p.id === pyq.id);
      const updated = existing >= 0 ? prev.map((p) => (p.id === pyq.id ? pyq : p)) : [pyq, ...prev];
      AsyncStorage.setItem(PYQ_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deletePYQ = useCallback(async (id: string) => {
    setPyqAnalyses((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem(PYQ_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getPYQById = useCallback((id: string) => pyqAnalyses.find((p) => p.id === id), [pyqAnalyses]);

  const updateStreak = useCallback(async () => {
    try {
      const today = new Date().toISOString();
      const lastStudy = await AsyncStorage.getItem(LAST_STUDY_KEY);
      if (lastStudy) {
        const last = new Date(lastStudy);
        const isToday = last.toDateString() === new Date().toDateString();
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
    <NotesContext.Provider
      value={{
        notes,
        subjects,
        pyqAnalyses,
        streak,
        isLoading,
        saveNote,
        deleteNote,
        getNoteById,
        getNotesForSubject,
        saveSubject,
        deleteSubject,
        getSubjectById,
        savePYQ,
        deletePYQ,
        getPYQById,
        updateStreak,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
