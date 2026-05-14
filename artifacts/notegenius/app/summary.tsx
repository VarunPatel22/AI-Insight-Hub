import { Feather } from "@expo/vector-icons";
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

const MODES = [
  { id: "bullets", label: "Bullet Points", icon: "list" as const },
  { id: "exam", label: "Exam Notes", icon: "book" as const },
  { id: "simple", label: "Simple Mode", icon: "smile" as const },
  { id: "keywords", label: "Keywords", icon: "tag" as const },
];

export default function SummaryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { getNoteById } = useNotes();
  const [activeMode, setActiveMode] = useState("bullets");

  const note = noteId ? getNoteById(noteId) : undefined;

  if (!note) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="alert-circle" size={44} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Note not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const summary = note.summary;
  const hasMCQ = (note.mcqs?.length ?? 0) > 0;
  const hasFlashcards = (note.flashcards?.length ?? 0) > 0;
  const hasViva = (note.vivaQuestions?.length ?? 0) > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Note Info */}
      <View style={[styles.noteInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.noteTitle, { color: colors.foreground }]}>{note.title}</Text>
        <View style={styles.noteMeta}>
          <View style={[styles.subjectBadge, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.subjectText, { color: colors.primary }]}>{note.subject}</Text>
          </View>
          <Text style={[styles.noteDate, { color: colors.mutedForeground }]}>
            {new Date(note.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Mode Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeTabs} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            style={[
              styles.modeTab,
              {
                backgroundColor: activeMode === mode.id ? colors.primary : colors.card,
                borderColor: activeMode === mode.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveMode(mode.id)}
          >
            <Feather name={mode.icon} size={13} color={activeMode === mode.id ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.modeTabText, { color: activeMode === mode.id ? "#fff" : colors.mutedForeground }]}>
              {mode.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {!summary ? (
          <View style={[styles.noSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
            <Text style={[styles.noSummaryText, { color: colors.mutedForeground }]}>No summary available for this note.</Text>
          </View>
        ) : activeMode === "bullets" ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Key Points</Text>
            {summary.bullets.map((bullet, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.foreground }]}>{bullet}</Text>
              </View>
            ))}
          </View>
        ) : activeMode === "exam" ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Exam Notes</Text>
            <Text style={[styles.examText, { color: colors.foreground }]}>{summary.examNotes}</Text>
          </View>
        ) : activeMode === "simple" ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Simple Explanation</Text>
            <Text style={[styles.examText, { color: colors.foreground }]}>{summary.simpleExplanation}</Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Important Keywords</Text>
            <View style={styles.keywordsWrap}>
              {summary.keywords.map((kw, i) => (
                <View key={i} style={[styles.keyword, { backgroundColor: colors.primary + "22" }]}>
                  <Text style={[styles.keywordText, { color: colors.primary }]}>{kw}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Practice Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Practice & Review</Text>
        <View style={styles.actionsGrid}>
          {hasMCQ && (
            <Pressable
              style={({ pressed }) => [styles.actionCard, { backgroundColor: "#00C9A7" + "22", borderColor: "#00C9A7" + "44", opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(`/mcq?noteId=${note.id}`)}
            >
              <Feather name="check-circle" size={24} color="#00C9A7" />
              <Text style={[styles.actionLabel, { color: "#00C9A7" }]}>MCQ Practice</Text>
              <Text style={[styles.actionCount, { color: "#00C9A7" + "aa" }]}>{note.mcqs?.length} questions</Text>
            </Pressable>
          )}
          {hasFlashcards && (
            <Pressable
              style={({ pressed }) => [styles.actionCard, { backgroundColor: "#FF9800" + "22", borderColor: "#FF9800" + "44", opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(`/flashcards?noteId=${note.id}`)}
            >
              <Feather name="layers" size={24} color="#FF9800" />
              <Text style={[styles.actionLabel, { color: "#FF9800" }]}>Flashcards</Text>
              <Text style={[styles.actionCount, { color: "#FF9800" + "aa" }]}>{note.flashcards?.length} cards</Text>
            </Pressable>
          )}
          {hasViva && (
            <Pressable
              style={({ pressed }) => [styles.actionCard, { backgroundColor: "#E91E63" + "22", borderColor: "#E91E63" + "44", opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(`/viva?noteId=${note.id}`)}
            >
              <Feather name="mic" size={24} color="#E91E63" />
              <Text style={[styles.actionLabel, { color: "#E91E63" }]}>Viva Practice</Text>
              <Text style={[styles.actionCount, { color: "#E91E63" + "aa" }]}>{note.vivaQuestions?.length} questions</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noteInfo: { margin: 16, borderRadius: 14, borderWidth: 1, padding: 16 },
  noteTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 10 },
  noteMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  subjectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  subjectText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  noteDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  modeTabs: { marginBottom: 8 },
  modeTab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  modeTabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  content: { paddingHorizontal: 16 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 14 },
  bulletRow: { flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "flex-start" },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  examText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  keywordsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  keyword: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  keywordText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", gap: 6 },
  actionLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  actionCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  notFoundText: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  backBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  noSummary: { borderRadius: 14, borderWidth: 1, padding: 30, alignItems: "center", gap: 10 },
  noSummaryText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
