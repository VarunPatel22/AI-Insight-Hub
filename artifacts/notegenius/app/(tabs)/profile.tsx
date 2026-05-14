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
  const { notes, streak, deleteNote } = useNotes();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const totalMCQs = notes.reduce((sum, n) => sum + (n.mcqs?.length ?? 0), 0);
  const totalFlashcards = notes.reduce((sum, n) => sum + (n.flashcards?.length ?? 0), 0);
  const summarizedNotes = notes.filter((n) => !!n.summary).length;

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notes",
      "This will permanently delete all your saved notes, summaries, MCQs, and flashcards. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            for (const note of notes) {
              await deleteNote(note.id);
            }
          },
        },
      ]
    );
  };

  const STATS = [
    { label: "Notes", value: notes.length, icon: "book-open" as const, color: "#6C63FF" },
    { label: "Summaries", value: summarizedNotes, icon: "file-text" as const, color: "#00C9A7" },
    { label: "MCQs", value: totalMCQs, icon: "check-circle" as const, color: "#FF9800" },
    { label: "Flashcards", value: totalFlashcards, icon: "layers" as const, color: "#E91E63" },
  ];

  const MENU_ITEMS = [
    {
      section: "Study",
      items: [
        { label: "Study Streak", value: `${streak} days`, icon: "zap" as const, color: "#FF9800" },
        { label: "Total Notes", value: `${notes.length}`, icon: "book-open" as const, color: "#6C63FF" },
        { label: "AI Generations", value: `${summarizedNotes}`, icon: "cpu" as const, color: "#00C9A7" },
      ],
    },
    {
      section: "App",
      items: [
        { label: "About NoteGenius AI", value: "v1.0.0", icon: "info" as const, color: "#9CA3AF" },
      ],
    },
    {
      section: "Data",
      items: [
        { label: "Clear All Notes", value: "", icon: "trash-2" as const, color: "#EF4444", danger: true },
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
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
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
                    if (item.danger) handleClearAll();
                  }}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
                    <Feather name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: item.danger ? "#EF4444" : colors.foreground }]}>
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
          NoteGenius AI — Powered by OpenAI
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
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  menuCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  menuValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 24, marginBottom: 8 },
});
