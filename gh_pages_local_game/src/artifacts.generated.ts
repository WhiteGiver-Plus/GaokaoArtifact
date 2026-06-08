import type { ArtifactConfig } from "./core/browser.js";

export const LOCAL_ARTIFACTS = [
  {
    "id": "big_pity",
    "name": "大保底",
    "rarity": "rare",
    "tags": [
      "高正确率",
      "压轴题"
    ],
    "description": "每场考试最后一题，正确率 +1000%。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_BEFORE_ROLL",
        "condition": {
          "kind": "lastQuestion"
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
    "rarity": "uncommon",
    "tags": [
      "高正确率",
      "节奏题"
    ],
    "description": "每场考试每第 5 道题，正确率 +200%。",
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
    "rarity": "rare",
    "tags": [
      "低正确率",
      "错题",
      "分数补偿"
    ],
    "description": "若本场考试所有题目全部答错，则考试原始分至少补到满分。",
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
    "rarity": "special",
    "tags": [
      "低正确率",
      "错题",
      "风险收益"
    ],
    "description": "本场考试每题正确率 -100%。",
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
    "rarity": "uncommon",
    "tags": [
      "连胜",
      "风险收益"
    ],
    "description": "若本题答对，则后续 2 题正确率 -100%。",
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
    "rarity": "uncommon",
    "tags": [
      "连败",
      "错题",
      "翻盘"
    ],
    "description": "若本题答错，则后续 2 题正确率 +100%。",
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
    "rarity": "rare",
    "tags": [
      "连胜",
      "倍率成长"
    ],
    "description": "每题得分倍率按当前连对数连续 x1.1。",
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
            "base": 1.1
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
    "rarity": "rare",
    "tags": [
      "连败",
      "错题",
      "倍率成长"
    ],
    "description": "按上一段连续答错数，使本题得分倍率连续 x1.2。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "effects": [
          {
            "op": "multiplyQuestionMultiplierByStreak",
            "streak": "wrong",
            "base": 1.2,
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
    "rarity": "rare",
    "tags": [
      "高正确率",
      "容错"
    ],
    "description": "每场考试第一次答错时，强制将本题结果改为正确。",
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
    "rarity": "uncommon",
    "tags": [
      "低正确率",
      "风险收益"
    ],
    "description": "每场考试第一次答对时，强制将本题结果改为错误。",
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
    "rarity": "rare",
    "tags": [
      "连胜",
      "总分成长"
    ],
    "description": "每连续答对五题时，当前总分 x1.1。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_END",
        "condition": {
          "kind": "streak",
          "streak": "correct",
          "op": "multipleOf",
          "value": 5
        },
        "effects": [
          {
            "op": "adjustCurrentTotalScore",
            "mode": "multiply",
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
    "rarity": "rare",
    "tags": [
      "连败",
      "错题",
      "考试倍率"
    ],
    "description": "每连续答错 5 题时，本场考试倍率 x1.2。",
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
    "rarity": "uncommon",
    "tags": [
      "遗物流",
      "抽取"
    ],
    "description": "每次抽取遗物时，备选数 +1。",
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "抽取",
      "消耗"
    ],
    "description": "随机获得 2 件遗物，然后销毁自身。",
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "抽取",
      "消耗"
    ],
    "description": "立刻进行一次 10 选 1 遗物抽取。",
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "销毁",
      "分数补偿"
    ],
    "description": "销毁最左侧的遗物(若为自身则不销毁)；下场考试初始分 +200。",
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
    "rarity": "uncommon",
    "tags": [
      "遗物流",
      "销毁",
      "分数补偿"
    ],
    "description": "失去这件遗物时，下场考试初始分 +100。",
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
    "rarity": "rare",
    "tags": [
      "体力",
      "倍率成长",
      "风险收益"
    ],
    "description": "体力下降 +10；每题得分倍率 +1。",
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
    "rarity": "common",
    "tags": [
      "体力",
      "续航"
    ],
    "description": "每场考试每第 5 道题结束时，体力 +20。",
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
    "rarity": "common",
    "tags": [
      "体力",
      "续航"
    ],
    "description": "每场考试开始时，体力 +50。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_START",
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
    "rarity": "rare",
    "tags": [
      "幸运方块",
      "随机爆发",
      "分数补偿"
    ],
    "description": "每题结算后有 0.3% 概率触发，本场考试最终得分增加 1000；每次触发后，本年度下次幸运方块增加值 x2，每年重置。",
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
    "rarity": "uncommon",
    "tags": [
      "高正确率"
    ],
    "description": "基础正确率 x135%。",
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
    "rarity": "rare",
    "tags": [
      "体力",
      "容错"
    ],
    "description": "你的体力下限被锁定为不可低于 30%。",
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
    "rarity": "special",
    "tags": [
      "高正确率",
      "体力",
      "风险收益"
    ],
    "description": "最终正确率 +1000%，每场考试开始时体力 +1000；每场考试结束时，考试最终得分 -1000。",
    "modifiers": [
      {
        "target": "finalAccuracy",
        "mode": "add",
        "value": 1000
      }
    ],
    "triggers": [
      {
        "timing": "EXAM_START",
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
            "op": "addExamPostBonus",
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
    "rarity": "common",
    "tags": [
      "高正确率"
    ],
    "description": "基础正确率 x150%。",
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
    "rarity": "uncommon",
    "tags": [
      "低正确率",
      "风险收益"
    ],
    "description": "基础正确率 x20%。",
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
    "rarity": "uncommon",
    "tags": [
      "高正确率",
      "体力"
    ],
    "description": "基础正确率 x140%，每题体力下降 +5。",
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
    "rarity": "uncommon",
    "tags": [
      "连胜",
      "节奏题",
      "倍率成长"
    ],
    "description": "若本题答对，则下一题得分倍率 +1.5。",
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
    "rarity": "common",
    "tags": [
      "高正确率",
      "前期题"
    ],
    "description": "每场考试前 2 题，正确率 +1000%。",
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
            "value": 10020
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
    "rarity": "uncommon",
    "tags": [
      "前期题",
      "倍率成长",
      "风险收益"
    ],
    "description": "每场考试前 8 题，得分倍率 -0.8；第 9 题起，得分倍率 +8。",
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
            "value": 8
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "联动"
    ],
    "description": "若右侧第一张遗物也会在当前时机触发，则额外触发它一次。",
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "联动",
      "豌豆"
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "联动",
      "豌豆"
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "联动",
      "豌豆"
    ],
    "description": "其他遗物触发时，20% 概率触发瓷砖萝卜右侧第一张遗物的同一时机效果。",
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
    "rarity": "special",
    "tags": [
      "遗物流",
      "联动",
      "豌豆"
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
    "rarity": "common",
    "tags": [
      "无效遗物"
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
    "rarity": "common",
    "tags": [
      "无效遗物"
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
    "rarity": "uncommon",
    "tags": [
      "分数形态",
      "考试倍率"
    ],
    "description": "每科考试结束时，若结算前考试原始分有相同数字，则本场考试倍率 +10。",
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
    "rarity": "rare",
    "tags": [
      "分数形态",
      "考试倍率"
    ],
    "description": "每科考试结束时，若结算前考试原始分包含至少 3 个相同数字，则本场考试倍率 +10。",
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
    "rarity": "rare",
    "tags": [
      "分数形态",
      "考试倍率"
    ],
    "description": "每科考试结束时，若结算前考试原始分为连续数字，则本场考试倍率 +20。",
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
    "name": "三次元差不多得了",
    "rarity": "uncommon",
    "tags": [
      "分数形态",
      "分数补偿"
    ],
    "description": "每科考试结束时，若结算前考试原始分为立方数，则本场考试最终得分增加 200。",
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
    "name": "二次元差不多得了",
    "rarity": "common",
    "tags": [
      "分数形态",
      "分数补偿"
    ],
    "description": "每科考试结束时，若结算前考试原始分为平方数，则本场考试最终得分增加 50。",
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
    "rarity": "rare",
    "tags": [
      "高正确率"
    ],
    "description": "最终正确率 x1.5。",
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
    "rarity": "rare",
    "tags": [
      "高正确率",
      "倍率成长"
    ],
    "description": "超出 100% 的当前正确率转换为题目得分倍率加成。",
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
    "rarity": "rare",
    "tags": [
      "高正确率",
      "倍率成长"
    ],
    "description": "若当前正确率超过 200%，本题得分倍率 x4。",
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
    "rarity": "uncommon",
    "tags": [
      "高正确率",
      "节奏题",
      "倍率成长"
    ],
    "description": "每场考试每第 3 道题，正确率 x1.5，得分倍率 x2。",
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
    "rarity": "rare",
    "tags": [
      "高正确率",
      "节奏题",
      "倍率成长"
    ],
    "description": "每场考试每第 10 道题，正确率 x2，得分倍率 x5。",
    "modifiers": [
      {
        "target": "finalAccuracy",
        "mode": "multiply",
        "value": 2,
        "condition": {
          "kind": "questionModulo",
          "modulo": 10,
          "equals": 0
        }
      }
    ],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "questionModulo",
          "modulo": 10,
          "equals": 0
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
    "rarity": "uncommon",
    "tags": [
      "体力",
      "倍率成长"
    ],
    "description": "体力高于 100% 时，题目得分倍率 x1.5。",
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
    "rarity": "uncommon",
    "tags": [
      "体力",
      "高正确率",
      "翻盘"
    ],
    "description": "体力低于 50% 时，最终正确率 x1.5。",
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
    "rarity": "rare",
    "tags": [
      "分数形态",
      "操作分数"
    ],
    "description": "考试结束时，交换考试原始分的任意两位数字。",
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
    "rarity": "rare",
    "tags": [
      "分数形态",
      "操作分数"
    ],
    "description": "考试结束时，将考试原始分个位改为 0-9 中任意数字。",
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
    "rarity": "rare",
    "tags": [
      "分数形态",
      "考试倍率"
    ],
    "description": "每科考试结束时，若结算前考试原始分为回文数，则本场考试倍率 +10。",
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
    "name": "好了好了,这下坏了",
    "rarity": "uncommon",
    "tags": [
      "胜败交替",
      "考试倍率"
    ],
    "description": "若前一题答对且本题答错，则本场考试倍率 x1.2。",
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
    "name": "坏了坏了,这下好了",
    "rarity": "uncommon",
    "tags": [
      "胜败交替",
      "考试倍率"
    ],
    "description": "若前一题答错且本题答对，则本场考试倍率 x1.2。",
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
    "rarity": "rare",
    "tags": [
      "压轴题",
      "倍率成长"
    ],
    "description": "每场考试最后一题，该题得分倍率 x10。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "lastQuestion"
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
    "name": "心外无物",
    "rarity": "special",
    "tags": [
      "遗物流",
      "销毁",
      "总分成长"
    ],
    "description": "获得时，弃掉其余所有遗物；每因此弃掉 1 件，当前总分 x1.4。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "ARTIFACT_GAINED",
        "effects": [
          {
            "op": "destroyAllOtherAndMultiplyCurrentTotal",
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
    "rarity": "rare",
    "tags": [
      "遗物流",
      "容量",
      "总分成长"
    ],
    "description": "遗物上限永久 -1；获得时，当前总分 x1.5。",
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
            "op": "adjustCurrentTotalScore",
            "mode": "multiply",
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
    "rarity": "common",
    "tags": [
      "无效遗物"
    ],
    "description": "仅仅是这张牌很小丑。无任何效果。",
    "modifiers": [],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "hundred_day_oath",
    "name": "暂时不能给你明确的答复",
    "rarity": "common",
    "tags": [
      "无效遗物"
    ],
    "description": "暂时不能给你明确的效果。",
    "modifiers": [],
    "triggers": [],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "nonsense_master",
    "name": "废话文学领域大神",
    "rarity": "rare",
    "tags": [
      "无效遗物"
    ],
    "description": "每科考试结束时，按无效遗物数量使本场考试最终得分增加：1/2/3/4+ 件对应 200/2000/50000/500000。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "无效遗物",
          "op": "eq",
          "value": 1
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 200
          }
        ]
      },
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "无效遗物",
          "op": "eq",
          "value": 2
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 2000
          }
        ]
      },
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "无效遗物",
          "op": "eq",
          "value": 3
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 50000
          }
        ]
      },
      {
        "timing": "EXAM_END",
        "condition": {
          "kind": "ownedTagCount",
          "tag": "无效遗物",
          "op": "gte",
          "value": 4
        },
        "effects": [
          {
            "op": "addExamPostBonus",
            "value": 500000
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
    "rarity": "rare",
    "tags": [
      "幸运方块"
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
    "name": "这个机遇不可特意去求!",
    "rarity": "rare",
    "tags": [
      "幸运方块"
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
    "id": "process_points",
    "name": "过程分",
    "rarity": "common",
    "tags": [
      "错题",
      "分数补偿",
      "低正确率"
    ],
    "description": "答错的题目也能获得 1 分，该分数受本题得分倍率加成。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_SCORE",
        "condition": {
          "kind": "result",
          "value": "wrong"
        },
        "effects": [
          {
            "op": "addQuestionBaseScore",
            "value": 1
          }
        ]
      }
    ],
    "maxCopies": 1,
    "draftable": true
  },
  {
    "id": "chain_is_method",
    "name": "能连起来就是招",
    "rarity": "rare",
    "tags": [
      "遗物流",
      "联动",
      "分数补偿"
    ],
    "description": "每题结算时，考试最终分数增加 2 的本题此前触发遗物次数次方分，上限 128。",
    "modifiers": [],
    "triggers": [
      {
        "timing": "QUESTION_END",
        "effects": [
          {
            "op": "addExamPostBonusByQuestionTriggerCount",
            "base": 2,
            "cap": 128
          }
        ],
        "phase": 5901,
        "order": 900
      }
    ],
    "maxCopies": 1,
    "draftable": true
  }
] satisfies ArtifactConfig[];
