import type { BaseRetriever, BaseVectorStore } from './interfaces.js';
import { Settings } from './settings.js';
import type { RetrievedChunk } from './types.js';

const DEFAULT_TOP_K = 5;

export type RetrieverOptions = {
    collectionName: string;
    filters?: Record<string, unknown>;
    topK?: number;
};

export class Retriever implements BaseRetriever {
    private readonly collectionName: string;
    private readonly filters?: Record<string, unknown>;
    private readonly topK: number;

    constructor(opts: RetrieverOptions) {
        if (!opts.collectionName) {
            throw new Error('Retriever requires a collectionName');
        }
        this.collectionName = opts.collectionName;
        this.filters = opts.filters;
        this.topK = opts.topK ?? DEFAULT_TOP_K;
    }

    async run(query: string): Promise<RetrievedChunk[]> {
        const store = Settings.vectorStore as BaseVectorStore | undefined;
        if (!store) {
            throw new Error(
                'Settings.vectorStore is not set. Assign a vector store before retrieving.',
            );
        }
        if (!Settings.embedding) {
            throw new Error(
                'Settings.embedding is not set. Assign an embedding provider before retrieving.',
            );
        }

        const [vector] = await Settings.embedding.embed([query]);
        return store.search(this.collectionName, vector, this.topK, this.filters);
    }
}
