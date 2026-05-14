import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
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

export default function PYQScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pyqAnalyses, subjects, deletePYQ, savePYQ } = useNotes();

  const [mode, setMode] = useState<"list" | "new">("list");
  const [paperText, setPaperText] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState("My Exam Paper");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const analyzePYQ = async () => {
    if (paperText.trim().length < 30) {
      Alert.alert("Not enough content", "Please paste at least 30 characters of exam paper content.");
      return;
    }

    Keyboard.dismiss();
    setIsAnalyzing(true);

    const steps = [
      "Reading exam paper...",
      "Detecting repeated questions...",
      "Analyzing topic patterns...",
      "Ranking by importance...",
      "Generating exam predictions...",
    ];
    let stepIdx = 0;
    setAnalyzeStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setAnalyzeStep(steps[stepIdx]);
    }, 2200);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const baseUrl = domain ? `https://${domain}` : "";
      const subject = subjects.find((s) => s.id === selectedSubjectId);

      const response = await fetch(`${baseUrl}/api/ai/analyze-pyq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperText: paperText.trim(),
          subject: subject?.name ?? "General",
          fileName: fileName.trim() || "Exam Paper",
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to analyze paper");
      }

      const data = await response.json();
      const pyqId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const pyq = {
        id: pyqId,
        subjectId: selectedSubjectId,
        subject: subject?.name ?? "General",
        fileName: fileName.trim() || "Exam Paper",
        createdAt: Date.now(),
        repeatedQuestions: data.repeatedQuestions ?? [],
        importantTopics: data.importantTopics ?? [],
        examPredictions: data.examPredictions ?? [],
        topQuestions: data.topQuestions ?? [],
      };

      await savePYQ(pyq);
      setPaperText("");
      setFileName("My Exam Paper");
      setMode("list");
      router.push(`/pyq-result?pyqId=${pyqId}`);
    } catch (err) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      Alert.alert("Analysis Failed", msg);
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStep("");
    }
  };

  const importanceColor = (imp: string) => {
    if (imp === "very_important") return "#EF4444";
    if (imp === "high_probability") return "#FF9800";
    if (imp === "most_repeated") return "#6C63FF";
    return "#00C9A7";
  };

  const importanceLabel = (imp: string) => {
    if (imp === "very_important") return "Very Important";
    if (imp === "high_probability") return "High Probability";
    if (imp === "most_repeated") return "Most Repeated";
    return "Frequently Asked";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#1A1040", "#0B0B1A"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>AI-Powered</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>PYQ Analyzer</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: "#6C63FF22", borderColor: "#6C63FF44" }]}>
            <Feather name="file-text" size={14} color="#6C63FF" />
            <Text style={[styles.countText, { color: "#6C63FF" }]}>{pyqAnalyses.length} analyzed</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabRow, { backgroundColor: "#ffffff11" }]}>
          <Pressable style={[styles.tabBtn, mode === "list" && styles.tabBtnActive]} onPress={() => setMode("list")}>
            <Text style={[styles.tabBtnText, { color: mode === "list" ? "#fff" : colors.mutedForeground }]}>
              Past Analyses
            </Text>
          </Pressable>
          <Pressable style={[styles.tabBtn, mode === "new" && styles.tabBtnActive]} onPress={() => setMode("new")}>
            <Text style={[styles.tabBtnText, { color: mode === "new" ? "#fff" : colors.mutedForeground }]}>
              Analyze New Paper
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      {mode === "list" ? (
        <FlatList
          data={pyqAnalyses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: pyq }) => {
            const topRepeated = pyq.repeatedQuestions[0];
            const subject = subjects.find((s) => s.id === pyq.subjectId);
            return (
              <Pressable
                style={({ pressed }) => [styles.pyqCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push(`/pyq-result?pyqId=${pyq.id}`)}
              >
                <View style={styles.pyqCardHeader}>
                  <View style={styles.pyqCardTitleRow}>
                    <View style={[styles.pyqCardIcon, { backgroundColor: "#6C63FF22" }]}>
                      <Feather name="file-text" size={18} color="#6C63FF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pyqCardTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {pyq.fileName}
                      </Text>
                      <Text style={[styles.pyqCardDate, { color: colors.mutedForeground }]}>
                        {subject ? subject.name : pyq.subject ?? "General"} • {new Date(pyq.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => deletePYQ(pyq.id)} hitSlop={10}>
                    <Feather name="trash-2" size={15} color={colors.mutedForeground} />
                  </Pressable>
                </View>

                <View style={styles.pyqCardStats}>
                  <View style={[styles.pyqStat, { backgroundColor: "#EF444422" }]}>
                    <Text style={[styles.pyqStatNum, { color: "#EF4444" }]}>{pyq.repeatedQuestions.length}</Text>
                    <Text style={[styles.pyqStatLabel, { color: "#EF4444" }]}>Repeated</Text>
                  </View>
                  <View style={[styles.pyqStat, { backgroundColor: "#FF980022" }]}>
                    <Text style={[styles.pyqStatNum, { color: "#FF9800" }]}>{pyq.importantTopics.length}</Text>
                    <Text style={[styles.pyqStatLabel, { color: "#FF9800" }]}>Topics</Text>
                  </View>
                  <View style={[styles.pyqStat, { backgroundColor: "#6C63FF22" }]}>
                    <Text style={[styles.pyqStatNum, { color: "#6C63FF" }]}>{pyq.examPredictions.length}</Text>
                    <Text style={[styles.pyqStatLabel, { color: "#6C63FF" }]}>Predicted</Text>
                  </View>
                </View>

                {topRepeated && (
                  <View style={[styles.topQuestionPreview, { backgroundColor: importanceColor(topRepeated.importance) + "11", borderColor: importanceColor(topRepeated.importance) + "33" }]}>
                    <View style={[styles.importanceBadge, { backgroundColor: importanceColor(topRepeated.importance) }]}>
                      <Text style={styles.importanceBadgeText}>{importanceLabel(topRepeated.importance)}</Text>
                    </View>
                    <Text style={[styles.topQuestionText, { color: colors.foreground }]} numberOfLines={2}>
                      {topRepeated.question}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="file-text" size={52} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No papers analyzed yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Paste your previous year exam paper content to detect repeated questions and predict upcoming exams
              </Text>
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => setMode("new")}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Analyze First Paper</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.newForm, { paddingBottom: bottomPad + 120 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Paper Name */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Paper / File Name</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  placeholder="e.g. OS Final Exam 2023"
                  placeholderTextColor={colors.mutedForeground}
                  value={fileName}
                  onChangeText={setFileName}
                />
              </View>
            </View>

            {/* Subject Selection */}
            {subjects.length > 0 && (
              <View style={styles.formSection}>
                <Text style={[styles.formLabel, { color: colors.foreground }]}>Subject (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Pressable
                    style={[
                      styles.subjectChip,
                      {
                        backgroundColor: !selectedSubjectId ? colors.primary : colors.secondary,
                        borderColor: !selectedSubjectId ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedSubjectId(undefined)}
                  >
                    <Text style={[styles.subjectChipText, { color: !selectedSubjectId ? "#fff" : colors.mutedForeground }]}>
                      General
                    </Text>
                  </Pressable>
                  {subjects.map((s) => (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.subjectChip,
                        {
                          backgroundColor: selectedSubjectId === s.id ? s.color : colors.secondary,
                          borderColor: selectedSubjectId === s.id ? s.color : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedSubjectId(s.id)}
                    >
                      <Text style={styles.subjectChipEmoji}>{s.icon}</Text>
                      <Text style={[styles.subjectChipText, { color: selectedSubjectId === s.id ? "#fff" : colors.mutedForeground }]}>
                        {s.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Paper Text */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.foreground }]}>Paste Exam Paper Content</Text>
              <Text style={[styles.formHint, { color: colors.mutedForeground }]}>
                Copy and paste questions from your previous year paper. The more complete the paper, the better the analysis.
              </Text>
              <View style={[styles.textArea, { backgroundColor: colors.secondary, borderColor: paperText.length > 0 ? colors.primary : colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  placeholder="Paste exam paper questions here...&#10;&#10;Example:&#10;Q1. Define deadlock and its conditions. (8 marks)&#10;Q2. Explain CPU scheduling algorithms with examples. (10 marks)&#10;..."
                  placeholderTextColor={colors.mutedForeground}
                  value={paperText}
                  onChangeText={setPaperText}
                  multiline
                  textAlignVertical="top"
                />
              </View>
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
                {paperText.length} characters
              </Text>
            </View>

            {/* What AI will analyze */}
            <View style={[styles.featuresBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.featuresTitle, { color: colors.foreground }]}>AI will detect:</Text>
              {[
                { icon: "repeat" as const, label: "Repeated questions & topics", color: "#EF4444" },
                { icon: "bar-chart-2" as const, label: "Marks-based importance ranking", color: "#FF9800" },
                { icon: "trending-up" as const, label: "High-probability exam predictions", color: "#6C63FF" },
                { icon: "star" as const, label: "Top questions by type & marks", color: "#00C9A7" },
              ].map((f) => (
                <View key={f.label} style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: f.color + "22" }]}>
                    <Feather name={f.icon} size={14} color={f.color} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.foreground }]}>{f.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Analyzing Overlay */}
          {isAnalyzing && (
            <View style={styles.overlay}>
              <View style={[styles.overlayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ActivityIndicator size="large" color="#6C63FF" />
                <Text style={[styles.overlayTitle, { color: colors.foreground }]}>Analyzing Paper</Text>
                <Text style={[styles.overlayStep, { color: colors.mutedForeground }]}>{analyzeStep}</Text>
              </View>
            </View>
          )}

          {/* Analyze Button */}
          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 16 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.analyzeBtn,
                { backgroundColor: paperText.length >= 30 ? "#6C63FF" : colors.muted, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={analyzePYQ}
              disabled={isAnalyzing || paperText.length < 30}
            >
              <Feather name="cpu" size={18} color={paperText.length >= 30 ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.analyzeBtnText, { color: paperText.length >= 30 ? "#fff" : colors.mutedForeground }]}>
                Analyze with AI
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  countBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  countText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tabRow: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#6C63FF" },
  tabBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 12 },
  pyqCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  pyqCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  pyqCardTitleRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  pyqCardIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  pyqCardTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  pyqCardDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  pyqCardStats: { flexDirection: "row", gap: 8 },
  pyqStat: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  pyqStatNum: { fontSize: 20, fontFamily: "Inter_700Bold" },
  pyqStatLabel: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 2 },
  topQuestionPreview: { borderRadius: 10, borderWidth: 1, padding: 10, gap: 6 },
  importanceBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  importanceBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  topQuestionText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 10, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  emptyBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  newForm: { padding: 16, gap: 4 },
  formSection: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  formHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10, lineHeight: 18 },
  inputBox: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 14 },
  subjectChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  subjectChipEmoji: { fontSize: 14 },
  subjectChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  textArea: { borderRadius: 12, borderWidth: 1.5, minHeight: 200, padding: 14 },
  textInput: { fontSize: 14, lineHeight: 22, minHeight: 180 },
  charCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "right" },
  featuresBox: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  featuresTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureIcon: { width: 30, height: 30, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#00000088", justifyContent: "center", alignItems: "center",
  },
  overlayCard: { width: 240, borderRadius: 20, borderWidth: 1, padding: 28, alignItems: "center", gap: 12 },
  overlayTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  overlayStep: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  analyzeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 15, borderRadius: 14,
  },
  analyzeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
