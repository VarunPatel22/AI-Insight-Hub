import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Note } from "@/context/NotesContext";

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const SUBJECTS_COLORS: Record<string, string> = {
  Mathematics: "#6C63FF",
  Physics: "#00C9A7",
  Chemistry: "#FF6B6B",
  Biology: "#4CAF50",
  History: "#FF9800",
  Literature: "#E91E63",
  Computer: "#2196F3",
  Economics: "#9C27B0",
  General: "#607D8B",
};

export default function NoteCard({ note, onDelete, compact = false }: NoteCardProps) {
  const colors = useColors();
  const router = useRouter();
  const subjectColor = SUBJECTS_COLORS[note.subject] ?? "#6C63FF";

  const hasContent = !!(note.summary || note.mcqs?.length || note.flashcards?.length);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        compact && styles.cardCompact,
      ]}
      onPress={() => router.push(`/summary?noteId=${note.id}`)}
    >
      <View style={styles.header}>
        <View style={[styles.subjectBadge, { backgroundColor: subjectColor + "22" }]}>
          <Text style={[styles.subjectText, { color: subjectColor }]}>{note.subject}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(note.createdAt)}</Text>
          {onDelete && (
            <Pressable
              onPress={() => onDelete(note.id)}
              hitSlop={8}
              style={{ marginLeft: 8 }}
            >
              <Feather name="trash-2" size={15} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {note.title}
      </Text>

      {!compact && (
        <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
          {note.noteText}
        </Text>
      )}

      {hasContent && (
        <View style={styles.badges}>
          {note.summary && (
            <View style={[styles.badge, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="file-text" size={11} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>Summary</Text>
            </View>
          )}
          {note.mcqs && note.mcqs.length > 0 && (
            <View style={[styles.badge, { backgroundColor: "#00C9A7" + "22" }]}>
              <Feather name="check-circle" size={11} color="#00C9A7" />
              <Text style={[styles.badgeText, { color: "#00C9A7" }]}>{note.mcqs.length} MCQs</Text>
            </View>
          )}
          {note.flashcards && note.flashcards.length > 0 && (
            <View style={[styles.badge, { backgroundColor: "#FF9800" + "22" }]}>
              <Feather name="layers" size={11} color="#FF9800" />
              <Text style={[styles.badgeText, { color: "#FF9800" }]}>{note.flashcards.length} Cards</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardCompact: {
    marginBottom: 0,
    width: 220,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  date: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    lineHeight: 21,
  },
  preview: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
