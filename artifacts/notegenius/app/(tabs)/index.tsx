import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import NoteCard from "@/components/NoteCard";
import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

const AI_TOOLS = [
  { id: "summary", label: "Summarize", icon: "file-text" as const, color: "#6C63FF", desc: "Smart topic summaries" },
  { id: "mcq", label: "MCQ Quiz", icon: "check-circle" as const, color: "#00C9A7", desc: "Practice questions" },
  { id: "flashcards", label: "Flashcards", icon: "layers" as const, color: "#FF9800", desc: "Memory cards" },
  { id: "viva", label: "Viva Prep", icon: "mic" as const, color: "#E91E63", desc: "Oral questions" },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, subjects, pyqAnalyses, streak } = useNotes();

  const recentNotes = notes.slice(0, 3);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const totalMCQs = notes.reduce((sum, n) => sum + (n.mcqs?.length ?? 0), 0);
  const totalFlashcards = notes.reduce((sum, n) => sum + (n.flashcards?.length ?? 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const STATS = [
    { label: "Notes", value: notes.length, icon: "book-open" as const, color: "#6C63FF" },
    { label: "Subjects", value: subjects.length, icon: "book" as const, color: "#00C9A7" },
    { label: "MCQs", value: totalMCQs, icon: "check-circle" as const, color: "#FF9800" },
    { label: "Streak", value: streak, icon: "zap" as const, color: "#E91E63", suffix: "d" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={["#1A1040", "#0B0B1A"]}
          style={[styles.header, { paddingTop: topPad + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting()}</Text>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>NoteGenius AI</Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="zap" size={14} color="#FF9800" />
              <Text style={[styles.streakText, { color: colors.foreground }]}>{streak}</Text>
              <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>day streak</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.uploadBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push("/upload")}
          >
            <Feather name="upload" size={18} color="#fff" />
            <Text style={styles.uploadBtnText}>Upload Notes</Text>
            <Feather name="chevron-right" size={16} color="#ffffff88" />
          </Pressable>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + "22" }]}>
                <Feather name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stat.value}{stat.suffix ?? ""}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* PYQ Analyzer Banner */}
        <Pressable
          style={({ pressed }) => [
            styles.pyqBanner,
            { backgroundColor: colors.card, borderColor: "#6C63FF44", opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.push("/(tabs)/pyq")}
        >
          <LinearGradient
            colors={["#6C63FF22", "#00C9A722"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pyqBannerGrad}
          >
            <View style={[styles.pyqBannerIcon, { backgroundColor: "#6C63FF33" }]}>
              <Feather name="file-text" size={24} color="#6C63FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pyqBannerTitle, { color: colors.foreground }]}>PYQ Analyzer</Text>
              <Text style={[styles.pyqBannerDesc, { color: colors.mutedForeground }]}>
                Analyze past papers • Predict exam questions
              </Text>
              {pyqAnalyses.length > 0 && (
                <Text style={[styles.pyqBannerCount, { color: "#6C63FF" }]}>
                  {pyqAnalyses.length} paper{pyqAnalyses.length > 1 ? "s" : ""} analyzed
                </Text>
              )}
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </LinearGradient>
        </Pressable>

        {/* Quick Subject Access */}
        {subjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Subjects</Text>
              <Pressable onPress={() => router.push("/(tabs)/subjects")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {subjects.slice(0, 6).map((subject) => {
                const subjectNotes = notes.filter((n) => n.subjectId === subject.id);
                return (
                  <Pressable
                    key={subject.id}
                    style={({ pressed }) => [
                      styles.subjectPill,
                      { backgroundColor: subject.color + "22", borderColor: subject.color + "44", opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={() => router.push(`/subject/${subject.id}`)}
                  >
                    <Text style={styles.subjectPillIcon}>{subject.icon}</Text>
                    <View>
                      <Text style={[styles.subjectPillName, { color: subject.color }]}>{subject.name}</Text>
                      <Text style={[styles.subjectPillCount, { color: subject.color + "99" }]}>
                        {subjectNotes.length} note{subjectNotes.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Notes</Text>
              <Pressable onPress={() => router.push("/(tabs)/notes")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} compact />
            ))}
          </View>
        )}

        {/* AI Tools Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Tools</Text>
          <View style={styles.toolsGrid}>
            {AI_TOOLS.map((tool) => (
              <Pressable
                key={tool.id}
                style={({ pressed }) => [
                  styles.toolCard,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => {
                  if (notes.length === 0) {
                    router.push("/upload");
                  } else {
                    router.push(`/${tool.id}?noteId=${notes[0].id}`);
                  }
                }}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + "22" }]}>
                  <Feather name={tool.icon} size={22} color={tool.color} />
                </View>
                <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
                <Text style={[styles.toolDesc, { color: colors.mutedForeground }]}>{tool.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Empty state */}
        {notes.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="book-open" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Start your study journey</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Upload notes to get AI summaries, MCQs, flashcards, and more
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/upload")}
            >
              <Text style={styles.emptyBtnText}>Upload Your First Note</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginTop: 2 },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  streakText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  streakLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14,
  },
  uploadBtnText: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  statsGrid: { flexDirection: "row", padding: 16, gap: 10 },
  statCard: {
    flex: 1, borderRadius: 14, borderWidth: 1, padding: 12,
    alignItems: "center", gap: 4,
  },
  statIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  pyqBanner: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1.5, overflow: "hidden", marginBottom: 4 },
  pyqBannerGrad: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  pyqBannerIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  pyqBannerTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  pyqBannerDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  pyqBannerCount: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  subjectPill: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, marginRight: 10,
  },
  subjectPillIcon: { fontSize: 20 },
  subjectPillName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  subjectPillCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  toolCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14 },
  toolIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  toolLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toolDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyBox: { margin: 16, borderRadius: 16, borderWidth: 1, padding: 30, alignItems: "center", gap: 8, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
