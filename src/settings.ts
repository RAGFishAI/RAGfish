import type { BaseEmbedding, BaseLLM, BaseVectorStore } from './interfaces.js';

class SettingsRegistry {
    embedding?: BaseEmbedding;
    llm?: BaseLLM;
    vectorStore?: BaseVectorStore;
}

export const Settings = new SettingsRegistry();

