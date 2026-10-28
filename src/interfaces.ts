import type {
    LlmCompleteInput,
    LlmCompleteResult,
    RetrievedChunk,
    VectorPoint,
} from './types.js';

export interface BaseEmbedding {
    embed(texts: string[]): Promise<number[][]>;
}

export interface BaseLLM {
    complete(input: LlmCompleteInput): Promise<LlmCompleteResult>;
}

export interface BaseRetriever {
    run(query: string): Promise<RetrievedChunk[]>;
}

export interface BaseVectorStore {
    ingest(collectionName: string, points: VectorPoint[]): Promise<string[]>;
    search(
        collectionName: string,
        vector: number[],
        topK: number,
        filters?: Record<string, unknown>,
    ): Promise<RetrievedChunk[]>;
    delete(collectionName: string, filters: Record<string, unknown>): Promise<void>;
}
