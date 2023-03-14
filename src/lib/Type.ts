export type Role = 'user' | 'assistant' | 'system'

export type Data = {
    title: string
    create_time: number
    mapping: Mapping
    // moderation_results: ModerationResult[];
    current_node: string
}

type Mapping = Record<string, ChatMessage>

export interface ChatMessage {
    id: string
    text: string
    role: Role
    // name?: string
    // delta?: string
    // detail?: any

    // relevant for both ChatGPTAPI and ChatGPTUnofficialProxyAPI
    parentMessageId?: string
    children: string[]
    // only relevant for ChatGPTUnofficialProxyAPI
    conversationId?: string
}

export type ConversationResponseEvent = {
    message?: Message
    conversation_id?: string
    error?: string | null
}

export type Message = {
    id: string
    // content: MessageContent
    role: Role
    content: string
    // user: string | null
    // create_time: string | null
    // update_time: string | null
    // end_turn: null
    // weight: number
    // recipient: string
    // metadata: MessageMetadata
}

export enum ChatCompletionRequestMessageRoleEnum {
    System = 'system',
    User = 'user',
    Assistant = 'assistant'
}

export type SendMessageOptions = {
    /** The name of a user in a multi-user chat. */
    name?: string
    parentMessageId?: string
    messageId?: string
    // stream?: boolean
    // systemMessage?: string
    // timeoutMs?: number
    // onProgress?: (partialResponse: ChatMessage) => void
    // abortSignal?: AbortSignal
}

export interface Conversation {
    id: string
    title: string
    create_time: number
}
