import CreateNodeMenu from '@/components/CreateNodeMenu';
import NameInputModal from '@/components/NameInputModal';
import { createNode, getNodes, Node } from '@/lib/nodes';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function HomeScreen() {
    const router = useRouter();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [pendingType, setPendingType] = useState<'folder' | 'deck' | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id);
            }
        });
    }, []);

    const loadNodes = useCallback(() => {
        if (!userId) return;
        const result = getNodes(userId, null);
        setNodes(result);
    }, [userId]);

    useEffect(() => {
        loadNodes();
    }, [loadNodes]);

    function handleMenuSelect(type: 'folder' | 'deck') {
        setPendingType(type);
        setNameModalVisible(true);
    }

    function handleCreate(name: string) {
        if (!userId || !pendingType) return;
        createNode(userId, null, pendingType, name);
        loadNodes();
    }

    function handleNodePress(node: Node) {
        if (node.type === 'folder') {
            router.push(`/(app)/folder/${node.id}?name=${encodeURIComponent(node.name)}`);
        } else {
            router.push(`/(app)/deck/${node.id}?name=${encodeURIComponent(node.name)}`);
        }
    }

    function renderNode({ item }: { item: Node }) {
        const isFolder = item.type === 'folder';
        return (
            <TouchableOpacity style={styles.nodeRow} onPress={() => handleNodePress(item)}>
                <View style={[styles.nodeIcon, { backgroundColor: isFolder ? '#2a2a3a' : '#2a1a2a' }]}>
                    <Ionicons
                        name={isFolder ? 'folder-outline' : 'layers-outline'}
                        size={20}
                        color={isFolder ? '#6c47ff' : '#c47fff'}
                    />
                </View>
                <Text style={styles.nodeName}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Library</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setMenuVisible(true)}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={nodes}
                keyExtractor={item => item.id}
                renderItem={renderNode}
                contentContainerStyle={nodes.length === 0 && styles.emptyContainer}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="library-outline" size={48} color="#333" />
                        <Text style={styles.emptyText}>Nothing here yet</Text>
                        <Text style={styles.emptySubText}>Tap + to create a folder or deck</Text>
                    </View>
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <CreateNodeMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={handleMenuSelect}
            />

            <NameInputModal
                visible={nameModalVisible}
                type={pendingType}
                onClose={() => setNameModalVisible(false)}
                onConfirm={handleCreate}
            />
        </SafeAreaView>
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
    },
    title: { fontSize: 28, fontWeight: '700', color: '#fff' },
    addBtn: {
        backgroundColor: '#6c47ff',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 14,
    },
    nodeIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nodeName: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500' },
    separator: { height: 1, backgroundColor: '#1a1a1a', marginLeft: 74 },
    emptyContainer: { flex: 1 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    emptyText: { color: '#555', fontSize: 16, fontWeight: '600', marginTop: 8 },
    emptySubText: { color: '#444', fontSize: 13 },
});