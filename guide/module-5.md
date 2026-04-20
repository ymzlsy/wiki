# Module 5: 实战案例与VibeCoding项目

## 5.1 Harness成熟度三级

![三级成熟度](/images/04-harness-levels.png)

<details>
<summary>📐 查看Graphviz源码 (04-harness-levels.dot)</summary>

```dot
// 见 dots/04-harness-levels.dot
```
</details>

## 5.2 案例1：从零搭建一个带Harness的Web项目

> **场景**：你需要快速开发一个公司内部的数据看板工具

### Step 1: 项目脚手架 + Harness初始化

```bash
# 创建项目
mkdir internal-dashboard && cd internal-dashboard
git init

# 创建AGENTS.md
cat > AGENTS.md << 'EOF'
# Internal Dashboard - Agent Guidelines

## Project Overview
React + TypeScript internal dashboard for company KPI tracking.
Tech stack: Vite + React + TailwindCSS + shadcn/ui

## Development Commands
- `pnpm dev` - Start dev server (NEVER run `pnpm build` during agent sessions)
- `pnpm test` - Run Vitest test suite
- `pnpm lint` - Run ESLint

## Coding Conventions
- All components in TypeScript (.tsx)
- Use TailwindCSS for styling, no inline styles
- All API calls go through `src/api/` layer
- State management with React Query, no Redux

## Testing Requirements
- Every new component must have a test file
- Use @testing-library/react for component tests
- Test file mirrors source structure: `src/components/Foo.tsx` → `tests/components/Foo.test.tsx`

## Architecture Constraints
- Dependencies: Types → API → Hooks → Components → Pages
- Components cannot import from Pages
- API layer cannot import from Components
EOF

# 初始化Superpowers
openskills sync -y
```

### Step 2: 让Agent按Harness工作

向Cascade发送：
```
帮我创建这个项目的基础脚手架，包含：
- Vite + React + TS 项目配置
- TailwindCSS + shadcn/ui 初始化
- 基本的目录结构
- ESLint + Prettier 配置
- Pre-commit hooks
请严格遵循AGENTS.md中的约定。
```

**观察**：Agent会读取AGENTS.md，按你定义的架构约束生成代码。

### Step 3: 功能开发循环

使用OPC循环：
```
O(编排): 我需要一个KPI卡片组件，显示数字、趋势和标题
P(规划): 请先告诉我你计划修改哪些文件，不要直接写代码
C(实现): 批准后再实现
```

## 5.3 案例2：用Harness约束的需求开发流程

> **场景**：你想改造公司的需求→开发流程

### 旧流程（Vague In → Vague Out）
```
PM在Jira写一句"加个CSV导出" → 开发猜测实现 → 返工多次
```

### 新流程（Structure In → Structure Out）

**Phase 1: Impact Map**
```markdown
## Repository Impact Map
需求: 为SBOM列表添加CSV导出功能

### 影响分析
backend (trustify):
  changes:
    - 添加CSV序列化方法到 SbomService
    - 添加 GET /api/v2/sbom/export 端点
frontend (trustify-ui):
  changes:
    - 在SBOM列表工具栏添加"导出CSV"按钮
```

**Phase 2: Structured Task**
```markdown
## Repository: trustify-backend

## Description
为SBOM查询结果添加CSV导出端点

## Files to Modify
- `modules/sbom/src/service.rs` — 添加CSV序列化方法
- `modules/sbom/src/endpoints.rs` — 添加GET处理器

## Implementation Notes
遵循 `SbomService::export_json()` 的现有JSON导出模式
复用 `modules/sbom/src/model.rs` 中的 QueryResult 类型

## Acceptance Criteria
- [ ] GET /api/v2/sbom/export?format=csv 返回有效CSV
- [ ] 现有JSON导出仍然正常工作

## Test Requirements
- [ ] `modules/sbom/tests/` 中的集成测试，遵循现有测试模式
```

## 5.4 案例3：VibeCoding火热项目 — AI Agent聊天机器人

> **场景**：当前互联网最火的AI Agent应用——你要用Harness约束下的VibeCoding搭建一个

```bash
mkdir ai-chatbot && cd ai-chatbot

cat > AGENTS.md << 'EOF'
# AI Chatbot - Agent Guidelines

## Architecture
Multi-turn chatbot with tool-calling capabilities.
Stack: Next.js 15 + Vercel AI SDK + OpenAI

## Harness Rules (Agent MUST follow)
1. ALL LLM calls go through `src/lib/ai.ts` — no direct API calls elsewhere
2. ALL tools defined in `src/tools/` — one file per tool
3. Message history managed by `src/lib/memory.ts` only
4. Token budget: max 4096 tokens per response
5. Error handling: NEVER expose raw LLM errors to user

## Verification Checklist
Before completing ANY task:
- [ ] Run `pnpm test`
- [ ] Run `pnpm lint`
- [ ] Verify no hardcoded API keys
- [ ] Check token budget compliance
EOF
```

**Vibe Coding但有Harness**: 你可以快速迭代、接受AI建议，但Harness确保不会跑偏。

## 5.5 案例4：7×24持续交付（真实数据）

> **"Agent是基础设施。让Agent从晚7点到早9点闲置，等同于每天晚上关闭CI流水线再早上重启。"** ——escape.tech

**已验证的真实运行记录：**
- **Rakuten**: Claude Code 在1250万行代码库上自主运行 **7小时**，准确率99.9%
- **OpenAI**: Codex 压力测试连续运行 **25小时**不中断
- **最强团队的做法**：工程师下班推任务 → Agent通宵写测试/Code Review/重构/安全扫描 → 早上代码库已被测试、审查、标记 → 工程师第一个任务是**分类(triage)而非实现**

```markdown
## 夜间Agent工作流

### 工程师下班前：
1. 推送包含结构化任务的Issue
2. 标记为 `agent-ready`

### 夜间Agent执行：
1. 拾取 `agent-ready` 的Issue
2. 按Harness约束编写代码
3. 运行CI/测试
4. 开PR并标记为 `needs-human-review`

### 早上工程师上班：
1. 审查Agent生成的PR
2. 第一个任务是分类(triage)，不是实现
3. 没有人工批准，不合并

⚠️ 关键：夜间周期产出的是候选(candidates)，不是提交(commits)
```

## 5.6 案例5：跨模型互操作 — 护城河是Harness而非模型

> **2026年3月30日，OpenAI开源了 `codex-plugin-cc`：一个在Claude Code内直接调用Codex的官方插件。** 竞争对手给对方做插件——这证明了：护城河是Harness，不是模型。

**实践启示：**
- 停止把模型选择当宗教，开始把它当**任务路由**
- Claude擅长长上下文推理，GPT擅长代码生成 → 用Harness按任务类型路由
- 生态在收敛向互操作性，而不是锁定

**模型选择的正确问题不是"哪个模型更好？"而是"在这个任务上，错误的代价是什么？检测错误有多便宜？"**

## 5.7 案例6：Anthropic Routines — Agent变成事件驱动基础设施

> Anthropic Routines把Claude Code从"你打一下它动一下"的交互工具，变成了**云端持续运行的自动化平台**。

### 三种触发模式

| 触发方式 | 场景 | 示例 |
|----------|------|------|
| **Schedule（定时）** | 定期执行 | 每天凌晨跑安全扫描、每周生成周报 |
| **GitHub Event（事件）** | 代码仓库变更 | PR打开时自动Code Review、Issue创建时自动分类 |
| **API Call（接口）** | 外部系统调用 | Slack消息触发部署、Webhook触发数据处理 |

三种触发器可以**组合**：同一个Routine可以被定时调度+GitHub事件同时触发。

### Harness治理挑战

Routines让Agent拥有了**持续执行权**，这带来新的治理问题：

| 风险 | 描述 | Harness对策 |
|------|------|-------------|
| **身份继承** | Routine以创建者身份运行，拥有该用户所有权限 | 最小权限原则：为Routine创建专用Service Account |
| **无审批执行** | 定时任务默认自动执行，无人在场 | 高风险操作强制暂停等待审批（Human-in-the-Loop） |
| **审计困难** | 大量自动执行难以追踪 | 结构化日志 + 操作审计trail |
| **回滚需求** | 自动执行出错时需要撤销 | 每次操作前snapshot + 可审计的rollback机制 |

> **核心判断：Routines的价值不在于"能自动跑"，而在于"能在控制下自动跑"。** 没有Harness约束的Routine就是一个失控的cron job。

## 5.8 案例7：AI-First工程栈的三个基础设施支柱

> **"AI-First不是给旧流程加AI，而是围绕Agent重构工程系统。"** ——Peter Pang

很多团队的做法是在现有流程上"粘"一个AI工具。Peter Pang在LinkedIn/Uber的经验表明，真正的AI-First需要重建三根柱子：

| 支柱 | 内容 | 为什么必须 |
|------|------|-----------|
| **统一代码可见性** | Monorepo + 语义代码搜索 + 依赖图 | Agent需要看到整个系统才能做出正确决策 |
| **确定性验证** | CI/CD + Review Gates + Feature Flags + 分级回滚 | Agent的输出必须经过确定性管道验证 |
| **自愈循环** | 生产监控 → 自动创建Issue → Agent修复 → CI验证 → 自动部署 | 从"人发现问题"到"系统自动闭环" |

### AI-Assisted vs. AI-First 诊断

判断你的团队在哪个阶段：

| 问题 | AI-Assisted（表层） | AI-First（深层） |
|------|---------------------|------------------|
| Agent能看到完整仓库结构吗？ | 只看当前文件 | Monorepo + 依赖图可用 |
| Agent输出有确定性验证吗？ | 手动检查 | CI自动验证 + Review Gate |
| Agent失败时有自动反馈吗？ | 人工重试 | 失败 → 规则 → 防止重犯 |
| 瓶颈在哪？ | "模型不够聪明" | "产品决策不够快" |
| 人类角色是什么？ | 写代码的 | 架构师 + 运维审核 |

> **瓶颈转移定律：** 当Agent消除了大部分实现成本，瓶颈立即从"编码速度"转向"PM规划质量"和"QA验证速度"。你的工程组织能多快把清晰需求喂给Agent，决定了AI-First的天花板。

## 5.9 🔬 Lab 5: 完整VibeCoding实战

**任务：** 选择以下任一项目，从头搭建：

**选项A**: 公司内部知识库搜索工具
- 要求写完整AGENTS.md
- 实现搜索、分类、标签功能
- 全程用OPC循环

**选项B**: AI辅助周报生成器
- 读取Git日志和Jira数据
- 自动生成周报摘要
- 用Harness约束AI生成格式

**选项C**: 代码Review助手
- 接入GitHub Webhook
- 自动对PR做首轮Review
- 基于项目的AGENTS.md规则
