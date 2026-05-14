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
  { id: "topics", label: "Topics", icon: "list" as const },
  { id: "bullets", label: "Key Points", icon: "circle" as const },
  { id: "exam", label: "Exam Notes", icon: "book" as const },
  { id: "simple", label: "Simple Mode", icon: "smile" as const },
  { id: "keywords", label: "Keywords", icon: "tag" as const },
];

export default function SummaryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { getNoteById } = useNotes();
  const [activeMode, setActiveMode] = useState("topics");

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
  const topics = note.topics ?? [];
  const hasMCQ = (note.mcqs?.length ?? 0) > 0;
  const hasFlashcards = (note.flashcards?.length ?? 0) > 0;
  const hasViva = (note.vivaQuestions?.length ?? 0) > 0;

  const TOPIC_COLORS = ["#6C63FF", "#00C9A7", "#FF9800", "#E91E63", "#2196F3"];

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
          {topics.length > 0 && (
            <View style={[styles.topicCountBadge, { backgroundColor: "#00C9A722" }]}>
              <Feather name="list" size={11} color="#00C9A7" />
              <Text style={[styles.topicCountText, { color: "#00C9A7" }]}>{topics.length} topics</Text>
            </View>
          )}
        </View>
      </View>

      {/* Mode Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.modeTabs}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
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

        {/* Topics View */}
        {activeMode === "topics" && (
          <View style={styles.topicsContainer}>
            {topics.length === 0 ? (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="info" size={20} color={colors.mutedForeground} />
                <Text style={[styles.noTopicsText, { color: colors.mutedForeground }]}>
                  No topics detected — the note may not have clear section headings. Try the other views.
                </Text>
              </View>
            ) : (
              topics.map((topic, i) => {
                const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
                return (
                  <View key={i} style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: color, borderLeftWidth: 4 }]}>
                    <View style={styles.topicHeader}>
                      <View style={[styles.topicNumBadge, { backgroundColor: color }]}>
                        <Text style={styles.topicNum}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.topicTitle, { color: colors.foreground }]}>{topic.title}</Text>
                    </View>

                    <Text style={[styles.topicSummary, { color: colors.foreground }]}>{topic.summary}</Text>

                    {topic.keyPoints.length > 0 && (
                      <View style={styles.keyPointsBlock}>
                        <Text style={[styles.blockTitle, { color: color }]}>Key Points</Text>
                        {topic.keyPoints.map((kp, j) => (
                          <View key={j} style={styles.bulletRow}>
                            <View style={[styles.bulletDot, { backgroundColor: color }]} />
                            <Text style={[styles.bulletText, { color: colors.foreground }]}>{kp}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {topic.definitions.length > 0 && (
                      <View style={[styles.definitionsBlock, { backgroundColor: color + "11", borderColor: color + "33" }]}>
                        <Text style={[styles.blockTitle, { color: color }]}>Definitions</Text>
                        {topic.definitions.map((def, j) => (
                          <Text key={j} style={[styles.definitionText, { color: colors.foreground }]}>• {def}</Text>
                        ))}
                      </View>
                    )}

                    {topic.formulas.length > 0 && (
                      <View style={[styles.formulasBlock, { backgroundColor: "#FF980011", borderColor: "#FF980033" }]}>
                        <Text style={[styles.blockTitle, { color: "#FF9800" }]}>Formulas</Text>
                        {topic.formulas.map((formula, j) => (
                          <Text key={j} style={[styles.formulaText, { color: colors.foreground }]}>{formula}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Bullet Points */}
        {activeMode === "bullets" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {!summary ? (
              <Text style={[styles.noSummaryText, { color: colors.mutedForeground }]}>No summary available</Text>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Key Points</Text>
                {summary.bullets.map((bullet, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.bulletText, { color: colors.foreground }]}>{bullet}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Exam Notes */}
        {activeMode === "exam" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {!summary ? (
              <Text style={[styles.noSummaryText, { color: colors.mutedForeground }]}>No summary available</Text>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Exam Notes</Text>
                <Text style={[styles.examText, { color: colors.foreground }]}>{summary.examNotes}</Text>
              </>
            )}
          </View>
        )}

        {/* Simple Explanation */}
        {activeMode === "simple" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {!summary ? (
              <Text style={[styles.noSummaryText, { color: colors.mutedForeground }]}>No summary available</Text>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Simple Explanation</Text>
                <Text style={[styles.examText, { color: colors.foreground }]}>{summary.simpleExplanation}</Text>
              </>
            )}
          </View>
        )}

        {/* Keywords */}
        {activeMode === "keywords" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {!summary ? (
              <Text style={[styles.noSummaryText, { color: colors.mutedForeground }]}>No summary available</Text>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Important Keywords</Text>
                <View style={styles.keywordsWrap}>
                  {summary.keywords.map((kw, i) => (
                    <View key={i} style={[styles.keyword, { backgroundColor: colors.primary + "22" }]}>
                      <Text style={[styles.keywordText, { color: colors.primary }]}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Practice Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Practice & Review</Text>
        <View style={styles.actionsGrid}>
          {hasMCQ && (
            <Pressable
              style={({ pressed }) => [styles.actionCard, { backgroundColor: "#00C9A722", borderColor: "#00C9A744", opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(`/mcq?noteId=${note.id}`)}
            >
              <Feather name="check-circle" size={24} color="#00C9A7" />
              <Text style={[styles.actionLabel, { color: "#00C9A7" }]}>MCQ Practice</Text>
              <Text style={[styles.actionCount, { color: "#00C9A7aa" }]}>{note.mcqs?.length} questions</Text>
            </Pressable>
          )}
          {hasFlashcards && (
            <Pressable
              style={({ pressed }) => [styles.actionCard, { backgroundColor: "#FF980022", borderColor: "#FF980044", opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(`/flashcards?noteId=${note.id}`)}
            >
              <Feather name="layers" size={24} color="#FF9800" />
              <Text style={[styles.actionLabel, { color: "#FF9800" }]}>Flashcards</Text>
              <Text style={[styles.actionCount, { color: "#FF9800aa" }]}>{note.flashcards?.length} cards</Text>
            </Pressable>
          )}
          {hasViva && (
            <Pressable
              style={({ pressed }) => [styles.actionCard, { backgroundColor: "#E91E6322", borderColor: "#E91E6344", opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(`/viva?noteId=${note.id}`)}
            >
              <Feather name="mic" size={24} color="#E91E63" />
              <Text style={[styles.actionLabel, { color: "#E91E63" }]}>Viva Practice</Text>
              <Text style={[styles.actionCount, { color: "#E91E63aa" }]}>{note.vivaQuestions?.length} questions</Text>
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
  noteMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  subjectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  subjectText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  noteDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  topicCountBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  topicCountText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  modeTabs: { marginBottom: 8 },
  modeTab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  modeTabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  content: { paddingHorizontal: 16 },
  topicsContainer: { gap: 12, marginBottom: 20 },
  topicCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  topicHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  topicNumBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  topicNum: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  topicTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold" },
  topicSummary: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  keyPointsBlock: { gap: 6 },
  blockTitle: { fontSize: 12, fontFamily: "Inter_700Bold", marginBottom: 4 },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  definitionsBlock: { borderRadius: 10, borderWidth: 1, padding: 10, gap: 4 },
  definitionText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  formulasBlock: { borderRadius: 10, borderWidth: 1, padding: 10, gap: 4 },
  formulaText: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontStyle: "italic" },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  examText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  keywordsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  keyword: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  keywordText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", gap: 6 },
  actionLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  actionCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  noTopicsText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginTop: 8 },
  noSummaryText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  notFoundText: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  backBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
