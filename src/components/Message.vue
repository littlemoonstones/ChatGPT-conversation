<script setup lang="ts">
import { defineProps, ref } from 'vue'
import type { PropType } from 'vue'
import type { ChatMessage } from '@/lib/Type'
import { ChatCompletionRequestMessageRoleEnum } from '@/lib/Type'
import { useChatRoomStore } from '@/stores/chatroom'
import { useStatusStore } from '@/stores/status'
import { getResponse } from '@/lib/ChatGPTMock'

// https://github.com/vuejs/core/issues/4294
// https://stackoverflow.com/questions/64831745/props-typing-in-vue-js-3-with-typescript
const props = defineProps({
  message: {
    type: Object as PropType<ChatMessage>,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})
const chatRoomStore = useChatRoomStore()
const statusStore = useStatusStore()

const parentId = props.message.parentMessageId
const parentNode = chatRoomStore.data?.mapping[parentId!]!
const isUser = props.message.role == ChatCompletionRequestMessageRoleEnum.User

const isEdit = ref(false)
const editMessage = ref('')

const total_length = parentNode.children.length
const currentPage = parentNode.children.indexOf(props.message.id)

const clickEditMessage = () => {
  isEdit.value = true
  editMessage.value = props.message.text
}

const clickCancel = () => {
  isEdit.value = false
  editMessage.value = ''
}

// Submit Message
const clickSubmit = async (text: string) => {
  statusStore.isLoading = true
  chatRoomStore.editMessage(props.index, text)

  // request ChatGPT Mock API
  let response = await getResponse(text)
  chatRoomStore.addMessage({
    ...response,
    parentMessageId: chatRoomStore.data?.current_node
  })

  isEdit.value = false
  editMessage.value = ''
  statusStore.isLoading = false
}
</script>
<template>
  <div class="w-full p-10 bg-base-100" :class="{ 'bg-neutral': isUser }">
    <div class="flex w-full">
      <div class="flex-1">
        <h2 class="font-bold font-mono">{{ props.message.role }}</h2>
        <p v-if="!isEdit">{{ props.message.text }}</p>
        <div v-else>
          <textarea class="w-full" v-model="editMessage"></textarea>
          <div class="flex justify-center">
            <button class="btn btn-success btn-sm" @click="clickSubmit(editMessage)">Submit</button>
            <button class="btn btn-outline btn-sm ml-2" @click="clickCancel">Cancel</button>
          </div>
        </div>
      </div>

      <div>
        <button v-if="isUser" class="btn btn-outline btn-sm" @click="clickEditMessage">Edit</button>
      </div>
    </div>
    <div v-if="total_length! > 1" class="flex btn-group items-center">
      <button
        class="btn btn-sm btn-ghost"
        :class="{ 'btn-disabled': currentPage == 0 }"
        @click="
          () => {
            chatRoomStore.switchNode(props.index, -1)
          }
        "
      >
        «
      </button>
      <p class="text-center">{{ currentPage + 1 }} / {{ total_length }}</p>
      <button
        class="btn btn-sm btn-ghost"
        :class="{ 'btn-disabled': currentPage + 1 == total_length }"
        @click="chatRoomStore.switchNode(props.index, 1)"
      >
        »
      </button>
    </div>
  </div>
</template>
