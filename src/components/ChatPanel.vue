<script setup>
  import { ref } from "vue";
  import { Minus, Plus, Position } from "@element-plus/icons-vue";

  defineProps({
    messages: {
      type: Array,
      required: true,
    },
    promptText: {
      type: String,
      required: true,
    },
    isThinking: {
      type: Boolean,
      required: true,
    },
    activeViewedMessageId: {
      type: [Number, String],
      default: null,
    },
  });

  defineEmits([
    "update:promptText",
    "send",
    "quick-question",
    "view-message",
    "collapse",
    "create-topic",
  ]);

  const chatThreadRef = ref(null);
  const contentPreviewLength = 42;

  const normalizeContent = (content) => String(content ?? "");

  const isContentOverflow = (content) =>
    normalizeContent(content).length > contentPreviewLength;

  const getPreviewContent = (content) => {
    const text = normalizeContent(content);
    return isContentOverflow(text) ? text.slice(0, contentPreviewLength) : text;
  };

  const scrollToBottom = () => {
    chatThreadRef.value?.scrollTo({
      top: chatThreadRef.value.scrollHeight,
      behavior: "smooth",
    });
  };

  defineExpose({
    scrollToBottom,
  });
</script>

<template>
  <aside class="chat-panel">
    <el-button
      class="collapse-btn"
      :icon="Minus"
      circle
      @click="$emit('collapse')"
    />
    <div ref="chatThreadRef" class="chat-thread">
      <section
        v-for="message in messages"
        :key="message.id"
        class="message-block"
        :class="{
          thinking: message.thinking,
          highlighted: activeViewedMessageId === message.id,
          question: message.role === 'user',
          answer: message.role === 'assistant',
        }"
      >
        <div v-if="message.role === 'user'" class="question-row">
          <div class="question-text">{{ message.content }}</div>
        </div>
        <div
          v-else-if="message.role === 'assistant'"
          class="answer-card"
          @click="$emit('view-message', message)"
        >
          <p class="meta">
            {{ message.status }} <span v-if="message.thinking"></span
            ><span v-if="message.thinking"></span>
          </p>
          <h3>{{ message.title }}</h3>
          <p class="content-row">
            <span class="content-text">{{
              getPreviewContent(message.content)
            }}</span
            ><span v-if="isContentOverflow(message.content)">...</span>
            <span
              class="view-link"
              :class="{ active: activeViewedMessageId === message.id }"
            >
              查看
            </span>
          </p>
        </div>
      </section>
    </div>

    <div class="prompt-card">
      <el-input
        :model-value="promptText"
        class="prompt-input"
        type="textarea"
        resize="none"
        :autosize="false"
        placeholder="请输入你的问题"
        @update:model-value="$emit('update:promptText', $event)"
        @keydown.enter.exact.prevent="$emit('send')"
      />
      <div class="prompt-actions">
        <el-button class="plus" text :icon="Plus" />
        <el-button
          class="send"
          :icon="Position"
          :loading="isThinking"
          @click="$emit('send')"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
  .chat-panel {
    position: relative;
    height: calc(100vh - 70px);
    min-height: 640px;
    margin-top: 0;
    border: 1px solid rgba(62, 38, 118, 0.7);
    border-radius: 16px;
    background: #ffffff;
  }

  .collapse-btn.el-button {
    display: none;
  }

  .chat-thread {
    height: calc(100% - 190px);
    overflow-y: auto;
    margin-top: 8px;
    padding: 0px 29px 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .chat-thread::-webkit-scrollbar {
    display: none;
  }

  .message-block {
    position: relative;
    margin-bottom: 33px;
    padding: 0;
  }

  .question-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }

  .message-block:first-child .question-row {
    margin-top: 20px;
  }

  .question-row .question-text {
    display: flex;
    max-width: 330px;
    padding: 6px 12px;
    border-radius: 6px;
    background-color: #f0f0f0;
    color: rgba(0, 0, 0, 0.82);
    font-size: 12px;
    line-height: 18px;
  }

  .answer-card {
    padding: 0;
    cursor: pointer;
    max-width: 360px;
  }

  .message-block.highlighted .answer-card {
    padding: 14px 16px;
    background: #3e26760f;
    /* box-shadow: 0 4px 4px rgba(0, 0, 0, 0.06); */
  }

  .message-block .meta {
    margin: 0 0 8px;
    color: rgba(0, 0, 0, 0.35);
    font-size: 12px;
    line-height: 17px;
  }

  .message-block h3 {
    margin: 0 0 4px;
    color: #000000;
    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  .answer-card > p:not(.meta) {
    max-width: 330px;
    margin: 0;
    color: rgba(0, 0, 0, 0.72);
    font-size: 13px;
    line-height: 18px;
  }

  .content-row {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    text-overflow: ellipsis;
  }

  .view-link {
    margin-left: 6px;
    color: #6f3fd3;
    font-size: 12px;
    line-height: 17px;
  }

  .view-link.active {
    color: #4a2788;
    font-weight: 500;
  }

  .thinking .meta {
    color: rgba(0, 0, 0, 0.75);
    font-weight: 500;
  }

  .thinking .meta span {
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-left: 6px;
    border-radius: 50%;
    background: #6f3fd3;
    vertical-align: middle;
  }

  .thinking .meta span + span {
    opacity: 0.28;
  }

  .prompt-card {
    position: absolute;
    right: 35px;
    bottom: 32px;
    left: 35px;
    min-height: 120px;
    padding: 22px 16px 50px;
    border: 1px solid #e6dff5;
    border-radius: 12px;
    background: #fafafa;
    box-shadow: 0 4px 16px rgba(88, 53, 132, 0.1);
  }

  .prompt-card:hover {
    background: #ffffff;
    box-shadow: 0 4px 24px rgba(88, 53, 132, 0.18);
    border: 1px solid rgba(62, 38, 118, 0.3);
  }

  .prompt-input :deep(.el-textarea__inner) {
    min-height: 44px !important;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: #000000;
    font-size: 15px;
    line-height: 21px;
    resize: none;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .prompt-input :deep(.el-textarea__inner::-webkit-scrollbar) {
    display: none;
  }

  .prompt-input :deep(.el-textarea__inner:focus) {
    box-shadow: none;
  }

  .prompt-actions {
    position: absolute;
    right: 16px;
    bottom: 14px;
    left: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .prompt-actions .plus.el-button {
    color: rgba(0, 0, 0, 0.75);
    font-size: 20px;
  }

  .prompt-actions .send.el-button {
    width: 31px;
    height: 31px;
    border: 0;
    border-radius: 6px;
    background: #4a2788;
    color: #ffffff;
  }

  .prompt-actions .send.el-button:hover,
  .prompt-actions .send.el-button:focus {
    background: #4a2788;
    color: #ffffff;
  }
</style>
