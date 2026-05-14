import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNotes } from "@/context/NotesContext";
import { useColors } from "@/hooks/useColors";

export default function FlashcardsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { getNoteById } = useNotes();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const flipAnim = useRef(new Animated.Value(0)).current;

  const note = noteId ? getNoteById(noteId) : undefined;
  const cards = note?.flashcards ?? [];
  const current = cards[currentIdx];

  const frontInterp = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backInterp = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const flip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const goNext = async (markKnown: boolean) => {
    if (markKnown) {
      setKnown((prev) => new Set([...prev, currentIdx]));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (currentIdx < cards.length - 1) {
      flipAnim.setValue(0);
      setIsFlipped(false);
      setCurrentIdx((p) => p + 1);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setKnown(new Set());
    flipAnim.setValue(0);
  };

  if (!note || cards.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="layers" size={44} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No flashcards available</Text>
        <Pressable onPress={() => router.back()} style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isFinished = currentIdx === cards.length - 1 && isFlipped;
  const progress = ((currentIdx) / cards.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.foreground }]}>
            {currentIdx + 1} / {cards.length}
          </Text>
          <Text style={[styles.knownText, { color: "#00C9A7" }]}>{known.size} known</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` as any }]} />
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <Pressable onPress={flip} style={styles.cardWrapper}>
          {/* Front */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                transform: [{ rotateY: frontInterp }],
                backfaceVisibility: "hidden",
              },
            ]}
          >
            <View style={[styles.cardBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.cardBadgeText, { color: colors.primary }]}>QUESTION</Text>
            </View>
            <Text style={[styles.cardText, { color: colors.foreground }]}>{current?.question}</Text>
            <View style={styles.tapHint}>
              <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
              <Text style={[styles.tapHintText, { color: colors.mutedForeground }]}>Tap to reveal answer</Text>
            </View>
          </Animated.View>

          {/* Back */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                backgroundColor: "#6C63FF" + "15",
                borderColor: "#6C63FF",
                transform: [{ rotateY: backInterp }],
                backfaceVisibility: "hidden",
              },
            ]}
          >
            <View style={[styles.cardBadge, { backgroundColor: "#6C63FF" + "33" }]}>
              <Text style={[styles.cardBadgeText, { color: "#6C63FF" }]}>ANSWER</Text>
            </View>
            <Text style={[styles.cardText, { color: colors.foreground }]}>{current?.answer}</Text>
          </Animated.View>
        </Pressable>

        {/* Actions */}
        {isFlipped && (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: "#EF4444" + "22", borderColor: "#EF4444" }]}
              onPress={() => goNext(false)}
            >
              <Feather name="x" size={22} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>Still Learning</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: "#00C9A7" + "22", borderColor: "#00C9A7" }]}
              onPress={() => goNext(true)}
            >
              <Feather name="check" size={22} color="#00C9A7" />
              <Text style={[styles.actionBtnText, { color: "#00C9A7" }]}>Got It</Text>
            </Pressable>
          </View>
        )}

        {/* Finished */}
        {currentIdx === cards.length - 1 && known.size > 0 && (
          <View style={[styles.finishCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="award" size={36} color="#FF9800" />
            <Text style={[styles.finishTitle, { color: colors.foreground }]}>
              {known.size}/{cards.length} cards mastered!
            </Text>
            <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={restart}>
              <Feather name="refresh-cw" size={14} color="#fff" />
              <Text style={styles.btnText}>Study Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressSection: { padding: 16 },
  progressInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  knownText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressBar: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  cardContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  cardWrapper: { width: "100%", height: 300 },
  card: {
    position: "absolute", width: "100%", height: 300,
    borderRadius: 20, borderWidth: 2,
    padding: 28, justifyContent: "center", alignItems: "center",
    gap: 16,
  },
  cardBack: { position: "absolute", top: 0, left: 0, right: 0 },
  cardBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  cardBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  cardText: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center", lineHeight: 27 },
  tapHint: { flexDirection: "row", alignItems: "center", gap: 5, position: "absolute", bottom: 16 },
  tapHintText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  finishCard: {
    marginTop: 16, borderRadius: 16, borderWidth: 1,
    padding: 24, alignItems: "center", gap: 10,
  },
  finishTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 12 },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
