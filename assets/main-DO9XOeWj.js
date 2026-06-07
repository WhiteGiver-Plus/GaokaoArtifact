var He=Object.defineProperty;var We=(e,t,r)=>t in e?He(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var pe=(e,t,r)=>We(e,typeof t!="symbol"?t+"":t,r);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function r(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=r(n);fetch(n.href,s)}})();const X=[{id:"big_pity",name:"大保底",rarity:"rare",tags:["高正确率","压轴题"],description:"每场考试最后一题，正确率 +1000%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",condition:{kind:"lastQuestion"},effects:[{op:"addQuestionAccuracy",value:1e3}]}],maxCopies:1,draftable:!0},{id:"small_pity",name:"小保底",rarity:"uncommon",tags:["高正确率","节奏题"],description:"每场考试每 5 道题，正确率 +200%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",condition:{kind:"questionModulo",modulo:5,equals:0},effects:[{op:"addQuestionAccuracy",value:200}]}],maxCopies:1,draftable:!0},{id:"empty_city",name:"空城",rarity:"rare",tags:["低正确率","错题","分数补偿"],description:"若本场考试所有题目全部答错，则考试原始分至少补到满分。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"examAllWrong"},effects:[{op:"setExamScoreToFull"}]}],maxCopies:1,draftable:!0},{id:"self_sacrifice",name:"自刎归天",rarity:"special",tags:["低正确率","错题","风险收益"],description:"本场考试每题正确率 -100%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",effects:[{op:"addQuestionAccuracy",value:-100}]}],maxCopies:1,draftable:!0},{id:"proud_winner",name:"胜兵必骄，骄兵必败",rarity:"uncommon",tags:["连胜","风险收益"],description:"若本题答对，则后续 2 题正确率 -100%。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"correct"},effects:[{op:"queueQuestionModifier",target:"accuracy",value:-100,duration:2}]}],maxCopies:1,draftable:!0},{id:"sad_loser",name:"败兵必哀，哀兵必胜",rarity:"uncommon",tags:["连败","错题","翻盘"],description:"若本题答错，则后续 2 题正确率 +100%。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"wrong"},effects:[{op:"queueQuestionModifier",target:"accuracy",value:100,duration:2}]}],maxCopies:1,draftable:!0},{id:"rageblade",name:"羊刀",rarity:"rare",tags:["连胜","倍率成长"],description:"每题得分倍率按当前连对数连续 x1.1。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"result",value:"correct"},effects:[{op:"multiplyQuestionMultiplierByStreak",streak:"correct",base:1.1}]}],maxCopies:1,draftable:!0},{id:"doctor_scaling",name:"医死的人越多，医术越高明",rarity:"rare",tags:["连败","错题","倍率成长"],description:"按上一段连续答错数，使本题得分倍率连续 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",effects:[{op:"multiplyQuestionMultiplierByStreak",streak:"wrong",base:1.2,usePrevious:!0}]}],maxCopies:1,draftable:!0},{id:"guardian_angel",name:"复活甲",rarity:"rare",tags:["高正确率","容错"],description:"每场考试第一次答错时，强制将本题结果改为正确。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"wrong"},limit:{scope:"exam",count:1},effects:[{op:"forceResult",result:"correct"}]}],maxCopies:1,draftable:!0},{id:"right_then_wrong",name:"对的对的，哦不对不对",rarity:"uncommon",tags:["低正确率","风险收益"],description:"每场考试第一次答对时，强制将本题结果改为错误。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"correct"},limit:{scope:"exam",count:1},effects:[{op:"forceResult",result:"wrong"}]}],maxCopies:1,draftable:!0},{id:"final_ritual",name:"至终的仪式",rarity:"rare",tags:["连胜","总分成长"],description:"每连续答对五题时，当前总分 x1.1。",modifiers:[],triggers:[{timing:"QUESTION_END",condition:{kind:"streak",streak:"correct",op:"multipleOf",value:5},effects:[{op:"adjustCurrentTotalScore",mode:"multiply",value:1.1}]}],maxCopies:1,draftable:!0},{id:"identity_v",name:"第五人格",rarity:"rare",tags:["连败","错题","考试倍率"],description:"每连续答错 5 题时，本场考试倍率 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"streak",streak:"wrong",op:"multipleOf",value:5},effects:[{op:"multiplyExamMultiplier",value:1.2}]}],maxCopies:1,draftable:!0},{id:"multiple_choice",name:"多选题",rarity:"uncommon",tags:["遗物流","抽取"],description:"每次抽取遗物时，备选数 +1。",modifiers:[{target:"draftChoicesBonus",mode:"add",value:1}],triggers:[],maxCopies:1,draftable:!0},{id:"create_from_nothing",name:"无中生有",rarity:"rare",tags:["遗物流","抽取","消耗"],description:"随机获得 2 件遗物，然后销毁自身。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"gainRandomArtifacts",count:2},{op:"destroySelf"}]}],maxCopies:1,draftable:!0},{id:"ten_pull_gift",name:"上线立送10连抽",rarity:"rare",tags:["遗物流","抽取","消耗"],description:"立刻进行一次 10 选 1 遗物抽取。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"offerDraft",choices:10,picks:1}]}],maxCopies:1,draftable:!0},{id:"change_everything",name:"我们可以改变一切",rarity:"rare",tags:["遗物流","销毁","分数补偿"],description:"销毁最左侧其他遗物；下场考试初始分 +200。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"destroyOther",select:"leftmost"},{op:"addNextExamScore",value:200}]}],maxCopies:1,draftable:!0},{id:"silver_lion",name:"白银狮子",rarity:"uncommon",tags:["遗物流","销毁","分数补偿"],description:"失去这件遗物时，下场考试初始分 +100。",modifiers:[],triggers:[{timing:"ARTIFACT_LOST",condition:{kind:"lostArtifactIsSelf"},effects:[{op:"addNextExamScore",value:100}]}],maxCopies:1,draftable:!0},{id:"glass_cannon",name:"玻璃大炮",rarity:"rare",tags:["体力","倍率成长","风险收益"],description:"体力下降 +10；每题得分倍率 +1。",modifiers:[{target:"staminaDecay",mode:"add",value:10},{target:"questionMultiplier",mode:"add",value:1}],triggers:[],maxCopies:1,draftable:!0},{id:"regeneration_potion",name:"再生药水",rarity:"common",tags:["体力","续航"],description:"每场考试每 5 道题结束时，体力 +20。",modifiers:[],triggers:[{timing:"QUESTION_END",condition:{kind:"questionModulo",modulo:5,equals:0},effects:[{op:"addStat",stat:"stamina",value:20}]}],maxCopies:1,draftable:!0},{id:"stamina_potion",name:"体力药水",rarity:"common",tags:["体力","续航"],description:"每场考试开始时，体力 +50。",modifiers:[],triggers:[{timing:"EXAM_START",effects:[{op:"addStat",stat:"stamina",value:50}]}],maxCopies:1,draftable:!0},{id:"lucky_block",name:"幸运方块",rarity:"rare",tags:["幸运方块","随机爆发","分数补偿"],description:"每题结算后有 0.2% 概率触发，本场考试最终得分增加 1000；每次触发后，下次幸运方块增加值 x2。",modifiers:[],triggers:[{timing:"QUESTION_END",handler:"luckyBlock",params:{chance:.002,value:1e3}}],maxCopies:1,draftable:!0},{id:"strong_luck",name:"强运",rarity:"uncommon",tags:["高正确率"],description:"基础正确率 x125%。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:1.25}],triggers:[],maxCopies:1,draftable:!0},{id:"death_blade",name:"名刀·司命",rarity:"rare",tags:["体力","容错"],description:"你的体力下限被锁定为不可低于 10%。",modifiers:[{target:"staminaFloor",mode:"min",value:10}],triggers:[],maxCopies:1,draftable:!0},{id:"final_reincarnation",name:"轮回之终末",rarity:"special",tags:["高正确率","体力","风险收益"],description:"最终正确率 +1000%，每场考试开始时体力 +1000；每场考试结束时，考试原始分 -1000。",modifiers:[{target:"finalAccuracy",mode:"add",value:1e3}],triggers:[{timing:"EXAM_START",effects:[{op:"addStat",stat:"stamina",value:1e3}]},{timing:"EXAM_END",effects:[{op:"addExamScore",value:-1e3}]}],maxCopies:1,draftable:!0},{id:"eureka",name:"尤里卡",rarity:"common",tags:["高正确率"],description:"基础正确率 x120%。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:1.2}],triggers:[],maxCopies:1,draftable:!0},{id:"doubao",name:"豆包",rarity:"uncommon",tags:["低正确率","风险收益"],description:"基础正确率 x20%。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:.2}],triggers:[],maxCopies:1,draftable:!0},{id:"deep_thinking",name:"深度思考中",rarity:"uncommon",tags:["高正确率","体力"],description:"基础正确率 x140%，每题体力下降 +5。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:1.4},{target:"staminaDecay",mode:"add",value:5}],triggers:[],maxCopies:1,draftable:!0},{id:"linked_seats",name:"连坐制",rarity:"uncommon",tags:["连胜","节奏题","倍率成长"],description:"若本题答对，则下一题得分倍率 +1.5。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"correct"},effects:[{op:"queueQuestionModifier",target:"multiplier",value:1.5,duration:1}]}],maxCopies:1,draftable:!0},{id:"astrology",name:"观星",rarity:"common",tags:["高正确率","前期题"],description:"每场考试前 2 题，正确率 +100%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",condition:{kind:"questionIndex",op:"lte",value:2},effects:[{op:"addQuestionAccuracy",value:100}]}],maxCopies:1,draftable:!0},{id:"sinking_malphite",name:"沉底石头人",rarity:"uncommon",tags:["前期题","倍率成长","风险收益"],description:"每场考试前 8 题，得分倍率 -0.8；第 9 题起，得分倍率 +0.8。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"questionIndex",op:"lte",value:8},effects:[{op:"addQuestionMultiplier",value:-.8}]},{timing:"QUESTION_SCORE",condition:{kind:"questionIndex",op:"gt",value:8},effects:[{op:"addQuestionMultiplier",value:.8}]}],maxCopies:1,draftable:!0},{id:"imitator",name:"模仿者",rarity:"rare",tags:["遗物流","联动"],description:"模仿右侧第一张遗物。",modifiers:[],triggers:[{timing:"EXAM_START",handler:"mimicRight"},{timing:"QUESTION_BEFORE_ROLL",handler:"mimicRight"},{timing:"QUESTION_AFTER_ROLL",handler:"mimicRight"},{timing:"QUESTION_SCORE",handler:"mimicRight"},{timing:"QUESTION_END",handler:"mimicRight"},{timing:"EXAM_END",handler:"mimicRight"},{timing:"RUN_END",handler:"mimicRight"}],maxCopies:1,draftable:!0},{id:"repeater",name:"双发射手",rarity:"rare",tags:["遗物流","联动","豌豆"],description:"每次其他遗物触发时，20% 概率多触发一次。",modifiers:[],triggers:[{timing:"OTHER_ARTIFACT_TRIGGERED",handler:"repeatOtherTrigger",params:{chance:.2,times:1}}],maxCopies:1,draftable:!0},{id:"gatling_peashooter",name:"机枪射手",rarity:"rare",tags:["遗物流","联动","豌豆"],description:"每次其他遗物触发时，20% 概率多触发三次。",modifiers:[],triggers:[{timing:"OTHER_ARTIFACT_TRIGGERED",handler:"repeatOtherTrigger",params:{chance:.2,times:3}}],maxCopies:1,draftable:!0},{id:"tile_turnip",name:"瓷砖萝卜",rarity:"rare",tags:["遗物流","联动","豌豆"],description:"每次其他遗物触发时，20% 概率触发其右侧的第一个遗物。",modifiers:[],triggers:[{timing:"OTHER_ARTIFACT_TRIGGERED",handler:"triggerRightOnOtherTrigger",params:{chance:.2}}],maxCopies:1,draftable:!0},{id:"electric_gatling_pea",name:"电能机枪豌豆",rarity:"special",tags:["遗物流","联动","豌豆"],description:"若你有机枪射手，机枪射手效果翻倍。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"shanghai_essay",name:"上海卷高考作文",rarity:"common",tags:["无效遗物"],description:"有人说，这个遗物没有任何效果，也有人认为不尽如此，你怎么看？无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"reasonable_reason",name:"说的道理",rarity:"common",tags:["无效遗物"],description:"说的道理。无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"happy_clown",name:"欢乐小丑",rarity:"uncommon",tags:["分数形态","考试倍率"],description:"每科考试结束时，若结算前考试原始分包含至少 2 个相同数字，则本场考试倍率 +2。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreRepeatedDigit",count:2},effects:[{op:"addExamMultiplier",value:2}]}],maxCopies:1,draftable:!0},{id:"slippery_clown",name:"滑稽小丑",rarity:"rare",tags:["分数形态","考试倍率"],description:"每科考试结束时，若结算前考试原始分包含至少 3 个相同数字，则本场考试倍率 +10。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreRepeatedDigit",count:3},effects:[{op:"addExamMultiplier",value:10}]}],maxCopies:1,draftable:!0},{id:"crazy_clown",name:"狂小丑",rarity:"rare",tags:["分数形态","考试倍率"],description:"每科考试结束时，若结算前考试原始分为连续数字，则本场考试倍率 +20。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreStraight"},effects:[{op:"addExamMultiplier",value:20}]}],maxCopies:1,draftable:!0},{id:"tesseract",name:"宇宙立方",rarity:"uncommon",tags:["分数形态","分数补偿"],description:"每科考试结束时，若结算前考试原始分为立方数，则本场考试最终得分增加 200。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreCube"},effects:[{op:"addExamPostBonus",value:200}]}],maxCopies:1,draftable:!0},{id:"weeb_square",name:"唉，二次元",rarity:"common",tags:["分数形态","分数补偿"],description:"每科考试结束时，若结算前考试原始分为平方数，则本场考试最终得分增加 50。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreSquare"},effects:[{op:"addExamPostBonus",value:50}]}],maxCopies:1,draftable:!0},{id:"prediction",name:"押题",rarity:"rare",tags:["高正确率"],description:"最终正确率 x1.5。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:1.5}],triggers:[],maxCopies:1,draftable:!0},{id:"holy_water_collector",name:"圣水采集器",rarity:"rare",tags:["高正确率","倍率成长"],description:"超出 100% 的当前正确率转换为题目得分倍率加成。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"accuracy",op:"gt",value:100},effects:[{op:"convertAccuracyOverflowToQuestionMultiplier"}]}],maxCopies:1,draftable:!0},{id:"transcendent",name:"超凡入圣",rarity:"rare",tags:["高正确率","倍率成长"],description:"若当前正确率超过 200%，本题得分倍率 x4。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"accuracy",op:"gt",value:200},effects:[{op:"multiplyQuestionMultiplier",value:4}]}],maxCopies:1,draftable:!0},{id:"happy_flower",name:"快乐小花",rarity:"uncommon",tags:["高正确率","节奏题","倍率成长"],description:"每场考试每 3 道题，正确率 x1.5，得分倍率 x2。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:1.5,condition:{kind:"questionModulo",modulo:3,equals:0}}],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"questionModulo",modulo:3,equals:0},effects:[{op:"multiplyQuestionMultiplier",value:2}]}],maxCopies:1,draftable:!0},{id:"pen_nib",name:"钢笔尖",rarity:"rare",tags:["高正确率","节奏题","倍率成长"],description:"每场考试每 10 道题，正确率 x2，得分倍率 x5。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:2,condition:{kind:"questionModulo",modulo:10,equals:0}}],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"questionModulo",modulo:10,equals:0},effects:[{op:"multiplyQuestionMultiplier",value:5}]}],maxCopies:1,draftable:!0},{id:"energetic",name:"精力充沛",rarity:"uncommon",tags:["体力","倍率成长"],description:"体力高于 100% 时，题目得分倍率 x1.5。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"stamina",op:"gt",value:100},effects:[{op:"multiplyQuestionMultiplier",value:1.5}]}],maxCopies:1,draftable:!0},{id:"red_skull",name:"红骷髅",rarity:"uncommon",tags:["体力","高正确率","翻盘"],description:"体力低于 50% 时，最终正确率 x1.5。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:1.5,condition:{kind:"stamina",op:"lt",value:50}}],triggers:[],maxCopies:1,draftable:!0},{id:"math_lover",name:"数学爱好者",rarity:"rare",tags:["分数形态","操作分数"],description:"考试结束时，交换考试原始分的任意两位数字。",modifiers:[],triggers:[{timing:"EXAM_END",phase:6e3,order:100,effects:[{op:"maximizeDigitSwap"}]}],maxCopies:1,draftable:!0},{id:"c_language_master",name:"C语言大佬",rarity:"rare",tags:["分数形态","操作分数"],description:"考试结束时，将考试原始分个位改为 0-9 中任意数字。",modifiers:[],triggers:[{timing:"EXAM_END",phase:6e3,order:200,effects:[{op:"maximizeOnesDigit"}]}],maxCopies:1,draftable:!0},{id:"palindrome_score",name:"回文数",rarity:"rare",tags:["分数形态","考试倍率"],description:"每科考试结束时，若结算前考试原始分为回文数，则本场考试倍率 +10。",modifiers:[],triggers:[{timing:"EXAM_END",phase:6200,condition:{kind:"scorePalindrome"},effects:[{op:"addExamMultiplier",value:10}]}],maxCopies:1,draftable:!0},{id:"all_for_nothing",name:"前功尽弃",rarity:"uncommon",tags:["胜败交替","考试倍率"],description:"若前一题答对且本题答错，则本场考试倍率 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"all",conditions:[{kind:"lastResult",value:"correct"},{kind:"result",value:"wrong"}]},effects:[{op:"multiplyExamMultiplier",value:1.2}]}],maxCopies:1,draftable:!0},{id:"learn_from_mistakes",name:"知错能改",rarity:"uncommon",tags:["胜败交替","考试倍率"],description:"若前一题答错且本题答对，则本场考试倍率 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"all",conditions:[{kind:"lastResult",value:"wrong"},{kind:"result",value:"correct"}]},effects:[{op:"multiplyExamMultiplier",value:1.2}]}],maxCopies:1,draftable:!0},{id:"final_question_warrior",name:"压轴题战神",rarity:"rare",tags:["压轴题","倍率成长"],description:"每场考试最后一题，该题得分倍率 x10。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"lastQuestion"},effects:[{op:"multiplyQuestionMultiplier",value:10}]}],maxCopies:1,draftable:!0},{id:"no_external_things",name:"心外无物",rarity:"special",tags:["遗物流","销毁","总分成长"],description:"获得时，弃掉其余所有遗物；每因此弃掉 1 件，当前总分 x1.4。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"destroyAllOtherAndMultiplyCurrentTotal",factorPerDestroyed:1.4}]}],maxCopies:1,draftable:!0},{id:"travel_light",name:"轻装上阵",rarity:"rare",tags:["遗物流","容量","总分成长"],description:"遗物上限永久 -1；获得时，当前总分 x1.5。",modifiers:[{target:"artifactLimit",mode:"add",value:-1}],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"adjustCurrentTotalScore",mode:"multiply",value:1.5}]}],maxCopies:1,draftable:!0},{id:"tiny_joker",name:"小丑牌",rarity:"common",tags:["无效遗物"],description:"仅仅是这张牌很小丑。无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"hundred_day_oath",name:"百日誓师",rarity:"common",tags:["无效遗物"],description:"无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"nonsense_master",name:"废话文学大师",rarity:"rare",tags:["无效遗物","分数补偿"],description:"每科考试结束时，按无效遗物数量使本场考试最终得分增加：1/2/3/4+ 件对应 20/100/1000/5000。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"无效遗物",op:"eq",value:1},effects:[{op:"addExamPostBonus",value:20}]},{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"无效遗物",op:"eq",value:2},effects:[{op:"addExamPostBonus",value:100}]},{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"无效遗物",op:"eq",value:3},effects:[{op:"addExamPostBonus",value:1e3}]},{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"无效遗物",op:"gte",value:4},effects:[{op:"addExamPostBonus",value:5e3}]}],maxCopies:1,draftable:!0},{id:"lucky_star",name:"幸运星",rarity:"rare",tags:["幸运方块"],description:"幸运方块触发概率 x8。",modifiers:[{target:"luckyBlockChance",mode:"multiply",value:8}],triggers:[],maxCopies:1,draftable:!0},{id:"lucky_coin",name:"幸运币",rarity:"rare",tags:["幸运方块"],description:"幸运方块触发概率 x8。",modifiers:[{target:"luckyBlockChance",mode:"multiply",value:8}],triggers:[],maxCopies:1,draftable:!0},{id:"process_points",name:"过程分",rarity:"common",tags:["错题","分数补偿","低正确率"],description:"答错的题目也能获得 1 分，该分数受本题得分倍率加成。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"result",value:"wrong"},effects:[{op:"addQuestionBaseScore",value:1}]}],maxCopies:1,draftable:!0},{id:"chain_is_method",name:"能连起来就是招",rarity:"rare",tags:["遗物流","联动","分数补偿"],description:"每题结算时，考试最终分数增加 2 的本题触发遗物次数次方分，上限 128。",modifiers:[],triggers:[{timing:"QUESTION_END",effects:[{op:"addExamPostBonusByQuestionTriggerCount",base:2,cap:128}],phase:5901,order:900}],maxCopies:1,draftable:!0}],Z=["chinese","math","english"],H=["physics","chemistry","biology","politics","history","geography"],v={chinese:"语文",math:"数学",english:"英语",physics:"物理",chemistry:"化学",biology:"生物",politics:"政治",history:"历史",geography:"地理"},P={chinese:{questionCount:15,pointsPerQuestion:10,fullScore:150},math:{questionCount:15,pointsPerQuestion:10,fullScore:150},english:{questionCount:15,pointsPerQuestion:10,fullScore:150},physics:{questionCount:10,pointsPerQuestion:10,fullScore:100},chemistry:{questionCount:10,pointsPerQuestion:10,fullScore:100},biology:{questionCount:10,pointsPerQuestion:10,fullScore:100},politics:{questionCount:10,pointsPerQuestion:10,fullScore:100},history:{questionCount:10,pointsPerQuestion:10,fullScore:100},geography:{questionCount:10,pointsPerQuestion:10,fullScore:100}};class Ye{constructor(t){pe(this,"state");this.state=ze(t)()}next(){let t=this.state+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}int(t){return t<=0?0:Math.floor(this.next()*t)}pick(t){if(t.length===0)throw new Error("Cannot pick from an empty array.");return t[this.int(t.length)]}shuffle(t){const r=[...t];for(let i=r.length-1;i>0;i-=1){const n=this.int(i+1);[r[i],r[n]]=[r[n],r[i]]}return r}}function ze(e){let t=1779033703^e.length;for(let r=0;r<e.length;r+=1)t=Math.imul(t^e.charCodeAt(r),3432918353),t=t<<13|t>>>19;return()=>(t=Math.imul(t^t>>>16,2246822507),t=Math.imul(t^t>>>13,3266489909),t^=t>>>16,t>>>0)}function Ve(){return`${Date.now()}-${Math.random().toString(36).slice(2)}`}function Je(e,t,r){return{seed:e,rng:new Ye(e),artifactConfigs:r,artifactById:new Map(r.map(i=>[i.id,i])),artifacts:[],log:[],exams:[],stats:{baseAccuracy:50,baseStamina:100,stamina:100,staminaDecay:5,staminaFloor:0,artifactLimit:9,draftChoicesBonus:0,nextDraftChoicesBonus:0,questionMultiplierBase:1,currentTotalAdjustment:0,luckyBlockValueMultiplier:1,pendingNextExamScore:0,preventDiscardCharges:0},triggerCounts:new Map,instanceSeq:0,currentEventCount:0,subjects:t,nextExamQuestionModifiers:[]}}function Se(e,t){return e.instanceSeq+=1,{instanceId:`${t}#${e.instanceSeq}`,artifactId:t}}function w(e,t){var r;e.log.push(t),(r=e.onLog)==null||r.call(e,t)}function Ke(e,t,r){return Math.min(r,Math.max(t,e))}function I(e,t,r){switch(t){case"eq":return e===r;case"neq":return e!==r;case"lt":return e<r;case"lte":return e<=r;case"gt":return e>r;case"gte":return e>=r}}function j(e){return Math.round(e)}function Ze(e,t){const r=Math.abs(j(e)).toString().split("");return r.some(i=>r.filter(n=>n===i).length>=t)}function et(e){const t=Math.abs(j(e)).toString();return"0123456789".includes(t)||"9876543210".includes(t)}function tt(e){const t=j(e);if(t<0)return!1;const r=Math.floor(Math.sqrt(t));return r*r===t}function rt(e){const t=j(e),r=Math.round(Math.cbrt(t));return r*r*r===t}function it(e){const t=Math.abs(j(e)).toString();return t.length>1&&t===t.split("").reverse().join("")}function Q(e,t,r){var n;if(!e||e.kind==="always")return!0;const i=r.exam;switch(e.kind){case"subject":return!!(i&&e.subjects.includes(i.subject));case"questionIndex":return!!(i&&I(i.questionIndex,e.op,e.value));case"questionIndexIn":return!!(i&&e.values.includes(i.questionIndex));case"lastQuestion":return!!(i&&i.questionIndex===i.questionCount);case"questionModulo":return!!(i&&i.questionIndex%e.modulo===e.equals);case"result":return(i==null?void 0:i.currentResult)===e.value;case"lastResult":return(i==null?void 0:i.lastResult)===e.value;case"streak":return at(e,i);case"wrongCount":return!!(i&&I(i.wrongCount,e.op,e.value));case"score":return!!(i&&I(Math.round(i.rawScore),e.op,e.value));case"stamina":return I(t.stats.stamina,e.op,e.value);case"accuracy":return!!(i&&I(i.currentFinalAccuracy,e.op,e.value));case"examAllWrong":return!!(i&&i.wrongCount===i.questionCount);case"scoreRepeatedDigit":return!!(i&&Ze(i.rawScore,e.count));case"scoreStraight":return!!(i&&et(i.rawScore));case"scorePalindrome":return!!(i&&it(i.rawScore));case"scoreSquare":return!!(i&&tt(i.rawScore));case"scoreCube":return!!(i&&rt(i.rawScore));case"ownedArtifact":return t.artifacts.some(s=>s.artifactId===e.id);case"ownedTagCount":return I(nt(t,e.tag),e.op,e.value);case"lostArtifactIsSelf":return((n=r.lostArtifact)==null?void 0:n.instanceId)===r.owner.instanceId;case"randomChance":return t.rng.next()<e.chance;case"all":return e.conditions.every(s=>Q(s,t,r));case"any":return e.conditions.some(s=>Q(s,t,r));case"not":return!Q(e.condition,t,r)}}function at(e,t){if(!t)return!1;const r=e.streak==="correct"?t.correctStreak:t.wrongStreak;return e.op==="multipleOf"?r>0&&r%e.value===0:I(r,e.op,e.value)}function nt(e,t){return e.artifacts.filter(r=>{const i=e.artifactById.get(r.artifactId);return i==null?void 0:i.tags.includes(t)}).length}async function st(e,t,r){const i=r.exam;switch(e.op){case"addStat":ot(e.stat,e.value,t);return;case"setStatMin":t.stats[e.stat]=Math.max(t.stats[e.stat],e.value);return;case"addQuestionAccuracy":y(e.op,i).currentAccuracyBonus+=e.value;return;case"addQuestionMultiplier":y(e.op,i).questionMultiplierAdds.push(e.value);return;case"multiplyQuestionMultiplier":y(e.op,i).questionMultiplierMuls.push(e.value);return;case"multiplyQuestionMultiplierByStreak":ct(e,y(e.op,i));return;case"addQuestionBaseScore":y(e.op,i).currentQuestionBaseScore+=e.value;return;case"addQuestionScore":y(e.op,i).currentQuestionFlatScore+=e.value;return;case"addExamPostBonusByQuestionTriggerCount":{const n=y(e.op,i),s=Math.min(e.cap,Math.pow(e.base,n.currentQuestionTriggerCount));n.examPostBonus+=s;return}case"convertAccuracyOverflowToQuestionMultiplier":{const n=y(e.op,i);n.questionMultiplierAdds.push(Math.max(0,n.currentFinalAccuracy-100)/100);return}case"addExamMultiplier":y(e.op,i).examMultiplierAdds.push(e.value);return;case"multiplyExamMultiplier":y(e.op,i).examMultiplierMuls.push(e.value);return;case"adjustCurrentTotalScore":ge(t,i,e.mode,e.value);return;case"addExamScore":y(e.op,i).rawScore+=e.value;return;case"addExamPostBonus":y(e.op,i).examPostBonus+=e.value;return;case"setExamScoreToFull":{const n=y(e.op,i);n.rawScore=Math.max(n.rawScore,n.fullScore);return}case"addNextExamScore":t.stats.pendingNextExamScore+=e.value;return;case"forceResult":y(e.op,i).forcedResult=e.result,y(e.op,i).currentResult=e.result;return;case"queueQuestionModifier":if(e.scope==="nextExam"){t.nextExamQuestionModifiers.push({target:e.target,value:e.value,mode:e.mode??"add",remaining:e.duration,source:r.owner.artifactId});return}y(e.op,i).questionModifiers.push({target:e.target,value:e.value,mode:e.mode??"add",remaining:e.duration,source:r.owner.artifactId});return;case"gainRandomArtifacts":await r.gainRandomArtifacts(e.count);return;case"offerDraft":await r.offerDraft(e.choices,e.picks);return;case"destroySelf":await r.destroySelf();return;case"destroyOther":await r.destroyOther(e.select);return;case"destroyAllOtherAndMultiplyCurrentTotal":{const n=await r.destroyAllOther();for(let s=0;s<n;s+=1)ge(t,i,"multiply",e.factorPerDestroyed);return}case"maximizeOnesDigit":{const n=y(e.op,i),s=await r.chooseOnesDigit(n.rawScore,n);lt(n,s);return}case"maximizeDigitSwap":{const n=y(e.op,i),s=await r.chooseDigitSwap(n.rawScore,n);dt(n,s);return}case"preventNextDiscard":t.stats.preventDiscardCharges+=1;return;case"log":w(t,e.message);return}}function ot(e,t,r){r.stats[e]+=t,e==="stamina"&&r.stats.stamina<r.stats.staminaFloor&&(r.stats.stamina=r.stats.staminaFloor)}function ct(e,t){const r=e.streak==="correct"?t.correctStreak:t.wrongStreak,i=e.usePrevious?t.previousWrongStreak:r;i>0&&t.questionMultiplierMuls.push(Math.pow(e.base,i))}function y(e,t){if(!t)throw new Error(`Effect ${e} requires an exam context.`);return t}function ge(e,t,r,i){if(r==="add"){e.stats.currentTotalAdjustment+=i;return}const n=ut(e,t);e.stats.currentTotalAdjustment+=n*(i-1)}function ut(e,t){return e.exams.reduce((r,i)=>r+i.score,0)+((t==null?void 0:t.rawScore)??0)+e.stats.currentTotalAdjustment}function lt(e,t){const r=Math.round(e.rawScore),i=typeof t=="number"&&Number.isInteger(t)?Math.min(9,Math.max(0,t)):9;e.rawScore=r-Math.abs(r)%10+i}function dt(e,t){const r=Math.round(e.rawScore),i=r<0?-1:1,n=Math.abs(r).toString().split("");if(t){const[o,c]=t;o>=0&&c>=0&&o<n.length&&c<n.length&&o!==c&&([n[o],n[c]]=[n[c],n[o]],e.rawScore=i*Number(n.join("")));return}let s=Math.abs(r);for(let o=0;o<n.length;o+=1)for(let c=o+1;c<n.length;c+=1){const u=[...n];[u[o],u[c]]=[u[c],u[o]],s=Math.max(s,Number(u.join("")))}e.rawScore=i*s}const x={ARTIFACT_GAINED:3e3,ARTIFACT_LOST:3100,EXAM_START:4100,QUESTION_BEFORE_ACCURACY:5100,QUESTION_RESULT_MODIFY:5300,QUESTION_SCORE_MODIFY:5500,QUESTION_END:5900,EXAM_PATTERN_TRIGGER:6200,RUN_TOTAL_MULTIPLIER:8100,OTHER_ARTIFACT_TRIGGERED:9e3};function Ee(e){return{RUN_START:1e3,DRAFT_OFFER:2100,ARTIFACT_GAINED:x.ARTIFACT_GAINED,ARTIFACT_LOST:x.ARTIFACT_LOST,EXAM_START:x.EXAM_START,QUESTION_BEFORE_ROLL:x.QUESTION_BEFORE_ACCURACY,QUESTION_AFTER_ROLL:x.QUESTION_RESULT_MODIFY,QUESTION_SCORE:x.QUESTION_SCORE_MODIFY,QUESTION_END:x.QUESTION_END,EXAM_END:x.EXAM_PATTERN_TRIGGER,RUN_END:x.RUN_TOTAL_MULTIPLIER,OTHER_ARTIFACT_TRIGGERED:x.OTHER_ARTIFACT_TRIGGERED}[e]}function $e(e=[]){return e.some(t=>gt(t))?200:e.some(t=>pt(t))?100:e.some(t=>t.op==="setStatMin"||t.op==="setExamScoreToFull")?300:500}function pt(e){return["addStat","addQuestionAccuracy","addQuestionMultiplier","addQuestionBaseScore","addQuestionScore","addExamPostBonusByQuestionTriggerCount","convertAccuracyOverflowToQuestionMultiplier","addExamMultiplier","addExamScore","addExamPostBonus","addNextExamScore"].includes(e.op)||e.op==="adjustCurrentTotalScore"&&e.mode==="add"}function gt(e){return["multiplyQuestionMultiplier","multiplyQuestionMultiplierByStreak","multiplyExamMultiplier","destroyAllOtherAndMultiplyCurrentTotal"].includes(e.op)||e.op==="adjustCurrentTotalScore"&&e.mode==="multiply"}function mt(e,t){const r=[...e.artifacts].flatMap((i,n)=>{const s=e.artifactById.get(i.artifactId);return((s==null?void 0:s.triggers)??[]).map((o,c)=>({owned:i,trigger:o,triggerIndex:c,slotIndex:n,phase:o.phase??Ee(o.timing),calcLayer:$e(o.effects),order:o.order??o.priority??500})).filter(o=>o.trigger.timing===t)});return we(r)}function we(e){return[...e].sort((t,r)=>t.phase-r.phase||t.slotIndex-r.slotIndex||t.triggerIndex-r.triggerIndex||me(t.trigger)-me(r.trigger)||t.calcLayer-r.calcLayer||t.order-r.order)}function me(e){var r,i;const t=(i=(r=e.effects)==null?void 0:r[0])==null?void 0:i.op;return t?t.includes("Question")?100:t.includes("Exam")?200:t.includes("CurrentTotal")?300:500:900}function E(e,t,r,i={}){const n=ft(e,t,i);let s=r;for(const o of D(n).filter(c=>c.mode==="set"))s=o.value;for(const o of D(n).filter(c=>c.mode==="add"))s+=o.value;for(const o of D(n).filter(c=>c.mode==="multiply"))s*=o.value;for(const o of D(n).filter(c=>c.mode==="min"))s=Math.max(s,o.value);for(const o of D(n).filter(c=>c.mode==="max"))s=Math.min(s,o.value);return s}function ft(e,t,r){const i=[];for(const n of e.artifacts){const s=e.artifactById.get(n.artifactId);for(const o of(s==null?void 0:s.modifiers)??[])o.target===t&&Q(o.condition,e,{exam:r.exam,owner:n})&&i.push(o)}return i}function D(e){return[...e].sort((t,r)=>(t.phase??0)-(r.phase??0)||(t.order??500)-(r.order??500))}const ht=20;async function Me(e,t={},r={}){var m;const i=t.seed??Ve(),n=vt(t.subjects),s=Je(i,n,e),o=t.year??1,c=t.threshold??750;if(s.onLog=r.onLog,bt(s,t.carryoverStats),t.initialArtifacts){for(const g of t.initialArtifacts)t.initialArtifactMode==="load"?Et(s,g):await ie(s,g,r,t);t.initialArtifactMode==="load"&&re(s,r)}else for(let g=0;g<(t.openingDrafts??6);g+=1)await k(s,r,t,4,"开局遗物");for(let g=0;g<n.length;g+=1)t.preExamDrafts&&await k(s,r,t,4,`第 ${o} 年考前遗物`),await Wt(s,n[g],g,r,t),(t.postExamDrafts??!0)&&await k(s,r,t,4,"考试结束奖励");await _(s,"RUN_END",void 0,r,t);const u=s.exams.reduce((g,S)=>g+S.score,0),l=Math.round(u+s.stats.currentTotalAdjustment),d={seed:i,subjects:n,year:o,threshold:c,artifactIds:s.artifacts.map(g=>g.artifactId),artifactNames:s.artifacts.map(g=>yt(s,g)),carryoverStats:St(s),exams:s.exams,totalScore:l,log:s.log};return(m=r.onRunEnd)==null||m.call(r,d),d}function vt(e){const t=e==null?void 0:e.filter(i=>!Z.includes(i)),r=(t==null?void 0:t.length)===3?t:H.slice(0,3);return[...Z,...r]}function yt(e,t){var r;return((r=e.artifactById.get(t.artifactId))==null?void 0:r.name)??t.artifactId}function bt(e,t){t&&(e.stats={...e.stats,...t,currentTotalAdjustment:0},e.stats.stamina=Math.max(e.stats.staminaFloor,e.stats.stamina))}function St(e){return{...e.stats,stamina:Math.max(e.stats.staminaFloor,e.stats.baseStamina),currentTotalAdjustment:0}}function Et(e,t){if(!e.artifactById.get(t))throw new Error(`Unknown artifact: ${t}`);e.artifacts.push(Se(e,t))}function $t(e){return e.artifacts.map(t=>e.artifactById.get(t.artifactId)).filter(t=>!!t)}function re(e,t){var r;(r=t.onArtifactsChanged)==null||r.call(t,$t(e))}async function k(e,t,r,i,n){const s=Math.max(1,i+E(e,"draftChoicesBonus",e.stats.draftChoicesBonus)+e.stats.nextDraftChoicesBonus);e.stats.nextDraftChoicesBonus=0;const o=Te(e,s);if(o.length===0){w(e,`${n}: 遗物池已空。`);return}const c=await At(o,n,t,r,e);if(c<0){w(e,`${n}: 跳过抽取。`);return}await ie(e,o[c].id,t,r)}function Te(e,t){const r=e.artifactConfigs.filter(i=>i.draftable===!1?!1:e.artifacts.filter(s=>s.artifactId===i.id).length<(i.maxCopies??1));return wt(e,r,t)}function wt(e,t,r){const i=[...t],n=[],s=xt(e);for(;i.length>0&&n.length<r;){const o=Mt(e,i,s),[c]=i.splice(o,1);n.push(c)}return n}function Mt(e,t,r){const i=t.map(o=>Tt(o,r)),n=i.reduce((o,c)=>o+c,0);let s=e.rng.next()*n;for(let o=0;o<i.length;o+=1)if(s-=i[o],s<=0)return o;return t.length-1}function Tt(e,t){return 1+e.tags.reduce((i,n)=>i+(t.get(n)??0),0)*.08}function xt(e){const t=new Map;for(const r of e.artifacts){const i=e.artifactById.get(r.artifactId);for(const n of(i==null?void 0:i.tags)??[])t.set(n,(t.get(n)??0)+1)}return t}async function At(e,t,r,i,n){const s=r.chooseArtifact?await r.chooseArtifact(e,t):Ct(e,i,n);return Number.isInteger(s)&&s<0?-1:xe(s,e.length)}function Ct(e,t,r){if(t.autoPolicy==="random")return r.rng.int(e.length);if(t.autoPolicy==="rare"){const i=["special","rare","uncommon","common"];return e.map((n,s)=>({index:s,rank:i.indexOf(n.rarity)})).sort((n,s)=>n.rank-s.rank)[0].index}return 0}function xe(e,t){return Number.isInteger(e)?Math.min(t-1,Math.max(0,e)):0}async function ie(e,t,r,i){const n=e.artifactById.get(t);if(!n)throw new Error(`Unknown artifact: ${t}`);const s=Se(e,t);e.artifacts.push(s),w(e,`获得遗物: ${n.name}`),e.currentEventCount=0,await U(e,s,"ARTIFACT_GAINED",void 0,r,i),re(e,r),await It(e,r,i)}async function It(e,t,r){for(;e.artifacts.length>E(e,"artifactLimit",e.stats.artifactLimit);){if(e.stats.preventDiscardCharges>0){e.stats.preventDiscardCharges-=1,w(e,"遗物上限超出，但本次丢弃被免除。");return}const i=e.artifacts.map(s=>e.artifactById.get(s.artifactId)),n=t.chooseDiscard?await t.chooseDiscard(i):Rt(i,r,e);await Ae(e,xe(n,e.artifacts.length),t,r)}}function Rt(e,t,r){return t.autoPolicy==="random"?r.rng.int(e.length):0}async function Ae(e,t,r,i){const[n]=e.artifacts.splice(t,1);if(!n)return;const s=e.artifactById.get(n.artifactId);w(e,`失去遗物: ${(s==null?void 0:s.name)??n.artifactId}`),e.currentEventCount=0,await U(e,n,"ARTIFACT_LOST",void 0,r,i,n);for(const o of[...e.artifacts])await U(e,o,"ARTIFACT_LOST",void 0,r,i,n);re(e,r)}async function ae(e,t,r,i){const n=e.artifacts.findIndex(s=>s.instanceId===t.instanceId);n>=0&&await Ae(e,n,r,i)}async function _(e,t,r,i,n){e.currentEventCount=0;const s=mt(e,t);for(const o of s)await L(e,{timing:t,owner:o.owned,triggerIndex:o.triggerIndex,trigger:o.trigger},r,i,n)}async function U(e,t,r,i,n,s,o,c){const u=e.artifactById.get(t.artifactId);if(!u)return;const l=we(u.triggers.map((d,m)=>({owned:t,trigger:d,triggerIndex:m,slotIndex:e.artifacts.findIndex(g=>g.instanceId===t.instanceId),phase:d.phase??Ee(d.timing),calcLayer:$e(d.effects),order:d.order??d.priority??500})).filter(d=>d.trigger.timing===r));for(const d of l)await L(e,{timing:r,owner:t,triggerIndex:d.triggerIndex,trigger:d.trigger,lostArtifact:o,sourceTrigger:c},i,n,s)}async function L(e,t,r,i,n){var S;if(e.currentEventCount>=ht)return w(e,"本次结算触发次数达到 20，后续遗物触发被跳过。"),!1;if(!Q(t.trigger.condition,e,{exam:r,owner:t.owner,lostArtifact:t.lostArtifact})||!Dt(e,t,r))return!1;e.currentEventCount+=1,r&&r.questionIndex>0&&fe(t.timing)&&(r.currentQuestionTriggerCount+=1);const s=e.artifactById.get(t.owner.artifactId),o=B(e,r),c=ee(e,r),u=_t(t.trigger);for(const T of t.trigger.effects??[])await st(T,e,{owner:t.owner,exam:r,gainRandomArtifacts:async $=>Bt(e,$,i,n),offerDraft:async($,A)=>Pt(e,$,A,i,n),destroySelf:async()=>ae(e,t.owner,i,n),destroyOther:async $=>jt(e,t.owner,$,i,n),destroyAllOther:async()=>Lt(e,t.owner,i,n),chooseOnesDigit:async($,A)=>i.chooseOnesDigit?i.chooseOnesDigit(Math.round($),A.subject):void 0,chooseDigitSwap:async($,A)=>i.chooseDigitSwap?i.chooseDigitSwap(Math.round($),A.subject):void 0});let l=!0;if(t.trigger.handler&&(l=await Ft(e,t,r,i,n)),!l)return e.currentEventCount-=1,r&&r.questionIndex>0&&fe(t.timing)&&(r.currentQuestionTriggerCount=Math.max(0,r.currentQuestionTriggerCount-1)),Qt(e,t,r),!1;const d=B(e,r),m=ee(e,r),g=(s==null?void 0:s.name)??t.owner.artifactId;return w(e,`触发遗物: ${g}${u?` -> ${u}`:""}`),await((S=i.onTrigger)==null?void 0:S.call(i,{artifactId:t.owner.artifactId,artifactName:g,timing:t.timing,triggerIndex:t.triggerIndex,slotIndex:e.artifacts.findIndex(T=>T.instanceId===t.owner.instanceId),effectText:u,replay:!!t.replay,before:o,after:d,scoreBefore:c,scoreAfter:m})),!t.replay&&t.timing!=="OTHER_ARTIFACT_TRIGGERED"&&await qt(e,t,r,i,n),!0}function _t(e){const t=(e.effects??[]).map(Ot).filter(Boolean);return e.handler&&t.push(`执行联动 ${e.handler}`),t.join("；")}function Ot(e){switch(e.op){case"addStat":return`${he(e.stat)} ${M(e.value)}`;case"setStatMin":return`${he(e.stat)}下限至少 ${e.value}`;case"addQuestionAccuracy":return`本题正确率 ${M(e.value)}`;case"addQuestionMultiplier":return`本题倍率 ${M(e.value)}`;case"multiplyQuestionMultiplier":return`本题倍率 x${e.value}`;case"multiplyQuestionMultiplierByStreak":return`按${e.streak==="correct"?"连对":"连错"}倍率 x${e.base}`;case"addQuestionBaseScore":return`本题基础分 ${M(e.value)}`;case"addQuestionScore":return`本题额外分 ${M(e.value)}`;case"addExamPostBonusByQuestionTriggerCount":return`按本题触发次数增加最终分，上限 ${e.cap}`;case"convertAccuracyOverflowToQuestionMultiplier":return"超出 100% 正确率转为本题倍率";case"addExamMultiplier":return`考试倍率 ${M(e.value)}`;case"multiplyExamMultiplier":return`考试倍率 x${e.value}`;case"adjustCurrentTotalScore":return`当前总分 ${e.mode==="add"?M(e.value):`x${e.value}`}`;case"addExamScore":return`本场分数 ${M(e.value)}`;case"addExamPostBonus":return`最终得分增加 ${M(e.value)}`;case"setExamScoreToFull":return"本场分数至少满分";case"addNextExamScore":return`下场考试分数 ${M(e.value)}`;case"forceResult":return`强制${e.result==="correct"?"改对":"改错"}`;case"queueQuestionModifier":return`后续 ${e.duration} 题${e.target==="accuracy"?"正确率":"倍率"} ${M(e.value)}`;case"gainRandomArtifacts":return`随机获得 ${e.count} 个遗物`;case"offerDraft":return`额外 ${e.choices} 选 ${e.picks}`;case"destroySelf":return"销毁自身";case"destroyOther":return"销毁其他遗物";case"destroyAllOtherAndMultiplyCurrentTotal":return`销毁其他遗物，每张当前总分 x${e.factorPerDestroyed}`;case"maximizeOnesDigit":return"将个位改成最优数字";case"maximizeDigitSwap":return"交换分数数字以最大化分数";case"preventNextDiscard":return"免除一次丢弃";case"log":return e.message}}function fe(e){return e.startsWith("QUESTION_")||e==="OTHER_ARTIFACT_TRIGGERED"}function he(e){return{baseAccuracy:"基础正确率",stamina:"体力",staminaDecay:"体力下降",staminaFloor:"体力下限",artifactLimit:"遗物上限",draftChoicesBonus:"抽取备选数",nextDraftChoicesBonus:"下次抽取备选数",questionMultiplierBase:"常驻本题倍率"}[e]??e}function M(e){return e>=0?`+${e}`:`${e}`}function B(e,t){return{accuracy:t?Nt(e,t):e.stats.baseAccuracy,questionMultiplier:t?Ce(e,t):e.stats.questionMultiplierBase,examMultiplier:t?Ie(e,t):1,baseStamina:e.stats.baseStamina,stamina:Math.round(e.stats.stamina*100)/100}}function ee(e,t){const r=Math.round(((t==null?void 0:t.rawScore)??0)*100)/100,i=Math.round(((t==null?void 0:t.examPostBonus)??0)*100)/100,n=Math.round(e.stats.currentTotalAdjustment*100)/100;return{currentTotal:Math.round(e.exams.reduce((o,c)=>o+c.score,0)+r+i+n),currentExamScore:r,examPostBonus:i,currentTotalAdjustment:n}}function Nt(e,t){if(t.currentFinalAccuracy>0)return Math.round(t.currentFinalAccuracy*100)/100;const r=E(e,"baseAccuracy",e.stats.baseAccuracy,{exam:t}),i=E(e,"finalAccuracy",r*e.stats.stamina/100+t.currentAccuracyBonus,{exam:t});return Math.round(i*100)/100}function Dt(e,t,r){const i=t.trigger.limit;if(!i)return!0;const s=`${i.scope==="exam"?`exam:${(r==null?void 0:r.index)??"none"}`:"run"}:${t.owner.instanceId}:${t.triggerIndex}`,o=e.triggerCounts.get(s)??0;return o>=i.count?!1:(e.triggerCounts.set(s,o+1),!0)}function Qt(e,t,r){const i=t.trigger.limit;if(!i)return;const s=`${i.scope==="exam"?`exam:${(r==null?void 0:r.index)??"none"}`:"run"}:${t.owner.instanceId}:${t.triggerIndex}`,o=e.triggerCounts.get(s)??0;if(o<=1){e.triggerCounts.delete(s);return}e.triggerCounts.set(s,o-1)}async function Bt(e,t,r,i){for(let n=0;n<t;n+=1){const s=Te(e,1);s[0]&&await ie(e,s[0].id,r,i)}}async function Pt(e,t,r,i,n){for(let s=0;s<r;s+=1)await k(e,i,n,t,"额外抽取")}async function jt(e,t,r,i,n){const s=e.artifacts.filter(c=>c.instanceId!==t.instanceId);if(s.length===0)return;const o=r==="random"?e.rng.pick(s):r==="rightmost"?s[s.length-1]:s[0];await ae(e,o,i,n)}async function Lt(e,t,r,i){const n=e.artifacts.filter(s=>s.instanceId!==t.instanceId);for(const s of n)await ae(e,s,r,i);return n.length}async function qt(e,t,r,i,n){const s=[...e.artifacts].filter(o=>o.instanceId!==t.owner.instanceId);for(const o of s)await U(e,o,"OTHER_ARTIFACT_TRIGGERED",r,i,n,void 0,t)}async function Ft(e,t,r,i,n){return t.trigger.handler==="mimicRight"?kt(e,t,r,i,n):t.trigger.handler==="repeatOtherTrigger"?Ut(e,t,r,i,n):t.trigger.handler==="triggerRightOnOtherTrigger"?Xt(e,t,r,i,n):t.trigger.handler==="luckyBlock"?Ht(e,t,r):!0}async function kt(e,t,r,i,n){const s=t.mimicDepth??0;if(s>=2)return!1;const o=e.artifacts.findIndex(m=>m.instanceId===t.owner.instanceId),c=e.artifacts[o+1];if(!c)return!1;const u=e.artifactById.get(c.artifactId),l=u==null?void 0:u.triggers.map((m,g)=>({trigger:m,triggerIndex:g})).filter(m=>m.trigger.timing===t.timing);if(!l||l.length===0)return!1;let d=!1;for(const m of l??[])d=await L(e,{timing:t.timing,owner:c,triggerIndex:m.triggerIndex,trigger:m.trigger,replay:!0,mimicDepth:s+1},r,i,n)||d;return d}async function Ut(e,t,r,i,n){var l,d;const s=t.sourceTrigger;if(!s||s.replay)return!1;const o=Number(((l=t.trigger.params)==null?void 0:l.chance)??0),c=Number(((d=t.trigger.params)==null?void 0:d.times)??1),u=Gt(e,"electric_gatling_pea")&&t.owner.artifactId==="gatling_peashooter"?c:0;if(e.rng.next()>=o)return!1;for(let m=0;m<c+u;m+=1)await L(e,{...s,replay:!0},r,i,n);return!0}function Gt(e,t){return e.artifacts.some(r=>r.artifactId===t)}async function Xt(e,t,r,i,n){var d;const s=t.sourceTrigger;if(!s||e.rng.next()>=Number(((d=t.trigger.params)==null?void 0:d.chance)??0))return!1;const o=e.artifacts.findIndex(m=>m.instanceId===t.owner.instanceId),c=e.artifacts[o+1],u=c?e.artifactById.get(c.artifactId):void 0,l=u==null?void 0:u.triggers.map((m,g)=>({item:m,triggerIndex:g})).find(m=>m.item.timing===s.timing);return!c||!l?!1:L(e,{timing:s.timing,owner:c,triggerIndex:l.triggerIndex,trigger:l.item,replay:!0},r,i,n)}function Ht(e,t,r){var c,u;if(!r)return!1;const i=Number(((c=t.trigger.params)==null?void 0:c.chance)??.002),n=Number(((u=t.trigger.params)==null?void 0:u.value)??1e3),s=E(e,"luckyBlockChance",i,{exam:r});if(e.rng.next()>=s)return!1;const o=E(e,"luckyBlockValue",n*e.stats.luckyBlockValueMultiplier,{exam:r});return r.examPostBonus+=o,e.stats.luckyBlockValueMultiplier*=2,w(e,`幸运方块触发: 最终得分增加 +${o}，下次效果 x2`),!0}async function Wt(e,t,r,i,n){var g,S;const s=E(e,"staminaFloor",e.stats.staminaFloor);e.stats.stamina=Math.max(s,e.stats.baseStamina);const o=Yt(e,t,r);w(e,`开始考试: ${v[t]}`),(g=i.onExamStart)==null||g.call(i,{index:r,subject:t,startingScore:o.rawScore,status:B(e,o)}),await _(e,"EXAM_START",o,i,n);for(let T=1;T<=o.questionCount;T+=1)await Vt(e,o,T,i,n);await _(e,"EXAM_END",o,i,n);const c=Math.round(o.rawScore*100)/100,u=Ie(e,o),l=Math.round(o.examPostBonus*100)/100,d=Math.round(c*u+l),m={subject:t,rawScore:c,examMultiplier:u,examPostBonus:l,score:d,correctCount:o.correctCount,wrongCount:o.wrongCount,questions:o.questionLogs};e.exams.push(m),await((S=i.onExamEnd)==null?void 0:S.call(i,m)),w(e,`结束考试: ${v[t]} ${d} 分`)}function Yt(e,t,r){const i=P[t],n={index:r,subject:t,questionCount:i.questionCount,pointsPerQuestion:i.pointsPerQuestion,fullScore:i.fullScore,questionIndex:0,rawScore:e.stats.pendingNextExamScore,examMultiplier:1,correctCount:0,wrongCount:0,correctStreak:0,wrongStreak:0,previousWrongStreak:0,currentAccuracyBonus:0,currentFinalAccuracy:0,currentQuestionMultiplier:1,questionMultiplierAdds:[],questionMultiplierMuls:[],currentQuestionBaseScore:0,currentQuestionFlatScore:0,currentQuestionTriggerCount:0,examMultiplierAdds:[],examMultiplierMuls:[],examPostBonus:0,questionLogs:[],questionModifiers:e.nextExamQuestionModifiers};return e.stats.pendingNextExamScore=0,e.nextExamQuestionModifiers=[],n}function zt(e){for(const t of e.questionModifiers)t.target==="accuracy"?e.currentAccuracyBonus+=t.value:t.mode==="multiply"?e.questionMultiplierMuls.push(t.value):e.questionMultiplierAdds.push(t.value),t.remaining-=1;e.questionModifiers=e.questionModifiers.filter(t=>t.remaining>0)}async function Vt(e,t,r,i,n){var l;t.questionIndex=r,t.previousWrongStreak=t.wrongStreak,t.currentAccuracyBonus=0,t.currentQuestionMultiplier=1,t.questionMultiplierAdds=[],t.questionMultiplierMuls=[],t.currentQuestionBaseScore=0,t.currentQuestionFlatScore=0,t.currentQuestionTriggerCount=0,t.forcedResult=void 0,t.currentResult=void 0,await((l=i.beforeQuestion)==null?void 0:l.call(i,{index:t.index,subject:t.subject,questionIndex:r,status:B(e,t)})),zt(t),await _(e,"QUESTION_BEFORE_ROLL",t,i,n);const s=E(e,"baseAccuracy",e.stats.baseAccuracy,{exam:t}),o=E(e,"finalAccuracy",s*e.stats.stamina/100+t.currentAccuracyBonus,{exam:t});t.currentFinalAccuracy=o;const c=Ke(o,0,100),u=e.rng.next()*100;t.currentResult=u<c?"correct":"wrong",await Jt(e,t,c,u,i,n)}async function Jt(e,t,r,i,n,s){await _(e,"QUESTION_AFTER_ROLL",t,n,s);const o=t.currentResult==="correct";o?(t.correctCount+=1,t.correctStreak+=1,t.wrongStreak=0):(t.wrongCount+=1,t.wrongStreak+=1,t.correctStreak=0),await Kt(e,t,r,i,o,n,s)}async function Kt(e,t,r,i,n,s,o){var S;await _(e,"QUESTION_SCORE",t,s,o);const c=Ce(e,t),u=((n?t.pointsPerQuestion:0)+t.currentQuestionBaseScore)*c+t.currentQuestionFlatScore;t.rawScore+=u;const l=e.stats.stamina,d={subject:t.subject,questionIndex:t.questionIndex,staminaBefore:l,staminaAfter:l,accuracy:Math.round(r*100)/100,roll:Math.round(i*100)/100,correct:n,scoreGained:Math.round(u*100)/100};t.currentQuestionLog=d,t.questionLogs.push(d);const m=E(e,"staminaFloor",e.stats.staminaFloor,{exam:t}),g=E(e,"staminaDecay",e.stats.staminaDecay,{exam:t});e.stats.stamina=Math.max(m,e.stats.stamina-g),await _(e,"QUESTION_END",t,s,o),d.staminaAfter=Math.round(e.stats.stamina*100)/100,w(e,Zt(t,d,c)),(S=s.onQuestion)==null||S.call(s,d,{index:t.index,subject:t.subject,rawScore:Math.round(t.rawScore*100)/100,examPostBonus:Math.round(t.examPostBonus*100)/100,currentTotalAdjustment:Math.round(e.stats.currentTotalAdjustment*100)/100,currentTotalScore:ee(e,t).currentTotal,status:B(e,t)}),t.lastResult=t.currentResult}function Zt(e,t,r){return`${v[e.subject]} Q${t.questionIndex}: ${t.correct?"正确":"错误"} | 正确率 ${t.accuracy}% | 掷骰 ${t.roll} | 体力 ${t.staminaBefore}->${t.staminaAfter} | 本题倍率 x${Math.round(r*100)/100} | 本题得分 ${t.scoreGained} | 本场累计 ${Math.round(e.rawScore)} | 连对 ${e.correctStreak} / 连错 ${e.wrongStreak}`}function Ce(e,t){const i=E(e,"questionMultiplier",e.stats.questionMultiplierBase,{exam:t})+t.questionMultiplierAdds.reduce((s,o)=>s+o,0),n=t.questionMultiplierMuls.reduce((s,o)=>s*o,i);return Math.max(0,Math.round(n*1e4)/1e4)}function Ie(e,t){const i=E(e,"examMultiplier",t.examMultiplier,{exam:t})+t.examMultiplierAdds.reduce((s,o)=>s+o,0),n=t.examMultiplierMuls.reduce((s,o)=>s*o,i);return Math.max(0,Math.round(n*1e4)/1e4)}const C=tr("root"),R=ti(),Re=[1,2,4,8],er=920,a={runId:0,phase:"start",seed:Xe(),playerName:wi(),subjects:H.slice(0,3),artifacts:[],exams:[],examQuestions:[],logs:[],visualEvents:[],triggerQueue:[],liveStatus:{accuracy:50,questionMultiplier:1,examMultiplier:1,baseStamina:100,stamina:100},chainCount:0,scoreAdjustment:0,draftSequence:0,sharedReport:Fr(),endlessActive:!1,endlessYear:1,scoreThreshold:750,autoPlay:!0,speedMultiplier:1,speedMs:Y(1),debugArtifactIds:R?ei():[],debugSearch:"",footerOpen:!1};C.addEventListener("click",e=>{var u,l,d,m,g,S,T,$,A,oe,ce,ue,le,de;const t=e.target,r=(u=t.closest("[data-choice]"))==null?void 0:u.dataset.choice,i=(l=t.closest("[data-score-choice]"))==null?void 0:l.dataset.scoreChoice,n=(d=t.closest("[data-score-position]"))==null?void 0:d.dataset.scorePosition,s=(m=t.closest("[data-action]"))==null?void 0:m.dataset.action,o=(g=t.closest("[data-speed]"))==null?void 0:g.dataset.speed,c=(S=t.closest("[data-subject]"))==null?void 0:S.dataset.subject;if(r!==void 0){(T=a.choicePrompt)==null||T.resolve(Number(r));return}if(i!==void 0){oi(Number(i));return}if(n!==void 0){ci(Number(n));return}if(o!==void 0){Wr(Number(o));return}if(s==="skip-draft"){($=a.choicePrompt)==null||$.resolve(-1);return}if(s==="skip-score-swap"){ui();return}if(s==="reset-score-swap"){li();return}if(c){Xr(c);return}if(s==="start-run"){ii();return}if(s==="continue-endless"){ai();return}if(s==="copy-share-link"){Lr();return}if(s==="add-debug-artifact"){const q=(A=t.closest("[data-artifact-id]"))==null?void 0:A.dataset.artifactId;q&&Kr(q);return}if(s==="remove-debug-artifact"){const q=Number((oe=t.closest("[data-debug-index]"))==null?void 0:oe.dataset.debugIndex);Zr(q);return}if(s==="clear-debug-build"){a.debugArtifactIds=[],ne(),f();return}if(s==="restart"){ri();return}if(s==="next-question"){(ce=a.waitingNext)==null||ce.call(a);return}if(s==="toggle-auto"){a.autoPlay=!a.autoPlay,(ue=a.waitingNext)==null||ue.call(a),f();return}if(s==="sprint"){a.autoPlay=!0,a.speedMultiplier=1,a.speedMs=0,a.sprintExamIndex=(le=a.activeExam)==null?void 0:le.index,(de=a.waitingNext)==null||de.call(a),f();return}if(s==="copy-feedback"){a.footerOpen=!0,Pr();return}});C.addEventListener("toggle",e=>{const t=e.target;t.dataset.section==="footer"&&(a.footerOpen=t.open)},!0);C.addEventListener("input",e=>{const t=e.target;if(t.dataset.field==="player-name"){a.playerName=t.value;try{window.localStorage.setItem("gaokao-player-name",a.playerName)}catch{}return}t.dataset.field==="debug-search"&&(a.debugSearch=t.value,f())});window.addEventListener("resize",_e);f();function f(){var r,i,n,s;const e=((r=a.activeTrigger)==null?void 0:r.intensity)??((i=a.scoreFlash)==null?void 0:i.intensity)??"low",t=((n=a.activeTrigger)==null?void 0:n.kind)??((s=a.scoreFlash)==null?void 0:s.kind)??"chain:step";C.innerHTML=`
    <div class="app-shell fx-${e} kind-${$i(t)} ${a.activeTrigger?"chain-live":""}">
      <main class="paper-field">${rr()}</main>
      ${ir()}
      ${ar()}
      ${Br()}
    </div>
  `,_e()}function _e(){window.requestAnimationFrame(()=>{const e=C.querySelector(".compact-exam-grid"),t=C.querySelector(".compact-exam-grid .exam-stage");e&&t&&e.style.setProperty("--left-column-height",`${Math.ceil(t.getBoundingClientRect().height)}px`);const r=C.querySelector(".start-layout-debug"),i=C.querySelector(".start-layout-debug .start-panel");r&&i&&r.style.setProperty("--start-left-column-height",`${Math.ceil(i.getBoundingClientRect().height)}px`)})}function tr(e){const t=document.getElementById(e);if(!t)throw new Error(`Missing #${e}`);return t}function rr(){return a.sharedReport&&a.phase==="start"?Qr(a.sharedReport):a.phase==="start"?cr():a.phase==="draft"&&a.choicePrompt?lr(a.choicePrompt):a.phase==="exam"&&a.activeExam?hr():a.phase==="result"&&a.result?Nr(a.result):ur()}function ir(){if(a.phase==="exam"||!a.activeTrigger)return"";const e=a.activeTrigger,t=e.scoreDelta,r=typeof t=="number"&&Math.abs(t)>1e-4?`分数 ${O(t)}`:e.effectText||"联动生效";return`
    <div class="global-trigger-toast toast-${e.tone} toast-${e.intensity}" role="status">
      <span>${e.replay?"复触发":"触发"}</span>
      <strong>${p(e.label)}</strong>
      <small>${p(r)}</small>
    </div>
  `}function ar(){const e=a.scoreChoicePrompt;if(!e)return"";const t=e.mode==="onesDigit"?"更改个位分数":"交换分数数字",r=e.mode==="onesDigit"?"选择一个个位数字后继续结算。":"选择两个分数位数，或跳过本次交换。";return`
    <section class="score-choice-backdrop" role="dialog" aria-modal="true" aria-label="${t}">
      <div class="score-choice-panel">
        <div class="score-choice-head">
          <p class="mono-label">SCORE CORRECTION</p>
          <h2>${t}</h2>
          <span>${v[e.subject]} 原始分 ${h(e.score)}</span>
        </div>
        <p>${r}</p>
        ${e.mode==="onesDigit"?`<div class="score-choice-grid">${e.options.map((i,n)=>nr(i,n)).join("")}</div>`:sr(e)}
      </div>
    </section>
  `}function nr(e,t){const r=e.delta>1e-4,i=e.delta<-1e-4;return`
    <button class="score-choice-option ${r?"better":i?"worse":"same"}" type="button" data-score-choice="${t}">
      <span>${p(e.label)}</span>
      <strong>${h(e.preview)}</strong>
      <small>${O(e.delta)}</small>
    </button>
  `}function sr(e){const t=Ue(e.score);return`
    <div class="score-swap-picker">
      <div class="score-swap-number" aria-label="当前分数数字">
        ${t.map((r,i)=>or(e,r,i,t.length)).join("")}
      </div>
      <div class="score-choice-actions">
        ${e.selectedPosition!==void 0?'<button class="secondary-button" type="button" data-action="reset-score-swap">重选第一位</button>':""}
        <button class="secondary-button" type="button" data-action="skip-score-swap">跳过交换</button>
      </div>
    </div>
  `}function or(e,t,r,i){const n=e.selectedPosition===r,s=e.selectedPosition!==void 0&&!n,o=s?pi(e.score,[e.selectedPosition,r]):e.score,c=V(o-e.score),u=n?"已选":s?`${h(o)} ${O(c)}`:ye(r,i);return`
    <button
      class="score-position-button ${n?"selected":""} ${s?"candidate":""}"
      type="button"
      data-score-position="${r}"
    >
      <span>${ye(r,i)}</span>
      <strong>${p(t)}</strong>
      <small>${p(u)}</small>
    </button>
  `}function cr(){return`
    <section class="start-screen">
      <div class="start-layout ${R?"start-layout-debug":""}">
        <section class="start-panel answer-card-panel">
          <div class="answer-card-title">
            <p class="mono-label">ADMISSION CARD</p>
            <h1>请选择你的高考遗物</h1>
          </div>
          <div class="answer-card-sheet" aria-label="答题卡开局设置">
            <div class="sheet-secret-line">姓名、准考证号填写处</div>
            ${Oe(a.subjects)}
          </div>
          <div class="start-actions">
            <button class="primary-button full-width" type="button" data-action="start-run">开始考试</button>
          </div>
        </section>
        <aside class="visual-ticket ${R?"answer-card-debug":""}">
          <div class="ticket-stamp">${R?"DEBUG":"开考"}</div>
          ${R?dr():`<div class="ticket-copy">
                  <span>ANSWER SHEET</span>
                  <strong>填涂完毕后开考</strong>
                  <span>${p(qe().join(" / "))}</span>
                </div>`}
        </aside>
      </div>
    </section>
  `}function ur(){return`
    <section class="result-screen shared-result-screen">
      <div class="result-card">
        <p class="mono-label">LOADING SCORE</p>
        <h1>正在读取战报</h1>
        <p>如果这是静态 GitHub Pages 链接，稍后会自动回到本地开局。</p>
      </div>
    </section>
  `}function lr(e){const t=!e.discard&&a.exams.length===0&&!a.activeExam&&e.reason==="开局遗物",r=Math.min(6,e.sequence),i=a.subjects;return`
    <section class="draft-screen ${e.discard?"draft-screen-discard":""}">
      <div class="draft-heading">
        <p class="mono-label">${e.discard?"OVERFLOW DISCARD":t?`OPENING ROLL ${r}/6`:"NEXT SUBJECT ROLL"}</p>
        <h1>${e.discard?"遗物已达上限":t?`请选择你的遗物 ${r}/6`:"请选择你的遗物"}</h1>
        ${e.discard?"<p>选择一件遗物丢弃，为新遗物腾出位置。</p>":""}
        ${t?Oe(i):""}
      </div>
      <div class="draft-grid">
        ${e.choices.map((n,s)=>mr(n,s)).join("")}
      </div>
      ${e.discard?"":'<button class="secondary-button skip-draft-button" type="button" data-action="skip-draft">跳过，不拿遗物</button>'}
      ${fr()}
    </section>
  `}function Oe(e){return`
    <div class="ticket-profile">
      <label class="player-name-field">
        <span>考生姓名</span>
        <input
          data-field="player-name"
          value="${J(a.playerName)}"
          placeholder="输入你的名字"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
      </label>
      <div class="subject-picker" aria-label="选科">
        <div class="subject-picker-head">
          <span>选科</span>
          <strong>${qe().join(" / ")}</strong>
        </div>
        <div class="subject-chip-row">
          ${H.map(t=>gr(t,e.includes(t))).join("")}
        </div>
      </div>
    </div>
  `}function dr(){const e=[];for(const r of a.debugArtifactIds){const i=Ne(r);i&&e.push(i)}const t=Vr();return`
    <div class="debug-builder">
      <div class="debug-head">
        <div>
          <p class="mono-label">DEBUG BUILD</p>
          <h2>任意构筑遗物组</h2>
        </div>
        <button class="secondary-button" type="button" data-action="clear-debug-build">清空</button>
      </div>
      <div class="debug-selected">
        ${e.length?e.map((r,i)=>`
                    <button class="debug-selected-chip rarity-${N(r.rarity)}" type="button" data-action="remove-debug-artifact" data-debug-index="${i}">
                      <span>${p(r.name)}</span>
                      <strong>×</strong>
                    </button>
                  `).join(""):'<span class="debug-empty">未放入遗物；开始考试将以空构筑进入考试。</span>'}
      </div>
      <label class="debug-search">
        <span>搜索遗物</span>
        <input
          data-field="debug-search"
          value="${J(a.debugSearch)}"
          placeholder="名称 / 描述 / tag / id"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
      </label>
      <div class="debug-artifact-list">
        ${t.length?t.map(r=>pr(r)).join(""):'<div class="debug-empty">没有匹配的遗物。</div>'}
      </div>
    </div>
  `}function pr(e){const t=a.debugArtifactIds.filter(n=>n===e.id).length,r=e.maxCopies??1,i=t>=r;return`
    <button
      class="debug-artifact-option rarity-${N(e.rarity)}"
      type="button"
      data-action="add-debug-artifact"
      data-artifact-id="${J(e.id)}"
      ${i?"disabled":""}
    >
      <span class="rarity">${z(e.rarity)}</span>
      <strong>${p(e.name)}</strong>
      <small>${p(e.description)}</small>
      <em>${t}/${r}</em>
    </button>
  `}function Ne(e){return X.find(t=>t.id===e)}function gr(e,t){return`
    <button type="button" class="${t?"subject-chip active":"subject-chip"}" data-subject="${e}">
      ${v[e]}
    </button>
  `}function mr(e,t){return`
    <button class="draft-card rarity-${N(e.rarity)}" type="button" data-choice="${t}">
      <div class="draft-card-top">
        <div class="term-corner">
          <span class="rarity">${z(e.rarity)}</span>
        </div>
      </div>
      <h2>${p(e.name)}</h2>
      <p>${p(e.description)}</p>
    </button>
  `}function fr(){return a.artifacts.length===0?"":`
    <div class="existing-build">
      <span class="mono-label">CURRENT BUILD</span>
      <div class="tag-row">
        ${a.artifacts.map(e=>`<span>${p(e.name)}</span>`).join("")}
      </div>
    </div>
  `}function hr(){var s,o;const e=a.activeExam,t=a.currentQuestion,r=P[e.subject],i=Math.max(0,r.questionCount-Math.min(r.questionCount,e.questionIndex));return`
    <section class="game-grid compact-exam-grid">
      <section class="exam-stage exam-paper fx-stage fx-${((s=a.activeTrigger)==null?void 0:s.intensity)??((o=a.scoreFlash)==null?void 0:o.intensity)??"low"}" aria-label="当前答题与词条触发">
        ${Sr(e,i)}
        ${Mr()}
        ${wr()}
        ${yr()}
        <div class="exam-priority">
          ${Er(e,t)}
          ${Tr()}
        </div>
        <div class="exam-controls">
          <button class="secondary-button" type="button" data-action="toggle-auto">${a.autoPlay?"暂停自动":"继续自动"}</button>
          ${vr()}
          <button class="secondary-button" type="button" data-action="sprint">快速跳过</button>
          <button class="secondary-button" type="button" data-action="restart">重开</button>
        </div>
      </section>
      <section class="support-drawers" aria-label="次要信息">
        ${Ar(e,i)}
        ${Cr()}
        ${Rr()}
        ${_r()}
      </section>
    </section>
  `}function vr(){return`
    <div class="speed-control" role="group" aria-label="加速">
      <span>加速</span>
      ${Re.map(e=>`
          <button
            class="speed-button ${a.speedMultiplier===e?"active":""}"
            type="button"
            data-speed="${e}"
            aria-pressed="${a.speedMultiplier===e}"
          >${e}x</button>
        `).join("")}
    </div>
  `}function yr(){const e=a.examSettlement;if(!e)return"";const t=Le(),r=e.rawScore??e.score,i=e.examMultiplier??1,n=e.examPostBonus??0,s=Math.round(r*i*100)/100,o=Math.abs(n)>1e-4?`
          <i>+</i>
          <span class="settlement-bonus">
            <b>结算加分</b>
            <strong>${h(n)}</strong>
          </span>
      `:"";return`
    <section class="exam-settlement-layer" role="dialog" aria-modal="true">
      <div class="settlement-float-field" aria-hidden="true">
        ${[`+${e.score}`,`原始分 ${h(r)}`,`得分倍率 x${h(i)}`,`=${h(s)}`,`${v[e.subject]} ${e.score}`,`答对 ${e.correctCount}`,`答错 ${e.wrongCount}`,`总分 ${t}`].map((u,l)=>br(u,l)).join("")}
      </div>
      <article class="settlement-card exam-paper">
        <div class="settlement-card-head">
          <span>${v[e.subject]}</span>
          <strong>${e.score}</strong>
        </div>
        <div class="settlement-formula" aria-label="本场结算公式">
          <span>
            <b>原始分</b>
            <strong>${h(r)}</strong>
          </span>
          <i>x</i>
          <span class="settlement-multiplier">
            <b>得分倍率</b>
            <strong>x${h(i)}</strong>
          </span>
          <i>=</i>
          <span class="settlement-product">
            <b>倍率分</b>
            <strong>${h(s)}</strong>
          </span>
          ${o}
        </div>
        <div class="settlement-score-shell">
          <span class="settlement-light-burst" aria-hidden="true"></span>
          <div class="settlement-score ${e.score>P[e.subject].fullScore?"over-score":""}">${e.score}</div>
        </div>
        <div class="settlement-stat-grid">
          <div><span>答对</span><strong>${e.correctCount}</strong></div>
          <div><span>答错</span><strong>${e.wrongCount}</strong></div>
          <div><span>总分</span><strong>${t}</strong></div>
        </div>
        <div class="settlement-subject-strip">
          ${a.exams.map(u=>`<span>${v[u.subject]} <strong>${u.score}</strong></span>`).join("")}
        </div>
        <button class="primary-button" type="button" data-action="next-question">开始考试</button>
      </article>
    </section>
  `}function br(e,t){const r=[["16%","22%"],["72%","20%"],["10%","62%"],["80%","58%"],["28%","78%"],["62%","76%"],["48%","18%"],["46%","84%"]],[i,n]=r[t%r.length];return`<span style="--x:${i};--y:${n};--i:${t}">${p(e)}</span>`}function F(e,t,r,i="当前"){var c,u,l;const n=(u=(c=a.activeTrigger)==null?void 0:c.deltas)==null?void 0:u.find(d=>d.key===r),s=n?((l=a.activeTrigger)==null?void 0:l.intensity)??"low":"low",o=r==="questionMultiplier"||r==="examMultiplier"?Ei(a.liveStatus[r]):"cool";return`
    <div class="paper-status-tile status-${r} heat-${o} ${n?`status-pulse intensity-${s}`:""}">
      ${n?`<b class="status-delta">${O(n.value,r)}</b>`:""}
      <span>${e}</span>
      <strong>${t}</strong>
      <small>${n?`${h(n.before)} -> ${h(n.after)}`:i}</small>
    </div>
  `}function Sr(e,t){const r=P[e.subject],i=Math.min(r.questionCount,e.questionIndex),n=a.exams.reduce((u,l)=>u+l.score,0)+e.score+a.scoreAdjustment,s=Math.min(100,i/r.questionCount*100),o=a.activeTrigger,c=o??a.scoreFlash;return`
    <div class="exam-paper-header compact-paper-header">
      <span class="secret-line">★ 考试状态 ★</span>
      <div class="paper-id-pattern" aria-hidden="true">
        <span>准考证号 ${p(a.seed.slice(0,10).toUpperCase())}</span>
        <i></i>
      </div>
      <div class="paper-status-layout" aria-label="当前考试状态">
        <div class="paper-title-block compact-paper-title">
          <p class="mono-label">AUTO EXAM STATUS</p>
          <h2>${v[e.subject]}</h2>
          <small>第 ${e.index+1}/${W().length} 场 · 答题点 ${i}/${r.questionCount} · 剩余 ${t}</small>
        </div>
        <div class="paper-score-total score-box-total ${c?`score-flash flash-${c.intensity}`:""}">
          <em class="paper-total-corner">总分 ${Math.round(n)}</em>
          <span>分数</span>
          <strong class="${e.score>r.fullScore?"over-score":""}">${Math.round(e.score)}</strong>
          <small>${v[e.subject]}当前分</small>
        </div>
        <div class="paper-status-grid">
          ${F("正确率",`${h(a.liveStatus.accuracy)}%`,"accuracy")}
          ${F("本题倍率",`x${h(a.liveStatus.questionMultiplier)}`,"questionMultiplier")}
          ${F("考试倍率",`x${h(a.liveStatus.examMultiplier)}`,"examMultiplier")}
          ${F("体力",`${h(a.liveStatus.stamina)}%`,"stamina",`基础 ${h(a.liveStatus.baseStamina)}%`)}
        </div>
      </div>
      ${o?`<div class="paper-trigger-banner status-trigger-banner banner-${o.tone}">
              <span>${o.replay?"复触发":"触发"}</span>
              <strong>${p(o.label)}</strong>
              <small>${p(o.effectText||"联动生效")}</small>
            </div>`:""}
      <div class="paper-progress-row">
        <div class="budget-bar" aria-label="答题点进度"><span style="width:${s}%"></span></div>
        <div class="budget-text">
          <span>答题点 ${i} / ${r.questionCount}</span>
          <span>CHAIN ${a.chainCount}</span>
        </div>
      </div>
    </div>
  `}function Er(e,t){const r=P[e.subject],i=t?t.correct?"result-success":"result-fail":"result-pending",n=Math.max(1,e.questionIndex);return`
    <article class="question-card ${i}">
      <div class="scanline"></div>
      <div class="question-top">
        <span class="mono-label">QUESTION ${String(n).padStart(2,"0")}</span>
        <span class="score-pill">${r.pointsPerQuestion} 分</span>
      </div>
      <h1>${v[e.subject]} 第 ${n} 题</h1>
      <div class="question-meta">
        <span>${v[e.subject]}</span>
        <span>正确率 ${(t==null?void 0:t.accuracy)??"--"}%</span>
        <span>掷骰 ${(t==null?void 0:t.roll)??"--"}</span>
      </div>
      <div class="answer-grid">
        ${Array.from({length:r.questionCount},(s,o)=>$r(o+1,r.pointsPerQuestion)).join("")}
      </div>
      <div class="tag-row large">
        <span>体力 ${t?`${t.staminaBefore}->${t.staminaAfter}`:"--"}</span>
        <span>本题 ${(t==null?void 0:t.scoreGained)??0} 分</span>
      </div>
      <div class="result-stamp">${t?t.correct?"成功":"失误":"等待判定"}</div>
    </article>
  `}function $r(e,t){var o;const r=a.examQuestions.find(c=>c.questionIndex===e),i=((o=a.activeExam)==null?void 0:o.questionIndex)===e&&!r?" active":"";if(!r)return`<span class="answer-pending${i}" data-index="${e}" title="第 ${e} 题：待判"></span>`;const n=r.correct?"answer-success":"answer-fail",s=r.correct?"成功":"失误";return`<span class="${n}${i}" data-index="${e}" title="第 ${e} 题：${s} ${r.scoreGained}/${t}"></span>`}function wr(){var n;const e=a.activeTrigger??a.scoreFlash;if(!e)return'<div class="trigger-overlay" aria-hidden="true"></div>';const t=(n=e.deltas)==null?void 0:n.sort((s,o)=>Math.abs(o.value)-Math.abs(s.value))[0],r=e.scoreDelta,i=typeof r=="number"&&Math.abs(r)>1e-4?`分数 ${O(r)}`:t?`${p(t.label)} ${O(t.value,t.key)}`:"";return`
    <div class="trigger-overlay" aria-hidden="true">
      <span class="float-event float-${e.tone} float-${e.intensity}">
        <strong>${p(e.label)}</strong>
        ${i?`<small>${i}</small>`:""}
      </span>
    </div>
  `}function Mr(){const e=a.activeTrigger??a.scoreFlash;return!e||e.intensity==="low"?'<div class="screen-fx" aria-hidden="true"></div>':`
    <div class="screen-fx screen-fx-${e.intensity}" aria-hidden="true">
      <i class="fx-scan"></i>
      <i class="fx-shockwave"></i>
      <i class="fx-sparks"></i>
    </div>
  `}function Tr(){var s,o,c,u;const e=new Set([(s=a.activeTrigger)==null?void 0:s.artifactId].filter(Boolean)),t=a.artifacts.filter(l=>e.has(l.id)),r=(t.length>0?t:a.artifacts).slice(0,8),i=((o=a.activeTrigger)==null?void 0:o.intensity)??"low",n=a.triggerQueue.filter(l=>{var d;return l.id!==((d=a.activeTrigger)==null?void 0:d.id)}).slice(0,4);return`
    <aside class="trigger-term-stage chain-${i}">
      <div class="trigger-stage-head">
        <div><p class="mono-label">TRIGGER ZONE</p><h2>触发词条</h2></div>
        <span class="chain-count chain-${i}">CHAIN ${a.chainCount}</span>
      </div>
      <div class="trigger-event-stack">
        ${a.activeTrigger?[a.activeTrigger,...n].map((l,d)=>`<span class="event-chip chip-${l.tone} chip-${l.intensity} ${d===0?"current":"queued"}">${p(l.label)}</span>`).join(""):""}
      </div>
      ${a.activeTrigger?`<div class="trigger-beam beam-${a.activeTrigger.intensity}"></div>`:""}
      ${(u=(c=a.activeTrigger)==null?void 0:c.deltas)!=null&&u.length?`<div class="trigger-delta-row">
              ${a.activeTrigger.deltas.map(l=>`<span>${p(l.label)} ${O(l.value,l.key)}</span>`).join("")}
            </div>`:""}
      <div class="trigger-card-strip">
        ${r.length>0?r.map(l=>xr(l,e.has(l.id))).join(""):'<article class="trigger-mini-card empty"><strong>还没抽词条</strong></article>'}
      </div>
    </aside>
  `}function xr(e,t){return`
    <article class="trigger-mini-card rarity-${N(e.rarity)} ${t?"triggered":""}">
      <div class="term-corner mini">
        <span class="rarity">${z(e.rarity)}</span>
      </div>
      <strong>${p(e.name)}</strong>
    </article>
  `}function Ar(e,t){return`
    <details class="mobile-drawer state-drawer">
      <summary><span>考试状态</span><strong>${t} 题待判</strong></summary>
      <div class="subject-list">
        ${W().map((r,i)=>{const n=a.exams.find(c=>c.subject===r),s=e.subject===r,o=n?n.score:s?Math.round(e.score):"--";return`<div class="subject-row ${s?"active":""} ${n?"done":""}"><span>${i+1}. ${v[r]}</span><strong>${o}</strong></div>`}).join("")}
      </div>
      <div class="stat-block">
        <div class="stat-row"><span>答对</span><strong>${a.examQuestions.filter(r=>r.correct).length}</strong></div>
        <div class="stat-row"><span>答错</span><strong>${a.examQuestions.filter(r=>!r.correct).length}</strong></div>
        <div class="stat-row"><span>当前正确率</span><strong>${h(a.liveStatus.accuracy)}%</strong></div>
        <div class="stat-row"><span>本题倍率</span><strong>x${h(a.liveStatus.questionMultiplier)}</strong></div>
        <div class="stat-row"><span>考试倍率</span><strong>x${h(a.liveStatus.examMultiplier)}</strong></div>
        <div class="stat-row"><span>体力</span><strong>${h(a.liveStatus.stamina)}%</strong></div>
        <div class="stat-row"><span>基础体力</span><strong>${h(a.liveStatus.baseStamina)}%</strong></div>
        <div class="stat-row"><span>自动</span><strong>${a.autoPlay?"ON":"OFF"}</strong></div>
      </div>
    </details>
  `}function Cr(){return`
    <details class="mobile-drawer terms-drawer">
      <summary><span>准考证词条库</span><strong>${a.artifacts.length} 条</strong></summary>
      <div class="panel-title">
        <p class="mono-label">ADMISSION TICKET</p>
        <h2>准考证词条</h2>
      </div>
      <div class="term-list">
        ${a.artifacts.map(e=>Ir(e)).join("")}
      </div>
    </details>
  `}function Ir(e){const t=a.visualEvents.some(r=>r.artifactId===e.id);return`
    <article class="term-card rarity-${N(e.rarity)} ${t?"triggered":""}">
      <div class="term-card-head">
        <div class="term-corner">
          <span class="rarity">${z(e.rarity)}</span>
        </div>
      </div>
      <h3>${p(e.name)}</h3>
      <p>${p(e.description)}</p>
    </article>
  `}function Rr(){return`
    <details class="mobile-drawer help-drawer">
      <summary><span>帮助文档</span><strong>规则 / 体力 / 操作</strong></summary>
      ${De()}
    </details>
  `}function De(){return`
    <div class="help-doc">
      <section>
        <h3>开局</h3>
        <p>先进行 6 次开局 4 选 1 遗物，再完成语文、数学、英语和 3 门自选科目的 6 场考试。</p>
      </section>
      <section>
        <h3>题目</h3>
        <p>语文、数学、英语各 15 题，单科满分 150 分；3 门选考科目各 10 题，单科满分 100 分。每题基础 10 分，六科标准满分 750 分。</p>
      </section>
      <section>
        <h3>正确率</h3>
        <p>判题时先算最终正确率 = 基础正确率 x 当前体力 / 100 + 本题正确率加成，再被相关遗物修正；超过 100% 的部分可被部分遗物转换成倍率收益。</p>
      </section>
      <section>
        <h3>体力与倍率</h3>
        <p>默认基础体力 100%，每题结算后体力 -5%。每科开考前体力恢复到基础体力；本题倍率只影响当前题，本场倍率在交卷时乘到本场原始分。</p>
      </section>
      <section>
        <h3>无尽模式</h3>
        <p>分数超过 750 可进入无尽模式。之后每年保留遗物，每科前获得一次 4 选 1，通关门槛从 750 开始每年 x1.5。</p>
      </section>
      <section>
        <h3>操作</h3>
        <p>自动模式会连续判题；暂停自动后可点击“继续自动”恢复；加速可切换 1x、2x、4x、8x 播放速度。</p>
      </section>
    </div>
  `}function _r(){return`
    <details class="mobile-drawer log-drawer">
      <summary><span>连锁日志</span><strong>${a.logs.length} 条</strong></summary>
      ${Qe()}
    </details>
  `}function Qe(){return`
    <section class="event-log">
      <div class="event-log-head"><span class="mono-label">CHAIN LOG</span><span>${a.logs.length} 条</span></div>
      <div class="event-log-list">
        ${a.logs.slice(-60).reverse().map(e=>`<p class="log-${Or(e)}">${p(e)}</p>`).join("")}
      </div>
    </section>
  `}function Or(e){return e.startsWith("触发遗物")||e.startsWith("获得遗物")?"good":e.includes("失去")||e.includes("错误")||e.includes("丢弃")?"warn":"wild"}function Nr(e){const t=Math.max(0,e.totalScore-750),r=e.totalScore>e.threshold,i=Pe(e.threshold),n=Be(e.totalScore);return`
    <section class="result-screen">
      <div class="result-card">
        <p class="mono-label">${a.endlessActive?`ENDLESS YEAR ${e.year}`:"FINAL SCORE"}</p>
        <div class="final-score ${e.totalScore>750?"over-score":""}">${e.totalScore}</div>
        <h1>${n}</h1>
        <p>${p(a.playerName||"考生")} 的六科已交卷。你的准考证上共有 ${a.artifacts.length} 条词条，当前门槛 ${e.threshold} 分，溢出分 ${t}。</p>
        <div class="endless-panel ${r?"passed":"failed"}">
          <div>
            <span>${r?"无尽模式可继续":"本轮战报封存"}</span>
            <strong>${r?`下一年门槛 ${i}`:`未超过 ${e.threshold}`}</strong>
          </div>
          <p>${r?"进入下一年后，保留当前遗物组；每科开考前获得一次 4 选 1，分数门槛 x1.5。":"超过 750 分后才可进入无尽模式；无尽年需要继续超过当年门槛。"}</p>
        </div>
        ${Dr(e,n,t)}
        <div class="result-subjects">
          ${e.exams.map(s=>`<div><span>${v[s.subject]}</span><strong>${s.score}</strong></div>`).join("")}
        </div>
        <div class="result-actions">
          ${r?`<button class="primary-button" type="button" data-action="continue-endless">进入第 ${e.year+1} 年</button>`:""}
          <button class="secondary-button" type="button" data-action="copy-share-link">复制战报链接</button>
          <button class="secondary-button" type="button" data-action="restart">重新开始</button>
        </div>
      </div>
      ${Qe()}
    </section>
  `}function Dr(e,t,r){return`
    <section class="share-card-preview" aria-label="分享卡片预览">
      <div class="share-card-paper">
        <div class="share-card-head">
          <div><span class="mono-label">REPORT CARD</span><strong>准考证战报</strong></div>
          <span>${e.year>1?`YEAR ${e.year}`:r>0?`OVER +${r}`:"本地战报"}</span>
        </div>
        <div class="share-card-candidate"><span>考生</span><strong>${p(a.playerName||"考生")}</strong></div>
        <div class="share-card-score ${e.totalScore>750?"over-score":""}">${e.totalScore}</div>
        <h2>${t}</h2>
        <div class="share-card-meta">
          <span>SEED ${p(e.seed)}</span>
          <span>门槛 ${e.threshold}</span>
        </div>
        <div class="share-card-hand"><span>无尽年</span><strong>${e.year}</strong></div>
        <div class="share-card-subjects">
          ${e.exams.map(i=>`<span>${v[i.subject]} <strong>${i.score}</strong></span>`).join("")}
        </div>
        <div class="share-card-terms">
          ${a.artifacts.slice(-6).reverse().map(i=>`<span class="rarity-text-${N(i.rarity)}">${p(i.name)}</span>`).join("")}
        </div>
      </div>
    </section>
  `}function Qr(e){const t=Math.max(0,e.score-750);return`
    <section class="result-screen shared-result-screen">
      <div class="result-card">
        <p class="mono-label">SHARED REPORT</p>
        <div class="final-score ${e.score>750?"over-score":""}">${e.score}</div>
        <h1>${p(e.title)}</h1>
        <p>${p(e.playerName)} 的分享战报。第 ${e.year} 年，门槛 ${e.threshold} 分，溢出分 ${t}。</p>
        <section class="share-card-preview" aria-label="分享战报">
          <div class="share-card-paper">
            <div class="share-card-head">
              <div><span class="mono-label">REPORT CARD</span><strong>准考证战报</strong></div>
              <span>YEAR ${e.year}</span>
            </div>
            <div class="share-card-candidate"><span>考生</span><strong>${p(e.playerName)}</strong></div>
            <div class="share-card-score ${e.score>750?"over-score":""}">${e.score}</div>
            <h2>${p(e.title)}</h2>
            <div class="share-card-meta">
              <span>SEED ${p(e.seed)}</span>
              <span>门槛 ${e.threshold}</span>
            </div>
            <div class="share-card-subjects">
              ${e.subjects.map(r=>`<span>${p(r.label)} <strong>${p(r.score)}</strong></span>`).join("")}
            </div>
            <div class="share-card-terms">
              ${e.artifacts.map(r=>`<span>${p(r)}</span>`).join("")}
            </div>
          </div>
        </section>
        <div class="result-actions">
          <button class="primary-button" type="button" data-action="restart">本地开考</button>
        </div>
      </div>
    </section>
  `}function Be(e){return e>=1e3?"满分已经失去行政意义":e>850?"招生办正在刷新页面":e>750?"分数溢出了答题卡":e>620?"稳定上岸，但准考证看起来不太合法":"命题组还活着"}function Pe(e){return Math.ceil(e*1.5)}function Br(){const e=jr(),t=a.footerNotice?`<div class="footer-notice" role="status">${p(a.footerNotice)}</div>`:"";return`
    <footer class="info-footer">
      <details>
        <summary><span>帮助文档</span><strong>规则 / 体力 / 操作</strong></summary>
        <div class="footer-help">
          ${De()}
        </div>
      </details>
      <details data-section="footer" ${a.footerOpen?"open":""}>
        <summary><span>发布信息</span><strong>反馈 / 赞赏 / 排名</strong></summary>
        <div class="footer-grid">
          <a class="footer-option" href="${J(e)}" target="_blank" rel="noreferrer">
            <strong>提交 GitHub Issue</strong>
            <span>自动带上 seed、阶段、成绩、遗物和最近日志，方便复现。</span>
          </a>
          <button class="footer-option" type="button" data-action="copy-feedback">
            <strong>复制 Issue 模板</strong>
            <span>GitHub 打不开时，先复制模板再手动粘贴。</span>
          </button>
          <div class="footer-roadmap">
            <span>排名接口可接 /api/leaderboard，提交内容建议同时附上战报截图。</span>
            <span>赞赏入口保留为配置项；没有收款码时不显示空按钮。</span>
          </div>
          ${t}
        </div>
      </details>
    </footer>
  `}async function Pr(){const e=je();try{await navigator.clipboard.writeText(e),G("Issue 模板已复制，可以直接粘贴到 GitHub。")}catch{G("浏览器禁止剪贴板写入，请直接点击提交 GitHub Issue。")}}function jr(){return`https://github.com/WhiteGiver-Plus/GaokaoArtifact/issues/new?${new URLSearchParams({title:`[反馈] ${a.phase} / seed ${a.seed}`,body:je()}).toString()}`}async function Lr(){const e=a.result;if(!e)return;const t=qr(e);try{await navigator.clipboard.writeText(t),G("战报链接已复制。")}catch{G(t)}}function qr(e){const t={playerName:a.playerName||"考生",seed:e.seed,score:e.totalScore,year:e.year,threshold:e.threshold,title:Be(e.totalScore),subjects:e.exams.map(n=>({label:v[n.subject],score:String(n.score)})),artifacts:a.artifacts.slice(-6).reverse().map(n=>n.name)},r=new URLSearchParams({report:kr(t)}),i=new URL(window.location.href);return i.search=r.toString(),i.hash="",i.toString()}function Fr(){try{const e=new URLSearchParams(window.location.search).get("report");return e?Ur(JSON.parse(decodeURIComponent(escape(window.atob(e))))):void 0}catch{return}}function kr(e){return window.btoa(unescape(encodeURIComponent(JSON.stringify(e))))}function Ur(e){if(!e||typeof e!="object")return;const t=e;if(!(typeof t.playerName!="string"||typeof t.seed!="string"||typeof t.score!="number"||typeof t.year!="number"||typeof t.threshold!="number"||typeof t.title!="string"||!Array.isArray(t.subjects)||!Array.isArray(t.artifacts)))return{playerName:t.playerName,seed:t.seed,score:Math.round(t.score),year:Math.max(1,Math.round(t.year)),threshold:Math.max(750,Math.round(t.threshold)),title:t.title,subjects:t.subjects.filter(r=>!!(r&&typeof r=="object"&&typeof r.label=="string"&&typeof r.score=="string")).slice(0,12),artifacts:t.artifacts.filter(r=>typeof r=="string").slice(0,12)}}function je(){const e=Gr();return["反馈类型：Bug / 平衡性 / 文案 / 其它","一句话描述：","","复现步骤：","1. ","2. ","3. ","","期望表现：","","实际表现：","","诊断信息：",JSON.stringify(e,null,2)].join(`
`)}function Gr(){var e;return{app:"请选择你的高考遗物",capturedAt:new Date().toISOString(),url:window.location.href,userAgent:navigator.userAgent,seed:a.seed,playerName:a.playerName||"考生",phase:a.phase,subjects:W().map(t=>v[t]),autoPlay:a.autoPlay,speedMultiplier:a.speedMultiplier,speedMs:a.speedMs,liveStatus:a.liveStatus,score:((e=a.result)==null?void 0:e.totalScore)??Le(),exams:a.exams.map(t=>({subject:v[t.subject],score:t.score})),currentExam:a.activeExam?{subject:v[a.activeExam.subject],questionIndex:a.activeExam.questionIndex,score:Math.round(a.activeExam.score)}:void 0,artifacts:a.artifacts.map(t=>({id:t.id,name:t.name,rarity:t.rarity})),recentQuestions:a.examQuestions.slice(-8).map(t=>({subject:v[t.subject],questionIndex:t.questionIndex,correct:t.correct,scoreGained:t.scoreGained})),recentLogs:a.logs.slice(-12)}}function Le(){var e;return Math.round(a.exams.reduce((t,r)=>t+r.score,0)+(((e=a.activeExam)==null?void 0:e.score)??0)+a.scoreAdjustment)}function G(e){a.footerNotice=e,f(),window.setTimeout(()=>{a.footerNotice===e&&(a.footerNotice=void 0,f())},3200)}function Xr(e){Hr()&&H.includes(e)&&(a.subjects.includes(e)||(a.subjects=[...a.subjects,e].slice(-3),f()))}function Hr(){return a.phase==="start"||a.exams.length===0&&!a.activeExam&&a.artifacts.length<1}function W(){return[...Z,...a.subjects]}function qe(){return W().map(e=>v[e])}function Wr(e){var t;Re.includes(e)&&(a.speedMultiplier=e,a.speedMs=Y(a.speedMultiplier),a.sprintExamIndex=void 0,a.autoPlay=!0,(t=a.waitingNext)==null||t.call(a),f())}function K(){a.speedMultiplier=1,a.speedMs=Y(a.speedMultiplier),a.sprintExamIndex=void 0,a.autoPlay=!0}function Y(e){return Math.round(er/e)}function Yr(){return Math.max(80,Math.min(420,Math.round(a.speedMs*.46)))}function zr(e){return e==="EXAM_END"?Math.max(1e3,Math.min(1500,Math.round(a.speedMs*.9))):a.speedMs<=0?0:Math.max(80,Math.round(a.speedMs*.55))}function Vr(){const e=a.debugSearch.trim().toLowerCase();return(e?te().filter(r=>Jr(r).includes(e)):te()).slice(0,60)}function te(){return X}function Jr(e){return[e.id,e.name,e.description,e.rarity,e.tags.join(" ")].join(" ").toLowerCase()}function Kr(e){const t=Ne(e);!t||a.debugArtifactIds.filter(i=>i===e).length>=(t.maxCopies??1)||(a.debugArtifactIds=[...a.debugArtifactIds,e],ne(),f())}function Zr(e){!Number.isInteger(e)||e<0||e>=a.debugArtifactIds.length||(a.debugArtifactIds=a.debugArtifactIds.filter((t,r)=>r!==e),ne(),f())}function ne(){if(R)try{window.localStorage.setItem("gaokao-debug-artifacts",JSON.stringify(a.debugArtifactIds))}catch{}}function ei(){try{const e=window.localStorage.getItem("gaokao-debug-artifacts"),t=e?JSON.parse(e):[];if(!Array.isArray(t))return[];const r=new Set(te().map(i=>i.id));return t.filter(i=>typeof i=="string"&&r.has(i))}catch{return[]}}function ti(){const e=window.location.pathname.replace(/\/+$/,"");return e.endsWith("/debug")||e.endsWith("/debug/index.html")}function N(e){return e==="special"?"legendary":e==="rare"?"epic":e==="uncommon"?"rare":"common"}function z(e){return e==="special"?"传说":e==="rare"?"史诗":e==="uncommon"?"稀有":"普通"}function se(){a.artifacts=[],a.exams=[],a.examQuestions=[],a.logs=[],a.visualEvents=[],a.triggerQueue=[],a.activeTrigger=void 0,a.examSettlement=void 0,a.liveStatus={accuracy:50,questionMultiplier:1,examMultiplier:1,baseStamina:100,stamina:100},a.chainCount=0,a.scoreFlash=void 0,a.scoreAdjustment=0,a.draftSequence=0,a.choicePrompt=void 0,a.activeExam=void 0,a.currentQuestion=void 0,a.waitingNext=void 0,a.result=void 0,a.sharedReport=void 0,a.scoreChoicePrompt=void 0,a.speedMultiplier=1,a.speedMs=Y(a.speedMultiplier),a.sprintExamIndex=void 0}function ri(e){a.runId+=1,a.seed=Xe(),se(),a.phase="start",f()}async function ii(e){a.runId+=1,a.endlessActive=!1,a.endlessYear=1,a.scoreThreshold=750,se(),a.phase="loading",f();const t=a.runId,r=R?a.debugArtifactIds.slice():void 0,i={seed:a.seed,subjects:a.subjects,initialArtifacts:r,autoPolicy:r?"first":void 0};await Me(X,i,Fe(t)),b(t)&&f()}async function ai(){const e=a.result;if(!e||e.totalScore<=e.threshold)return;a.runId+=1,a.endlessActive=!0,a.endlessYear=e.year+1,a.scoreThreshold=Pe(e.threshold),a.seed=`${e.seed}-Y${a.endlessYear}`,se(),a.phase="loading",f();const t=a.runId,r={seed:a.seed,subjects:a.subjects,initialArtifacts:e.artifactIds,initialArtifactMode:"load",carryoverStats:e.carryoverStats,year:a.endlessYear,threshold:a.scoreThreshold,openingDrafts:0,preExamDrafts:!0,postExamDrafts:!1};await Me(X,r,Fe(t)),b(t)&&f()}function Fe(e){return{chooseArtifact:(t,r)=>ve(e,t,r,!1),chooseDiscard:t=>ve(e,t,"遗物已达上限",!0),onLog:t=>{b(e)&&(a.logs=[...a.logs,t],Si(t))},onTrigger:async t=>{b(e)&&await fi(e,t)},chooseOnesDigit:async(t,r)=>await ni(e,t,r)??9,chooseDigitSwap:(t,r)=>si(e,t,r),onArtifactsChanged:t=>{b(e)&&(a.artifacts=t)},onExamStart:t=>{b(e)&&(a.phase="exam",a.examQuestions=[],a.visualEvents=[],a.triggerQueue=[],a.activeTrigger=void 0,a.examSettlement=void 0,a.sprintExamIndex!==void 0&&a.sprintExamIndex!==t.index&&K(),a.chainCount=0,a.scoreFlash=void 0,a.scoreAdjustment=0,a.currentQuestion=void 0,a.liveStatus=t.status,a.activeExam={index:t.index,subject:t.subject,questionIndex:0,score:t.startingScore},f())},beforeQuestion:async t=>{var r;b(e)&&(a.phase="exam",a.liveStatus=t.status,a.activeTrigger=void 0,a.triggerQueue=[],a.examSettlement=void 0,a.chainCount=0,a.scoreFlash=void 0,a.activeExam={index:t.index,subject:t.subject,questionIndex:t.questionIndex,score:((r=a.activeExam)==null?void 0:r.score)??0},f(),await gi(e))},onQuestion:(t,r)=>{if(!b(e))return;a.currentQuestion=t,a.examQuestions=[...a.examQuestions,t],a.liveStatus=r.status,a.activeExam={index:r.index,subject:r.subject,questionIndex:t.questionIndex,score:r.rawScore+r.examPostBonus},a.scoreAdjustment=r.currentTotalAdjustment;const i={id:`score-${Date.now()}-${t.questionIndex}`,label:t.correct?`+${t.scoreGained}`:"失误",tone:t.correct?"score":"fail",kind:t.correct?"score:add":"score:fail",intensity:be(t.scoreGained,r.status)};a.scoreFlash=i,a.visualEvents=[i,...a.visualEvents].slice(0,12),f(),window.setTimeout(()=>{var n;((n=a.scoreFlash)==null?void 0:n.id)===i.id&&(a.scoreFlash=void 0,f())},Yr())},onExamEnd:async t=>{var n;if(!b(e))return;const r=(n=a.activeExam)==null?void 0:n.index,i={id:`settlement-${Date.now()}-${t.subject}`,label:`+${t.score}`,tone:"score",kind:"score:add",intensity:be(t.score,a.liveStatus)};a.exams=[...a.exams,t],a.activeExam=a.activeExam?{...a.activeExam,score:0}:a.activeExam,a.scoreAdjustment=0,a.scoreFlash=i,a.visualEvents=[i,...a.visualEvents].slice(0,12),a.examSettlement=t,a.sprintExamIndex===r&&K(),f(),await mi(e),b(e)&&(a.examSettlement=void 0,a.scoreFlash=void 0,f())},onRunEnd:t=>{b(e)&&(a.result=t,a.examSettlement=void 0,K(),a.phase="result")}}}function ve(e,t,r,i){return b(e)?(a.phase="draft",new Promise(n=>{const s=i?a.draftSequence:a.draftSequence+1;i||(a.draftSequence=s),a.choicePrompt={reason:r,choices:t,discard:i,sequence:s,resolve:o=>{a.choicePrompt=void 0,n(o),f()}},f()})):Promise.resolve(0)}function ni(e,t,r){const i=Math.round(t),n=Array.from({length:10},(s,o)=>{const c=di(i,o);return{label:`个位 ${o}`,value:o,preview:c,delta:V(c-i)}}).sort((s,o)=>o.preview-s.preview);return ke(e,{mode:"onesDigit",subject:r,score:i,options:n}).then(s=>typeof s=="number"?s:void 0)}function si(e,t,r){const i=Math.round(t);return ke(e,{mode:"digitSwap",subject:r,score:i,options:[]}).then(n=>Array.isArray(n)?n:void 0)}function ke(e,t){return b(e)?new Promise(r=>{a.scoreChoicePrompt={...t,resolve:i=>{a.scoreChoicePrompt=void 0,r(i),f()}},f()}):Promise.resolve(void 0)}function oi(e){const t=a.scoreChoicePrompt;if(!t)return;const r=t.options[e];r&&t.resolve(r.value)}function ci(e){const t=a.scoreChoicePrompt;if(!t||t.mode!=="digitSwap")return;const r=Ue(t.score);if(!(!Number.isInteger(e)||e<0||e>=r.length)){if(t.selectedPosition===void 0){a.scoreChoicePrompt={...t,selectedPosition:e},f();return}if(t.selectedPosition===e){a.scoreChoicePrompt={...t,selectedPosition:void 0},f();return}t.resolve([t.selectedPosition,e])}}function ui(){const e=a.scoreChoicePrompt;!e||e.mode!=="digitSwap"||e.resolve([0,0])}function li(){const e=a.scoreChoicePrompt;!e||e.mode!=="digitSwap"||(a.scoreChoicePrompt={...e,selectedPosition:void 0},f())}function di(e,t){return e-Math.abs(e)%10+t}function pi(e,t){const r=e<0?-1:1,i=Math.abs(e).toString().split(""),[n,s]=t;return n<0||s<0||n>=i.length||s>=i.length||n===s?e:([i[n],i[s]]=[i[s],i[n]],r*Number(i.join("")))}function Ue(e){return Math.abs(Math.round(e)).toString().split("")}function ye(e,t){const r=["个位","十位","百位","千位","万位","十万位","百万位","千万位","亿位"],i=t-e-1;return r[i]??`第 ${e+1} 位`}function gi(e){return b(e)?a.autoPlay?Ge(a.speedMs):new Promise(t=>{a.waitingNext=()=>{a.waitingNext=void 0,t(),f()}}):Promise.resolve()}function mi(e){return b(e)?new Promise(t=>{a.waitingNext=()=>{a.waitingNext=void 0,t(),f()}}):Promise.resolve()}async function fi(e,t){const r=hi(t);a.chainCount+=1,a.triggerQueue=[...a.triggerQueue,r],a.activeTrigger=r,a.liveStatus=t.after,a.activeExam&&(a.activeExam={...a.activeExam,score:t.scoreAfter.currentExamScore+t.scoreAfter.examPostBonus}),a.scoreAdjustment=t.scoreAfter.currentTotalAdjustment,a.visualEvents=[r,...a.visualEvents].slice(0,12),f();const i=zr(t.timing);i>0&&await Ge(i),b(e)&&(a.triggerQueue=a.triggerQueue.filter(n=>n.id!==r.id))}function hi(e){const t=V(e.scoreAfter.currentTotal-e.scoreBefore.currentTotal);return{id:`${Date.now()}-${e.slotIndex}-${e.triggerIndex}-${a.visualEvents.length}`,label:e.artifactName,tone:Math.abs(t)>1e-4?t>0?"score":"fail":e.replay?"chain":"term",kind:vi(e),intensity:yi(e,a.chainCount+1),artifactId:e.artifactId,effectText:e.effectText,deltas:bi(e.before,e.after),scoreDelta:t,scoreBefore:e.scoreBefore.currentTotal,scoreAfter:e.scoreAfter.currentTotal,slotIndex:e.slotIndex,replay:e.replay,chainIndex:a.chainCount+1}}function vi(e){const t=e.scoreAfter.currentTotal-e.scoreBefore.currentTotal;if(Math.abs(t)>1e-4)return t>0?"score:add":"score:fail";const r=e.after.questionMultiplier-e.before.questionMultiplier,i=e.after.examMultiplier-e.before.examMultiplier;return e.after.examMultiplier>=50||e.after.questionMultiplier>=50?"jackpot:trigger":r>0||i>0?"multiplier:increase":e.replay?"chain:step":"multiplier:increase"}function yi(e,t){const r=Math.max(e.after.questionMultiplier,e.after.examMultiplier),i=Math.abs(e.scoreAfter.currentTotal-e.scoreBefore.currentTotal),n=Math.max(e.after.questionMultiplier-e.before.questionMultiplier,e.after.examMultiplier-e.before.examMultiplier),s=Math.abs(e.after.stamina-e.before.stamina);return i>=250?"jackpot":i>=100?"high":i>=30?"medium":r>=50||n>=25||t>=10?"jackpot":r>=25||n>=10||t>=6?"high":r>=10||n>=2||s>=40||t>=3?"medium":"low"}function be(e,t){const r=Math.max(t.questionMultiplier,t.examMultiplier);return e>=250||r>=50?"jackpot":e>=100||r>=25?"high":e>=30||r>=10?"medium":"low"}function bi(e,t){return[["accuracy","正确率"],["questionMultiplier","本题倍率"],["examMultiplier","考试倍率"],["baseStamina","基础体力"],["stamina","体力"]].map(([i,n])=>({key:i,label:n,value:V(t[i]-e[i]),before:e[i],after:t[i]})).filter(i=>Math.abs(i.value)>1e-4)}function V(e){return Math.round(e*1e4)/1e4}function Si(e){const t="触发遗物: ",r="获得遗物: ";if(!e.startsWith(t)&&e.startsWith(r)){const i=e.slice(r.length),n={id:`${Date.now()}-${a.visualEvents.length}`,label:i,tone:"chain",kind:"chain:step",intensity:"low"};a.visualEvents=[n,...a.visualEvents].slice(0,12)}}function b(e){return e===a.runId}function Ge(e){return new Promise(t=>window.setTimeout(t,e))}function Xe(){return Math.random().toString(36).slice(2,10)}function h(e){return String(Math.round(e*100)/100)}function O(e,t){const r=e>0?"+":"",i=t==="stamina"||t==="baseStamina"||t==="accuracy"?"%":"";return`${r}${h(e)}${i}`}function Ei(e){return e>=50?"overdrive":e>=25?"hot":e>=10?"warm":"cool"}function $i(e){return e.replace(":","-")}function wi(){try{return window.localStorage.getItem("gaokao-player-name")??"考生"}catch{return"考生"}}function p(e){return String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function J(e){return p(e)}
