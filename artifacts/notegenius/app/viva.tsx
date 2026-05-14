import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#00C9A7",
  intermediate: "#FF9800",
  advanced: "#EF4444",
};

export default function VivaScreen() {
  const colors = useColors();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { getNoteById } = useNotes();

  const [activeLevel, setActiveLevel] = useState<Level>("All");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const note = noteId ? getNoteById(noteId) : undefined;
  const allQuestions = note?.vivaQuestions ?? [];
  const questions =
    activeLevel === "All"
      ? allQuestions
      : allQuestions.filter((q) => q.level === activeLevel.toLowerCase());

  const handleReveal = async (idx: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  if (!note || allQuestions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="mic" size={44} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No viva questions available</Text>
        <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Info */}
      <View style={[styles.infoBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="mic" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.foreground }]}>
          {allQuestions.length} viva questions from {note.subject}
        </Text>
      </View>

      {/* Level Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {LEVELS.map((level) => (
          <Pressable
            key={level}
            style={[styles.levelChip, {
              backgroundColor: activeLevel === level ? colors.primary : colors.card,
              borderColor: activeLevel === level ? colors.primary : colors.border,
            }]}
            onPress={() => { setActiveLevel(level); setExpandedIdx(null); }}
          >
            {level !== "All" && (
              <View style={[styles.levelDot, { backgroundColor: activeLevel === level ? "#fff" : LEVEL_COLORS[level.toLowerCase()] }]} />
            )}
            <Text style={[styles.levelText, { color: activeLevel === level ? "#fff" : colors.mutedForeground }]}>{level}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Questions List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {questions.length === 0 ? (
          <View style={styles.emptyFilter}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No {activeLevel.toLowerCase()} level questions found
            </Text>
          </View>
        ) : (
          questions.map((item, idx) => (
            <Pressable
              key={idx}
              style={[
                styles.questionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: expandedIdx === idx ? LEVEL_COLORS[item.level] : colors.border,
                },
              ]}
              onPress={() => handleReveal(idx)}
            >
              {/* Question Row */}
              <View style={styles.questionRow}>
                <View style={[styles.qNum, { backgroundColor: LEVEL_COLORS[item.level] + "22" }]}>
                  <Text style={[styles.qNumText, { color: LEVEL_COLORS[item.level] }]}>{idx + 1}</Text>
                </View>
                <Text style={[styles.questionText, { color: colors.foreground }]}>{item.question}</Text>
                <Feather
                  name={expandedIdx === idx ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>

              {/* Level Badge */}
              <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[item.level] + "15" }]}>
                <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[item.level] }]}>
                  {item.level.toUpperCase()}
                </Text>
              </View>

              {/* Answer */}
              {expandedIdx === idx && (
                <View style={[styles.answerBox, { backgroundColor: LEVEL_COLORS[item.level] + "10", borderColor: LEVEL_COLORS[item.level] + "30" }]}>
                  <View style={styles.answerHeader}>
                    <Feather name="message-circle" size={14} color={LEVEL_COLORS[item.level]} />
                    <Text style={[styles.answerLabel, { color: LEVEL_COLORS[item.level] }]}>Model Answer</Text>
                  </View>
                  <Text style={[styles.answerText, { color: colors.foreground }]}>{item.answer}</Text>
                </View>
              )}
            </Pressable>
          ))
        )}

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.tipsTitle, { color: colors.foreground }]}>Viva Tips</Text>
          {[
            "Take a moment to think before answering",
            "Speak clearly and at a steady pace",
            "Show your reasoning, not just the answer",
            "Ask for clarification if the question is unclear",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBar: { flexDirection: "row", alignItems: "center", gap: 8, margin: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  infoText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  levelRow: { marginBottom: 12 },
  levelChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  levelDot: { width: 7, height: 7, borderRadius: 4 },
  levelText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  questionCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  questionRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  qNum: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  qNumText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  questionText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 21 },
  levelBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 8, marginLeft: 38 },
  levelBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  answerBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 12 },
  answerHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  answerLabel: { fontSize: 12, fontFamily: "Inter_700Bold" },
  answerText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  emptyFilter: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  tipsCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 8 },
  tipsTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  tipRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  btnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
