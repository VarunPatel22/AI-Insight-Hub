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
  { id: "summarize", label: "Summarize", icon: "file-text" as const, color: "#6C63FF", desc: "Smart summaries" },
  { id: "mcq", label: "MCQ Quiz", icon: "check-circle" as const, color: "#00C9A7", desc: "Practice questions" },
  { id: "flashcards", label: "Flashcards", icon: "layers" as const, color: "#FF9800", desc: "Memory cards" },
  { id: "viva", label: "Viva Prep", icon: "mic" as const, color: "#E91E63", desc: "Oral questions" },
];

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Computer", "Economics"];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, streak } = useNotes();

  const recentNotes = notes.slice(0, 5);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

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

          {/* Upload CTA */}
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

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Notes</Text>
              <Pressable onPress={() => router.push("/(tabs)/notes")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {recentNotes.map((note) => (
                <View key={note.id} style={{ marginRight: 10 }}>
                  <NoteCard note={note} compact />
                </View>
              ))}
            </ScrollView>
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
                    router.push(`/${tool.id === "summarize" ? "summary" : tool.id}?noteId=${notes[0].id}`);
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

        {/* Subject Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subject Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUBJECTS.map((subject) => (
              <Pressable
                key={subject}
                style={[styles.subjectChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => router.push("/(tabs)/notes")}
              >
                <Text style={[styles.subjectChipText, { color: colors.foreground }]}>{subject}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Empty state */}
        {notes.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="book-open" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No notes yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Upload your first note to get started with AI-powered learning
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/upload")}
            >
              <Text style={styles.emptyBtnText}>Upload Notes</Text>
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
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  streakText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  streakLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: 14,
  },
  uploadBtnText: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  horizontalScroll: { marginHorizontal: -4 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  toolCard: {
    width: "47%", borderRadius: 14, borderWidth: 1, padding: 14,
  },
  toolIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  toolLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toolDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  subjectChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  subjectChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  emptyBox: {
    margin: 20, borderRadius: 16, borderWidth: 1,
    padding: 30, alignItems: "center", gap: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
