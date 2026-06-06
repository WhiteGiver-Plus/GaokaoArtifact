# 高考遗物 v0.1 机制文档

## 目标

本版本先交付无前端纯文字测试版，用 Node CLI 跑完整局游戏。核心引擎与 CLI 分离，未来网页只负责展示和输入，不复制考试、抽遗物、触发器或分数逻辑。

## 一局游戏流程

1. 选择选考三科；前三科固定为语文、数学、英语。
2. 开局连续进行 5 次遗物三选一。
3. 依次进行 6 场考试，每场 15 题，每题基础 10 分，单科基础满分 150。
4. 每场考试结束后再进行 1 次遗物抽取。
5. 超过遗物上限时立刻选择一件遗物丢弃。
6. 六科结束后应用总分倍率并给出最终总分。

## 基础状态

- 基础正确率：开局 50%。
- 体力：开局 100；可以超过 100；体力下限默认为 0。
- 体力下降：每题结算后默认下降 5 点。
- 本题得分倍率：每题开始时重置为 `1 + 遗物提供的常驻本题倍率`。
- 本场考试倍率：每场考试开始时重置为 1。
- 总分倍率：整局保留，六科结束时应用。
- 遗物上限：默认 8；部分遗物可以提高上限或免除一次丢弃。

## 判题与计分

- 每题先触发题前遗物，再计算最终正确率。
- 最终正确率公式：`clamp(基础正确率 * 当前体力 / 100 + 本题正确率修正, 0, 100)`。
- 掷一次 seed RNG；随机数小于最终正确率则答对。
- 判题后遗物可以强制改对或改错；同一时机冲突时，后触发者覆盖前触发者。
- 答对获得 `10 * 本题得分倍率 + 本题额外分`；答错默认只获得本题额外分。
- 单科分数允许超过 150，也允许被遗物压到负数。
- 分数内部保留小数，展示、平方/立方/数字形状判断使用四舍五入后的当前分。

## 事件总线与修饰符系统

遗物按外部 JSON 配置加载。每个遗物包含 id、名称、来源、稀有度、标签、描述、`modifiers` 和 `triggers`。

- `modifiers` 是持有时持续生效的数值修饰，不算触发，失去遗物后自动失效。
- `triggers` 是离散事件处理器，进入事件总线，受 phase、order、栏位顺序和 20 次触发上限控制。
- 复杂联动遗物使用 handler 插件，但仍由配置文件启用。

支持的触发时机：

- `ARTIFACT_GAINED`：获得遗物时。
- `ARTIFACT_LOST`：失去遗物时。
- `EXAM_START`：考试开始时。
- `QUESTION_BEFORE_ROLL`：每题判定正确率前。
- `QUESTION_AFTER_ROLL`：随机判定后、计入连击前。
- `QUESTION_SCORE`：计分前。
- `QUESTION_END`：计分和体力下降后。
- `EXAM_END`：考试结束、单科最终结算前。
- `RUN_END`：六科结束、总分结算前。
- `OTHER_ARTIFACT_TRIGGERED`：其他遗物触发后，供联动遗物监听。

同一时机先按 priority 升序触发，再按遗物栏从左到右触发。默认 priority 为 100。每个结算事件最多执行 20 次遗物触发，超过后跳过并写入战报。

事件排序规则更新为：

```text
phase -> target -> calcLayer -> order -> slotIndex -> triggerIndex
```

旧 `timing` 会映射到数字 phase；新遗物可以直接写 `phase` 和 `order`。同一个数值 target 内固定先加算后乘算：

```text
base/set -> add -> multiply -> min/max/clamp -> finalize
```

计算模板：

```text
finalValue = clamp((baseValue + sum(add)) * product(multiply), min, max)
```

因此栏位顺序不能让乘算插到加算前面；双发、机枪、模仿者等连锁触发也不能打破这个顺序。

## 遗物配置扩展

遗物文件位于 `data/artifacts/*.json`，加载器会读取目录下所有 JSON 并合并。新增普通遗物时，只需要添加一个 JSON 对象：

```json
{
  "id": "example_artifact",
  "name": "示例遗物",
  "source": "高考梗",
  "rarity": "common",
  "tags": ["accuracy"],
  "description": "每场前两题正确率 +20。",
  "triggers": [
    {
      "timing": "QUESTION_BEFORE_ROLL",
      "condition": { "kind": "questionIndex", "op": "lte", "value": 2 },
      "effects": [{ "op": "addQuestionAccuracy", "value": 20 }]
    }
  ]
}
```

如果遗物需要复制、重放、触发右侧遗物等复杂行为，应在 `src/core/engine.ts` 注册 handler，并在配置里引用 handler 名称。当前已实现 `mimicRight`、`repeatOtherTrigger`、`triggerRightOnOtherTrigger`。

## CLI

- 自动完整局：`npm run simulate -- 20260606 first`
- 交互文字版：`npm run play -- 20260606`
- 参数含义：第一个位置参数是 seed，第二个位置参数是自动策略，支持 `first`、`random`、`rare`。
- 选考科目也可用参数传入：`npm run simulate -- 20260606 first --subjects=physics,chemistry,biology`

## 当前遗物池

当前共有 60 个遗物，按配置文件拆分：

- `01-streak.json`：12 个连胜、连败、强制改写结果遗物。
- `02-draft-loss.json`：5 个抽取、销毁、失去遗物。
- `03-basic.json`：10 个基础正确率、体力、随机分数遗物。
- `04-position-link.json`：10 个题目位置、栏位联动、无效遗物。
- `05-score-patterns.json`：5 个分数形状遗物。
- `06-new-artifacts.json`：18 个新增遗物，补充体力、选考科目、抽取补偿、容量和失去流派。

## v0 约定

- 考试过程中不产生玩家临时决策；玩家只在选科、选遗物、丢弃遗物时决策。
- 获得时写入的基础数值变化默认为永久变化；需要“失去后失效”的能力应后续增加持续光环型效果。
- `豆包` 在 v0 中被规范为自动触发：基础正确率 -20%，每场第一道错题改为正确。
- `押题卷` 在获得时写入下一场考试前三题正确率修正，然后立刻销毁自身。
- `书包夹层` 在获得时提供一次免丢弃机会，然后立刻销毁自身。
