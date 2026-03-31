import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

interface Props {
    visible: boolean;
    type: 'folder' | 'deck' | null;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export default function NameInputModal({ visible, type, onClose, onConfirm }: Props) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (!visible) setName('');
    }, [visible]);

    function handleConfirm() {
        if (!name.trim()) return;
        onConfirm(name.trim());
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.dialog}>
                    <Text style={styles.title}>
                        {type === 'folder' ? 'New Folder' : 'New Deck'}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder={type === 'folder' ? 'Folder name' : 'Deck name'}
                        placeholderTextColor="#888"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        onSubmitEditing={handleConfirm}
                    />

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmBtn, !name.trim() && styles.confirmDisabled]}
                            onPress={handleConfirm}
                            disabled={!name.trim()}
                        >
                            <Text style={styles.confirmText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    dialog: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 24,
    },
    title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
    input: {
        backgroundColor: '#0f0f0f',
        borderRadius: 10,
        padding: 13,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        marginBottom: 20,
    },
    actions: { flexDirection: 'row', gap: 10 },
    cancelBtn: {
        flex: 1, padding: 13, borderRadius: 10,
        backgroundColor: '#2a2a2a', alignItems: 'center',
    },
    cancelText: { color: '#888', fontWeight: '600' },
    confirmBtn: {
        flex: 1, padding: 13, borderRadius: 10,
        backgroundColor: '#6c47ff', alignItems: 'center',
    },
    confirmDisabled: { opacity: 0.4 },
    confirmText: { color: '#fff', fontWeight: '600' },
});