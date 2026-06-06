---
name: game-meme-artifact-research
description: Use when researching game memes, items, augments, relics, or player slang and converting them into humorous GaokaoArtifact exam relic lists in Markdown, especially when matching devdoc/artifacts_example.md style.
metadata:
  short-description: Turn game memes into exam relic lists
---

# Game Meme Artifact Research

## Purpose

Turn a game topic into a Markdown list of GaokaoArtifact relics. The output should feel like `devdoc/artifacts_example.md`: short relic names, one-line or two-line effects, loose category headings, and mechanics that are funny because they preserve the original game's logic inside the exam system.

## Required Context

Before writing, read:

- `devdoc/artifacts_example.md` for tone and formatting.
- `devdoc/mechanics.md` for available exam states, timings, limits, and relic order rules.

If the user asks for current game content, or the topic may have changed, browse current sources. Prefer official sources for rules and patch context, then use reliable community databases for exhaustive item/relic/augment lists. Every generated relic must include its source game/topic, source term, and a precise source-backed original description.

## Workflow

1. **Define the source pool**
   - Identify the exact game/topic: examples include LOL装备, 海克斯大乱斗词条, 杀戮尖塔2遗物, 皇室战争梗, 小丑牌梗, 脑叶公司梗.
   - Collect 8-20 recognizable source terms. Favor names with strong mechanics, player slang, or meme value over obscure entries.

2. **Extract original mechanics**
   - For each candidate, write a short note mentally: trigger timing, cost, stacking rule, drawback, randomness, position, death/save mechanic, destroy/transform mechanic, or combo dependency.
   - Keep the joke anchored to that behavior. Do not use a famous name with an unrelated generic buff.
   - Preserve the source context in the output. Use `出处:` and `原描述:` lines under every relic.
   - `原描述` must be precise, not a loose summary: include exact trigger conditions, changed stats, numbers, durations, scaling coefficients, cooldowns, rarity/tier, and version/context when the source provides them. Directly translate or technically transcribe the source effect into Chinese; do not omit numbers just because they are not used in the converted relic.

3. **Map into the exam system**
   Use the states from `devdoc/mechanics.md`:
   - 体力, 基础正确率, 本题得分倍率, 本场考试得分倍率, 总得分倍率.
   - Per-question, exam-start, exam-end, all-exams-end, relic-gain, relic-loss, and left-to-right relic order triggers.
   - Respect the 8 relic limit and the 20-trigger settlement cap when writing loop/combo relics.
   - Do not limit triggers to the example categories. Relics may trigger from question number, subject, question type, difficulty tag,文/理/计算/记忆/作文/听力等属性, relic slot index, left/right neighbors, score digits, total score shape, health threshold, previous answer pattern, selected subject group, or source-game rarity/tier.
   - If the current simulator does not yet expose a needed attribute, write it as a clear design requirement, for example: `需要题目属性: 计算题`.

4. **Write in artifact-example style**
   - Use concise Chinese.
   - Format as category headings plus `遗物名:` and effect text.
   - Effects can be absurd, but must be mechanically readable.
   - Add drawbacks to powerful relics. The funniest relics usually overfit the source mechanic and punish the player in a source-faithful way.

5. **Balance pass**
   - Include a mix of: direct power, drawback, delayed payoff, loss/removal, score digit trick, position trick, random high-roll, and combo relics.
   - Avoid too many flat `正确率+X%` relics.
   - If an effect can loop, specify "每次结算最多触发一次" or rely explicitly on the global 20-trigger cap.

## Output Shape

Each run should create one Markdown file unless the user asks otherwise:

```markdown
# 主题名遗物

调研来源:
- ...

### 分类

遗物名:
出处: 游戏/模式/词条名
原描述: 精确翻译/转写原效果；必须包括触发条件、数值、持续时间、缩放、冷却或版本语境
遗物效果: 转换后的高考遗物机制

遗物名:
出处: ...
原描述: ...
遗物效果: ...
```

Useful categories:

- 基础遗物
- 连胜/连败流
- 题目位置
- 题号触发
- 题目属性触发
- 抽取与失去机制
- 分数机制
- 联动
- 无效遗物

## Quality Bar

Good outputs should pass these checks:

- A reader can guess the source joke or source mechanic from the effect.
- A reader can read the source context from the file itself: each relic has `出处`, `原描述`, and `遗物效果`.
- At least half the relics have a timing condition, combo condition, drawback, or special trigger.
- No source topic becomes a samey list of stat sticks.
- The final Markdown is directly usable as an artifact-design draft, not a prose essay.
