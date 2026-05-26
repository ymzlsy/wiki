<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  floating?: boolean
}>()

const question = ref('')
const loading = ref(false)
const answer = ref('')
const error = ref('')
const remaining = ref<number | null>(null)
const limit = ref<number | null>(3)
const isOpen = ref(false)

const canSubmit = computed(() => {
  return !loading.value && question.value.trim().length >= 8
})

async function submitQuestion() {
  if (!canSubmit.value) return

  loading.value = true
  answer.value = ''
  error.value = ''

  try {
    const response = await fetch('/api/harness-qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question.value.trim()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error || '问答暂时不可用，请稍后再试。')
    }

    answer.value = data.answer || ''
    remaining.value = typeof data.remaining === 'number' ? data.remaining : null
    limit.value = typeof data.limit === 'number' ? data.limit : limit.value
  } catch (err) {
    error.value = err instanceof Error ? err.message : '问答暂时不可用，请稍后再试。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    v-if="props.floating"
    class="harness-qa-launcher"
    type="button"
    aria-label="打开 Harness 知识问答"
    @click="isOpen = true"
  >
    <span class="harness-qa-launcher__mark">AI</span>
    <span>问答</span>
  </button>

  <div
    v-if="!props.floating || isOpen"
    class="harness-qa-shell"
    :class="{ 'harness-qa-shell--floating': props.floating }"
  >
    <button
      v-if="props.floating"
      class="harness-qa-backdrop"
      type="button"
      aria-label="关闭知识问答"
      @click="isOpen = false"
    />

    <div class="harness-qa" role="dialog" aria-label="Harness 知识问答">
      <button
        v-if="props.floating"
        class="harness-qa__close"
        type="button"
        aria-label="关闭知识问答"
        @click="isOpen = false"
      >
        ×
      </button>

    <div class="harness-qa__header">
      <strong>Harness 知识问答</strong>
      <span>只回答 Harness / Agent / Skills / 飞书 CLI / Long-Horizon 相关问题</span>
    </div>

    <textarea
      v-model="question"
      class="harness-qa__input"
      placeholder="例如：产品经理在什么阶段才需要给团队“部署一套 harness”？"
      rows="5"
    />

    <div class="harness-qa__actions">
      <button class="harness-qa__button" :disabled="!canSubmit" @click="submitQuestion">
        {{ loading ? '思考中...' : '提问' }}
      </button>
      <span class="harness-qa__hint">
        同一 IP 每天最多 3 次，建议问具体工作问题而不是泛AI问题。
      </span>
    </div>

    <p v-if="remaining !== null" class="harness-qa__meta">
      今日剩余次数：{{ remaining }} / {{ limit }}
    </p>

    <div v-if="answer" class="harness-qa__answer">
      <h4>回答</h4>
      <p>{{ answer }}</p>
    </div>

    <div v-if="error" class="harness-qa__error">
      {{ error }}
    </div>
    </div>
  </div>
</template>

<style scoped>
.harness-qa-launcher {
  position: fixed;
  right: max(18px, env(safe-area-inset-right));
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(217, 119, 6, 0.22);
  border-radius: 999px;
  padding: 10px 14px 10px 10px;
  background: rgba(255, 255, 255, 0.94);
  color: #2d241b;
  box-shadow: 0 16px 42px rgba(26, 20, 14, 0.16);
  cursor: pointer;
  font: inherit;
}

.harness-qa-launcher__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #d97706;
  color: #fff;
  font-size: 12px;
  font-weight: 760;
}

.harness-qa-shell--floating {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 24px;
}

.harness-qa-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(21, 18, 14, 0.28);
  cursor: default;
}

.harness-qa {
  position: relative;
  margin: 24px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 247, 237, 0.88), rgba(255, 255, 255, 0.98)),
    radial-gradient(circle at 0% 0%, rgba(217, 119, 6, 0.12), transparent 36%);
}

.harness-qa-shell--floating .harness-qa {
  z-index: 1;
  width: min(520px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  overflow: auto;
  margin: 0;
  box-shadow: 0 24px 70px rgba(21, 18, 14, 0.24);
}

.harness-qa__close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.harness-qa__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.harness-qa__header span,
.harness-qa__hint,
.harness-qa__meta {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.harness-qa__input {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border: 1px solid rgba(52, 95, 70, 0.22);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
  font: inherit;
}

.harness-qa__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}

.harness-qa__button {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  background: #d97706;
  color: #fff;
  cursor: pointer;
  font: inherit;
}

.harness-qa__button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.harness-qa__answer,
.harness-qa__error {
  margin-top: 16px;
  border-radius: 12px;
  padding: 14px 16px;
}

.harness-qa__answer {
  background: rgba(217, 119, 6, 0.08);
}

.harness-qa__answer h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.harness-qa__answer p,
.harness-qa__error {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.8;
}

.harness-qa__error {
  background: rgba(180, 52, 52, 0.08);
  color: #9d2f2f;
}

@media (max-width: 640px) {
  .harness-qa-shell--floating {
    padding: 12px;
  }

  .harness-qa-shell--floating .harness-qa {
    width: 100%;
    max-height: calc(100vh - 24px);
  }
}
</style>
