import type { LlmCompleteInput, RetrievedChunk } from './types.js';

export interface BaseEmbedding {
    embed(texts: string[]): Promise<number[][]>;
}

export interface BaseLLM {
    complete(input: LlmCompleteInput): Promise<string>;
}

export interface BaseRetriever {
    run(query: string): Promise<RetrievedChunk[]>;
}
