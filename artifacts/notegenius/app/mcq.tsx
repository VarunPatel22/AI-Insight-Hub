import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#00C9A7",
  medium: "#FF9800",
  hard: "#EF4444",
};

export default function MCQScreen() {
  const colors = useColors();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { getNoteById } = useNotes();

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("All");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const note = noteId ? getNoteById(noteId) : undefined;
  const allMcqs = note?.mcqs ?? [];
  const mcqs =
    selectedDifficulty === "All"
      ? allMcqs
      : allMcqs.filter((q) => q.difficulty === selectedDifficulty.toLowerCase());

  const currentQ = mcqs[currentIdx];

  const handleSelect = async (optIdx: number) => {
    if (showAnswer) return;
    setSelectedOption(optIdx);
    setShowAnswer(true);
    setAnswered((p) => p + 1);
    if (optIdx === currentQ.correctIndex) {
      setScore((p) => p + 1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNext = () => {
    if (currentIdx < mcqs.length - 1) {
      setCurrentIdx((p) => p + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore(0);
    setAnswered(0);
  };

  const getOptionStyle = (idx: number) => {
    if (!showAnswer) {
      return {
        backgroundColor: selectedOption === idx ? colors.primary + "33" : colors.card,
        borderColor: selectedOption === idx ? colors.primary : colors.border,
      };
    }
    if (idx === currentQ.correctIndex) return { backgroundColor: "#00C9A7" + "33", borderColor: "#00C9A7" };
    if (idx === selectedOption && idx !== currentQ.correctIndex) return { backgroundColor: "#EF4444" + "33", borderColor: "#EF4444" };
    return { backgroundColor: colors.card, borderColor: colors.border };
  };

  const isFinished = answered === mcqs.length && mcqs.length > 0;

  if (!note || allMcqs.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="alert-circle" size={44} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No MCQs available</Text>
        <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Score Bar */}
      <View style={[styles.scoreBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: "#00C9A7" }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Correct</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: colors.foreground }]}>{currentIdx + 1}/{mcqs.length}</Text>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Question</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: "#EF4444" }]}>{answered - score}</Text>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Wrong</Text>
        </View>
      </View>

      {/* Difficulty Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {DIFFICULTIES.map((d) => (
          <Pressable
            key={d}
            style={[styles.filterChip, {
              backgroundColor: selectedDifficulty === d ? colors.primary : colors.card,
              borderColor: selectedDifficulty === d ? colors.primary : colors.border,
            }]}
            onPress={() => { setSelectedDifficulty(d); handleRestart(); }}
          >
            <Text style={[styles.filterText, { color: selectedDifficulty === d ? "#fff" : colors.mutedForeground }]}>{d}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {mcqs.length === 0 ? (
        <View style={styles.emptyFilter}>
          <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No {selectedDifficulty.toLowerCase()} questions</Text>
        </View>
      ) : isFinished ? (
        <View style={[styles.finished, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="award" size={48} color="#FF9800" />
          <Text style={[styles.finishedTitle, { color: colors.foreground }]}>Quiz Complete!</Text>
          <Text style={[styles.finishedScore, { color: colors.primary }]}>{score}/{mcqs.length}</Text>
          <Text style={[styles.finishedLabel, { color: colors.mutedForeground }]}>
            {score >= mcqs.length * 0.8 ? "Excellent work!" : score >= mcqs.length * 0.5 ? "Good effort!" : "Keep practicing!"}
          </Text>
          <Pressable style={[styles.btn, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={handleRestart}>
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.btnText}>Try Again</Text>
          </Pressable>
        </View>
      ) : currentQ ? (
        <View style={styles.questionContainer}>
          {/* Difficulty Badge */}
          <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[currentQ.difficulty] + "22" }]}>
            <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[currentQ.difficulty] }]}>
              {currentQ.difficulty.toUpperCase()}
            </Text>
          </View>

          {/* Question */}
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.foreground }]}>{currentQ.question}</Text>
          </View>

          {/* Options */}
          {currentQ.options.map((option, idx) => (
            <Pressable
              key={idx}
              style={[styles.optionCard, getOptionStyle(idx)]}
              onPress={() => handleSelect(idx)}
            >
              <View style={[styles.optionLetter, {
                backgroundColor: showAnswer && idx === currentQ.correctIndex ? "#00C9A7" : colors.secondary,
              }]}>
                <Text style={[styles.optionLetterText, {
                  color: showAnswer && idx === currentQ.correctIndex ? "#fff" : colors.mutedForeground,
                }]}>
                  {["A", "B", "C", "D"][idx]}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>
              {showAnswer && idx === currentQ.correctIndex && (
                <Feather name="check-circle" size={18} color="#00C9A7" />
              )}
              {showAnswer && idx === selectedOption && idx !== currentQ.correctIndex && (
                <Feather name="x-circle" size={18} color="#EF4444" />
              )}
            </Pressable>
          ))}

          {/* Explanation */}
          {showAnswer && (
            <View style={[styles.explanation, { backgroundColor: "#6C63FF" + "15", borderColor: "#6C63FF" + "33" }]}>
              <Feather name="info" size={14} color="#6C63FF" />
              <Text style={[styles.explanationText, { color: colors.foreground }]}>{currentQ.explanation}</Text>
            </View>
          )}

          {/* Next Button */}
          {showAnswer && currentIdx < mcqs.length - 1 && (
            <Pressable style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next Question</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </Pressable>
          )}
          {showAnswer && currentIdx === mcqs.length - 1 && (
            <Pressable style={[styles.nextBtn, { backgroundColor: "#FF9800" }]} onPress={() => setAnswered(mcqs.length)}>
              <Text style={styles.nextBtnText}>See Results</Text>
              <Feather name="award" size={16} color="#fff" />
            </Pressable>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scoreBar: { flexDirection: "row", margin: 16, borderRadius: 14, borderWidth: 1, padding: 16 },
  scoreItem: { flex: 1, alignItems: "center" },
  scoreValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  filterRow: { marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  questionContainer: { paddingHorizontal: 16 },
  diffBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  diffText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  questionCard: { borderRadius: 14, borderWidth: 1, padding: 18, marginBottom: 14 },
  questionText: { fontSize: 16, fontFamily: "Inter_600SemiBold", lineHeight: 24 },
  optionCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  optionLetter: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  optionLetterText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  explanation: { flexDirection: "row", gap: 8, alignItems: "flex-start", borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  explanationText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 16 },
  nextBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  finished: { margin: 16, borderRadius: 20, borderWidth: 1, padding: 32, alignItems: "center", gap: 8 },
  finishedTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 8 },
  finishedScore: { fontSize: 48, fontFamily: "Inter_700Bold" },
  finishedLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  emptyFilter: { padding: 32, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_500Medium", marginTop: 10 },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
