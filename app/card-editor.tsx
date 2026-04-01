import { createCard, updateCard } from '@/lib/cards';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CardEditorScreen() {
    const router = useRouter();
    const { deckId, cardId, front: initialFront, back: initialBack } =
        useLocalSearchParams<{ deckId: string; cardId?: string; front?: string; back?: string }>();

    const isEditing = !!cardId;

    const [front, setFront] = useState(initialFront ? decodeURIComponent(initialFront) : '');
    const [back, setBack] = useState(initialBack ? decodeURIComponent(initialBack) : '');
    const backRef = useRef<TextInput>(null);

    function handleSave() {
        if (!front.trim() || !back.trim()) {
            Alert.alert('Both fields are required', 'Please fill in the front and back of the card.');
            return;
        }

        if (isEditing && cardId) {
            updateCard(cardId, front.trim(), back.trim());
        } else {
            createCard(deckId, front.trim(), back.trim());
        }

        router.back();
    }

    function handleSaveAndAdd() {
        if (!front.trim() || !back.trim()) {
            Alert.alert('Both fields are required', 'Please fill in the front and back of the card.');
            return;
        }

        createCard(deckId, front.trim(), back.trim());
        setFront('');
        setBack('');
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{isEditing ? 'Edit Card' : 'New Card'}</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                    <Text style={styles.label}>Front</Text>
                    <TextInput
                        style={styles.frontInput}
                        placeholder="Question or term"
                        placeholderTextColor="#555"
                        value={front}
                        onChangeText={setFront}
                        autoFocus
                        returnKeyType="next"
                        onSubmitEditing={() => backRef.current?.focus()}
                    />

                    <Text style={styles.label}>Back</Text>
                    <TextInput
                        ref={backRef}
                        style={styles.backInput}
                        placeholder="Answer or definition. Markdown supported."
                        placeholderTextColor="#555"
                        value={back}
                        onChangeText={setBack}
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>

                {!isEditing && (
                    <TouchableOpacity style={styles.addAnotherBtn} onPress={handleSaveAndAdd}>
                        <Ionicons name="add-circle-outline" size={18} color="#6c47ff" />
                        <Text style={styles.addAnotherText}>Save & Add Another</Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
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
        gap: 10,
    },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    title: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
    saveBtn: {
        backgroundColor: '#6c47ff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveText: { color: '#fff', fontWeight: '600' },
    body: { flex: 1, paddingHorizontal: 20 },
    label: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
    frontInput: {
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        padding: 14,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    backInput: {
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        padding: 14,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        minHeight: 200,
    },
    addAnotherBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
    },
    addAnotherText: { color: '#6c47ff', fontWeight: '600', fontSize: 15 },
});