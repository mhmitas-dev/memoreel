import ImportPreviewModal from '@/components/ImportPreviewModal';
import { bulkCreateCards, Card, deleteCard, getCards } from '@/lib/cards';
import { exportMarkdown, parseMarkdown } from '@/lib/markdown';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeckScreen() {
    const router = useRouter();
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    const [cards, setCards] = useState<Card[]>([]);
    const [importPreview, setImportPreview] = useState<{ front: string; back: string }[] | null>(null);
    const [importModalVisible, setImportModalVisible] = useState(false);

    const loadCards = useCallback(() => {
        if (!id) return;
        setCards(getCards(id));
    }, [id]);

    useEffect(() => {
        loadCards();
    }, [loadCards]);

    async function handleImport() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const parsed = parseMarkdown(content);

            if (parsed.length === 0) {
                Alert.alert('No cards found', 'Make sure your file uses ## for card fronts.');
                return;
            }

            setImportPreview(parsed);
            setImportModalVisible(true);
        } catch (e) {
            Alert.alert('Error', 'Could not read the file.');
        }
    }

    async function handleExport() {
        if (!id || !name) return;
        try {
            const deckName = decodeURIComponent(name);
            const content = exportMarkdown(deckName, cards);
            const path = `${FileSystem.cacheDirectory}${deckName.replace(/\s+/g, '_')}.md`;
            await FileSystem.writeAsStringAsync(path, content);
            await Sharing.shareAsync(path, { mimeType: 'text/markdown' });
        } catch (e) {
            Alert.alert('Error', 'Could not export the deck.');
        }
    }

    function handleConfirmImport(parsed: { front: string; back: string }[]) {
        if (!id) return;
        bulkCreateCards(id, parsed);
        loadCards();
    }

    function handleLongPress(card: Card) {
        Alert.alert(card.front, undefined, [
            {
                text: 'Edit',
                onPress: () => router.push(
                    `/(app)/card-editor?cardId=${card.id}&deckId=${id}&front=${encodeURIComponent(card.front)}&back=${encodeURIComponent(card.back)}`
                ),
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    Alert.alert('Delete card?', 'This cannot be undone.', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                                deleteCard(card.id);
                                loadCards();
                            },
                        },
                    ]);
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }

    function renderCard({ item }: { item: Card }) {
        return (
            <TouchableOpacity
                style={styles.cardRow}
                onPress={() => router.push(
                    `/(app)/card-preview?cardId=${item.id}&deckId=${id}`
                )}
                onLongPress={() => handleLongPress(item)}
                delayLongPress={400}
            >
                <View style={styles.cardContent}>
                    <Text style={styles.cardFront} numberOfLines={2}>{item.front}</Text>
                    {item.starred === 1 && (
                        <Ionicons name="star" size={14} color="#f5c518" style={styles.starIcon} />
                    )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>
                    {decodeURIComponent(name ?? '')}
                </Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleImport} style={styles.iconBtn}>
                        <Ionicons name="download-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleExport} style={styles.iconBtn}>
                        <Ionicons name="share-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push(`/(app)/study?deckId=${id}&name=${name}`)}
                        style={styles.studyBtn}
                        disabled={cards.length === 0}
                    >
                        <Text style={styles.studyText}>Study</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={cards}
                keyExtractor={item => item.id}
                renderItem={renderCard}
                contentContainerStyle={cards.length === 0 && styles.emptyContainer}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="layers-outline" size={48} color="#333" />
                        <Text style={styles.emptyText}>No cards yet</Text>
                        <Text style={styles.emptySubText}>Tap + to add a card or import a markdown file</Text>
                    </View>
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push(`/(app)/card-editor?deckId=${id}`)}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            <ImportPreviewModal
                visible={importModalVisible}
                cards={importPreview ?? []}
                onClose={() => setImportModalVisible(false)}
                onConfirm={handleConfirmImport}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
    },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconBtn: { padding: 8 },
    studyBtn: {
        backgroundColor: '#6c47ff',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        marginLeft: 4,
    },
    studyText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardFront: { flex: 1, color: '#fff', fontSize: 15 },
    starIcon: { marginLeft: 4 },
    separator: { height: 1, backgroundColor: '#1a1a1a', marginLeft: 20 },
    emptyContainer: { flex: 1 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 40 },
    emptyText: { color: '#555', fontSize: 16, fontWeight: '600', marginTop: 8 },
    emptySubText: { color: '#444', fontSize: 13, textAlign: 'center' },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6c47ff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
    },
});