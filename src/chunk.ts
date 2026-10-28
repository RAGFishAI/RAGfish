export function chunkText(
    text: string,
    chunkSize?: number,
    chunkOverlap?: number,
): string[] {
    const normalized = text.trim();
    if (!normalized) {
        return [];
    }

    if (chunkSize === undefined) {
        return [normalized];
    }

    const overlap = chunkOverlap ?? 200;
    if (overlap >= chunkSize) {
        throw new Error('chunkOverlap must be less than chunkSize');
    }

    const chunks: string[] = [];
    let start = 0;
    while (start < normalized.length) {
        const end = Math.min(start + chunkSize, normalized.length);
        const chunk = normalized.slice(start, end).trim();
        if (chunk) {
            chunks.push(chunk);
        }
        if (end >= normalized.length) {
            break;
        }
        start = end - overlap;
    }
    return chunks;
}
