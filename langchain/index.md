# LangChain 生态学习与实战路径

> 面向 AI 产品经理 / FDE：不是为了背 API，而是为了把 LangChain、LangGraph、LangSmith 变成可落地的产品交付能力。
>
> 适用读者：会一点 Python 或愿意让 Codex / Claude Code 帮你写代码的人；正在做知识库问答、工作流助手、Agent 原型、企业内部 AI 工具、客户项目 PoC 的人。
>
> 核心来源：
> - [LangChain 官方文档](https://docs.langchain.com/oss/python/langchain/overview)
> - [LangGraph 官方文档](https://docs.langchain.com/oss/python/langgraph)
> - [LangSmith Observability](https://docs.langchain.com/oss/python/langchain/observability)
> - [LangChain GitHub](https://github.com/langchain-ai/langchain)

---

## 一句话结论

LangChain 不是一个 Skill，也不是一个单独产品。它是一套 **开源 AI 应用开发框架 + Agent 工程生态**。

你可以把它拆成三层：

| 名称 | 它是什么 | 你什么时候用 |
|---|---|---|
| LangChain | LLM 应用开发库 | 快速接模型、工具、RAG、结构化输出、简单 Agent |
| LangGraph | 有状态 Agent / 工作流编排框架 | 多步骤、可恢复、需要人工确认、长期运行的 Agent |
| LangSmith | 观测、调试、评测平台 | 想知道 Agent 为什么答错、哪一步慢、哪个版本更好 |

一句话记住：

> LangChain 负责“把 AI 应用搭起来”，LangGraph 负责“让 Agent 稳定跑完整流程”，LangSmith 负责“看见它怎么跑、怎么改进”。

---

## 先建立正确心智

### 1. LangChain 不是万能框架

它最适合做的是“把模型接进业务流程”：

- 调用不同模型供应商
- 把函数、API、数据库、搜索包装成工具
- 给模型约束结构化输出
- 把文档检索接进回答流程
- 让 Agent 自己决定什么时候调用工具
- 把每一步 trace 起来，方便调试和评测

它不适合替代所有业务代码。真实项目里，最稳的写法通常是：

> 普通业务逻辑自己写，LLM 只负责理解、生成、分类、规划、调用工具。

### 2. LangChain、Dify、LlamaIndex 怎么区分

| 工具 | 更像什么 | 更适合谁 |
|---|---|---|
| Dify | AI 应用平台 | 产品验证、运营后台、低代码工作流 |
| LangChain | AI 应用开发框架 | FDE、工程团队、需要定制业务逻辑的人 |
| LlamaIndex | 数据 / RAG 框架 | 文档知识库、复杂检索、数据连接 |
| LangGraph | Agent 状态机 | 长流程、多分支、可中断可恢复的 Agent |
| LangSmith | Agent 观测评测平台 | 需要上线、调优、对比版本的团队 |

对 AI 产品经理来说，LangChain 的价值不是“我亲自写多少代码”，而是你能看懂工程师在搭什么，能判断一个需求应该做成 RAG、工具调用、固定工作流，还是 Agent。

对 FDE 来说，LangChain 的价值是你可以快速把客户系统、内部数据、模型能力、评测闭环串起来。

---

## 安装与最小调用

### 1. 创建项目

```bash
mkdir langchain-practice
cd langchain-practice
python -m venv .venv
source .venv/bin/activate
pip install -U langchain langchain-openai langgraph python-dotenv
```

如果你用其他模型供应商，就安装对应集成包，例如：

```bash
pip install -U langchain-anthropic
pip install -U langchain-google-genai
```

### 2. 设置环境变量

不要把 key 写进代码，放到环境变量或 `.env`：

```bash
export OPENAI_API_KEY="你的 key"
```

项目里可以建一个 `.env.example`，只写变量名：

```dotenv
OPENAI_API_KEY=
LANGSMITH_API_KEY=
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=langchain-practice
```

### 3. 最小模型调用

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-5.4")
response = model.invoke("用一句话解释 LangChain 是什么")

print(response.content)
```

这一步的意义：你先确认“模型调用”能跑通。后面所有 RAG、Agent、工具调用都是在这个基础上叠能力。

---

## 核心能力一：结构化输出

产品里最常见的失败不是模型不会回答，而是回答格式不可控。比如你要把客户反馈分类、把会议纪要变成行动项、把需求变成 PRD 字段，就不能只要一段自然语言。

### 场景

把一段用户反馈变成结构化字段：

- 问题类型
- 紧急程度
- 涉及模块
- 下一步建议

### 代码

```python
from typing import Literal
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model


class FeedbackTriage(BaseModel):
    category: Literal["bug", "feature", "support", "pricing", "other"]
    urgency: Literal["low", "medium", "high"]
    module: str = Field(description="涉及的产品模块")
    next_action: str = Field(description="建议下一步动作")


model = init_chat_model("openai:gpt-5.4")
structured_model = model.with_structured_output(FeedbackTriage)

result = structured_model.invoke(
    "客户说：移动端进入报表页经常白屏，明早要给领导演示，能不能马上修？"
)

print(result)
```

### 你要掌握的判断

如果结果要进入数据库、任务系统、飞书 Base、CRM、工单系统，就尽量用结构化输出。

如果只是写邮件、写总结、写解释，可以先用自然语言。

---

## 核心能力二：工具调用

工具调用是 Agent 的根。模型本身不能查数据库、发消息、读日历、调 API，但你可以把这些动作包装成工具，让模型在需要时调用。

### 场景

客户问“沈阳项目现在是什么状态”，Agent 需要调用项目查询工具，而不是凭空回答。

### 代码

```python
from langchain.agents import create_agent


def get_project_status(project_name: str) -> str:
    """查询项目状态。project_name 是项目名称。"""
    mock_db = {
        "沈阳项目": "方案已确认，等待客户反馈第三轮报价。",
        "兰州职培": "课程大纲已完成，正在整理交付材料。",
    }
    return mock_db.get(project_name, "没有查到该项目。")


agent = create_agent(
    model="openai:gpt-5.4",
    tools=[get_project_status],
    system_prompt="你是项目助理。回答前必须先查项目状态，不要编造。"
)

result = agent.invoke({
    "messages": [
        {"role": "user", "content": "沈阳项目现在推进到哪了？"}
    ]
})

print(result["messages"][-1].content)
```

### 你要掌握的判断

能写成确定性函数的，就写成工具。

典型工具包括：

| 工具类型 | 实战例子 |
|---|---|
| 查询类 | 查项目状态、查库存、查排期、查客户信息 |
| 写入类 | 创建任务、更新 CRM、写入飞书 Base |
| 计算类 | 报价、排班、评分、优先级计算 |
| 操作类 | 发消息、生成文档、创建日程、触发审批 |

产品设计上，工具说明要像“给新人交代工作”一样明确。描述越含糊，Agent 越容易误用。

---

## 核心能力三：RAG 知识库问答

RAG 不是“把文档塞给模型”。更准确地说，它是：

> 先从知识库找相关材料，再让模型基于材料回答。

### 两种 RAG

| 模式 | 特点 | 适合场景 |
|---|---|---|
| 固定 RAG Chain | 每次都检索，再回答 | FAQ、制度问答、产品文档问答 |
| Agentic RAG | Agent 自己决定是否检索 | 复杂问答、需要多次搜索、需要工具组合 |

### 一个最小 RAG 工具

```python
from langchain.agents import create_agent
from langchain.tools import tool

DOCS = [
    "Harness Engineering 的核心是用确定性系统约束概率模型。",
    "LangGraph 适合长期运行、有状态、可中断恢复的 Agent。",
    "LangSmith 用于追踪、调试和评测 LLM 应用。"
]


@tool
def search_knowledge_base(query: str) -> str:
    """搜索内部知识库，返回与 query 最相关的资料。"""
    hits = [doc for doc in DOCS if any(word in doc for word in query.split())]
    return "\n".join(hits[:3]) or "没有找到相关资料。"


agent = create_agent(
    model="openai:gpt-5.4",
    tools=[search_knowledge_base],
    system_prompt="回答知识问题前，优先搜索知识库，并引用搜索结果。"
)

result = agent.invoke({
    "messages": [
        {"role": "user", "content": "LangGraph 适合做什么？"}
    ]
})

print(result["messages"][-1].content)
```

真实项目里，你会把 `DOCS` 换成：

- Markdown / PDF / Word 文档
- 飞书文档
- 客户资料
- 产品手册
- 数据库记录
- 向量数据库检索结果

### FDE 的实战判断

RAG 最容易失败在三个地方：

| 失败点 | 表现 | 应对 |
|---|---|---|
| 文档切片太粗 | 找到一堆不相关内容 | 按标题、段落、业务实体切片 |
| 检索条件太弱 | 答案缺关键事实 | 混合检索：关键词 + 向量 + 元数据 |
| 没有评测集 | 你不知道是否变好 | 建 20-50 条黄金问题集 |

---

## 核心能力四：LangGraph 长流程 Agent

当任务只有一步，用普通函数就够了。当任务有 3-5 步，LangChain Agent 可以跑。当任务需要状态、分支、暂停、人工确认、重试和恢复，就该看 LangGraph。

### 典型场景

比如“客户反馈处理 Agent”：

1. 读取客户反馈
2. 分类和定级
3. 查知识库和历史工单
4. 生成处理建议
5. 高风险时等待人工确认
6. 写入飞书 Base / Jira
7. 发送群通知

这类流程不能只靠模型自由发挥。它需要明确节点。

### 最小 LangGraph

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langchain.chat_models import init_chat_model


class FeedbackState(TypedDict):
    feedback: str
    category: str
    response: str


model = init_chat_model("openai:gpt-5.4")


def classify(state: FeedbackState) -> FeedbackState:
    result = model.invoke(
        f"把这条客户反馈分类为 bug/feature/support/other：{state['feedback']}"
    )
    return {**state, "category": result.content}


def draft_response(state: FeedbackState) -> FeedbackState:
    result = model.invoke(
        f"反馈类型：{state['category']}\n反馈内容：{state['feedback']}\n请生成客服回复。"
    )
    return {**state, "response": result.content}


builder = StateGraph(FeedbackState)
builder.add_node("classify", classify)
builder.add_node("draft_response", draft_response)
builder.add_edge(START, "classify")
builder.add_edge("classify", "draft_response")
builder.add_edge("draft_response", END)

graph = builder.compile()

result = graph.invoke({
    "feedback": "报表页打不开，明天客户验收要用。",
    "category": "",
    "response": "",
})

print(result["response"])
```

### 你要掌握的判断

用 LangGraph 时，不要一上来就画复杂大图。先把业务流程写成节点：

| 业务节点 | 是否需要模型 | 是否需要工具 | 是否需要人工 |
|---|---|---|---|
| 分类 | 是 | 否 | 否 |
| 查询资料 | 否 | 是 | 否 |
| 生成方案 | 是 | 可能 | 否 |
| 高风险审批 | 否 | 可能 | 是 |
| 写入系统 | 否 | 是 | 可能 |

这张表就是 PM 和 FDE 的共同语言。

---

## 核心能力五：LangSmith 观测与评测

只要你做 AI 应用，上线前一定会遇到这几个问题：

- 为什么这次答错了？
- 它到底调用了哪个工具？
- 哪一步最慢？
- 改了 prompt 后有没有变好？
- 这个模型更贵，但质量是否真的更好？

LangSmith 解决的是这些问题。

### 开启 tracing

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="你的 LangSmith key"
export LANGSMITH_PROJECT="customer-feedback-agent"
```

然后你的 LangChain / LangGraph 调用会被记录下来，方便你看完整执行路径。

### 不上 LangSmith 也要保留这套意识

如果你暂时不用 LangSmith，也至少要自己记录：

| 字段 | 为什么重要 |
|---|---|
| input | 复现问题 |
| retrieved_docs | 判断检索是否失败 |
| tool_calls | 判断 Agent 是否误用工具 |
| final_output | 做人工评审 |
| latency_ms | 看性能 |
| cost_estimate | 控成本 |
| version | 对比 prompt / 模型 / 检索配置 |

这也是为什么 Langfuse、Promptfoo、Ragas 这些工具值得一起看。它们都在解决“AI 应用如何稳定迭代”的问题。

---

## 三个最值得做的实战项目

### 项目一：内部知识库问答助手

目标：把你的 `secondbrain`、项目文档、培训资料接成一个问答助手。

技术路线：

| 模块 | 推荐做法 |
|---|---|
| 文档源 | Markdown / PDF / 飞书文档导出 |
| 检索 | 先关键词，再向量检索 |
| 回答 | LangChain RAG Chain |
| 引用 | 每次回答带来源路径 |
| 评测 | 20 条黄金问题集 |

最小交付：

- 输入一个问题
- 返回答案
- 列出引用文档
- 如果没找到依据，明确说“不确定”

可以应用到你的实战：

- 项目复盘问答
- 培训资料助手
- 客户交付文档问答
- AI 产品经理知识库

### 项目二：客户反馈分流 Agent

目标：把群消息、表单、客服记录里的反馈自动分类、定级、写入任务池。

技术路线：

| 模块 | 推荐做法 |
|---|---|
| 输入 | 飞书群消息 / CSV / 表单 |
| 分类 | 结构化输出 |
| 查重 | 检索历史反馈 |
| 写入 | 工具调用写 Base / Jira |
| 通知 | 高优先级发群消息 |

最小交付：

- 读一批反馈
- 输出结构化分类
- 自动生成下一步建议
- 高优先级单独标记

可以应用到你的实战：

- 客户项目需求池
- 培训产品反馈归纳
- 数字人产品问题收集
- 内部工具改进 backlog

### 项目三：长流程交付助理

目标：让 Agent 帮你从“客户需求”推进到“方案草稿、风险清单、任务拆解、交付计划”。

技术路线：

| 模块 | 推荐做法 |
|---|---|
| 流程编排 | LangGraph |
| 知识输入 | RAG |
| 行动工具 | 创建任务、写文档、发消息 |
| 人工确认 | 高风险节点暂停 |
| 观测 | LangSmith / 本地日志 |

最小交付：

- 输入客户需求
- 输出需求澄清问题
- 生成初版方案
- 拆任务
- 人工确认后写入项目文档

可以应用到你的实战：

- 方案售前
- 培训课程定制
- 项目启动会准备
- 周报 / 复盘自动化

---

## 30 天学习路线

### 第 1 周：跑通基础调用

目标：你能解释 LangChain 是什么，并跑通模型调用、结构化输出、工具调用。

每天任务：

| 天 | 学什么 | 做什么 |
|---|---|---|
| Day 1 | LangChain / LangGraph / LangSmith 区别 | 画一张三者关系图 |
| Day 2 | 模型调用 | 跑通 `init_chat_model` |
| Day 3 | Prompt + 输出 | 做一个总结器 |
| Day 4 | 结构化输出 | 做客户反馈分类 |
| Day 5 | 工具调用 | 包一个查询项目状态工具 |
| Day 6 | Agent | 让 Agent 自己决定是否调用工具 |
| Day 7 | 复盘 | 写出 3 个你工作里可用的工具 |

验收标准：

- 你能写出一个 50 行以内的小 Agent
- 你知道什么时候该用结构化输出
- 你知道工具描述为什么重要

### 第 2 周：做第一个 RAG

目标：把一批文档接进问答流程。

每天任务：

| 天 | 学什么 | 做什么 |
|---|---|---|
| Day 8 | 文档加载 | 读 Markdown 文档 |
| Day 9 | 切片 | 按标题和段落切分 |
| Day 10 | 检索 | 先做关键词检索 |
| Day 11 | 向量检索 | 接一个本地或云向量库 |
| Day 12 | RAG Chain | 基于材料回答 |
| Day 13 | 引用来源 | 返回文件名和段落 |
| Day 14 | 评测集 | 写 20 条黄金问题 |

验收标准：

- 回答能带来源
- 找不到材料时不编
- 你能判断是“检索错了”还是“生成错了”

### 第 3 周：上 LangGraph

目标：把一个多步骤业务流程做成状态机。

每天任务：

| 天 | 学什么 | 做什么 |
|---|---|---|
| Day 15 | StateGraph | 定义状态结构 |
| Day 16 | 节点 | 把业务流程拆成节点 |
| Day 17 | 条件分支 | 高优先级走不同路径 |
| Day 18 | 工具节点 | 接查询和写入工具 |
| Day 19 | 人工确认 | 高风险动作前暂停 |
| Day 20 | 错误处理 | 给工具失败加重试和降级 |
| Day 21 | 复盘 | 画出你的交付助理流程图 |

验收标准：

- 你的流程不是纯 prompt，而是明确节点
- 每个节点知道输入、输出、失败怎么办
- 你能解释为什么这件事要用 LangGraph

### 第 4 周：评测、观测和上线意识

目标：把 Demo 变成可改进的系统。

每天任务：

| 天 | 学什么 | 做什么 |
|---|---|---|
| Day 22 | Trace | 开启 LangSmith 或本地日志 |
| Day 23 | Dataset | 整理 30 条测试样例 |
| Day 24 | Eval | 设计正确性、引用、格式指标 |
| Day 25 | 版本对比 | 比较两个 prompt |
| Day 26 | 成本 | 记录 token、耗时、失败率 |
| Day 27 | 安全边界 | 给工具加 allow / deny / confirm |
| Day 28 | 发布 | 做一个可演示的 CLI 或 Web 页面 |
| Day 29 | 复盘 | 写一页产品化判断 |
| Day 30 | 迁移 | 把 demo 接入真实项目数据 |

验收标准：

- 你有一组固定测试题
- 你能对比版本好坏
- 你知道上线前至少要看哪些 trace 和失败样例

---

## 你在真实项目里怎么用

### 作为 AI 产品经理

你要把需求拆成这 5 个问题：

| 问题 | 示例 |
|---|---|
| 用户输入是什么 | 群消息、文档、表单、语音转写、客户问题 |
| 系统要查什么 | 知识库、项目状态、历史工单、CRM |
| 哪些动作必须确定性完成 | 写任务、发消息、改字段、生成链接 |
| 哪些地方必须人工确认 | 发给客户、改价格、删除数据、高风险结论 |
| 怎么判断效果变好 | 正确率、引用命中率、人工修改率、节省时间 |

你不需要一开始就关心所有 API。你要先会把业务需求翻译成：

> 输入 → 检索 → 推理 → 工具 → 人工确认 → 输出 → 评测。

### 作为 FDE

你要把原型拆成这 5 层：

| 层 | 你要交付什么 |
|---|---|
| Model | 模型配置、fallback、成本控制 |
| Tools | 客户系统 API 包装、参数校验、权限边界 |
| Retrieval | 文档索引、检索、引用、更新策略 |
| Orchestration | LangChain Agent 或 LangGraph workflow |
| Observability | trace、日志、评测集、版本对比 |

FDE 最有价值的不是“把 demo 跑起来”，而是能在客户场景里说明：

- 为什么这一步要自动化
- 为什么这一步不能自动化
- 为什么这里要人工确认
- 为什么这个错误能被发现
- 为什么下一版会变好

---

## 什么时候别用 LangChain

下面这些情况，可以先不用：

| 情况 | 更好的选择 |
|---|---|
| 只是单次调用模型 | 直接用模型 SDK |
| 只是低代码快速验证 | Dify / Flowise |
| 主要是文档索引和检索 | LlamaIndex 也许更合适 |
| 业务流程完全确定 | 普通后端代码 |
| 还没有评测和日志意识 | 先补最小日志和测试集 |

LangChain 的价值在“组合复杂能力”。如果你的任务只是 `prompt → answer`，它反而可能增加复杂度。

---

## 安全与上线清单

上线前至少检查：

- 所有 API key 都来自环境变量
- 工具参数用 schema 校验
- 写入类工具有权限边界
- 高风险动作需要人工确认
- 用户输入不能直接变成 SQL、文件路径、命令参数
- RAG 回答必须带来源或说明不确定
- 每次运行有 trace 或日志
- 有固定评测集
- 能回滚 prompt / 模型 / 检索配置

尤其记住一句：

> LLM 输出也是不可信输入。它调用工具前，参数仍然要校验。

---

## 推荐学习顺序

先学：

1. LangChain overview
2. Model invoke
3. Structured output
4. Tool calling
5. RAG
6. LangGraph StateGraph
7. LangSmith tracing / eval

先不要急着学：

- 所有集成包
- 复杂 multi-agent
- 花哨 memory
- 没有业务场景的 agent 模板
- 一上来就做完整平台

最好的学习方式是：每学一个概念，就立刻把它映射到你自己的项目里。

| 概念 | 你的项目映射 |
|---|---|
| Tool calling | 飞书任务、Base、项目状态、客户资料 |
| RAG | secondbrain、项目文档、培训材料 |
| Structured output | 反馈分类、需求字段、风险清单 |
| LangGraph | 售前方案、周报、交付助理 |
| LangSmith | 版本对比、错误复盘、客户演示证据 |

---

## 最小实战模板

你可以把任何 AI 项目先写成这个模板：

```text
项目名称：
目标用户：
输入来源：
需要查的资料：
可调用工具：
需要人工确认的动作：
输出格式：
失败时怎么办：
评测样例：
上线指标：
```

例子：

```text
项目名称：客户反馈分流 Agent
目标用户：产品经理、客户成功
输入来源：飞书群消息、表单、CSV
需要查的资料：历史反馈、产品模块说明、当前 roadmap
可调用工具：写入飞书 Base、创建任务、发送群通知
需要人工确认的动作：给客户承诺排期、标记高风险、创建 P0 任务
输出格式：结构化分类 + 下一步建议 + 来源链接
失败时怎么办：写入待人工处理队列
评测样例：50 条历史反馈
上线指标：人工分类时间下降 50%，高优反馈漏判率低于 5%
```

这个模板比“我想做一个 Agent”更有用。它把项目从想象拉回可交付。

---

## 最后判断

如果你只想做一次演示，Dify 可能更快。

如果你想真正理解 AI 应用怎么工程化，LangChain 生态值得系统学。

如果你要把 Agent 做到能长期跑、能追踪、能评测、能接客户系统，那学习顺序应该是：

```text
LangChain 基础能力
→ LangGraph 流程控制
→ LangSmith / Langfuse 观测评测
→ 接入真实业务工具
→ 建立评测集和版本迭代机制
```

真正的实战不是“会调模型”，而是你能把一个模糊业务需求拆成输入、检索、工具、流程、观测和评测，然后让它一版一版变稳。
