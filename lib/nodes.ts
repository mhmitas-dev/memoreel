import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import db from './database';
import { supabase } from './supabase';

export type NodeType = 'folder' | 'deck';

export interface Node {
    id: string;
    user_id: string;
    parent_id: string | null;
    type: NodeType;
    name: string;
    created_at: string;
    updated_at: string;
    synced: number;
}

export function getNodes(userId: string, parentId: string | null): Node[] {
    if (parentId === null) {
        return db.getAllSync<Node>(
            `SELECT * FROM nodes WHERE user_id = ? AND parent_id IS NULL ORDER BY type DESC, name ASC`,
            [userId]
        );
    }
    return db.getAllSync<Node>(
        `SELECT * FROM nodes WHERE user_id = ? AND parent_id = ? ORDER BY type DESC, name ASC`,
        [userId, parentId]
    );
}

export function createNode(
    userId: string,
    parentId: string | null,
    type: NodeType,
    name: string
): Node {
    const node: Node = {
        id: uuidv4(),
        user_id: userId,
        parent_id: parentId,
        type,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced: 0,
    };

    db.runSync(
        `INSERT INTO nodes (id, user_id, parent_id, type, name, created_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [node.id, node.user_id, node.parent_id, node.type, node.name, node.created_at, node.updated_at]
    );

    // fire and forget sync
    syncNode(node);

    return node;
}

async function syncNode(node: Node) {
    const { error } = await supabase.from('nodes').upsert({
        id: node.id,
        user_id: node.user_id,
        parent_id: node.parent_id,
        type: node.type,
        name: node.name,
        created_at: node.created_at,
        updated_at: node.updated_at,
    });

    if (!error) {
        db.runSync(`UPDATE nodes SET synced = 1 WHERE id = ?`, [node.id]);
    }
}