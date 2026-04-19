import { Card, getCards } from '@/lib/cards';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

function shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function StudyScreen() {
    const router = useRouter();
    const { deckId, name } = useLocalSearchParams<{ deckId: string; name: string }>();

    const originalCards = useRef<Card[]>(getCards(deckId)).current;
    const [cards, setCards] = useState<Card[]>(originalCards);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [shuffled, setShuffled] = useState(false);
    const [completed, setCompleted] = useState(false);

    const swipeAnim = useRef(new Animated.Value(0)).current;
    const isSwiping = useRef(false);

    const card = cards[index];

    function resetCard() {
        setFlipped(false);
    }

    function goToNext() {
        if (index >= cards.length - 1) { setCompleted(true); return; }
        Animated.timing(swipeAnim, { toValue: -SCREEN_WIDTH, duration: 220, useNativeDriver: true }).start(() => {
            swipeAnim.setValue(SCREEN_WIDTH);
            resetCard();
            setIndex(i => i + 1);
            Animated.timing(swipeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
        });
    }

    function goToPrev() {
        if (index <= 0) return;
        Animated.timing(swipeAnim, { toValue: SCREEN_WIDTH, duration: 220, useNativeDriver: true }).start(() => {
            swipeAnim.setValue(-SCREEN_WIDTH);
            resetCard();
            setIndex(i => i - 1);
            Animated.timing(swipeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
        });
    }

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => {
            const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10;
            if (isHorizontal) isSwiping.current = true;
            return isHorizontal;
        },
        onPanResponderMove: (_, g) => swipeAnim.setValue(g.dx),
        onPanResponderRelease: (_, g) => {
            isSwiping.current = false;
            if (g.dx < -SWIPE_THRESHOLD || g.vx < -0.5) goToNext();
            else if (g.dx > SWIPE_THRESHOLD || g.vx > 0.5) goToPrev();
            else Animated.spring(swipeAnim, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
        },
        onPanResponderTerminate: () => {
            isSwiping.current = false;
            Animated.spring(swipeAnim, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
        },
    })).current;

    function handleTap() {
        if (isSwiping.current) return;
        setFlipped(f => !f);
    }

    function handleShuffle() {
        setCards(shuffled ? originalCards : shuffleArray(originalCards));
        setShuffled(s => !s);
        setIndex(0);
        resetCard();
        swipeAnim.setValue(0);
    }

    function handleRestart() {
        setIndex(0);
        resetCard();
        swipeAnim.setValue(0);
        setCompleted(false);
    }

    if (completed) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.completionContainer}>
                    <Text style={styles.completionEmoji}>🎉</Text>
                    <Text style={styles.completionTitle}>All done!</Text>
                    <Text style={styles.completionSub}>You've gone through all {cards.length} cards</Text>
                    <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
                        <Ionicons name="refresh" size={18} color="#fff" />
                        <Text style={styles.restartText}>Study Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>Back to Deck</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {decodeURIComponent(name ?? '')}
                </Text>
                <TouchableOpacity onPress={handleShuffle} style={styles.iconBtn}>
                    <Ionicons name="shuffle" size={22} color={shuffled ? '#6c47ff' : '#fff'} />
                </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${((index + 1) / cards.length) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{index + 1} / {cards.length}</Text>
            </View>

            <View style={styles.cardArea} {...panResponder.panHandlers}>
                <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: swipeAnim }] }]}>
                    <TouchableOpacity style={styles.card} activeOpacity={1} onPress={handleTap}>
                        <ScrollView
                            contentContainerStyle={styles.cardScroll}
                            scrollEnabled={flipped}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.sideLabel}>{flipped ? 'BACK' : 'FRONT'}</Text>
                            {!flipped ? (
                                <>
                                    <Text style={styles.frontText}>{card.front}</Text>
                                    {card.starred === 1 && (
                                        <Ionicons name="star" size={16} color="#f5c518" style={styles.starBadge} />
                                    )}
                                    <Text style={styles.tapHint}>Tap to reveal · Swipe to navigate</Text>
                                </>
                            ) : (
                                <Markdown style={markdownStyles}>{card.back}</Markdown>
                            )}
                        </ScrollView>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    },
    iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
    progressContainer: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, gap: 12, marginBottom: 8,
    },
    progressTrack: { flex: 1, height: 3, backgroundColor: '#2a2a2a', borderRadius: 2 },
    progressFill: { height: 3, backgroundColor: '#6c47ff', borderRadius: 2 },
    progressText: { color: '#555', fontSize: 13 },
    cardArea: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
    cardWrapper: { flex: 1 },
    card: {
        flex: 1, backgroundColor: '#1a1a1a',
        borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a',
    },
    cardScroll: { flexGrow: 1, padding: 28 },
    sideLabel: {
        color: '#444', fontSize: 11, fontWeight: '700',
        letterSpacing: 1, marginBottom: 20,
    },
    frontText: { color: '#fff', fontSize: 24, fontWeight: '600', lineHeight: 34 },
    starBadge: { marginTop: 16 },
    tapHint: { color: '#333', fontSize: 12, marginTop: 32 },
    completionContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 32, gap: 12,
    },
    completionEmoji: { fontSize: 64, marginBottom: 8 },
    completionTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
    completionSub: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 16 },
    restartBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#6c47ff', paddingHorizontal: 28, paddingVertical: 14,
        borderRadius: 28, width: '100%', justifyContent: 'center',
    },
    restartText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    backBtn: {
        paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28,
        width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a',
    },
    backBtnText: { color: '#888', fontWeight: '600', fontSize: 16 },
});

const markdownStyles = {
    body: { color: '#fff', fontSize: 18, lineHeight: 28 },
    strong: { color: '#fff', fontWeight: '700' as const },
    code_inline: { backgroundColor: '#2a2a2a', color: '#c47fff', borderRadius: 4 },
    fence: { backgroundColor: '#2a2a2a', borderRadius: 8, padding: 12 },
    bullet_list: { color: '#fff' },
    ordered_list: { color: '#fff' },
};