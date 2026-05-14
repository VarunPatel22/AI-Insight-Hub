import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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

const SUBJECTS = ["General", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Computer", "Economics", "Literature"];
const INPUT_TABS = ["Text", "Image"] as const;

type InputTab = (typeof INPUT_TABS)[number];

export default function UploadScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveNote, updateStreak } = useNotes();

  const [activeTab, setActiveTab] = useState<InputTab>("Text");
  const [noteText, setNoteText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("General");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

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
      Alert.alert("OCR Note", "Image selected! In this demo, please paste the text content manually in the Text tab. Full OCR coming soon.");
      setActiveTab("Text");
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
      Alert.alert("OCR Note", "Photo captured! In this demo, please paste the text content manually in the Text tab. Full OCR coming soon.");
      setActiveTab("Text");
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
      "Generating summary...",
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

      const response = await fetch(`${baseUrl}/api/ai/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText: noteText.trim(), subject: selectedSubject }),
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
        subject: selectedSubject,
        noteText: noteText.trim(),
        createdAt: Date.now(),
        summary: data.summary,
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
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Feather
                name={tab === "Text" ? "type" : "image"}
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
                placeholder="Paste your study notes here... (minimum 50 characters)"
                placeholderTextColor={colors.mutedForeground}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                textAlignVertical="top"
              />
            </View>
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {noteText.length} characters {noteText.length < 50 ? `(${50 - noteText.length} more needed)` : ""}
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
            <View style={[styles.ocrNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="info" size={14} color={colors.mutedForeground} />
              <Text style={[styles.ocrNoteText, { color: colors.mutedForeground }]}>
                OCR text extraction available. After capturing, you can also paste text manually in the Text tab.
              </Text>
            </View>
          </View>
        )}

        {/* Subject Selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUBJECTS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.subjectChip,
                  {
                    backgroundColor: selectedSubject === s ? colors.primary : colors.secondary,
                    borderColor: selectedSubject === s ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedSubject(s)}
              >
                <Text style={[styles.subjectText, { color: selectedSubject === s ? "#fff" : colors.mutedForeground }]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* What AI generates */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>AI will generate</Text>
          <View style={styles.aiFeatures}>
            {[
              { icon: "file-text" as const, label: "Smart Summary", color: "#6C63FF" },
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
  textArea: { borderRadius: 12, borderWidth: 1.5, minHeight: 200, padding: 14 },
  textInput: { fontSize: 14, lineHeight: 22, minHeight: 180 },
  charCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "right" },
  imageButtons: { flexDirection: "row", gap: 10 },
  imageBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 20, alignItems: "center", gap: 8,
  },
  imageBtnLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  imageBtnDesc: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  ocrNote: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 12,
  },
  ocrNoteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  subjectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  subjectText: { fontSize: 13, fontFamily: "Inter_500Medium" },
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
