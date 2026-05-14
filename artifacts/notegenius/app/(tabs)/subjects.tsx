import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

export default function SubjectsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subjects, notes, pyqAnalyses, deleteSubject } = useNotes();
  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const filtered = subjects.filter((s) =>
    search.trim() === "" || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStats = (subjectId: string) => {
    const subjectNotes = notes.filter((n) => n.subjectId === subjectId);
    const pyqs = pyqAnalyses.filter((p) => p.subjectId === subjectId);
    const totalMCQs = subjectNotes.reduce((sum, n) => sum + (n.mcqs?.length ?? 0), 0);
    return { noteCount: subjectNotes.length, pyqCount: pyqs.length, mcqCount: totalMCQs };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>My Subjects</Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/create-subject")}
          >
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            placeholder="Search subjects..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: subject }) => {
          const stats = getStats(subject.id);
          return (
            <Pressable
              style={({ pressed }) => [styles.subjectCard, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push(`/subject/${subject.id}`)}
              onLongPress={() => {
                deleteSubject(subject.id);
              }}
            >
              <LinearGradient
                colors={[subject.color + "33", subject.color + "11"]}
                style={[styles.subjectCardInner, { borderColor: subject.color + "44" }]}
              >
                <Text style={styles.subjectIcon}>{subject.icon}</Text>
                <Text style={[styles.subjectName, { color: colors.foreground }]} numberOfLines={2}>
                  {subject.name}
                </Text>
                <View style={styles.subjectStats}>
                  <View style={styles.subjectStat}>
                    <Feather name="book-open" size={11} color={subject.color} />
                    <Text style={[styles.subjectStatText, { color: subject.color }]}>
                      {stats.noteCount}
                    </Text>
                  </View>
                  {stats.pyqCount > 0 && (
                    <View style={styles.subjectStat}>
                      <Feather name="file-text" size={11} color={subject.color} />
                      <Text style={[styles.subjectStatText, { color: subject.color }]}>
                        {stats.pyqCount} PYQ
                      </Text>
                    </View>
                  )}
                </View>
                <Pressable
                  style={[styles.addNoteBtn, { backgroundColor: subject.color }]}
                  onPress={() => router.push(`/upload?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.name)}`)}
                >
                  <Feather name="plus" size={12} color="#fff" />
                  <Text style={styles.addNoteBtnText}>Add Note</Text>
                </Pressable>
              </LinearGradient>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="book" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {subjects.length === 0 ? "No subjects yet" : "No subjects found"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {subjects.length === 0
                ? "Create a subject to organize your notes and track progress"
                : "Try a different search term"}
            </Text>
            {subjects.length === 0 && (
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/create-subject")}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Create First Subject</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { padding: 16, gap: 12 },
  subjectCard: { flex: 1 },
  subjectCardInner: {
    borderRadius: 16, borderWidth: 1.5, padding: 16,
    alignItems: "flex-start", gap: 8, minHeight: 160,
  },
  subjectIcon: { fontSize: 28, marginBottom: 4 },
  subjectName: { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 20 },
  subjectStats: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  subjectStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  subjectStatText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  addNoteBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 4,
  },
  addNoteBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 10, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  emptyBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
