import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

const SECTIONS = ["Repeated", "Topics", "Predictions", "Top Questions"] as const;
type Section = (typeof SECTIONS)[number];

export default function PYQResultScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pyqId } = useLocalSearchParams<{ pyqId: string }>();
  const { getPYQById } = useNotes();
  const [activeSection, setActiveSection] = useState<Section>("Repeated");

  const topPad = insets.top;
  const bottomPad = insets.bottom;

  const pyq = pyqId ? getPYQById(pyqId) : undefined;

  if (!pyq) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="alert-circle" size={44} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Analysis not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.goBackBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.goBackBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const importanceColor = (imp: string) => {
    if (imp === "very_important") return "#EF4444";
    if (imp === "high_probability") return "#FF9800";
    if (imp === "most_repeated") return "#6C63FF";
    return "#00C9A7";
  };

  const importanceLabel = (imp: string) => {
    const map: Record<string, string> = {
      very_important: "Very Important",
      high_probability: "High Probability",
      most_repeated: "Most Repeated",
      frequently_asked: "Frequently Asked",
    };
    return map[imp] ?? imp;
  };

  const typeColor = (type: string) => {
    if (type === "long") return "#6C63FF";
    if (type === "short") return "#00C9A7";
    return "#FF9800";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#1A1040", "#0B0B1A"]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerNav}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={[styles.navBtn, { backgroundColor: "#ffffff11" }]}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerFileName} numberOfLines={1}>{pyq.fileName}</Text>
            <Text style={styles.headerMeta}>
              {pyq.subject ?? "General"} · {new Date(pyq.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatNum, { color: "#EF4444" }]}>{pyq.repeatedQuestions.length}</Text>
            <Text style={styles.headerStatLabel}>Repeated Qs</Text>
          </View>
          <View style={[styles.headerStatDivider, { backgroundColor: "#ffffff22" }]} />
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatNum, { color: "#FF9800" }]}>{pyq.importantTopics.length}</Text>
            <Text style={styles.headerStatLabel}>Hot Topics</Text>
          </View>
          <View style={[styles.headerStatDivider, { backgroundColor: "#ffffff22" }]} />
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatNum, { color: "#00C9A7" }]}>{pyq.examPredictions.length}</Text>
            <Text style={styles.headerStatLabel}>Predictions</Text>
          </View>
          <View style={[styles.headerStatDivider, { backgroundColor: "#ffffff22" }]} />
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatNum, { color: "#6C63FF" }]}>{pyq.topQuestions.length}</Text>
            <Text style={styles.headerStatLabel}>Top Qs</Text>
          </View>
        </View>

        {/* Section Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionTabs} contentContainerStyle={{ gap: 8 }}>
          {SECTIONS.map((sec) => (
            <Pressable
              key={sec}
              style={[styles.sectionTab, activeSection === sec && styles.sectionTabActive]}
              onPress={() => setActiveSection(sec)}
            >
              <Text style={[styles.sectionTabText, { color: activeSection === sec ? "#fff" : "#ffffff88" }]}>
                {sec}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Repeated Questions */}
        {activeSection === "Repeated" && (
          <View style={styles.section}>
            {pyq.repeatedQuestions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No repeated questions detected</Text>
              </View>
            ) : (
              pyq.repeatedQuestions.map((q, i) => {
                const color = importanceColor(q.importance);
                return (
                  <View key={i} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: color, borderLeftWidth: 4 }]}>
                    <View style={styles.questionHeader}>
                      <View style={[styles.importanceBadge, { backgroundColor: color }]}>
                        <Text style={styles.importanceBadgeText}>{importanceLabel(q.importance)}</Text>
                      </View>
                      <View style={styles.questionMeta}>
                        <View style={[styles.metaPill, { backgroundColor: "#ffffff11" }]}>
                          <Feather name="repeat" size={11} color={color} />
                          <Text style={[styles.metaPillText, { color: color }]}>{q.count}x</Text>
                        </View>
                        <View style={[styles.metaPill, { backgroundColor: "#ffffff11" }]}>
                          <Feather name="award" size={11} color={colors.mutedForeground} />
                          <Text style={[styles.metaPillText, { color: colors.mutedForeground }]}>{q.avgMarks} marks</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.questionText, { color: colors.foreground }]}>{q.question}</Text>
                    <View style={[styles.topicTag, { backgroundColor: color + "22" }]}>
                      <Feather name="tag" size={10} color={color} />
                      <Text style={[styles.topicTagText, { color: color }]}>{q.topic}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Important Topics */}
        {activeSection === "Topics" && (
          <View style={styles.section}>
            {pyq.importantTopics.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No topics detected</Text>
              </View>
            ) : (
              <>
                {/* Table Header */}
                <View style={[styles.tableHeader, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground, flex: 2 }]}>Topic</Text>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground }]}>Times</Text>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground }]}>Marks</Text>
                  <Text style={[styles.tableHeaderText, { color: colors.mutedForeground }]}>Level</Text>
                </View>
                {pyq.importantTopics.map((topic, i) => {
                  const isTop = i < 3;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        {
                          backgroundColor: isTop ? "#6C63FF11" : colors.card,
                          borderColor: isTop ? "#6C63FF33" : colors.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: 6 }}>
                        {isTop && <Feather name="star" size={11} color="#6C63FF" />}
                        <Text style={[styles.tableCell, { color: colors.foreground }]} numberOfLines={2}>
                          {topic.topic}
                        </Text>
                      </View>
                      <Text style={[styles.tableCell, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>
                        {topic.repetitions}x
                      </Text>
                      <Text style={[styles.tableCell, { color: "#FF9800" }]}>{topic.avgMarks}</Text>
                      <Text style={[styles.tableCell, { color: "#6C63FF", fontSize: 10 }]} numberOfLines={1}>
                        {topic.importance}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        {/* Exam Predictions */}
        {activeSection === "Predictions" && (
          <View style={styles.section}>
            <View style={[styles.predictionBanner, { backgroundColor: "#6C63FF11", borderColor: "#6C63FF33" }]}>
              <Feather name="trending-up" size={18} color="#6C63FF" />
              <Text style={[styles.predictionBannerText, { color: "#6C63FF" }]}>
                AI-predicted questions based on past paper patterns
              </Text>
            </View>
            {pyq.examPredictions.map((prediction, i) => (
              <View
                key={i}
                style={[styles.predictionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.predictionNum, { backgroundColor: "#6C63FF" }]}>
                  <Text style={styles.predictionNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.predictionText, { color: colors.foreground }]}>{prediction}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Questions */}
        {activeSection === "Top Questions" && (
          <View style={styles.section}>
            {["long", "short", "definition"].map((type) => {
              const questions = pyq.topQuestions.filter((q) => q.type === type);
              if (questions.length === 0) return null;
              const color = typeColor(type);
              return (
                <View key={type}>
                  <View style={styles.typeHeader}>
                    <View style={[styles.typeTag, { backgroundColor: color }]}>
                      <Text style={styles.typeTagText}>{type.charAt(0).toUpperCase() + type.slice(1)} Questions</Text>
                    </View>
                  </View>
                  {questions.map((q, i) => (
                    <View
                      key={i}
                      style={[styles.topQuestionCard, { backgroundColor: colors.card, borderColor: color + "44" }]}
                    >
                      <View style={styles.topQuestionRow}>
                        <Text style={[styles.topQuestionText, { color: colors.foreground }]}>{q.question}</Text>
                        <View style={[styles.marksBadge, { backgroundColor: color + "22" }]}>
                          <Text style={[styles.marksBadgeText, { color: color }]}>{q.marks}M</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerNav: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  navBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  headerFileName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  headerMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#ffffff77", marginTop: 2 },
  headerStats: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff08", borderRadius: 14, padding: 14, marginBottom: 16 },
  headerStat: { flex: 1, alignItems: "center", gap: 2 },
  headerStatNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  headerStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#ffffff77" },
  headerStatDivider: { width: 1, height: 32, marginHorizontal: 4 },
  sectionTabs: { marginBottom: 4 },
  sectionTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#ffffff11" },
  sectionTabActive: { backgroundColor: "#6C63FF" },
  sectionTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16 },
  section: { gap: 10 },
  emptyCard: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: "center" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  questionCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  questionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  importanceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  importanceBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  questionMeta: { flexDirection: "row", gap: 6 },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  questionText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  topicTag: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  topicTagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  tableHeader: { flexDirection: "row", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  tableHeaderText: { flex: 1, fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tableRow: { flexDirection: "row", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" },
  tableCell: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  predictionBanner: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 4 },
  predictionBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 19 },
  predictionCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  predictionNum: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center", marginTop: 2 },
  predictionNumText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  predictionText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  typeHeader: { marginBottom: 8, marginTop: 4 },
  typeTag: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  typeTagText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  topQuestionCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  topQuestionRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  topQuestionText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  marksBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  marksBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  notFoundText: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  goBackBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  goBackBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
