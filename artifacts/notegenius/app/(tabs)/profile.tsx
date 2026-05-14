import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, subjects, pyqAnalyses, streak, deleteNote, deleteSubject, deletePYQ } = useNotes();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const totalMCQs = notes.reduce((sum, n) => sum + (n.mcqs?.length ?? 0), 0);
  const totalFlashcards = notes.reduce((sum, n) => sum + (n.flashcards?.length ?? 0), 0);
  const totalViva = notes.reduce((sum, n) => sum + (n.vivaQuestions?.length ?? 0), 0);
  const summarizedNotes = notes.filter((n) => !!n.summary).length;
  const totalTopics = notes.reduce((sum, n) => sum + (n.topics?.length ?? 0), 0);

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all notes, subjects, and PYQ analyses. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            for (const note of notes) await deleteNote(note.id);
            for (const subject of subjects) await deleteSubject(subject.id);
            for (const pyq of pyqAnalyses) await deletePYQ(pyq.id);
          },
        },
      ]
    );
  };

  const STATS = [
    { label: "Notes", value: notes.length, icon: "book-open" as const, color: "#6C63FF" },
    { label: "Subjects", value: subjects.length, icon: "book" as const, color: "#00C9A7" },
    { label: "PYQ Papers", value: pyqAnalyses.length, icon: "file-text" as const, color: "#FF9800" },
    { label: "Streak", value: streak, icon: "zap" as const, color: "#E91E63", suffix: "d" },
  ];

  const STUDY_STATS = [
    { label: "Topics Identified", value: totalTopics, color: "#6C63FF" },
    { label: "MCQs Generated", value: totalMCQs, color: "#00C9A7" },
    { label: "Flashcards", value: totalFlashcards, color: "#FF9800" },
    { label: "Viva Questions", value: totalViva, color: "#E91E63" },
    { label: "Summaries", value: summarizedNotes, color: "#2196F3" },
  ];

  const MENU_ITEMS = [
    {
      section: "Study Stats",
      items: [
        { label: "Study Streak", value: `${streak} days`, icon: "zap" as const, color: "#FF9800" },
        { label: "Total Notes", value: `${notes.length}`, icon: "book-open" as const, color: "#6C63FF" },
        { label: "Subjects Created", value: `${subjects.length}`, icon: "book" as const, color: "#00C9A7" },
        { label: "PYQ Papers Analyzed", value: `${pyqAnalyses.length}`, icon: "file-text" as const, color: "#FF9800" },
        { label: "AI Generations", value: `${summarizedNotes}`, icon: "cpu" as const, color: "#9C27B0" },
      ],
    },
    {
      section: "App",
      items: [
        { label: "About NoteGenius AI", value: "v2.0.0", icon: "info" as const, color: "#9CA3AF" },
        { label: "Powered by OpenAI GPT", value: "gpt-5.4", icon: "zap" as const, color: "#9CA3AF" },
      ],
    },
    {
      section: "Data",
      items: [
        { label: "Clear All Data", value: "", icon: "trash-2" as const, color: "#EF4444", danger: true },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}>
            <Feather name="user" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>Student</Text>
          <View style={[styles.streakPill, { backgroundColor: "#FF9800" + "22" }]}>
            <Feather name="zap" size={12} color="#FF9800" />
            <Text style={[styles.streakPillText, { color: "#FF9800" }]}>{streak} day streak</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={stat.icon} size={18} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}{stat.suffix ?? ""}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* AI Activity */}
        <View style={[styles.aiActivity, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.aiActivityTitle, { color: colors.foreground }]}>AI Activity</Text>
          <View style={styles.aiActivityGrid}>
            {STUDY_STATS.map((stat) => (
              <View key={stat.label} style={styles.aiStat}>
                <Text style={[styles.aiStatValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.aiStatLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_ITEMS.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.section.toUpperCase()}</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    if ("danger" in item && item.danger) handleClearAll();
                  }}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
                    <Feather name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: "danger" in item && item.danger ? "#EF4444" : colors.foreground }]}>
                    {item.label}
                  </Text>
                  {item.value ? (
                    <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{item.value}</Text>
                  ) : (
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          NoteGenius AI v2.0 — Your AI Study Companion
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingBottom: 8, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  streakPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 6 },
  streakPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 16 },
  statCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  aiActivity: { margin: 16, borderRadius: 16, borderWidth: 1, padding: 16 },
  aiActivityTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  aiActivityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  aiStat: { width: "30%", alignItems: "center", gap: 2 },
  aiStatValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  aiStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  menuCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  menuValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 24, marginBottom: 8 },
});
