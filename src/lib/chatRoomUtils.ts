import type { Data, ChatMessage } from './types'

export const collectMessagesFromNode = (data: Data, startNodeId: string): ChatMessage[] => {
    const messageList: ChatMessage[] = []
    let currentNode = data.mapping[startNodeId]

    while (currentNode.children.length > 0) {
        messageList.push(currentNode)
        currentNode = data.mapping[currentNode.children[0]]
    }

    messageList.push(currentNode)
    return messageList
}

// click child to switch next or previous
// increment: +1 or -1
// +1: next child
// -1: previouse child
export const switchNode = (
    currentMessageList: ChatMessage[],
    index: number,
    increment: number,
    data: Data | null
) => {
    if (!data) return

    const childNode = currentMessageList[index]
    const parentId = childNode.parentMessageId

    if (parentId) {
        const parentNode = data.mapping[parentId]
        const childIndex = parentNode.children.indexOf(childNode.id)
        const nextChildId = parentNode.children[childIndex + increment]

        if (nextChildId) {
            const newMessageList = collectMessagesFromNode(data, nextChildId)
            currentMessageList.splice(index)
            currentMessageList.push(...newMessageList)

            data.current_node = newMessageList[newMessageList.length - 1].id
        }
    }
}

export const loadCurrentMessages = (currentMessageList: ChatMessage[], data: Data | null) => {
    if (!data) return

    const currentNodeId = data.current_node
    currentMessageList.splice(0, currentMessageList.length)

    if (currentNodeId) {
        const messageList = collectMessagesFromNode(data, currentNodeId)
        currentMessageList.unshift(...messageList.reverse())
    }
}

export enum MessageOperationType {
    ADD,
    EDIT
}

export const processMessage = (
    currentMessageList: ChatMessage[],
    data: Data | null,
    operationType: MessageOperationType,
    message: ChatMessage,
    index?: number
) => {
    if (!data) return

    const { parentMessageId } = message
    if (parentMessageId) {
        const parentNode = data.mapping[parentMessageId]
        const originalChildLength = parentNode.children.length

        parentNode.children.push(message.id)
        data.mapping[message.id] = message

        if (operationType === MessageOperationType.EDIT && index !== undefined) {
            currentMessageList.splice(index)
        } else if (operationType === MessageOperationType.ADD && originalChildLength > 0) {
            currentMessageList.pop()
        }
        // replace the old messages with the other messages from next child
        currentMessageList.push(message)
        data.current_node = message.id
    }
}
