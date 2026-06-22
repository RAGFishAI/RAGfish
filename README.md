# ragfish

Core RAG (Retrieval-Augmented Generation) primitives for Node.js.

`ragfish` provides a `Chat` orchestrator, provider interfaces (`BaseLLM`, `BaseEmbedding`, `BaseRetriever`), and a `Settings` registry. It has **zero runtime dependencies** — you bring your own LLM and embedding providers.

## Install

```bash
npm install ragfish
```

## Quick start

```ts
import { Chat, Settings } from 'ragfish';

// 1. Set a global embedding provider (used by retrievers)
//    Use @ragfish/openai or implement BaseEmbedding yourself
import { OpenAIEmbedding } from '@ragfish/openai';

Settings.embedding = new OpenAIEmbedding({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'text-embedding-3-small',
});

// 2. Create an LLM instance
import { OpenAILLM } from '@ragfish/openai';

const llm = new OpenAILLM({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
});

// 3. (Optional) Create a retriever
import { QdrantRetriever } from '@ragfish/qdrant';

const retriever = new QdrantRetriever({
    collectionName: 'my-docs',
    topK: 5,
});

// 4. Start a chat
const chat = new Chat({
    llm,
    retriever,       // optional — adds a built-in retrieve_chunks tool
    systemPrompt: 'You are a helpful assistant.',
});

const response = await chat.message('What is the refund policy?');
console.log(response.content);

// Continue the same conversation — history is maintained automatically
const followUp = await chat.message('Can I get a full refund after 30 days?');
console.log(followUp.content);
```

## Core concepts

### `Chat`

The main orchestrator. Maintains conversation history in memory and handles the LLM tool-call loop automatically.

```ts
const chat = new Chat({
    llm,                      // required — any BaseLLM implementation
    retriever,                // optional — any BaseRetriever implementation
    systemPrompt: '...',      // optional
    chatHistory: [],          // optional — resume an existing conversation
    tools: [],                // optional — additional custom tools
});

const { content } = await chat.message('user input here');
```

When a `retriever` is provided, `Chat` automatically registers a `retrieve_chunks` tool. The LLM decides when to call it based on the conversation.

### Custom tools

Register your own tools alongside the built-in retriever:

```ts
import type { RegisteredTool } from 'ragfish';

const calculatorTool: RegisteredTool = {
    definition: {
        type: 'function',
        function: {
            name: 'calculate',
            description: 'Evaluate a math expression',
            parameters: {
                type: 'object',
                properties: {
                    expression: { type: 'string' },
                },
                required: ['expression'],
                additionalProperties: false,
            },
        },
    },
    execute: async (args) => {
        // your logic here
        return String(eval(args.expression as string));
    },
};

const chat = new Chat({ llm, tools: [calculatorTool] });
```

### `Settings`

Global registry for shared providers. Currently holds `embedding`.

```ts
import { Settings } from 'ragfish';

Settings.embedding = myEmbeddingProvider; // must be set before any retriever runs
```

## Provider interfaces

Implement these to bring your own providers:

```ts
import type { BaseEmbedding, BaseLLM, BaseRetriever, RetrievedChunk, LlmCompleteInput } from 'ragfish';

// Custom embedding
class MyEmbedding implements BaseEmbedding {
    async embed(texts: string[]): Promise<number[][]> {
        // call your embedding API
    }
}

// Custom LLM
class MyLLM implements BaseLLM {
    async complete(input: LlmCompleteInput): Promise<string> {
        // call your LLM API, handle tool calls
    }
}

// Custom retriever
class MyRetriever implements BaseRetriever {
    async run(query: string): Promise<RetrievedChunk[]> {
        // embed query and search your vector store
    }
}
```

### `RetrievedChunk` shape

```ts
type RetrievedChunk = {
    documentId: string;
    fileName: string;
    chunkIndex: number;
    text: string;
    score: number;
};
```

## Official providers

| Package | Provides |
|---|---|
| [`@ragfish/openai`](https://www.npmjs.com/package/@ragfish/openai) | `OpenAIEmbedding`, `OpenAILLM` |
| [`@ragfish/qdrant`](https://www.npmjs.com/package/@ragfish/qdrant) | `QdrantRetriever`, `ingest()`, `chunkText()` |

## TypeScript

`ragfish` ships with full TypeScript declarations. No `@types/*` needed.

Requires `"moduleResolution": "NodeNext"` or `"Bundler"` in your `tsconfig.json`.

## License

MIT
