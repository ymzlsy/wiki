# Module 4: AI Factory 七层架构

> **当你理解了三大支柱，就可以构建完整的AI工厂了。**

## 4.1 七层架构全景

![七层架构](/images/00-five-layers.png)

<details>
<summary>📐 查看Graphviz源码 (00-five-layers.dot)</summary>

```dot
// 见 dots/00-five-layers.dot
```
</details>

## 4.2 逐层解析

### Layer 1: Intent Capture（意图捕获）
- 产品需求、Bug报告、客户支持信号、路线图项、内部需求
- **关键**：意图必须被结构化，不是一句"帮我加个CSV导出"

### Layer 2: Spec & Issue Framing（规范化需求）
- 有约束的指令 + 验收标准 + 上下文链接
- **Red Hat方法**：两阶段工作流（Impact Map → Structured Task）

![Red Hat 工作流](/images/05-redhat-workflow.png)

<details>
<summary>📐 查看Graphviz源码 (05-redhat-workflow.dot)</summary>

```dot
// 见 dots/05-redhat-workflow.dot
```
</details>

### Layer 3: Context & Instruction（上下文与指令）
- 对应 Module 1 的全部内容

### Layer 4: Execution（执行）
- 一个或多个Agent编辑代码、调用工具、运行命令
- **Stripe模式**：开发者发任务 → Agent写代码 → Agent过CI → Agent开PR → 人审核合并
- **LangChain中间件模式**：

![LangChain中间件](/images/06-langchain-middleware.png)

### Layer 5: Verification（验证）
- 测试、静态分析、Review Agent、CI、人工签字
- **核心准则**：验证胜过建议

### Layer 6: Isolation & Permission（隔离与权限）
- Worktrees、沙箱、运行时隔离、Secret边界、审批流
- Git Worktree让多个Agent可以并行工作在不同分支

### Layer 7: Feedback（反馈）
- 生产遥测、客户信号、Review结果、反复失败 → 反馈到规则/提示/流程
- **形成闭环**：Layer 7 → Layer 1

## 4.3 Harness架构模式（来自Salesforce）

根据任务复杂度，选择不同的Harness架构模式：

### 模式1: 单线程监督者（Single-Threaded Supervisor）

最简单的形式：Harness包裹单个模型执行循环，监控每一轮对话，检测错误或安全违规。

**适用场景：** 客服Agent帮用户重置密码、代码补全、单文件修改等简单任务。

### 模式2: 多Agent协调（Multi-Agent Coordination）

Harness作为Hub-and-Spoke模式的调度器，管理多个专家Agent：

```
营销活动项目示例：

Harness（调度器）
  ├── 研究Agent → 收集市场趋势数据
  ├── 写作Agent → 基于研究生成广告文案
  └── 合规Agent → 审查文案的法律合规性

Harness管理Agent之间的"交接"：
确保每个Agent只接收来自上一步的相关上下文，而非全部数据
```

**选择指南：**

| 维度 | 单线程监督者 | 多Agent协调 |
|------|------------|------------|
| **复杂度** | 单步骤、线性任务 | 多步骤、需要不同专业能力 |
| **并行性** | 串行 | 可并行 |
| **成本** | 低 | 中到高（多模型调用） |
| **典型场景** | 客服、代码补全 | 营销、DevOps流水线、大型重构 |

## 4.4 缺失任何一层的后果

| 缺失层 | 后果 | 真实症状 |
|--------|------|----------|
| 无需求规范 | 快速实现模糊的意图 | Agent写了一堆代码但解决的是错误的问题 |
| 无上下文纪律 | 昂贵的瞎摸索 | Agent发明不存在的API，幻觉文件路径 |
| 无验证 | 规模化的Vibe Coding | 代码能编译但逻辑错误，技术债指数级增长 |
| 无隔离 | 不受控的并行 | 多Agent互相覆盖代码，合并冲突不断 |
| 无反馈闭环 | 换个包装重复犯错 | 同样的Bug在不同PR中反复出现 |

> **投资优质Harness的战略收益（Salesforce总结）：** 可靠性（可回滚到安全状态）、模型无关性（换模型不用重写业务逻辑）、成本控制（缓存减少重复调用）、安全合规（所有Agent操作可审计）。

## 4.5 🔬 Lab 4: 七层架构桌面推演

**任务：** 选一个你公司的真实需求，用七层架构框架做一次完整的桌面推演：
1. 写出Intent
2. 写出Structured Spec
3. 设计Context（AGENTS.md内容）
4. 规划Execution（哪些Agent做什么）
5. 设计Verification（什么测试/检查）
6. 规划Isolation（如何隔离）
7. 设计Feedback（如何闭环）
