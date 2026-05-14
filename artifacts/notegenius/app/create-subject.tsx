import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const SUBJECT_COLORS = [
  "#6C63FF", "#00C9A7", "#FF6B6B", "#FF9800",
  "#4CAF50", "#2196F3", "#9C27B0", "#E91E63",
  "#00BCD4", "#795548",
];

const SUBJECT_ICONS = [
  "📚", "🔬", "💻", "📐", "🌍",
  "⚡", "🧪", "📊", "🏛️", "🎓",
  "📝", "🧠", "🔢", "🌱", "🎭",
  "📖", "🏥", "⚙️", "🎵", "🌐",
];

export default function CreateSubjectScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveSubject } = useNotes();

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(SUBJECT_ICONS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const subject = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
        createdAt: Date.now(),
      };
      await saveSubject(subject);
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Subject</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: canSave ? selectedColor : colors.muted }]}
          onPress={handleSave}
          disabled={!canSave || isSaving}
        >
          <Text style={[styles.saveBtnText, { color: canSave ? "#fff" : colors.mutedForeground }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      >
        {/* Preview */}
        <View style={styles.previewSection}>
          <View style={[styles.preview, { backgroundColor: selectedColor + "22", borderColor: selectedColor + "44" }]}>
            <Text style={styles.previewIcon}>{selectedIcon}</Text>
            <Text style={[styles.previewName, { color: selectedColor }]}>
              {name.trim() || "Subject Name"}
            </Text>
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Subject Name</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.secondary, borderColor: name.length > 0 ? selectedColor : colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="e.g. Operating Systems, Python, DBMS..."
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Choose Color</Text>
          <View style={styles.colorGrid}>
            {SUBJECT_COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Feather name="check" size={14} color="#fff" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Choose Icon</Text>
          <View style={styles.iconGrid}>
            {SUBJECT_ICONS.map((icon) => (
              <Pressable
                key={icon}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: selectedIcon === icon ? selectedColor + "33" : colors.secondary,
                    borderColor: selectedIcon === icon ? selectedColor : colors.border,
                  },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconEmoji}>{icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick presets */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Quick Presets</Text>
          <View style={styles.presets}>
            {[
              { name: "Operating Systems", icon: "💻", color: "#6C63FF" },
              { name: "Python Programming", icon: "⚡", color: "#00C9A7" },
              { name: "Cyber Security", icon: "🔬", color: "#FF6B6B" },
              { name: "DBMS", icon: "📊", color: "#FF9800" },
              { name: "Data Structures", icon: "🧠", color: "#2196F3" },
              { name: "Mathematics", icon: "📐", color: "#9C27B0" },
            ].map((preset) => (
              <Pressable
                key={preset.name}
                style={[styles.preset, { backgroundColor: preset.color + "22", borderColor: preset.color + "44" }]}
                onPress={() => {
                  setName(preset.name);
                  setSelectedIcon(preset.icon);
                  setSelectedColor(preset.color);
                }}
              >
                <Text style={styles.presetIcon}>{preset.icon}</Text>
                <Text style={[styles.presetName, { color: preset.color }]}>{preset.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  previewSection: { alignItems: "center", paddingVertical: 24 },
  preview: {
    borderRadius: 20, borderWidth: 2, padding: 24,
    alignItems: "center", gap: 10, minWidth: 140,
  },
  previewIcon: { fontSize: 36 },
  previewName: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "center" },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  inputBox: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 15 },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  colorDot: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
  colorDotSelected: {
    borderWidth: 3, borderColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconBtn: {
    width: 50, height: 50, borderRadius: 14, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center",
  },
  iconEmoji: { fontSize: 22 },
  presets: { gap: 10 },
  preset: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10,
  },
  presetIcon: { fontSize: 18 },
  presetName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
