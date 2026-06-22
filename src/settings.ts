import type { BaseEmbedding } from './interfaces.js';

class SettingsRegistry {
    embedding?: BaseEmbedding;
}

export const Settings = new SettingsRegistry();
