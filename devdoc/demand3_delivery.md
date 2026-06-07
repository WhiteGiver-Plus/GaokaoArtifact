# demand3 交付文档

## 新增遗物

### 过程分

- id: `process_points`
- 稀有度: `common`
- tags: `错题`, `分数补偿`, `低正确率`
- 效果: 答错的题目也获得 1 分，并且这 1 分进入本题基础分，因此会被本题得分倍率放大。
- 实现: 新增效果 `addQuestionBaseScore`，在题目计分公式中按 `((答对 ? 10 : 0) + currentQuestionBaseScore) * 本题倍率 + 额外固定分` 结算。

### 能连起来就是招

- id: `chain_is_method`
- 稀有度: `rare`
- tags: `遗物流`, `联动`, `分数补偿`
- 效果: 每题结算尾声触发，考试最终分数增加 `2 ^ 本题触发遗物次数` 分，上限 128。
- 实现: 每道题开始时清空 `currentQuestionTriggerCount`；题目期触发的遗物和题目期的联动触发会累计该计数。该遗物在 `QUESTION_END` 的较晚 phase 触发，按当前题累计次数增加 `examPostBonus`。

## tag 系统修改

遗物 tag 已从旧的底层机制标签改为流派标签，当前流派包括：

- `高正确率`
- `低正确率`
- `连败`
- `连胜`
- `胜败交替`
- `遗物流`
- `体力`
- `错题`
- `幸运方块`
- `豌豆`
- `分数补偿`
- `倍率成长`
- `考试倍率`
- `分数形态`
- `联动`
- `无效遗物`
- `风险收益`
- `容错`
- `压轴题`
- `节奏题`
- `前期题`
- `总分成长`
- `抽取`
- `消耗`
- `销毁`
- `续航`
- `翻盘`
- `随机爆发`
- `操作分数`
- `容量`

`废话文学大师` 原先依赖内部 `blank` tag 统计无效遗物数量；该条件已同步改为统计 `无效遗物`，避免继续暴露旧 tag。

## 同 tag 抽取概率

抽取候选不再是纯随机洗牌截取。当前规则：

- 每个可抽遗物基础权重为 `1`。
- 玩家已拥有的每个同名 tag，会让候选遗物权重增加 `0.08`。
- 多个 tag 可以叠加，例如候选遗物命中 3 个已拥有 tag 时，权重为 `1.24`。
- 每次候选从剩余池中按权重无放回抽取，保持不会在同一次候选中重复出现同一遗物。

这属于“略微提高”同流派出现率，不会锁死流派，也不会阻止跨流派选择。

## 代码改动位置

- `data/artifacts.json`: 新增 2 件遗物，重填全部遗物 tags。
- `gh_pages_local_game/src/artifacts.generated.ts`: 由 `npm run game:data --silent` 重新生成。
- `gh_pages_local_game/src/core/types.ts`: 新增计分效果类型和题目期计数字段。
- `gh_pages_local_game/src/core/effects.ts`: 实现 `addQuestionBaseScore` 与 `addExamPostBonusByQuestionTriggerCount`。
- `gh_pages_local_game/src/core/engine.ts`: 修改题目计分公式、题目期触发计数、同 tag 加权抽取。
- `gh_pages_local_game/src/core/phases.ts`: 将新增计分效果纳入加法结算层。
- `gh_pages_local_game/scripts/verifyDemand3.ts`: 新增 demand3 行为验证脚本。

## 验证

已执行：

```bash
npm run game:data --silent
npm run typecheck --silent
npx tsx gh_pages_local_game/scripts/verifyDemand3.ts
npm run game:build --silent
```

验证覆盖：

- `过程分` 在全错场景下每题给 1 分。
- `过程分` 的错题分受本题倍率影响。
- `能连起来就是招` 在每题两次遗物触发时，单科额外增加 60 分。
- 流派 tag 覆盖需求列举的核心流派，且不再暴露 `blank`。
- 已拥有 `高正确率` 遗物后，固定样本下同 tag 候选出现次数高于无初始遗物基线。
