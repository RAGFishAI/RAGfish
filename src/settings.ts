import type { BaseEmbedding, BaseLLM } from './interfaces.js';

class SettingsRegistry {
    embedding?: BaseEmbedding;
    llm?: BaseLLM;
}

export const Settings = new SettingsRegistry();

