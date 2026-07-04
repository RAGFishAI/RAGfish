import { randomUUID } from 'node:crypto';
import { chunkText } from './chunk.js';
import { Settings } from './settings.js';
import type { IngestInput } from './types.js';

export type { IngestInput };

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

export class Ingest {
    private readonly collectionName: string;

    constructor(collectionName: string) {
        if (!collectionName) {
            throw new Error('Ingest requires a collectionName');
        }
        this.collectionName = collectionName;
    }

    async run(input: IngestInput): Promise<string[]> {
        if (!Settings.vectorStore) {
            throw new Error(
                'Settings.vectorStore is not set. Assign a vector store before ingesting.',
            );
        }
        if (!Settings.embedding) {
            throw new Error(
                'Settings.embedding is not set. Assign an embedding provider before ingesting.',
            );
        }

        const chunks = chunkText(
            input.text,
            input.chunkSize ?? DEFAULT_CHUNK_SIZE,
            input.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
        );
        if (chunks.length === 0) {
            throw new Error('Text has no indexable content');
        }

        const vectors = await Settings.embedding.embed(chunks);

        const points = chunks.map((chunk, index) => ({
            id: randomUUID(),
            vector: vectors[index],
            payload: {
                ...input.payload,
                text: chunk,
                chunkIndex: index,
            },
        }));

        return Settings.vectorStore.ingest(this.collectionName, points);
    }
}
