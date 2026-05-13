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
      type: Number,
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
        }"
      >
        <div class="question-row">
          <div class="question-text">{{ message.action }}</div>
        </div>
        <div class="answer-card">
          <p class="meta">
            {{ message.status }} <span v-if="message.thinking"></span
            ><span v-if="message.thinking"></span>
          </p>
          <h3>{{ message.title }}</h3>
          <p>{{ message.content }}</p>
          <button
            class="view-link"
            :class="{ active: activeViewedMessageId === message.id }"
            @click.stop="$emit('view-message', message)"
          >
            查看
          </button>
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
        <el-button
          class="plus"
          text
          :icon="Plus"
          @click="$emit('create-topic')"
        />
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
