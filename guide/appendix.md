# 附录

## A. 参考项目索引

| 项目 | 路径 | Harness亮点 |
|------|------|-------------|
| AGENTS.md规范 | `refs/codes/agents.md-main/` | AGENTS.md标准定义、FAQ、兼容性 |
| LangChain | `refs/codes/langchain-master/` | 268行教科书级AGENTS.md、中间件Harness |
| LangGraph | `refs/codes/langgraph-main/` | Monorepo的Harness、依赖地图 |
| CrewAI | `refs/codes/crewAI-main/` | 多Agent协调的Harness |
| AutoGen | `refs/codes/autogen-main/` | 对话式Agent的Harness |
| DeerFlow | `refs/codes/deer-flow-main/` | 前后端分离的Agent Harness |
| Claude Cookbooks | `refs/codes/claude-cookbooks-main/` | Skills系统、自定义技能 |

## B. 参考文章

1. [OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/)
2. [Escape.tech: SF实地报告](https://escape.tech/blog/everything-i-learned-about-harness-engineering-and-ai-factories-in-san-francisco-april-2026/)
3. [NxCode: 完全指南](https://www.nxcode.io/resources/news/harness-engineering-complete-guide-ai-agent-codex-2026)
4. [Red Hat: 结构化工作流](https://developers.redhat.com/articles/2026/04/07/harness-engineering-structured-workflows-ai-assisted-development)
5. [Salesforce: Agent Harness](https://www.salesforce.com/agentforce/ai-agents/agent-harness/)
6. [LangChain: Harness五层解剖系列](https://blog.langchain.dev/) — Vivek Trivedy "Agent = Model + Harness"
7. [Stanford HAI: AI Index Report 2026](https://hai.stanford.edu/ai-index/2026-ai-index-report) — 423页年度报告
8. [Peter Pang: AI-First工程系统重构](https://mp.weixin.qq.com/) — LinkedIn/Uber经验
9. [Anthropic Routines文档](https://docs.anthropic.com/) — 云端Agent自动化
10. [Hamel Husain: Evals are the new PRD](https://hamel.dev/) — AI产品经理方法论
11. [Anthropic Cat Wu: 指数级进化下的产品管理](https://mp.weixin.qq.com/) — Side Quest文化
12. [Andrew Ng: Building Faster with AI (2026)](https://www.youtube.com/) — 速度方法论
13. [Stanford CS230: Beyond the Model到Agent工作流五层地图](https://cs230.stanford.edu/) — 渐进式复杂度
14. [Karpathy: LLM Wiki知识库架构](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — 三层架构原版

## C. 工具栈推荐

| 类别 | 工具 |
|------|------|
| **终端&编排** | cmux, Superset, Claude Manager |
| **规范&规划** | OpenSpec, Repository Impact Map（Red Hat方法） |
| **质量&审查** | Codex Plugin for CC (`codex-plugin-cc`), CodeRabbit, Taskless |
| **上下文&记忆** | Claude-Mem, MCP Servers, RAG |
| **运行时隔离** | Coasts, Git Worktrees, 沙箱 |
| **技能框架** | Superpowers (obra/superpowers), OpenSkills |
| **UI设计系统** | DESIGN.md (`awesome-design-md`), getdesign.md |
| **自主研究** | autoresearch (Karpathy), Codex 长时间运行 |
| **跨模型互操作** | `codex-plugin-cc`（在Claude Code中调用Codex） |

## D. DESIGN.md —— Agent的UI约束文件

`DESIGN.md`是一种纯文本设计系统文档，让AI Agent在生成UI时保持视觉一致性。它是Harness在UI层面的延伸。

**结构包含：** 视觉主题、色板、排版、间距、组件库、暗黑模式等。

```bash
# 获取品牌级DESIGN.md（如Vercel风格、Linear风格）
# 方式1: 克隆awesome-design-md仓库
git clone https://github.com/VoltAgent/awesome-design-md ~/.agent/design-md-library

# 方式2: 在线浏览
# https://getdesign.md/vercel/design-md
# https://getdesign.md/linear.app/design-md
```

**用法：** 将对应品牌的`DESIGN.md`复制到项目根目录，Agent生成UI时会自动遵循其中的设计规范。

## E. autoresearch —— 自主迭代的Agent模式

Karpathy提出的autoresearch模式：Agent在固定时间预算内自主 修改→验证→保留/丢弃→重复，优化给定指标。

这个模式已被封装为Agent Skill，支持多种子命令：

```bash
# 安装autoresearch技能
openskills install uditgoenka/autoresearch --universal --global

# 使用（在Agent会话中）
npx openskills read autoresearch
# 支持子命令: plan, debug, fix, security, ship, scenario, predict, learn, reason
```

## F. 快速命令参考

```bash
# 安装Superpowers技能
npm install -g openskills
openskills install obra/superpowers --universal --global

# 在新项目中同步
openskills sync -y

# 读取特定技能
npx openskills read brainstorming
npx openskills read writing-plans,test-driven-development

# 生成图表
dot -Tpng input.dot -o output.png

# 多工具指令文件同步
ln -sf AGENTS.md CLAUDE.md
```

## G. Karpathy LLM Wiki：知识库即Harness的知识层

Karpathy提出的三层知识架构与Harness的Memory Layer高度对应：

| Karpathy层 | 对应Harness层 | 核心规则 |
|-----------|-------------|----------|
| **Raw/**（原始素材） | 外部数据源 | 只读、不可修改、保留溯源 |
| **Wiki/**（编译产物） | Memory Layer知识存储 | LLM拥有、人只读、持续更新 |
| **Schema**（CLAUDE.md） | Control Layer配置 | 人+LLM共同演化、跨会话持久 |

**四阶段循环：** Ingest（摄入）→ Compile（编译）→ Query（查询）→ Lint（维护）

**知识蒸馏为Agent技能：** 看到好内容 → AI蒸馏成结构化文档 → Agent加载后直接使用 → 技能复利

> **小规模不需要RAG：** 几十篇文章、几万字规模下，一个INDEX.md（标题+一句话摘要）就够了。LLM读一遍INDEX就知道该去读哪些文章。——Karpathy社区实践

## H. 关键金句索引

| 来源 | 金句 |
|------|------|
| **Red Hat** | "Structure In, Structure Out." |
| **Salesforce** | "2025年追模型，2026年追基础设施。护城河是Harness，不是模型。" |
| **Escape.tech** | "Agent是基础设施。让它闲置=关闭CI。" |
| **Escape.tech** | "10x不是对比AI之前，是对比2025年12月。模型改善+Harness改善+编排改善同时发生。" |
| **OpenAI** | "`codex-plugin-cc` —— 竞争对手给对方做插件，证明生态收敛向互操作。" |
| **ETH Zurich** | "详细的仓库上下文通常增加成本，而且可能降低任务成功率。" |
| **LangChain** | "If you're not the model, you're the harness." / "Evals是Harness的训练数据。" |
| **LangChain** | "If you don't own your harness, you don't own your memory." |
| **Hamel Husain** | "Evals are the new PRD." |
| **Andrew Ng** | "PM is the new bottleneck. 最好的团队配比接近1 PM : 0.5工程师。" |
| **Cat Wu (Anthropic)** | "做简单有效的事。不要为模型当前限制写复杂workaround。" |
| **Peter Pang** | "AI-First不是给旧流程加AI，而是围绕Agent重构工程系统。" |
| **Stanford AI Index** | "AI能拿IMO金牌但看不准时钟——锯齿边界。" |
| **Karpathy** | "个人知识库 → 个人化模型。Wiki是编译产物，不是存储。" |

---

> **记住Harness Engineering的本质：** Structure In, Structure Out.
> 你约束了输入的结构，就约束了输出的质量。
> 不是限制AI的能力，而是让AI的能力被正确发挥。
>
> **未来真正的竞争护城河，是你的Agentic基础设施——Harness的质量，决定了AI战略的成败。**
