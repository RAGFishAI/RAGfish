import type { BaseEmbedding, BaseRetriever } from './interfaces.js';
import { Settings } from './settings.js';
import type { RetrievedChunk } from './types.js';

const DEFAULT_TOP_K = 5;

export type RetrieverOptions = {
    collectionName: string;
    filters?: Record<string, unknown>;
    topK?: number;
    embedding?: BaseEmbedding;
};

export class Retriever implements BaseRetriever {
    private readonly collectionName: string;
    private readonly filters?: Record<string, unknown>;
    private readonly topK: number;
    private readonly embedding: BaseEmbedding;

    constructor(opts: RetrieverOptions) {
        if (!opts.collectionName) {
            throw new Error('Retriever requires a collectionName');
        }
        const embedding = opts.embedding ?? Settings.embedding;
        if (!embedding) {
            throw new Error(
                'No embedding configured. Pass opts.embedding or set Settings.embedding before creating Retriever.',
            );
        }
        this.collectionName = opts.collectionName;
        this.filters = opts.filters;
        this.topK = opts.topK ?? DEFAULT_TOP_K;
        this.embedding = embedding;
    }

    async run(query: string): Promise<RetrievedChunk[]> {
        if (!Settings.vectorStore) {
            throw new Error(
                'Settings.vectorStore is not set. Assign a vector store before retrieving.',
            );
        }

        const [vector] = await this.embedding.embed([query]);
        return Settings.vectorStore.search(
            this.collectionName,
            vector,
            this.topK,
            this.filters,
        );
    }
}
