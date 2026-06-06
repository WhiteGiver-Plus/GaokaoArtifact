import type { ArtifactConfig } from "../../src/core/browser.js";

export const WEB_ARTIFACTS = [
  {
    "id": "big_pity",
    "name": "大保底",
    "source": "抽卡",
    "rarity": "rare",
    "tags": [
      "accuracy",
      "position"
    ],
    "description": "你的最后一题正确率 +1000%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_BEFORE_ROLL",
        "condition": {
          "kind": "questionIndex",
          "op": "eq",
          "value": 15
        },
        "effects": [
          {
            "op": "addQuestionAccuracy",
            "value": 1000
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "small_pity",
    "name": "小保底",
    "source": "抽卡",
    "rarity": "uncommon",
    "tags": [
      "accuracy",
      "position"
    ],
    "description": "每第 5 题正确率 +200%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_BEFORE_ROLL",
        "condition": {
          "kind": "questionModulo",
          "modulo": 5,
          "equals": 0
        },
        "effects": [
          {
            "op": "addQuestionAccuracy",
            "value": 200
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "empty_city",
    "name": "空城",
    "source": "三国杀",
    "rarity": "rare",
    "tags": [
      "wrong",
      "exam_score"
    ],
    "description": "若本场考试所有题目全部答错，则本场考试获得满分。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "examAllWrong"
        },
        "effects": [
          {
            "op": "setExamScoreToFull"
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "self_sacrifice",
    "name": "自刎归天",
    "source": "三国杀",
    "rarity": "special",
    "tags": [
      "wrong",
      "risk"
    ],
    "description": "本场考试全部题目正确率 -100%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_BEFORE_ROLL",
        "effects": [
          {
            "op": "addQuestionAccuracy",
            "value": -100
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "proud_winner",
    "name": "胜兵必骄，骄兵必败",
    "source": "三国杀",
    "rarity": "uncommon",
    "tags": [
      "streak",
      "risk"
    ],
    "description": "若上一道题答对，则下两道题正确率 -100%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_AFTER_ROLL",
        "condition": {
          "kind": "result",
          "value": "correct"
        },
        "effects": [
          {
            "op": "queueQuestionModifier",
            "target": "accuracy",
            "value": -100,
            "duration": 2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "sad_loser",
    "name": "败兵必哀，哀兵必胜",
    "source": "三国杀",
    "rarity": "uncommon",
    "tags": [
      "streak",
      "comeback"
    ],
    "description": "若上一道题答错，则下两道题正确率 +100%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_AFTER_ROLL",
        "condition": {
          "kind": "result",
          "value": "wrong"
        },
        "effects": [
          {
            "op": "queueQuestionModifier",
            "target": "accuracy",
            "value": 100,
            "duration": 2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "rageblade",
    "name": "羊刀",
    "source": "LOL装备",
    "rarity": "rare",
    "tags": [
      "streak",
      "multiplier"
    ],
    "description": "每连续答对一道题，本题得分倍率乘 1.2。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "result",
          "value": "correct"
        },
        "effects": [
          {
            "op": "multiplyQuestionMultiplierByStreak",
            "streak": "correct",
            "base": 1.2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "doctor_scaling",
    "name": "医死的人越多，医术越高明",
    "source": "网文",
    "rarity": "rare",
    "tags": [
      "wrong",
      "multiplier"
    ],
    "description": "每连续答错一道题，下一道题得分倍率乘 1.5。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "effects": [
          {
            "op": "multiplyQuestionMultiplierByStreak",
            "streak": "wrong",
            "base": 1.5,
            "usePrevious": true
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "guardian_angel",
    "name": "复活甲",
    "source": "LOL装备",
    "rarity": "rare",
    "tags": [
      "safety",
      "force_result"
    ],
    "description": "每场考试的第一道错题被强制改为正确。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_AFTER_ROLL",
        "condition": {
          "kind": "result",
          "value": "wrong"
        },
        "limit": {
          "scope": "exam",
          "count": 1
        },
        "effects": [
          {
            "op": "forceResult",
            "result": "correct"
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "right_then_wrong",
    "name": "对的对的，哦不对不对",
    "source": "高考梗",
    "rarity": "uncommon",
    "tags": [
      "risk",
      "force_result"
    ],
    "description": "每场考试的第一道正确题被强制改为错误。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_AFTER_ROLL",
        "condition": {
          "kind": "result",
          "value": "correct"
        },
        "limit": {
          "scope": "exam",
          "count": 1
        },
        "effects": [
          {
            "op": "forceResult",
            "result": "wrong"
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "final_ritual",
    "name": "至终的仪式",
    "source": "第五人格",
    "rarity": "rare",
    "tags": [
      "streak",
      "total_score"
    ],
    "description": "每连续答对五题时，当前总分倍率乘 1.1。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "streak",
          "streak": "correct",
          "op": "multipleOf",
          "value": 5
        },
        "effects": [
          {
            "op": "multiplyRunMultiplier",
            "value": 1.1
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "identity_v",
    "name": "第五人格",
    "source": "第五人格",
    "rarity": "rare",
    "tags": [
      "wrong",
      "exam_multiplier"
    ],
    "description": "每连续答错五题时，当前得分倍率乘 1.2。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "streak",
          "streak": "wrong",
          "op": "multipleOf",
          "value": 5
        },
        "effects": [
          {
            "op": "multiplyExamMultiplier",
            "value": 1.2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "multiple_choice",
    "name": "多选题",
    "source": "高考梗",
    "rarity": "uncommon",
    "tags": [
      "draft"
    ],
    "description": "每次抽取遗物的备选数 +1。",
    "modifiers": [
      {
        "target": "draftChoicesBonus",
        "mode": "add",
        "value": 1
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "create_from_nothing",
    "name": "无中生有",
    "source": "斗地主",
    "rarity": "rare",
    "tags": [
      "draft",
      "consume"
    ],
    "description": "随机加入两张新词条，销毁此词条。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "gainRandomArtifacts",
            "count": 2
          },
          {
            "op": "destroySelf"
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "ten_pull_gift",
    "name": "上线立送10连抽",
    "source": "手游梗",
    "rarity": "rare",
    "tags": [
      "draft",
      "consume"
    ],
    "description": "立刻从 10 张新词条中选取一张。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "offerDraft",
            "choices": 10,
            "picks": 1
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "change_everything",
    "name": "我们可以改变一切",
    "source": "网文",
    "rarity": "rare",
    "tags": [
      "destroy",
      "exam_score"
    ],
    "description": "销毁一个其他遗物，下场考试增加 200 分。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "destroyOther",
            "select": "leftmost"
          },
          {
            "op": "addNextExamScore",
            "value": 200
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "silver_lion",
    "name": "白银狮子",
    "source": "三国杀",
    "rarity": "uncommon",
    "tags": [
      "lost",
      "exam_score"
    ],
    "description": "失去这张遗物时，下场考试增加 100 分。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "ARTIFACT_LOST",
        "condition": {
          "kind": "lostArtifactIsSelf"
        },
        "effects": [
          {
            "op": "addNextExamScore",
            "value": 100
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "glass_cannon",
    "name": "玻璃大炮",
    "source": "游戏通用",
    "rarity": "rare",
    "tags": [
      "risk",
      "multiplier",
      "stamina"
    ],
    "description": "体力下降速度 +10%，本题得分倍率 +1。",
    "modifiers": [
      {
        "target": "staminaDecay",
        "mode": "add",
        "value": 10
      },
      {
        "target": "questionMultiplier",
        "mode": "add",
        "value": 1
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "regeneration_potion",
    "name": "再生药水",
    "source": "泰拉瑞亚",
    "rarity": "common",
    "tags": [
      "stamina"
    ],
    "description": "体力每 5 题回复 20%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_END",
        "condition": {
          "kind": "questionModulo",
          "modulo": 5,
          "equals": 0
        },
        "effects": [
          {
            "op": "addStat",
            "stat": "stamina",
            "value": 20
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "stamina_potion",
    "name": "体力药水",
    "source": "泰拉瑞亚",
    "rarity": "common",
    "tags": [
      "stamina"
    ],
    "description": "当前体力增加 50%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "addStat",
            "stat": "stamina",
            "value": 50
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "lucky_block",
    "name": "幸运方块",
    "source": "游戏通用",
    "rarity": "rare",
    "tags": [
      "random",
      "exam_score"
    ],
    "description": "每题结算时有 0.2% 概率触发，获得 1000 分；每次触发后，下一次效果 x2。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_END",
        "handler": "luckyBlock",
        "params": {
          "chance": 0.002,
          "value": 1000
        }
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "strong_luck",
    "name": "强运",
    "source": "高考梗",
    "rarity": "uncommon",
    "tags": [
      "accuracy"
    ],
    "description": "基础正确率 x125%。",
    "modifiers": [
      {
        "target": "baseAccuracy",
        "mode": "multiply",
        "value": 1.25
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "death_blade",
    "name": "名刀·司命",
    "source": "王者荣耀",
    "rarity": "rare",
    "tags": [
      "stamina",
      "safety"
    ],
    "description": "你的体力下限被锁定为不可低于 10%。",
    "modifiers": [
      {
        "target": "staminaFloor",
        "mode": "min",
        "value": 10
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "final_reincarnation",
    "name": "轮回之终末",
    "source": "网文",
    "rarity": "special",
    "tags": [
      "accuracy",
      "stamina",
      "risk"
    ],
    "description": "正确率 +1000%，体力 +1000%，每场考试结束时 -1000 分。",
    "modifiers": [
      {
        "target": "finalAccuracy",
        "mode": "add",
        "value": 1000
      }
    ],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "addStat",
            "stat": "stamina",
            "value": 1000
          }
        ]
      },
      {
        "timing": "EXAM_END",
        "effects": [
          {
            "op": "addExamScore",
            "value": -1000
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "eureka",
    "name": "尤里卡",
    "source": "文明",
    "rarity": "common",
    "tags": [
      "accuracy"
    ],
    "description": "基础正确率 x120%。",
    "modifiers": [
      {
        "target": "baseAccuracy",
        "mode": "multiply",
        "value": 1.2
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "doubao",
    "name": "豆包",
    "source": "AI梗",
    "rarity": "uncommon",
    "tags": [
      "accuracy",
      "force_result"
    ],
    "description": "你可以在考试时询问豆包，基础正确率 x20%。",
    "modifiers": [
      {
        "target": "baseAccuracy",
        "mode": "multiply",
        "value": 0.2
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "deep_thinking",
    "name": "深度思考中",
    "source": "AI梗",
    "rarity": "uncommon",
    "tags": [
      "accuracy",
      "stamina"
    ],
    "description": "基础正确率 x140%，体力下降速率 +5%。",
    "modifiers": [
      {
        "target": "baseAccuracy",
        "mode": "multiply",
        "value": 1.4
      },
      {
        "target": "staminaDecay",
        "mode": "add",
        "value": 5
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "linked_seats",
    "name": "连坐制",
    "source": "高考梗",
    "rarity": "uncommon",
    "tags": [
      "position",
      "multiplier"
    ],
    "description": "若本题正确，则后一题得分倍率增加 1.5。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_AFTER_ROLL",
        "condition": {
          "kind": "result",
          "value": "correct"
        },
        "effects": [
          {
            "op": "queueQuestionModifier",
            "target": "multiplier",
            "value": 1.5,
            "duration": 1
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "astrology",
    "name": "观星",
    "source": "三国杀",
    "rarity": "common",
    "tags": [
      "position",
      "accuracy"
    ],
    "description": "每场考试前两题正确率 +100%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_BEFORE_ROLL",
        "condition": {
          "kind": "questionIndex",
          "op": "lte",
          "value": 2
        },
        "effects": [
          {
            "op": "addQuestionAccuracy",
            "value": 100
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "sinking_malphite",
    "name": "沉底石头人",
    "source": "LOL梗",
    "rarity": "uncommon",
    "tags": [
      "position",
      "multiplier"
    ],
    "description": "每次考试前 8 题得分倍率 -0.8，此后所有题得分倍率 +0.8。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "questionIndex",
          "op": "lte",
          "value": 8
        },
        "effects": [
          {
            "op": "addQuestionMultiplier",
            "value": -0.8
          }
        ]
      },
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "questionIndex",
          "op": "gt",
          "value": 8
        },
        "effects": [
          {
            "op": "addQuestionMultiplier",
            "value": 0.8
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "imitator",
    "name": "模仿者",
    "source": "植物大战僵尸",
    "rarity": "rare",
    "tags": [
      "slot",
      "copy"
    ],
    "description": "模仿右侧第一张遗物。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_START",
        "handler": "mimicRight"
      },
      {
        "timing": "QUESTION_BEFORE_ROLL",
        "handler": "mimicRight"
      },
      {
        "timing": "QUESTION_AFTER_ROLL",
        "handler": "mimicRight"
      },
      {
        "timing": "QUESTION_SCORE",
        "handler": "mimicRight"
      },
      {
        "timing": "QUESTION_END",
        "handler": "mimicRight"
      },
      {
        "timing": "EXAM_END",
        "handler": "mimicRight"
      },
      {
        "timing": "RUN_END",
        "handler": "mimicRight"
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "repeater",
    "name": "双发射手",
    "source": "植物大战僵尸",
    "rarity": "rare",
    "tags": [
      "slot",
      "repeat"
    ],
    "description": "每次其他遗物触发时，20% 概率多触发一次。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "OTHER_ARTIFACT_TRIGGERED",
        "handler": "repeatOtherTrigger",
        "params": {
          "chance": 0.2,
          "times": 1
        }
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "gatling_peashooter",
    "name": "机枪射手",
    "source": "植物大战僵尸",
    "rarity": "rare",
    "tags": [
      "slot",
      "repeat"
    ],
    "description": "每次其他遗物触发时，20% 概率多触发三次。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "OTHER_ARTIFACT_TRIGGERED",
        "handler": "repeatOtherTrigger",
        "params": {
          "chance": 0.2,
          "times": 3
        }
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "tile_turnip",
    "name": "瓷砖萝卜",
    "source": "植物大战僵尸",
    "rarity": "rare",
    "tags": [
      "slot",
      "repeat"
    ],
    "description": "每次其他遗物触发时，20% 概率触发其右侧的第一个遗物。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "OTHER_ARTIFACT_TRIGGERED",
        "handler": "triggerRightOnOtherTrigger",
        "params": {
          "chance": 0.2
        }
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "electric_gatling_pea",
    "name": "电能机枪豌豆",
    "source": "植物大战僵尸",
    "rarity": "special",
    "tags": [
      "slot",
      "combo"
    ],
    "description": "若你有机枪射手，机枪射手效果翻倍。",
    "modifiers": [],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "shanghai_essay",
    "name": "上海卷高考作文",
    "source": "高考梗",
    "rarity": "common",
    "tags": [
      "blank"
    ],
    "description": "有人说，这个遗物没有任何效果，也有人认为不尽如此，你怎么看？无任何效果。",
    "modifiers": [],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "reasonable_reason",
    "name": "说的道理",
    "source": "高考梗",
    "rarity": "common",
    "tags": [
      "blank"
    ],
    "description": "说的道理。无任何效果。",
    "modifiers": [],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "happy_clown",
    "name": "欢乐小丑",
    "source": "小丑牌",
    "rarity": "uncommon",
    "tags": [
      "score_pattern",
      "exam_multiplier"
    ],
    "description": "每科考试结束时，本场考试分数中包含两个相同数字，则本场考试倍率 +2。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "scoreRepeatedDigit",
          "count": 2
        },
        "effects": [
          {
            "op": "addExamMultiplier",
            "value": 2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "slippery_clown",
    "name": "滑稽小丑",
    "source": "小丑牌",
    "rarity": "rare",
    "tags": [
      "score_pattern",
      "exam_multiplier"
    ],
    "description": "每科考试结束时，本场考试分数中包含三个相同数字，则本场考试倍率 +10。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "scoreRepeatedDigit",
          "count": 3
        },
        "effects": [
          {
            "op": "addExamMultiplier",
            "value": 10
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "crazy_clown",
    "name": "狂小丑",
    "source": "小丑牌",
    "rarity": "rare",
    "tags": [
      "score_pattern",
      "exam_multiplier"
    ],
    "description": "每科考试结束时，本场考试分数为顺子，则本场考试倍率 +20。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "scoreStraight"
        },
        "effects": [
          {
            "op": "addExamMultiplier",
            "value": 20
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "tesseract",
    "name": "宇宙立方",
    "source": "漫威梗",
    "rarity": "uncommon",
    "tags": [
      "score_pattern",
      "exam_score"
    ],
    "description": "若本场考试分数为立方数，增加 200 额外分。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "scoreCube"
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 200
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "weeb_square",
    "name": "唉，二次元",
    "source": "二次元梗",
    "rarity": "common",
    "tags": [
      "score_pattern",
      "exam_score"
    ],
    "description": "若本场考试分数为平方数，增加 50 额外分。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "scoreSquare"
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 50
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "prediction",
    "name": "押题",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "accuracy"
    ],
    "description": "正确率 x1.5。",
    "modifiers": [
      {
        "target": "finalAccuracy",
        "mode": "multiply",
        "value": 1.5
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "holy_water_collector",
    "name": "圣水采集器",
    "source": "皇室战争",
    "rarity": "rare",
    "tags": [
      "accuracy",
      "multiplier"
    ],
    "description": "超出 100% 的正确率转换为得分乘数。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "accuracy",
          "op": "gt",
          "value": 100
        },
        "effects": [
          {
            "op": "convertAccuracyOverflowToQuestionMultiplier"
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "transcendent",
    "name": "超凡入圣",
    "source": "网文",
    "rarity": "rare",
    "tags": [
      "accuracy",
      "multiplier"
    ],
    "description": "若你的正确率超过 200%，本题得分倍率 x4。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "accuracy",
          "op": "gt",
          "value": 200
        },
        "effects": [
          {
            "op": "multiplyQuestionMultiplier",
            "value": 4
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "happy_flower",
    "name": "快乐小花",
    "source": "植物大战僵尸",
    "rarity": "uncommon",
    "tags": [
      "accuracy",
      "position",
      "multiplier"
    ],
    "description": "每 3 道题，本题正确率 x1.5，得分倍率 x2。",
    "modifiers": [
      {
        "target": "finalAccuracy",
        "mode": "multiply",
        "value": 1.5,
        "condition": {
          "kind": "questionModulo",
          "modulo": 3,
          "equals": 0
        }
      }
    ],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "questionModulo",
          "modulo": 3,
          "equals": 0
        },
        "effects": [
          {
            "op": "multiplyQuestionMultiplier",
            "value": 2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "pen_nib",
    "name": "钢笔尖",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "accuracy",
      "position",
      "multiplier"
    ],
    "description": "每第 10 题，本题正确率 x2，得分倍率 x5。",
    "modifiers": [
      {
        "target": "finalAccuracy",
        "mode": "multiply",
        "value": 2,
        "condition": {
          "kind": "questionIndex",
          "op": "eq",
          "value": 10
        }
      }
    ],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "questionIndex",
          "op": "eq",
          "value": 10
        },
        "effects": [
          {
            "op": "multiplyQuestionMultiplier",
            "value": 5
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "energetic",
    "name": "精力充沛",
    "source": "高考梗",
    "rarity": "uncommon",
    "tags": [
      "stamina",
      "multiplier"
    ],
    "description": "若体力高于 100%，则本题得分倍率 x1.5。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "stamina",
          "op": "gt",
          "value": 100
        },
        "effects": [
          {
            "op": "multiplyQuestionMultiplier",
            "value": 1.5
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "red_skull",
    "name": "红骷髅",
    "source": "漫威梗",
    "rarity": "uncommon",
    "tags": [
      "stamina",
      "accuracy"
    ],
    "description": "当你体力低于 50% 时，正确率 x1.5。",
    "modifiers": [
      {
        "target": "finalAccuracy",
        "mode": "multiply",
        "value": 1.5,
        "condition": {
          "kind": "stamina",
          "op": "lt",
          "value": 50
        }
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "math_lover",
    "name": "数学爱好者",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "score_pattern"
    ],
    "description": "考试结束后，可以交换分数的任意两位数字，在 C 语言大佬之前触发。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "phase": 6000,
        "order": 100,
        "effects": [
          {
            "op": "maximizeDigitSwap"
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "c_language_master",
    "name": "C语言大佬",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "score_pattern"
    ],
    "description": "考试结束后更改分数个位数为 0-9 中任何数字，在分数加成卡之前触发。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "phase": 6000,
        "order": 200,
        "effects": [
          {
            "op": "maximizeOnesDigit"
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "palindrome_score",
    "name": "回文数",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "score_pattern",
      "exam_multiplier"
    ],
    "description": "若考试结算前分数为回文数，本场考试倍率 +10。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "phase": 6200,
        "condition": {
          "kind": "scorePalindrome"
        },
        "effects": [
          {
            "op": "addExamMultiplier",
            "value": 10
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "all_for_nothing",
    "name": "前功尽弃",
    "source": "高考梗",
    "rarity": "uncommon",
    "tags": [
      "alternate",
      "exam_multiplier"
    ],
    "description": "若前一题正确而本题错误，本场考试结算倍率 x1.2。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "lastResult",
              "value": "correct"
            },
            {
              "kind": "result",
              "value": "wrong"
            }
          ]
        },
        "effects": [
          {
            "op": "multiplyExamMultiplier",
            "value": 1.2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "learn_from_mistakes",
    "name": "知错能改",
    "source": "高考梗",
    "rarity": "uncommon",
    "tags": [
      "alternate",
      "exam_multiplier"
    ],
    "description": "若前一题错误而本题正确，本场考试结算倍率 x1.2。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "lastResult",
              "value": "wrong"
            },
            {
              "kind": "result",
              "value": "correct"
            }
          ]
        },
        "effects": [
          {
            "op": "multiplyExamMultiplier",
            "value": 1.2
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "final_question_warrior",
    "name": "压轴题战神",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "position",
      "multiplier"
    ],
    "description": "每场考试最后一题得分倍率 x10。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "questionIndex",
          "op": "eq",
          "value": 15
        },
        "effects": [
          {
            "op": "multiplyQuestionMultiplier",
            "value": 10
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "no_external_things",
    "name": "无须外物",
    "source": "高考梗",
    "rarity": "special",
    "tags": [
      "artifact",
      "destroy",
      "run_multiplier"
    ],
    "description": "获得时弃掉其余所有遗物，每因此弃掉一张，当前分数 x1.4。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "destroyAllOtherAndMultiplyRun",
            "factorPerDestroyed": 1.4
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "travel_light",
    "name": "轻装上阵",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "artifact",
      "capacity",
      "run_multiplier"
    ],
    "description": "遗物上限永久 -1，当前分数 x1.5。",
    "modifiers": [
      {
        "target": "artifactLimit",
        "mode": "add",
        "value": -1
      }
    ],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "multiplyRunMultiplier",
            "value": 1.5
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "tiny_joker",
    "name": "小丑牌",
    "source": "小丑牌",
    "rarity": "common",
    "tags": [
      "blank"
    ],
    "description": "仅仅是这张牌很小丑。无任何效果。",
    "modifiers": [],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "hundred_day_oath",
    "name": "百日誓师",
    "source": "高考梗",
    "rarity": "common",
    "tags": [
      "blank"
    ],
    "description": "无任何效果。",
    "modifiers": [],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "nonsense_master",
    "name": "废话文学大师",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "blank",
      "exam_score"
    ],
    "description": "每拥有 1/2/3/4 张无效遗物，每场考试得分 +20/+100/+1000/+5000。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "blank",
          "op": "eq",
          "value": 1
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 20
          }
        ]
      },
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "blank",
          "op": "eq",
          "value": 2
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 100
          }
        ]
      },
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "blank",
          "op": "eq",
          "value": 3
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 1000
          }
        ]
      },
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "blank",
          "op": "gte",
          "value": 4
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 5000
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "lucky_star",
    "name": "幸运星",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "lucky_block"
    ],
    "description": "幸运方块触发概率 x8。",
    "modifiers": [
      {
        "target": "luckyBlockChance",
        "mode": "multiply",
        "value": 8
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "lucky_coin",
    "name": "幸运币",
    "source": "高考梗",
    "rarity": "rare",
    "tags": [
      "lucky_block"
    ],
    "description": "幸运方块触发概率 x8。",
    "modifiers": [
      {
        "target": "luckyBlockChance",
        "mode": "multiply",
        "value": 8
      }
    ],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  }
] satisfies ArtifactConfig[];
