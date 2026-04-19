import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    visible: boolean;
    cards: { front: string; back: string }[];
    onClose: () => void;
    onConfirm: (cards: { front: string; back: string }[]) => void;
}

export default function ImportPreviewModal({ visible, cards, onClose, onConfirm }: Props) {
    const insets = useSafeAreaInsets();

    function handleConfirm() {
        onConfirm(cards);
        onClose();
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{cards.length} cards found</Text>
                    <TouchableOpacity onPress={handleConfirm}>
                        <Text style={styles.confirm}>Import</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={cards}
                    keyExtractor={(_, i) => String(i)}
                    renderItem={({ item, index }) => (
                        <View style={styles.cardRow}>
                            <Text style={styles.index}>{index + 1}</Text>
                            <View style={styles.cardContent}>
                                <Text style={styles.front}>{item.front}</Text>
                                <Text style={styles.back} numberOfLines={2}>{item.back}</Text>
                            </View>
                        </View>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.list}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    title: { color: '#fff', fontWeight: '700', fontSize: 16 },
    cancel: { color: '#888', fontSize: 15 },
    confirm: { color: '#6c47ff', fontSize: 15, fontWeight: '700' },
    list: { padding: 20 },
    cardRow: { flexDirection: 'row', gap: 14, paddingVertical: 4 },
    index: { color: '#444', fontSize: 13, width: 24, paddingTop: 2 },
    cardContent: { flex: 1 },
    front: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    back: { color: '#888', fontSize: 13 },
    separator: { height: 12 },
});