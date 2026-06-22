export type ToolCall = {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
};

export type ToolDefinition = {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
};

export type ChatMessage =
    | { role: 'system'; content: string }
    | { role: 'user'; content: string }
    | {
          role: 'assistant';
          content: string | null;
          tool_calls?: ToolCall[];
      }
    | { role: 'tool'; tool_call_id: string; content: string };

export type LlmCompleteInput = {
    systemPrompt: string;
    messages: ChatMessage[];
    tools: ToolDefinition[];
    executeTool?: (
        name: string,
        args: Record<string, unknown>,
    ) => Promise<string>;
};

export type RetrievedChunk = {
    documentId: string;
    fileName: string;
    chunkIndex: number;
    text: string;
    score: number;
};

export type RegisteredTool = {
    definition: ToolDefinition;
    execute: (args: Record<string, unknown>) => Promise<string>;
};
