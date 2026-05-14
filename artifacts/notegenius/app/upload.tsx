import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const PRESET_SUBJECTS = ["General", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Computer Science", "Economics", "Literature"];
const INPUT_TABS = ["Text", "Image"] as const;
type InputTab = (typeof INPUT_TABS)[number];

export default function UploadScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveNote, updateStreak, subjects } = useNotes();

  const params = useLocalSearchParams<{ subjectId?: string; subjectName?: string }>();

  const [activeTab, setActiveTab] = useState<InputTab>("Text");
  const [noteText, setNoteText] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(params.subjectId);
  const [customSubject, setCustomSubject] = useState(params.subjectName ?? "General");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const getSubjectName = () => {
    if (selectedSubjectId) {
      const found = subjects.find((s) => s.id === selectedSubjectId);
      if (found) return found.name;
    }
    return customSubject;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Alert.alert(
        "Image Selected",
        "Please also paste the text content from your notes in the Text tab for AI processing. Full OCR coming soon.",
        [{ text: "OK", onPress: () => setActiveTab("Text") }]
      );
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      Alert.alert(
        "Photo Captured",
        "Please paste the text content from your notes in the Text tab for AI processing.",
        [{ text: "OK", onPress: () => setActiveTab("Text") }]
      );
    }
  };

  const processNotes = async () => {
    if (noteText.trim().length < 50) {
      Alert.alert("Not enough content", "Please enter at least 50 characters of notes to process.");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    const steps = [
      "Analyzing your notes...",
      "Detecting topics & chapters...",
      "Generating topic summaries...",
      "Creating MCQ questions...",
      "Building flashcards...",
      "Preparing viva questions...",
    ];

    let stepIdx = 0;
    setProcessingStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setProcessingStep(steps[stepIdx]);
    }, 2500);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const baseUrl = domain ? `https://${domain}` : "";
      const subjectName = getSubjectName();

      const response = await fetch(`${baseUrl}/api/ai/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText: noteText.trim(), subject: subjectName }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to process notes");
      }

      const data = await response.json();

      const noteId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const note = {
        id: noteId,
        title: data.title || "My Notes",
        subject: subjectName,
        subjectId: selectedSubjectId,
        noteText: noteText.trim(),
        createdAt: Date.now(),
        summary: data.summary,
        topics: data.topics ?? [],
        mcqs: data.mcqs,
        flashcards: data.flashcards,
        vivaQuestions: data.vivaQuestions,
      };

      await saveNote(note);
      await updateStreak();

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/summary?noteId=${noteId}`);
    } catch (err) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      Alert.alert("Processing Failed", msg + "\n\nMake sure the API server is running.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomInset + 120 }}
      >
        {/* Input Method Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {INPUT_TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Feather
                name={tab === "Text" ? "type" : "camera"}
                size={14}
                color={activeTab === tab ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.tabText, { color: activeTab === tab ? "#fff" : colors.mutedForeground }]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Text Input */}
        {activeTab === "Text" && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>Paste Your Notes</Text>
            <View style={[styles.textArea, { backgroundColor: colors.secondary, borderColor: noteText.length > 0 ? colors.primary : colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Paste your study notes here... The AI will detect topics and chapters automatically. Minimum 50 characters."
                placeholderTextColor={colors.mutedForeground}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                textAlignVertical="top"
              />
            </View>
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {noteText.length} characters {noteText.length < 50 ? `(${50 - noteText.length} more needed)` : "✓"}
            </Text>
          </View>
        )}

        {/* Image Input */}
        {activeTab === "Image" && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>Scan Notes</Text>
            <View style={styles.imageButtons}>
              <Pressable
                style={[styles.imageBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={takePhoto}
              >
                <Feather name="camera" size={28} color={colors.primary} />
                <Text style={[styles.imageBtnLabel, { color: colors.foreground }]}>Take Photo</Text>
                <Text style={[styles.imageBtnDesc, { color: colors.mutedForeground }]}>Scan handwritten notes</Text>
              </Pressable>
              <Pressable
                style={[styles.imageBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={pickImage}
              >
                <Feather name="image" size={28} color="#00C9A7" />
                <Text style={[styles.imageBtnLabel, { color: colors.foreground }]}>From Gallery</Text>
                <Text style={[styles.imageBtnDesc, { color: colors.mutedForeground }]}>Upload existing image</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Subject Selector */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.foreground }]}>Subject</Text>
            {subjects.length === 0 && (
              <Pressable onPress={() => router.push("/create-subject")}>
                <Text style={[styles.createSubjectLink, { color: colors.primary }]}>+ Create Subject</Text>
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {/* My subjects first */}
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
                onPress={() => { setSelectedSubjectId(s.id); setCustomSubject(s.name); }}
              >
                <Text style={styles.subjectChipEmoji}>{s.icon}</Text>
                <Text style={[styles.subjectText, { color: selectedSubjectId === s.id ? "#fff" : colors.mutedForeground }]}>
                  {s.name}
                </Text>
              </Pressable>
            ))}

            {/* Preset subjects */}
            {PRESET_SUBJECTS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.subjectChip,
                  {
                    backgroundColor: !selectedSubjectId && customSubject === s ? colors.primary : colors.secondary,
                    borderColor: !selectedSubjectId && customSubject === s ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => { setSelectedSubjectId(undefined); setCustomSubject(s); }}
              >
                <Text style={[styles.subjectText, { color: !selectedSubjectId && customSubject === s ? "#fff" : colors.mutedForeground }]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {subjects.length > 0 && (
            <Pressable
              style={[styles.createSubjectBtn, { borderColor: colors.border }]}
              onPress={() => router.push("/create-subject")}
            >
              <Feather name="plus" size={14} color={colors.primary} />
              <Text style={[styles.createSubjectBtnText, { color: colors.primary }]}>Create New Subject</Text>
            </Pressable>
          )}
        </View>

        {/* What AI generates */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>AI will generate</Text>
          <View style={styles.aiFeatures}>
            {[
              { icon: "list" as const, label: "Topic-Wise Summary", color: "#6C63FF" },
              { icon: "check-circle" as const, label: "MCQ Questions", color: "#00C9A7" },
              { icon: "layers" as const, label: "Flashcards", color: "#FF9800" },
              { icon: "mic" as const, label: "Viva Questions", color: "#E91E63" },
            ].map((f) => (
              <View key={f.label} style={[styles.aiFeature, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={f.icon} size={16} color={f.color} />
                <Text style={[styles.aiFeatureText, { color: colors.foreground }]}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={[styles.processingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.processingTitle, { color: colors.foreground }]}>AI Processing</Text>
            <Text style={[styles.processingStep, { color: colors.mutedForeground }]}>{processingStep}</Text>
            <View style={styles.processingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, { backgroundColor: colors.primary }]} />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Process Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomInset + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.processBtn,
            { backgroundColor: noteText.length >= 50 ? colors.primary : colors.muted, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={processNotes}
          disabled={isProcessing || noteText.length < 50}
        >
          <Feather name="cpu" size={18} color={noteText.length >= 50 ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.processBtnText, { color: noteText.length >= 50 ? "#fff" : colors.mutedForeground }]}>
            Process with AI
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: "row", margin: 16, borderRadius: 12, borderWidth: 1, padding: 4, gap: 4 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 9 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  createSubjectLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  textArea: { borderRadius: 12, borderWidth: 1.5, minHeight: 200, padding: 14 },
  textInput: { fontSize: 14, lineHeight: 22, minHeight: 180 },
  charCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "right" },
  imageButtons: { flexDirection: "row", gap: 10 },
  imageBtn: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 20, alignItems: "center", gap: 8 },
  imageBtnLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  imageBtnDesc: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  subjectChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  subjectChipEmoji: { fontSize: 14 },
  subjectText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  createSubjectBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderStyle: "dashed", alignSelf: "flex-start", marginTop: 6,
  },
  createSubjectBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  aiFeatures: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  aiFeature: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  aiFeatureText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  processingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#00000088", justifyContent: "center", alignItems: "center",
  },
  processingCard: {
    width: 240, borderRadius: 20, borderWidth: 1,
    padding: 28, alignItems: "center", gap: 12,
  },
  processingTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  processingStep: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  processingDots: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  processBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 15, borderRadius: 14,
  },
  processBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
