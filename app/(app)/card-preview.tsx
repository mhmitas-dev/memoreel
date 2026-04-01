import { Card, deleteCard, toggleStar } from '@/lib/cards';
import db from '@/lib/database';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CardPreviewScreen() {
    const router = useRouter();
    const { cardId, deckId } = useLocalSearchParams<{ cardId: string; deckId: string }>();
    const [card, setCard] = useState<Card | null>(null);
    const [flipped, setFlipped] = useState(false);

    const loadCard = useCallback(() => {
        if (!cardId) return;
        const result = db.getFirstSync<Card>(`SELECT * FROM cards WHERE id = ?`, [cardId]);
        setCard(result ?? null);
    }, [cardId]);

    useEffect(() => {
        loadCard();
    }, [loadCard]);

    function handleToggleStar() {
        if (!cardId) return;
        toggleStar(cardId);
        loadCard();
    }

    function handleDelete() {
        Alert.alert('Delete card?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    if (!cardId) return;
                    deleteCard(cardId);
                    router.back();
                },
            },
        ]);
    }

    function handleEdit() {
        if (!card) return;
        router.push(
            `/(app)/card-editor?cardId=${card.id}&deckId=${deckId}&front=${encodeURIComponent(card.front)}&back=${encodeURIComponent(card.back)}`
        );
    }

    if (!card) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleToggleStar} style={styles.iconBtn}>
                        <Ionicons
                            name={card.starred === 1 ? 'star' : 'star-outline'}
                            size={22}
                            color={card.starred === 1 ? '#f5c518' : '#fff'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => Alert.alert('Card', undefined, [
                            { text: 'Edit', onPress: handleEdit },
                            { text: 'Delete', style: 'destructive', onPress: handleDelete },
                            { text: 'Cancel', style: 'cancel' },
                        ])}
                        style={styles.iconBtn}
                    >
                        <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => setFlipped(f => !f)}
                    activeOpacity={0.9}
                >
                    {!flipped ? (
                        <View style={styles.side}>
                            <Text style={styles.sideLabel}>FRONT</Text>
                            <Text style={styles.frontText}>{card.front}</Text>
                            <Text style={styles.tapHint}>Tap to reveal back</Text>
                        </View>
                    ) : (
                        <View style={styles.side}>
                            <Text style={styles.sideLabel}>BACK</Text>
                            <Markdown style={markdownStyles}>{card.back}</Markdown>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerRight: { flexDirection: 'row', gap: 4 },
    iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    body: { flex: 1 },
    bodyContent: { padding: 20, flexGrow: 1 },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 24,
        minHeight: 300,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        justifyContent: 'center',
    },
    side: { gap: 16 },
    sideLabel: {
        color: '#444',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    frontText: { color: '#fff', fontSize: 22, fontWeight: '600', lineHeight: 32 },
    tapHint: { color: '#333', fontSize: 13, marginTop: 8 },
});

const markdownStyles = {
    body: { color: '#fff', fontSize: 16, lineHeight: 26 },
    heading1: { color: '#fff', fontWeight: '700' },
    heading2: { color: '#fff', fontWeight: '700' },
    strong: { color: '#fff', fontWeight: '700' },
    code_inline: { backgroundColor: '#2a2a2a', color: '#c47fff', borderRadius: 4 },
    fence: { backgroundColor: '#2a2a2a', borderRadius: 8, padding: 12 },
    bullet_list: { color: '#fff' },
    ordered_list: { color: '#fff' },
};