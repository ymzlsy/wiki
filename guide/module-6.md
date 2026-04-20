# Module 6: 手搓Agent Harness框架

> **目标：让你具备从零构建Harness的能力，遇到新需求能快速实现和验证。**

## 6.1 最小可行Harness（30分钟版）

```
my-harness/
├── AGENTS.md           # 项目指令
├── .pre-commit-config.yaml  # 提交前检查
├── scripts/
│   ├── lint.sh         # Lint脚本
│   ├── test.sh         # 测试脚本
│   └── verify.sh       # 综合验证
├── .github/workflows/
│   └── ci.yml          # CI管线
└── docs/
    └── architecture.md # 架构文档(Agent可读)
```

## 6.2 进阶：中间件式Harness（LangChain模式）

```python
# harness/middleware.py

class HarnessMiddleware:
    """Harness中间件基类"""
    def process(self, request, next_middleware):
        raise NotImplementedError

class LocalContextMiddleware(HarnessMiddleware):
    """映射代码库结构，注入相关上下文"""
    def process(self, request, next_middleware):
        # 扫描目录结构
        context = scan_directory_structure(request.repo_path)
        request.context.update(context)
        return next_middleware(request)

class LoopDetectionMiddleware(HarnessMiddleware):
    """检测Agent是否陷入重复循环"""
    def process(self, request, next_middleware):
        if is_repeated_action(request):
            return escalate_to_human(request)
        return next_middleware(request)

class PreCompletionChecklistMiddleware(HarnessMiddleware):
    """完成前强制验证"""
    def process(self, request, next_middleware):
        result = next_middleware(request)
        if not run_verification_checklist(result):
            return retry_with_feedback(request, result)
        return result

class HarnessPipeline:
    """中间件管线"""
    def __init__(self, middlewares):
        self.middlewares = middlewares
    
    def execute(self, request):
        def chain(index):
            if index >= len(self.middlewares):
                return execute_agent(request)
            return self.middlewares[index].process(request, lambda r: chain(index + 1))
        return chain(0)

# 使用
pipeline = HarnessPipeline([
    LocalContextMiddleware(),
    LoopDetectionMiddleware(),
    PreCompletionChecklistMiddleware(),
])
result = pipeline.execute(agent_request)
```

## 6.3 AGENTS.md模板工厂

```python
# harness/agents_md_generator.py

TEMPLATE = """# {project_name} - Agent Guidelines

## Project Overview
{description}
Tech stack: {tech_stack}

## Development Commands
{dev_commands}

## Coding Conventions
{coding_conventions}

## Architecture Constraints
{architecture_constraints}

## Testing Requirements
{testing_requirements}

## Security Rules
- No eval(), exec(), or pickle on user input
- No hardcoded API keys
- Proper exception handling (no bare except:)
{extra_security}

## Verification Checklist
Before completing ANY task:
{verification_checklist}
"""

def generate_agents_md(config: dict) -> str:
    """基于配置生成AGENTS.md"""
    return TEMPLATE.format(**config)
```

## 6.4 约束验证器

```python
# harness/constraint_validator.py

import ast
import os

class ConstraintValidator:
    """架构约束验证器"""
    
    def __init__(self, rules: dict):
        self.rules = rules
        self.violations = []
    
    def validate_dependency_layers(self, src_dir: str):
        """验证依赖分层规则"""
        layers = self.rules.get("dependency_layers", [])
        # Types → Config → Repo → Service → Runtime → UI
        for file_path in self._walk_python_files(src_dir):
            imports = self._extract_imports(file_path)
            current_layer = self._get_layer(file_path, layers)
            for imp in imports:
                imp_layer = self._get_layer(imp, layers)
                if imp_layer > current_layer:
                    self.violations.append(
                        f"{file_path}: imports {imp} (layer {imp_layer} > {current_layer})"
                    )
    
    def validate_naming_conventions(self, src_dir: str):
        """验证命名约定"""
        # 实现略 - 检查函数名、变量名、文件名是否符合约定
        pass
    
    def validate_no_forbidden_patterns(self, src_dir: str):
        """检查禁止的模式（eval/exec等）"""
        for file_path in self._walk_python_files(src_dir):
            with open(file_path) as f:
                content = f.read()
            if "eval(" in content or "exec(" in content:
                self.violations.append(f"{file_path}: contains eval() or exec()")
    
    def report(self) -> str:
        if not self.violations:
            return "✅ All constraints passed"
        return "❌ Violations:\n" + "\n".join(f"  - {v}" for v in self.violations)
```

## 6.5 反馈闭环引擎

```python
# harness/feedback_engine.py

class FeedbackEngine:
    """将Review评论转化为规则"""
    
    def __init__(self, rules_file: str):
        self.rules_file = rules_file
    
    def analyze_review_comments(self, comments: list[str]) -> dict:
        """分析Review评论，识别重复模式"""
        patterns = {}
        for comment in comments:
            category = self._categorize(comment)
            patterns.setdefault(category, []).append(comment)
        
        # 出现3次以上的 → 应该转化为规则
        recurring = {k: v for k, v in patterns.items() if len(v) >= 3}
        return recurring
    
    def generate_lint_rule(self, pattern: str) -> str:
        """将模式转化为Lint规则"""
        # 这里可以调用LLM帮助生成规则
        return f"# Auto-generated rule from recurring review comment:\n# Pattern: {pattern}\n"
    
    def update_agents_md(self, new_rule: str):
        """将新规则追加到AGENTS.md"""
        with open("AGENTS.md", "a") as f:
            f.write(f"\n{new_rule}\n")
```

## 6.6 🔬 Lab 6: 组装你自己的Harness

**任务：**
1. 基于6.1-6.5的组件，组装一个完整的Harness框架
2. 在一个真实的小项目上测试它
3. 记录Agent在有Harness和无Harness下的行为差异
4. 迭代：找到Agent的失败模式，添加新的约束
