import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import db from './database';
import { supabase } from './supabase';

export interface Card {
    id: string;
    deck_id: string;
    front: string;
    back: string;
    position: number;
    starred: number;
    created_at: string;
    updated_at: string;
    synced: number;
}

export function getCards(deckId: string): Card[] {
    return db.getAllSync<Card>(
        `SELECT * FROM cards WHERE deck_id = ? ORDER BY position ASC, created_at ASC`,
        [deckId]
    );
}

export function createCard(deckId: string, front: string, back: string): Card {
    const count = db.getFirstSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM cards WHERE deck_id = ?`,
        [deckId]
    );
    const position = count?.count ?? 0;

    const card: Card = {
        id: uuidv4(),
        deck_id: deckId,
        front,
        back,
        position,
        starred: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced: 0,
    };

    db.runSync(
        `INSERT INTO cards (id, deck_id, front, back, position, starred, created_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, 0)`,
        [card.id, card.deck_id, card.front, card.back, card.position, card.created_at, card.updated_at]
    );

    syncCard(card);
    return card;
}

export function updateCard(id: string, front: string, back: string): void {
    const now = new Date().toISOString();
    db.runSync(
        `UPDATE cards SET front = ?, back = ?, updated_at = ?, synced = 0 WHERE id = ?`,
        [front, back, now, id]
    );
    const card = db.getFirstSync<Card>(`SELECT * FROM cards WHERE id = ?`, [id]);
    if (card) syncCard(card);
}

export function toggleStar(id: string): void {
    db.runSync(
        `UPDATE cards SET starred = CASE WHEN starred = 1 THEN 0 ELSE 1 END, synced = 0 WHERE id = ?`,
        [id]
    );
    const card = db.getFirstSync<Card>(`SELECT * FROM cards WHERE id = ?`, [id]);
    if (card) syncCard(card);
}

export function deleteCard(id: string): void {
    db.runSync(`DELETE FROM cards WHERE id = ?`, [id]);
    supabase.from('cards').delete().eq('id', id);
}

export function bulkCreateCards(
    deckId: string,
    cards: { front: string; back: string }[]
): void {
    const count = db.getFirstSync<{ count: number }>(
        `SELECT COUNT(*) as count FROM cards WHERE deck_id = ?`,
        [deckId]
    );
    let position = count?.count ?? 0;

    for (const c of cards) {
        const card: Card = {
            id: uuidv4(),
            deck_id: deckId,
            front: c.front,
            back: c.back,
            position: position++,
            starred: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            synced: 0,
        };

        db.runSync(
            `INSERT INTO cards (id, deck_id, front, back, position, starred, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, 0)`,
            [card.id, card.deck_id, card.front, card.back, card.position, card.created_at, card.updated_at]
        );

        syncCard(card);
    }
}

async function syncCard(card: Card) {
    const { error } = await supabase.from('cards').upsert({
        id: card.id,
        deck_id: card.deck_id,
        front: card.front,
        back: card.back,
        position: card.position,
        starred: card.starred,
        created_at: card.created_at,
        updated_at: card.updated_at,
    });

    if (!error) {
        db.runSync(`UPDATE cards SET synced = 1 WHERE id = ?`, [card.id]);
    }
}