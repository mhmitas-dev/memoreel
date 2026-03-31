import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: 'folder' | 'deck') => void;
}

export default function CreateNodeMenu({ visible, onClose, onSelect }: Props) {
    const slideAnim = useRef(new Animated.Value(200)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 4,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 200,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
                >
                    <View style={styles.handle} />

                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => { onSelect('folder'); onClose(); }}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#2a2a3a' }]}>
                            <Ionicons name="folder-outline" size={22} color="#6c47ff" />
                        </View>
                        <View>
                            <Text style={styles.optionTitle}>New Folder</Text>
                            <Text style={styles.optionSub}>Organise your decks</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => { onSelect('deck'); onClose(); }}
                    >
                        <View style={[styles.iconWrap, { backgroundColor: '#2a1a2a' }]}>
                            <Ionicons name="layers-outline" size={22} color="#c47fff" />
                        </View>
                        <View>
                            <Text style={styles.optionTitle}>New Deck</Text>
                            <Text style={styles.optionSub}>A set of flashcards</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 36,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
    optionSub: { color: '#888', fontSize: 13, marginTop: 2 },
});