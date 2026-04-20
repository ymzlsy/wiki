# Module 2: Architectural Constraints 架构约束

> **核心理念：不要告诉Agent"写好代码"，用机制强制什么是好代码。**

## 2.1 架构约束执行机制

![约束执行](/images/02-constraints-enforcement.png)

<details>
<summary>📐 查看Graphviz源码 (02-constraints-enforcement.dot)</summary>

```dot
// 见 dots/02-constraints-enforcement.dot
```
</details>

## 2.2 四层防线详解

### Layer 1: Pre-commit Hooks
```bash
# .pre-commit-config.yaml 示例
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
  - repo: https://github.com/astral-sh/ruff-pre-commit
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
```

### Layer 2: Deterministic Linters
规则比建议更强大：**如果一类错误反复出现，停止描述它，开始预防它。**

```markdown
# 在AGENTS.md中定义编码标准
1. **YAGNI**: 不需要就不建
2. **DRY**: 第二次重复后再提取，不要过早
3. **Fail Fast**: 显式错误胜过静默失败
4. **Simple First**: 先写明显的解决方案
5. **Delete Aggressively**: 更少代码 = 更少Bug
6. **Semantic Naming**: 语义化命名，优化人和LLM的理解
```

### Layer 3: CI Validation
```yaml
# 架构约束的CI检查
- 依赖分层规则（Types → Config → Repo → Service → Runtime → UI）
- 每层只能引用左侧层
- 结构化测试（类似ArchUnit）
- 类型检查 (mypy/TypeScript strict)
```

### Layer 4: LLM-based Auditors
用第二个模型审查第一个模型的输出：
- 高风险PR用不同模型交叉审查
- Review Agent专注于Agent代码的常见失败模式

## 2.3 Red Hat的两阶段约束工作流（实战方法论）

Red Hat工程师在Rust后端+TypeScript前端+Helm Charts的多仓库项目中总结出：**"Vague In, Vague Out"是Agent最常见的失败根因。**

解决方案：将约束分为**规划阶段**和**实施阶段**两道关卡。

### Phase 1: Repository Impact Map（仓库影响地图）

在写任何代码前，让Agent用LSP和MCP扫描真实代码库，输出影响地图：

```yaml
trustify (backend):
  changes:
    - Add CSV serialization for SBOM query results
    - Add GET /api/v2/sbom/export endpoint
trustify-ui (frontend):
  changes:
    - Add "Export CSV" button to SBOM list toolbar
```

**关键：人类在此处审查。** 如果Agent选错了模块、遗漏了仓库、或发明了不存在的endpoint模式，在这里拦截。成本：审查3行地图 vs. 审查100行PR。

### Phase 2: Structured Task Template（结构化任务模板）

影响地图通过审查后，每个工作单元变成严格模板：

```markdown
## Repository: trustify-backend
## Description
Add a CSV export endpoint for SBOM query results.
## Files to Modify
- `modules/sbom/src/service.rs` — add CSV serialization method
- `modules/sbom/src/endpoints.rs` — add GET handler
## Implementation Notes
Follow the existing JSON export pattern in `SbomService::export_json()`.
Reuse the `QueryResult` type from `modules/sbom/src/model.rs`.
## Acceptance Criteria
- [ ] GET /api/v2/sbom/export?format=csv returns valid CSV
- [ ] Existing JSON export still works
## Test Requirements
- [ ] Integration test in `modules/sbom/tests/` following existing test patterns
```

**每个字段都有意义：**
- **Repository** — 限定Agent在单个仓库内工作，避免跨仓库混乱
- **Files to Modify** — 真实路径（从Phase 1分析中得到，不是猜的）
- **Implementation Notes** — 引用真实的符号名和现有模式
- **Acceptance Criteria** — Agent可对照验证的清单

> **核心原则：Structure In, Structure Out.** 你约束输入的结构越多，输出就越可预测。——Red Hat

## 2.4 为什么约束反而提升效率

**矛盾的真相：** 约束解空间越小，Agent越高效。

当Agent可以生成任何东西时 → 浪费token探索死胡同
当Harness定义清晰边界时 → 更快收敛到正确解

**LangChain的证明**: 同一模型，只改Harness中的约束 → 得分提升13.7个百分点

## 2.5 🔬 Lab 2: 构建约束体系

**任务：**
1. 为Lab 1的项目添加`.pre-commit-config.yaml`
2. 在AGENTS.md中添加明确的依赖分层规则
3. 创建一个简单的CI检查脚本
4. 故意让Agent违反规则，观察Harness如何拦截
