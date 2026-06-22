import type { BaseLLM, BaseRetriever } from './interfaces.js';
import type {
    ChatMessage,
    RegisteredTool,
    ToolDefinition,
} from './types.js';

const RETRIEVE_CHUNKS_TOOL_NAME = 'retrieve_chunks';

export type ChatOptions = {
    llm: BaseLLM;
    retriever?: BaseRetriever;
    chatHistory?: ChatMessage[];
    systemPrompt?: string;
    tools?: RegisteredTool[];
};

export type ChatResponse = {
    content: string;
};

export class Chat {
    private readonly llm: BaseLLM;
    private readonly retriever?: BaseRetriever;
    private readonly history: ChatMessage[];
    private readonly systemPrompt: string;
    private readonly tools: RegisteredTool[];

    constructor(opts: ChatOptions) {
        this.llm = opts.llm;
        this.retriever = opts.retriever;
        this.history = opts.chatHistory ?? [];
        this.systemPrompt = opts.systemPrompt ?? '';
        this.tools = opts.tools ?? [];
    }

    private buildRetrieveTool(retriever: BaseRetriever): RegisteredTool {
        return {
            definition: {
                type: 'function',
                function: {
                    name: RETRIEVE_CHUNKS_TOOL_NAME,
                    description:
                        'Search the knowledge base for text chunks relevant to a query.',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description:
                                    'Search query to find relevant chunks',
                            },
                        },
                        required: ['query'],
                        additionalProperties: false,
                    },
                },
            },
            execute: async (args) => {
                const query = args.query;
                if (typeof query !== 'string' || !query.trim()) {
                    throw new Error(
                        `${RETRIEVE_CHUNKS_TOOL_NAME} requires a non-empty string "query"`,
                    );
                }
                const chunks = await retriever.run(query);
                return JSON.stringify(chunks);
            },
        };
    }

    async message(content: string): Promise<ChatResponse> {
        const trimmed = content.trim();
        if (!trimmed) {
            throw new Error('message content must not be empty');
        }

        const registeredTools = [
            ...(this.retriever ? [this.buildRetrieveTool(this.retriever)] : []),
            ...this.tools,
        ];
        const toolMap = new Map<string, RegisteredTool>(
            registeredTools.map((tool) => [tool.definition.function.name, tool]),
        );
        const tools: ToolDefinition[] = registeredTools.map(
            (tool) => tool.definition,
        );

        this.history.push({ role: 'user', content: trimmed });

        const answer = await this.llm.complete({
            systemPrompt: this.systemPrompt,
            messages: this.history,
            tools,
            executeTool: async (name, args) => {
                const tool = toolMap.get(name);
                if (!tool) {
                    throw new Error(`Unknown tool: ${name}`);
                }
                return await tool.execute(args);
            },
        });

        this.history.push({ role: 'assistant', content: answer });
        return { content: answer };
    }
}
