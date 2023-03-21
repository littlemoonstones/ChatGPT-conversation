import type { ChatMessage } from './types'
import { ChatCompletionRequestMessageRoleEnum } from './types'
import { faker } from '@faker-js/faker'

/*
This is the ChatGPT Mock API, which simulates the behavior of the ChatGPT API for testing and development purposes. 
It includes sample data and response formats that can be used to test client-side code that interacts with the ChatGPT API.
 */
export const getResponse = async (prompt: string): Promise<ChatMessage> => {
    await new Promise((resolve) => setTimeout(resolve, 2000 * Math.random()))
    return {
        id: faker.datatype.uuid(),
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        text: faker.commerce.product(),
        children: []
    }
}
