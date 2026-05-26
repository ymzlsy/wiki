const DAILY_LIMIT = 3
const MAX_QUESTION_LENGTH = 280
const DEFAULT_MODEL = 'gemini-2.5-flash-lite'

const HARNESS_KEYWORDS = [
  'harness',
  'agent',
  'prompt',
  'context',
  'eval',
  'skills',
  'skill',
  'agents.md',
  'codex',
  'claude code',
  'feishu',
  'lark',
  'long horizon',
  'long-horizon',
  'continual learning',
  'ai factory',
  'workflow',
  'tool use',
  '记忆',
  '上下文',
  '提示词',
  '工具调用',
  '飞书',
  '长程',
  '持续学习',
  '约束',
  '评测',
  '知识库'
]

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

function normalizeQuestion(input) {
  return String(input || '').replace(/\s+/g, ' ').trim()
}

function getShanghaiDayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
}

function getClientIp(request) {
  const forwarded = request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')
    || ''
  return forwarded.split(',')[0].trim() || 'unknown'
}

async function sha256Short(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

function isHarnessScopedQuestion(question) {
  const lower = question.toLowerCase()
  return HARNESS_KEYWORDS.some((keyword) => lower.includes(keyword))
}

function extractAnswer(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || []
  const text = parts
    .map((part) => part?.text || '')
    .join('\n')
    .trim()
  return text
}

async function askGemini(question, env) {
  const model = env.GEMINI_MODEL || DEFAULT_MODEL
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`

  const prompt = [
    '你是一个 Harness Engineering 教程网站里的知识问答助手。',
    '只回答与 Harness Engineering 及其紧邻实践相关的问题：Prompt Engineering、Context Engineering、Agent、Skills、Evals、Long-Horizon、Continual Learning、Codex、Claude Code、飞书 CLI、知识库、工具调用与工作流约束。',
    '如果问题过宽，请自动缩窄到 Harness 视角回答。',
    '如果问题明显超出范围，请简短拒答，并提示用户改问 Harness 相关问题。',
    '输出要求：中文、实操、简洁，优先给判断和步骤，避免空话，控制在 220 字以内。'
  ].join('\n')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: prompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: question }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 320
      }
    })
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${message}`)
  }

  const payload = await response.json()
  const answer = extractAnswer(payload)

  if (!answer) {
    throw new Error('Gemini returned an empty answer.')
  }

  return answer
}

export async function onRequestPost(context) {
  const { request, env } = context

  if (!env.GEMINI_API_KEY) {
    return json({ error: '服务端尚未配置 GEMINI_API_KEY。' }, 503)
  }

  if (!env.HARNESS_QA_LIMITS) {
    return json({ error: '服务端尚未绑定 HARNESS_QA_LIMITS。' }, 503)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: '请求格式不正确。' }, 400)
  }

  const question = normalizeQuestion(body?.question)

  if (!question) {
    return json({ error: '请输入问题。' }, 400)
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return json({ error: `问题请控制在 ${MAX_QUESTION_LENGTH} 字以内。` }, 400)
  }

  if (!isHarnessScopedQuestion(question)) {
    return json({
      error: '这个问答框只回答 Harness、Agent、Skills、飞书 CLI、Long-Horizon 等教程相关问题。可以把问题缩窄后再问。'
    }, 400)
  }

  const day = getShanghaiDayKey()
  const ipHash = await sha256Short(getClientIp(request))
  const key = `harness-qa:${day}:${ipHash}`
  const rawCount = await env.HARNESS_QA_LIMITS.get(key)
  const count = Number(rawCount || 0)

  if (count >= DAILY_LIMIT) {
    return json({
      error: `今天的提问次数已经用完了，请明天再来。当前限制是每个 IP 每天 ${DAILY_LIMIT} 次。`,
      remaining: 0,
      limit: DAILY_LIMIT
    }, 429)
  }

  try {
    const answer = await askGemini(question, env)
    const nextCount = count + 1
    await env.HARNESS_QA_LIMITS.put(key, String(nextCount), {
      expirationTtl: 60 * 60 * 24 * 3
    })

    return json({
      answer,
      remaining: Math.max(0, DAILY_LIMIT - nextCount),
      limit: DAILY_LIMIT,
      day
    })
  } catch (error) {
    return json({
      error: '问答服务暂时不可用，请稍后再试。',
      detail: error instanceof Error ? error.message : String(error)
    }, 502)
  }
}
