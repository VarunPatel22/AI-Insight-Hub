import { Feather } from "@expo/vector-icons";
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

import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

const TOOLS = [
  {
    id: "summarize",
    label: "AI Summarizer",
    icon: "file-text" as const,
    color: "#6C63FF",
    description: "Transform long notes into concise bullet points, exam notes, and key summaries.",
    features: ["Bullet points", "Exam notes", "Simple explanation", "Keywords"],
  },
  {
    id: "mcq",
    label: "MCQ Generator",
    icon: "check-circle" as const,
    color: "#00C9A7",
    description: "Generate multiple-choice questions with 4 options, answers, and explanations.",
    features: ["Easy / Medium / Hard", "Answer explanation", "Practice mode", "Score tracking"],
  },
  {
    id: "flashcards",
    label: "Flashcard Creator",
    icon: "layers" as const,
    color: "#FF9800",
    description: "Create swipeable Q&A flashcards for quick revision and memory practice.",
    features: ["Flip animations", "Swipe to reveal", "Revision mode", "Progress tracking"],
  },
  {
    id: "viva",
    label: "Viva Questions",
    icon: "mic" as const,
    color: "#E91E63",
    description: "Generate common viva and interview-style questions with comprehensive answers.",
    features: ["Beginner / Advanced", "Oral questions", "Detailed answers", "Technical prep"],
  },
  {
    id: "quickrev",
    label: "Quick Revision",
    icon: "zap" as const,
    color: "#FF6B6B",
    description: "Instantly condense notes into last-minute key points and formulas.",
    features: ["Key formulas", "Important points", "Last-minute prep", "Exam focus"],
  },
  {
    id: "examprep",
    label: "Exam Preparation",
    icon: "award" as const,
    color: "#9C27B0",
    description: "Generate predicted exam questions and frequently tested concepts.",
    features: ["Predicted questions", "Common concepts", "Viva prep", "Topic coverage"],
  },
];

export default function ToolsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes } = useNotes();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const handleTool = (toolId: string) => {
    if (notes.length === 0) {
      router.push("/upload");
      return;
    }
    const noteId = notes[0].id;
    if (toolId === "summarize" || toolId === "quickrev" || toolId === "examprep") {
      router.push(`/summary?noteId=${noteId}`);
    } else if (toolId === "mcq") {
      router.push(`/mcq?noteId=${noteId}`);
    } else if (toolId === "flashcards") {
      router.push(`/flashcards?noteId=${noteId}`);
    } else if (toolId === "viva") {
      router.push(`/viva?noteId=${noteId}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>AI Tools</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Powered by advanced AI for smarter studying
          </Text>
        </View>

        <View style={styles.toolsList}>
          {TOOLS.map((tool) => (
            <Pressable
              key={tool.id}
              style={({ pressed }) => [
                styles.toolCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => handleTool(tool.id)}
            >
              <View style={styles.toolHeader}>
                <View style={[styles.toolIcon, { backgroundColor: tool.color + "22" }]}>
                  <Feather name={tool.icon} size={24} color={tool.color} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
                  <Text style={[styles.toolDescription, { color: colors.mutedForeground }]}>
                    {tool.description}
                  </Text>
                </View>
              </View>
              <View style={styles.featuresList}>
                {tool.features.map((feature, i) => (
                  <View key={i} style={[styles.featureChip, { backgroundColor: tool.color + "15" }]}>
                    <Text style={[styles.featureText, { color: tool.color }]}>{feature}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.toolFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.useBtn, { color: tool.color }]}>
                  {notes.length === 0 ? "Upload notes first" : "Use this tool"}
                </Text>
                <Feather name="chevron-right" size={16} color={tool.color} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  toolsList: { padding: 16, gap: 12 },
  toolCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  toolHeader: { flexDirection: "row", gap: 14, padding: 16, paddingBottom: 12 },
  toolIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  toolInfo: { flex: 1 },
  toolLabel: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  toolDescription: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  featuresList: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  featureChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  featureText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  toolFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
  useBtn: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
