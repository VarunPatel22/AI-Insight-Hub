import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
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

const TABS = ["Notes", "PYQ", "Stats"] as const;
type Tab = (typeof TABS)[number];

export default function SubjectDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSubjectById, getNotesForSubject, pyqAnalyses, deleteNote, deletePYQ } = useNotes();
  const [activeTab, setActiveTab] = useState<Tab>("Notes");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const subject = id ? getSubjectById(id) : undefined;
  const subjectNotes = id ? getNotesForSubject(id) : [];
  const subjectPYQs = pyqAnalyses.filter((p) => p.subjectId === id);

  if (!subject) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="alert-circle" size={44} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Subject not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const totalMCQs = subjectNotes.reduce((sum, n) => sum + (n.mcqs?.length ?? 0), 0);
  const totalFlashcards = subjectNotes.reduce((sum, n) => sum + (n.flashcards?.length ?? 0), 0);
  const totalTopics = subjectNotes.reduce((sum, n) => sum + (n.topics?.length ?? 0), 0);
  const totalViva = subjectNotes.reduce((sum, n) => sum + (n.vivaQuestions?.length ?? 0), 0);

  const importanceColor = (imp: string) => {
    if (imp === "very_important") return "#EF4444";
    if (imp === "high_probability") return "#FF9800";
    if (imp === "most_repeated") return "#6C63FF";
    return "#00C9A7";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[subject.color + "33", subject.color + "11", colors.background]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerNav}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.navBtn, { backgroundColor: colors.card + "aa" }]}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/upload?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.name)}`)}
            style={[styles.navBtn, { backgroundColor: subject.color }]}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.subjectInfo}>
          <Text style={styles.subjectIcon}>{subject.icon}</Text>
          <Text style={[styles.subjectName, { color: colors.foreground }]}>{subject.name}</Text>
          <View style={styles.subjectMeta}>
            <View style={[styles.metaBadge, { backgroundColor: subject.color + "33" }]}>
              <Text style={[styles.metaBadgeText, { color: subject.color }]}>
                {subjectNotes.length} note{subjectNotes.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: subject.color + "33" }]}>
              <Text style={[styles.metaBadgeText, { color: subject.color }]}>
                {subjectPYQs.length} PYQ
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: subject.color + "22" }]}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, activeTab === tab && { backgroundColor: subject.color }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === tab ? "#fff" : subject.color }]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      {activeTab === "Notes" && (
        <FlatList
          data={subjectNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <NoteCard note={item} onDelete={deleteNote} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="book-open" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No notes yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Upload notes for this subject to get started
              </Text>
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: subject.color }]}
                onPress={() => router.push(`/upload?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.name)}`)}
              >
                <Feather name="upload" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Upload Notes</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {activeTab === "PYQ" && (
        <FlatList
          data={subjectPYQs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: pyq }) => (
            <Pressable
              style={({ pressed }) => [styles.pyqCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push(`/pyq-result?pyqId=${pyq.id}`)}
            >
              <View style={styles.pyqCardRow}>
                <View style={[styles.pyqIcon, { backgroundColor: subject.color + "22" }]}>
                  <Feather name="file-text" size={20} color={subject.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pyqTitle, { color: colors.foreground }]}>{pyq.fileName}</Text>
                  <Text style={[styles.pyqDate, { color: colors.mutedForeground }]}>
                    {new Date(pyq.createdAt).toLocaleDateString()} · {pyq.repeatedQuestions.length} repeated questions
                  </Text>
                </View>
                <Pressable onPress={() => deletePYQ(pyq.id)} hitSlop={10}>
                  <Feather name="trash-2" size={15} color={colors.mutedForeground} />
                </Pressable>
              </View>
              {pyq.repeatedQuestions[0] && (
                <View style={[styles.topQ, { backgroundColor: importanceColor(pyq.repeatedQuestions[0].importance) + "11" }]}>
                  <View style={[styles.badge, { backgroundColor: importanceColor(pyq.repeatedQuestions[0].importance) }]}>
                    <Text style={styles.badgeText}>
                      {pyq.repeatedQuestions[0].importance.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <Text style={[styles.topQText, { color: colors.foreground }]} numberOfLines={2}>
                    {pyq.repeatedQuestions[0].question}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="file-text" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No PYQ analyses</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Analyze previous year papers to predict your exam
              </Text>
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: subject.color }]}
                onPress={() => router.push("/(tabs)/pyq")}
              >
                <Feather name="file-text" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Analyze Paper</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {activeTab === "Stats" && (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}>
          <View style={styles.statsGrid}>
            {[
              { label: "Notes", value: subjectNotes.length, color: subject.color, icon: "book-open" as const },
              { label: "Topics", value: totalTopics, color: "#6C63FF", icon: "list" as const },
              { label: "MCQs", value: totalMCQs, color: "#00C9A7", icon: "check-circle" as const },
              { label: "Flashcards", value: totalFlashcards, color: "#FF9800", icon: "layers" as const },
              { label: "Viva Qs", value: totalViva, color: "#E91E63", icon: "mic" as const },
              { label: "PYQ Papers", value: subjectPYQs.length, color: "#FF6B6B", icon: "file-text" as const },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + "22" }]}>
                  <Feather name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Recent notes topics */}
          {subjectNotes.some((n) => n.topics && n.topics.length > 0) && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Topics Covered</Text>
              {subjectNotes.flatMap((n) => n.topics ?? []).map((topic, i) => (
                <View key={i} style={[styles.topicItem, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: subject.color }]}>
                  <Text style={[styles.topicTitle, { color: colors.foreground }]}>{topic.title}</Text>
                  <Text style={[styles.topicSummary, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {topic.summary}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  navBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  subjectInfo: { alignItems: "center", gap: 8, marginBottom: 20 },
  subjectIcon: { fontSize: 40 },
  subjectName: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  subjectMeta: { flexDirection: "row", gap: 8 },
  metaBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  metaBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tabBar: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4, marginBottom: 0 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
  tabBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 10 },
  pyqCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  pyqCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pyqIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  pyqTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  pyqDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  topQ: { borderRadius: 10, padding: 10, gap: 6 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", textTransform: "capitalize" },
  topQText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 10, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  emptyBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 10 },
  topicItem: { borderRadius: 12, borderWidth: 1, borderLeftWidth: 3, padding: 12, marginBottom: 8 },
  topicTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  topicSummary: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  notFoundText: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  backBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
