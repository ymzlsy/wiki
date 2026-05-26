<script setup lang="ts">
import { computed, ref } from 'vue'

const question = ref('')
const loading = ref(false)
const answer = ref('')
const error = ref('')
const remaining = ref<number | null>(null)
const limit = ref<number | null>(3)

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
  <div class="harness-qa">
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
</template>

<style scoped>
.harness-qa {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(242, 248, 244, 0.92), rgba(255, 255, 255, 0.98));
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
  background: #2e6b4c;
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
  background: rgba(46, 107, 76, 0.08);
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
</style>
