import { Card } from './cards';

export function parseMarkdown(content: string): { front: string; back: string }[] {
    const cards: { front: string; back: string }[] = [];
    const lines = content.split('\n');

    let currentFront: string | null = null;
    let currentBack: string[] = [];

    for (const line of lines) {
        if (line.startsWith('## ')) {
            // save previous card if exists
            if (currentFront !== null) {
                const back = currentBack.join('\n').trim();
                if (back) cards.push({ front: currentFront, back });
            }
            currentFront = line.replace('## ', '').trim();
            currentBack = [];
        } else if (line.startsWith('# ')) {
            // ignore h1
            continue;
        } else if (currentFront !== null) {
            currentBack.push(line);
        }
    }

    // save last card
    if (currentFront !== null) {
        const back = currentBack.join('\n').trim();
        if (back) cards.push({ front: currentFront, back });
    }

    return cards;
}

export function exportMarkdown(deckName: string, cards: Card[]): string {
    const lines: string[] = [];
    lines.push(`# ${deckName}`);
    lines.push('');

    for (const card of cards) {
        lines.push(`## ${card.front}`);
        lines.push(card.back);
        lines.push('');
    }

    return lines.join('\n');
}