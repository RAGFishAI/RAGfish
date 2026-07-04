import { randomUUID } from 'node:crypto';
import { chunkText } from './chunk.js';
import type { BaseEmbedding } from './interfaces.js';
import { Settings } from './settings.js';
import type { IngestInput } from './types.js';

export type { IngestInput };

export type IngestOptions = {
    collectionName: string;
    embedding?: BaseEmbedding;
};

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

export class Ingest {
    private readonly collectionName: string;
    private readonly embedding: BaseEmbedding;

    constructor(opts: IngestOptions) {
        if (!opts.collectionName) {
            throw new Error('Ingest requires a collectionName');
        }
        const embedding = opts.embedding ?? Settings.embedding;
        if (!embedding) {
            throw new Error(
                'No embedding configured. Pass opts.embedding or set Settings.embedding before creating Ingest.',
            );
        }
        this.collectionName = opts.collectionName;
        this.embedding = embedding;
    }

    async run(input: IngestInput): Promise<string[]> {
        if (!Settings.vectorStore) {
            throw new Error(
                'Settings.vectorStore is not set. Assign a vector store before ingesting.',
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

        const vectors = await this.embedding.embed(chunks);

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
