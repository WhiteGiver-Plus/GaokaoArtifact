var Qe=Object.defineProperty;var je=(e,t,r)=>t in e?Qe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var oe=(e,t,r)=>je(e,typeof t!="symbol"?t+"":t,r);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function r(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=r(n);fetch(n.href,s)}})();const G=[{id:"big_pity",name:"大保底",rarity:"rare",tags:["accuracy","position"],description:"每场考试最后一题，正确率 +1000%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",condition:{kind:"questionIndex",op:"eq",value:15},effects:[{op:"addQuestionAccuracy",value:1e3}]}],maxCopies:1,draftable:!0},{id:"small_pity",name:"小保底",rarity:"uncommon",tags:["accuracy","position"],description:"每场考试每 5 道题，正确率 +200%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",condition:{kind:"questionModulo",modulo:5,equals:0},effects:[{op:"addQuestionAccuracy",value:200}]}],maxCopies:1,draftable:!0},{id:"empty_city",name:"空城",rarity:"rare",tags:["wrong","exam_score"],description:"若本场考试所有题目全部答错，则考试原始分至少补到满分。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"examAllWrong"},effects:[{op:"setExamScoreToFull"}]}],maxCopies:1,draftable:!0},{id:"self_sacrifice",name:"自刎归天",rarity:"special",tags:["wrong","risk"],description:"本场考试每题正确率 -100%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",effects:[{op:"addQuestionAccuracy",value:-100}]}],maxCopies:1,draftable:!0},{id:"proud_winner",name:"胜兵必骄，骄兵必败",rarity:"uncommon",tags:["streak","risk"],description:"若本题答对，则后续 2 题正确率 -100%。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"correct"},effects:[{op:"queueQuestionModifier",target:"accuracy",value:-100,duration:2}]}],maxCopies:1,draftable:!0},{id:"sad_loser",name:"败兵必哀，哀兵必胜",rarity:"uncommon",tags:["streak","comeback"],description:"若本题答错，则后续 2 题正确率 +100%。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"wrong"},effects:[{op:"queueQuestionModifier",target:"accuracy",value:100,duration:2}]}],maxCopies:1,draftable:!0},{id:"rageblade",name:"羊刀",rarity:"rare",tags:["streak","multiplier"],description:"每题得分倍率按当前连对数连续 x1.1。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"result",value:"correct"},effects:[{op:"multiplyQuestionMultiplierByStreak",streak:"correct",base:1.1}]}],maxCopies:1,draftable:!0},{id:"doctor_scaling",name:"医死的人越多，医术越高明",rarity:"rare",tags:["wrong","multiplier"],description:"按上一段连续答错数，使本题得分倍率连续 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",effects:[{op:"multiplyQuestionMultiplierByStreak",streak:"wrong",base:1.2,usePrevious:!0}]}],maxCopies:1,draftable:!0},{id:"guardian_angel",name:"复活甲",rarity:"rare",tags:["safety","force_result"],description:"每场考试第一次答错时，强制将本题结果改为正确。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"wrong"},limit:{scope:"exam",count:1},effects:[{op:"forceResult",result:"correct"}]}],maxCopies:1,draftable:!0},{id:"right_then_wrong",name:"对的对的，哦不对不对",rarity:"uncommon",tags:["risk","force_result"],description:"每场考试第一次答对时，强制将本题结果改为错误。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"correct"},limit:{scope:"exam",count:1},effects:[{op:"forceResult",result:"wrong"}]}],maxCopies:1,draftable:!0},{id:"final_ritual",name:"至终的仪式",rarity:"rare",tags:["streak","total_score"],description:"每连续答对五题时，当前总分 x1.1。",modifiers:[],triggers:[{timing:"QUESTION_END",condition:{kind:"streak",streak:"correct",op:"multipleOf",value:5},effects:[{op:"adjustCurrentTotalScore",mode:"multiply",value:1.1}]}],maxCopies:1,draftable:!0},{id:"identity_v",name:"第五人格",rarity:"rare",tags:["wrong","exam_multiplier"],description:"每连续答错 5 题时，本场考试倍率 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"streak",streak:"wrong",op:"multipleOf",value:5},effects:[{op:"multiplyExamMultiplier",value:1.2}]}],maxCopies:1,draftable:!0},{id:"multiple_choice",name:"多选题",rarity:"uncommon",tags:["draft"],description:"每次抽取遗物时，备选数 +1。",modifiers:[{target:"draftChoicesBonus",mode:"add",value:1}],triggers:[],maxCopies:1,draftable:!0},{id:"create_from_nothing",name:"无中生有",rarity:"rare",tags:["draft","consume"],description:"随机获得 2 件遗物，然后销毁自身。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"gainRandomArtifacts",count:2},{op:"destroySelf"}]}],maxCopies:1,draftable:!0},{id:"ten_pull_gift",name:"上线立送10连抽",rarity:"rare",tags:["draft","consume"],description:"立刻进行一次 10 选 1 遗物抽取。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"offerDraft",choices:10,picks:1}]}],maxCopies:1,draftable:!0},{id:"change_everything",name:"我们可以改变一切",rarity:"rare",tags:["destroy","exam_score"],description:"销毁最左侧其他遗物；下场考试初始分 +200。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"destroyOther",select:"leftmost"},{op:"addNextExamScore",value:200}]}],maxCopies:1,draftable:!0},{id:"silver_lion",name:"白银狮子",rarity:"uncommon",tags:["lost","exam_score"],description:"失去这件遗物时，下场考试初始分 +100。",modifiers:[],triggers:[{timing:"ARTIFACT_LOST",condition:{kind:"lostArtifactIsSelf"},effects:[{op:"addNextExamScore",value:100}]}],maxCopies:1,draftable:!0},{id:"glass_cannon",name:"玻璃大炮",rarity:"rare",tags:["risk","multiplier","stamina"],description:"体力下降 +10；每题得分倍率 +1。",modifiers:[{target:"staminaDecay",mode:"add",value:10},{target:"questionMultiplier",mode:"add",value:1}],triggers:[],maxCopies:1,draftable:!0},{id:"regeneration_potion",name:"再生药水",rarity:"common",tags:["stamina"],description:"每场考试每 5 道题结束时，体力 +20。",modifiers:[],triggers:[{timing:"QUESTION_END",condition:{kind:"questionModulo",modulo:5,equals:0},effects:[{op:"addStat",stat:"stamina",value:20}]}],maxCopies:1,draftable:!0},{id:"stamina_potion",name:"体力药水",rarity:"common",tags:["stamina"],description:"每场考试开始时，体力 +50。",modifiers:[],triggers:[{timing:"EXAM_START",effects:[{op:"addStat",stat:"stamina",value:50}]}],maxCopies:1,draftable:!0},{id:"lucky_block",name:"幸运方块",rarity:"rare",tags:["random","exam_score"],description:"每题结算后有 0.2% 概率触发，本场考试最终得分增加 1000；每次触发后，下次幸运方块增加值 x2。",modifiers:[],triggers:[{timing:"QUESTION_END",handler:"luckyBlock",params:{chance:.002,value:1e3}}],maxCopies:1,draftable:!0},{id:"strong_luck",name:"强运",rarity:"uncommon",tags:["accuracy"],description:"基础正确率 x125%。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:1.25}],triggers:[],maxCopies:1,draftable:!0},{id:"death_blade",name:"名刀·司命",rarity:"rare",tags:["stamina","safety"],description:"你的体力下限被锁定为不可低于 10%。",modifiers:[{target:"staminaFloor",mode:"min",value:10}],triggers:[],maxCopies:1,draftable:!0},{id:"final_reincarnation",name:"轮回之终末",rarity:"special",tags:["accuracy","stamina","risk"],description:"最终正确率 +1000%，每场考试开始时体力 +1000；每场考试结束时，考试原始分 -1000。",modifiers:[{target:"finalAccuracy",mode:"add",value:1e3}],triggers:[{timing:"EXAM_START",effects:[{op:"addStat",stat:"stamina",value:1e3}]},{timing:"EXAM_END",effects:[{op:"addExamScore",value:-1e3}]}],maxCopies:1,draftable:!0},{id:"eureka",name:"尤里卡",rarity:"common",tags:["accuracy"],description:"基础正确率 x120%。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:1.2}],triggers:[],maxCopies:1,draftable:!0},{id:"doubao",name:"豆包",rarity:"uncommon",tags:["accuracy","force_result"],description:"基础正确率 x20%。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:.2}],triggers:[],maxCopies:1,draftable:!0},{id:"deep_thinking",name:"深度思考中",rarity:"uncommon",tags:["accuracy","stamina"],description:"基础正确率 x140%，每题体力下降 +5。",modifiers:[{target:"baseAccuracy",mode:"multiply",value:1.4},{target:"staminaDecay",mode:"add",value:5}],triggers:[],maxCopies:1,draftable:!0},{id:"linked_seats",name:"连坐制",rarity:"uncommon",tags:["position","multiplier"],description:"若本题答对，则下一题得分倍率 +1.5。",modifiers:[],triggers:[{timing:"QUESTION_AFTER_ROLL",condition:{kind:"result",value:"correct"},effects:[{op:"queueQuestionModifier",target:"multiplier",value:1.5,duration:1}]}],maxCopies:1,draftable:!0},{id:"astrology",name:"观星",rarity:"common",tags:["position","accuracy"],description:"每场考试前 2 题，正确率 +100%。",modifiers:[],triggers:[{timing:"QUESTION_BEFORE_ROLL",condition:{kind:"questionIndex",op:"lte",value:2},effects:[{op:"addQuestionAccuracy",value:100}]}],maxCopies:1,draftable:!0},{id:"sinking_malphite",name:"沉底石头人",rarity:"uncommon",tags:["position","multiplier"],description:"每场考试前 8 题，得分倍率 -0.8；第 9 题起，得分倍率 +0.8。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"questionIndex",op:"lte",value:8},effects:[{op:"addQuestionMultiplier",value:-.8}]},{timing:"QUESTION_SCORE",condition:{kind:"questionIndex",op:"gt",value:8},effects:[{op:"addQuestionMultiplier",value:.8}]}],maxCopies:1,draftable:!0},{id:"imitator",name:"模仿者",rarity:"rare",tags:["slot","copy"],description:"模仿右侧第一张遗物。",modifiers:[],triggers:[{timing:"EXAM_START",handler:"mimicRight"},{timing:"QUESTION_BEFORE_ROLL",handler:"mimicRight"},{timing:"QUESTION_AFTER_ROLL",handler:"mimicRight"},{timing:"QUESTION_SCORE",handler:"mimicRight"},{timing:"QUESTION_END",handler:"mimicRight"},{timing:"EXAM_END",handler:"mimicRight"},{timing:"RUN_END",handler:"mimicRight"}],maxCopies:1,draftable:!0},{id:"repeater",name:"双发射手",rarity:"rare",tags:["slot","repeat"],description:"每次其他遗物触发时，20% 概率多触发一次。",modifiers:[],triggers:[{timing:"OTHER_ARTIFACT_TRIGGERED",handler:"repeatOtherTrigger",params:{chance:.2,times:1}}],maxCopies:1,draftable:!0},{id:"gatling_peashooter",name:"机枪射手",rarity:"rare",tags:["slot","repeat"],description:"每次其他遗物触发时，20% 概率多触发三次。",modifiers:[],triggers:[{timing:"OTHER_ARTIFACT_TRIGGERED",handler:"repeatOtherTrigger",params:{chance:.2,times:3}}],maxCopies:1,draftable:!0},{id:"tile_turnip",name:"瓷砖萝卜",rarity:"rare",tags:["slot","repeat"],description:"每次其他遗物触发时，20% 概率触发其右侧的第一个遗物。",modifiers:[],triggers:[{timing:"OTHER_ARTIFACT_TRIGGERED",handler:"triggerRightOnOtherTrigger",params:{chance:.2}}],maxCopies:1,draftable:!0},{id:"electric_gatling_pea",name:"电能机枪豌豆",rarity:"special",tags:["slot","combo"],description:"若你有机枪射手，机枪射手效果翻倍。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"shanghai_essay",name:"上海卷高考作文",rarity:"common",tags:["blank"],description:"有人说，这个遗物没有任何效果，也有人认为不尽如此，你怎么看？无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"reasonable_reason",name:"说的道理",rarity:"common",tags:["blank"],description:"说的道理。无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"happy_clown",name:"欢乐小丑",rarity:"uncommon",tags:["score_pattern","exam_multiplier"],description:"每科考试结束时，若结算前考试原始分包含至少 2 个相同数字，则本场考试倍率 +2。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreRepeatedDigit",count:2},effects:[{op:"addExamMultiplier",value:2}]}],maxCopies:1,draftable:!0},{id:"slippery_clown",name:"滑稽小丑",rarity:"rare",tags:["score_pattern","exam_multiplier"],description:"每科考试结束时，若结算前考试原始分包含至少 3 个相同数字，则本场考试倍率 +10。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreRepeatedDigit",count:3},effects:[{op:"addExamMultiplier",value:10}]}],maxCopies:1,draftable:!0},{id:"crazy_clown",name:"狂小丑",rarity:"rare",tags:["score_pattern","exam_multiplier"],description:"每科考试结束时，若结算前考试原始分为连续数字，则本场考试倍率 +20。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreStraight"},effects:[{op:"addExamMultiplier",value:20}]}],maxCopies:1,draftable:!0},{id:"tesseract",name:"宇宙立方",rarity:"uncommon",tags:["score_pattern","exam_score"],description:"每科考试结束时，若结算前考试原始分为立方数，则本场考试最终得分增加 200。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreCube"},effects:[{op:"addExamPostBonus",value:200}]}],maxCopies:1,draftable:!0},{id:"weeb_square",name:"唉，二次元",rarity:"common",tags:["score_pattern","exam_score"],description:"每科考试结束时，若结算前考试原始分为平方数，则本场考试最终得分增加 50。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"scoreSquare"},effects:[{op:"addExamPostBonus",value:50}]}],maxCopies:1,draftable:!0},{id:"prediction",name:"押题",rarity:"rare",tags:["accuracy"],description:"最终正确率 x1.5。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:1.5}],triggers:[],maxCopies:1,draftable:!0},{id:"holy_water_collector",name:"圣水采集器",rarity:"rare",tags:["accuracy","multiplier"],description:"超出 100% 的当前正确率转换为题目得分倍率加成。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"accuracy",op:"gt",value:100},effects:[{op:"convertAccuracyOverflowToQuestionMultiplier"}]}],maxCopies:1,draftable:!0},{id:"transcendent",name:"超凡入圣",rarity:"rare",tags:["accuracy","multiplier"],description:"若当前正确率超过 200%，本题得分倍率 x4。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"accuracy",op:"gt",value:200},effects:[{op:"multiplyQuestionMultiplier",value:4}]}],maxCopies:1,draftable:!0},{id:"happy_flower",name:"快乐小花",rarity:"uncommon",tags:["accuracy","position","multiplier"],description:"每场考试每 3 道题，正确率 x1.5，得分倍率 x2。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:1.5,condition:{kind:"questionModulo",modulo:3,equals:0}}],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"questionModulo",modulo:3,equals:0},effects:[{op:"multiplyQuestionMultiplier",value:2}]}],maxCopies:1,draftable:!0},{id:"pen_nib",name:"钢笔尖",rarity:"rare",tags:["accuracy","position","multiplier"],description:"每场考试每 10 道题，正确率 x2，得分倍率 x5。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:2,condition:{kind:"questionModulo",modulo:10,equals:0}}],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"questionModulo",modulo:10,equals:0},effects:[{op:"multiplyQuestionMultiplier",value:5}]}],maxCopies:1,draftable:!0},{id:"energetic",name:"精力充沛",rarity:"uncommon",tags:["stamina","multiplier"],description:"体力高于 100% 时，题目得分倍率 x1.5。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"stamina",op:"gt",value:100},effects:[{op:"multiplyQuestionMultiplier",value:1.5}]}],maxCopies:1,draftable:!0},{id:"red_skull",name:"红骷髅",rarity:"uncommon",tags:["stamina","accuracy"],description:"体力低于 50% 时，最终正确率 x1.5。",modifiers:[{target:"finalAccuracy",mode:"multiply",value:1.5,condition:{kind:"stamina",op:"lt",value:50}}],triggers:[],maxCopies:1,draftable:!0},{id:"math_lover",name:"数学爱好者",rarity:"rare",tags:["score_pattern"],description:"考试结束时，交换考试原始分的任意两位数字。",modifiers:[],triggers:[{timing:"EXAM_END",phase:6e3,order:100,effects:[{op:"maximizeDigitSwap"}]}],maxCopies:1,draftable:!0},{id:"c_language_master",name:"C语言大佬",rarity:"rare",tags:["score_pattern"],description:"考试结束时，将考试原始分个位改为 0-9 中任意数字。",modifiers:[],triggers:[{timing:"EXAM_END",phase:6e3,order:200,effects:[{op:"maximizeOnesDigit"}]}],maxCopies:1,draftable:!0},{id:"palindrome_score",name:"回文数",rarity:"rare",tags:["score_pattern","exam_multiplier"],description:"每科考试结束时，若结算前考试原始分为回文数，则本场考试倍率 +10。",modifiers:[],triggers:[{timing:"EXAM_END",phase:6200,condition:{kind:"scorePalindrome"},effects:[{op:"addExamMultiplier",value:10}]}],maxCopies:1,draftable:!0},{id:"all_for_nothing",name:"前功尽弃",rarity:"uncommon",tags:["alternate","exam_multiplier"],description:"若前一题答对且本题答错，则本场考试倍率 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"all",conditions:[{kind:"lastResult",value:"correct"},{kind:"result",value:"wrong"}]},effects:[{op:"multiplyExamMultiplier",value:1.2}]}],maxCopies:1,draftable:!0},{id:"learn_from_mistakes",name:"知错能改",rarity:"uncommon",tags:["alternate","exam_multiplier"],description:"若前一题答错且本题答对，则本场考试倍率 x1.2。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"all",conditions:[{kind:"lastResult",value:"wrong"},{kind:"result",value:"correct"}]},effects:[{op:"multiplyExamMultiplier",value:1.2}]}],maxCopies:1,draftable:!0},{id:"final_question_warrior",name:"压轴题战神",rarity:"rare",tags:["position","multiplier"],description:"每场考试最后一题，该题得分倍率 x10。",modifiers:[],triggers:[{timing:"QUESTION_SCORE",condition:{kind:"questionIndex",op:"eq",value:15},effects:[{op:"multiplyQuestionMultiplier",value:10}]}],maxCopies:1,draftable:!0},{id:"no_external_things",name:"心外无物",rarity:"special",tags:["artifact","destroy","current_total"],description:"获得时，弃掉其余所有遗物；每因此弃掉 1 件，当前总分 x1.4。",modifiers:[],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"destroyAllOtherAndMultiplyCurrentTotal",factorPerDestroyed:1.4}]}],maxCopies:1,draftable:!0},{id:"travel_light",name:"轻装上阵",rarity:"rare",tags:["artifact","capacity","current_total"],description:"遗物上限永久 -1；获得时，当前总分 x1.5。",modifiers:[{target:"artifactLimit",mode:"add",value:-1}],triggers:[{timing:"ARTIFACT_GAINED",effects:[{op:"adjustCurrentTotalScore",mode:"multiply",value:1.5}]}],maxCopies:1,draftable:!0},{id:"tiny_joker",name:"小丑牌",rarity:"common",tags:["blank"],description:"仅仅是这张牌很小丑。无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"hundred_day_oath",name:"百日誓师",rarity:"common",tags:["blank"],description:"无任何效果。",modifiers:[],triggers:[],maxCopies:1,draftable:!0},{id:"nonsense_master",name:"废话文学大师",rarity:"rare",tags:["blank","exam_score"],description:"每科考试结束时，按无效遗物数量使本场考试最终得分增加：1/2/3/4+ 件对应 20/100/1000/5000。",modifiers:[],triggers:[{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"blank",op:"eq",value:1},effects:[{op:"addExamPostBonus",value:20}]},{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"blank",op:"eq",value:2},effects:[{op:"addExamPostBonus",value:100}]},{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"blank",op:"eq",value:3},effects:[{op:"addExamPostBonus",value:1e3}]},{timing:"EXAM_END",condition:{kind:"ownedTagCount",tag:"blank",op:"gte",value:4},effects:[{op:"addExamPostBonus",value:5e3}]}],maxCopies:1,draftable:!0},{id:"lucky_star",name:"幸运星",rarity:"rare",tags:["lucky_block"],description:"幸运方块触发概率 x8。",modifiers:[{target:"luckyBlockChance",mode:"multiply",value:8}],triggers:[],maxCopies:1,draftable:!0},{id:"lucky_coin",name:"幸运币",rarity:"rare",tags:["lucky_block"],description:"幸运方块触发概率 x8。",modifiers:[{target:"luckyBlockChance",mode:"multiply",value:8}],triggers:[],maxCopies:1,draftable:!0}],F=["chinese","math","english"],X=["physics","chemistry","biology","politics","history","geography"],h={chinese:"语文",math:"数学",english:"英语",physics:"物理",chemistry:"化学",biology:"生物",politics:"政治",history:"历史",geography:"地理"};class Be{constructor(t){oe(this,"state");this.state=ke(t)()}next(){let t=this.state+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}int(t){return t<=0?0:Math.floor(this.next()*t)}pick(t){if(t.length===0)throw new Error("Cannot pick from an empty array.");return t[this.int(t.length)]}shuffle(t){const r=[...t];for(let a=r.length-1;a>0;a-=1){const n=this.int(a+1);[r[a],r[n]]=[r[n],r[a]]}return r}}function ke(e){let t=1779033703^e.length;for(let r=0;r<e.length;r+=1)t=Math.imul(t^e.charCodeAt(r),3432918353),t=t<<13|t>>>19;return()=>(t=Math.imul(t^t>>>16,2246822507),t=Math.imul(t^t>>>13,3266489909),t^=t>>>16,t>>>0)}function Le(){return`${Date.now()}-${Math.random().toString(36).slice(2)}`}function Pe(e,t,r){return{seed:e,rng:new Be(e),artifactConfigs:r,artifactById:new Map(r.map(a=>[a.id,a])),artifacts:[],log:[],exams:[],stats:{baseAccuracy:50,baseStamina:100,stamina:100,staminaDecay:5,staminaFloor:0,artifactLimit:9,draftChoicesBonus:0,nextDraftChoicesBonus:0,questionMultiplierBase:1,currentTotalAdjustment:0,luckyBlockValueMultiplier:1,pendingNextExamScore:0,preventDiscardCharges:0},triggerCounts:new Map,instanceSeq:0,currentEventCount:0,subjects:t,nextExamQuestionModifiers:[]}}function ge(e,t){return e.instanceSeq+=1,{instanceId:`${t}#${e.instanceSeq}`,artifactId:t}}function $(e,t){var r;e.log.push(t),(r=e.onLog)==null||r.call(e,t)}function Fe(e,t,r){return Math.min(r,Math.max(t,e))}function I(e,t,r){switch(t){case"eq":return e===r;case"neq":return e!==r;case"lt":return e<r;case"lte":return e<=r;case"gt":return e>r;case"gte":return e>=r}}function j(e){return Math.round(e)}function qe(e,t){const r=Math.abs(j(e)).toString().split("");return r.some(a=>r.filter(n=>n===a).length>=t)}function Ue(e){const t=Math.abs(j(e)).toString();return"0123456789".includes(t)||"9876543210".includes(t)}function Ge(e){const t=j(e);if(t<0)return!1;const r=Math.floor(Math.sqrt(t));return r*r===t}function Xe(e){const t=j(e),r=Math.round(Math.cbrt(t));return r*r*r===t}function He(e){const t=Math.abs(j(e)).toString();return t.length>1&&t===t.split("").reverse().join("")}function D(e,t,r){var n;if(!e||e.kind==="always")return!0;const a=r.exam;switch(e.kind){case"subject":return!!(a&&e.subjects.includes(a.subject));case"questionIndex":return!!(a&&I(a.questionIndex,e.op,e.value));case"questionIndexIn":return!!(a&&e.values.includes(a.questionIndex));case"questionModulo":return!!(a&&a.questionIndex%e.modulo===e.equals);case"result":return(a==null?void 0:a.currentResult)===e.value;case"lastResult":return(a==null?void 0:a.lastResult)===e.value;case"streak":return Ye(e,a);case"wrongCount":return!!(a&&I(a.wrongCount,e.op,e.value));case"score":return!!(a&&I(Math.round(a.rawScore),e.op,e.value));case"stamina":return I(t.stats.stamina,e.op,e.value);case"accuracy":return!!(a&&I(a.currentFinalAccuracy,e.op,e.value));case"examAllWrong":return!!(a&&a.wrongCount===a.questionCount);case"scoreRepeatedDigit":return!!(a&&qe(a.rawScore,e.count));case"scoreStraight":return!!(a&&Ue(a.rawScore));case"scorePalindrome":return!!(a&&He(a.rawScore));case"scoreSquare":return!!(a&&Ge(a.rawScore));case"scoreCube":return!!(a&&Xe(a.rawScore));case"ownedArtifact":return t.artifacts.some(s=>s.artifactId===e.id);case"ownedTagCount":return I(We(t,e.tag),e.op,e.value);case"lostArtifactIsSelf":return((n=r.lostArtifact)==null?void 0:n.instanceId)===r.owner.instanceId;case"randomChance":return t.rng.next()<e.chance;case"all":return e.conditions.every(s=>D(s,t,r));case"any":return e.conditions.some(s=>D(s,t,r));case"not":return!D(e.condition,t,r)}}function Ye(e,t){if(!t)return!1;const r=e.streak==="correct"?t.correctStreak:t.wrongStreak;return e.op==="multipleOf"?r>0&&r%e.value===0:I(r,e.op,e.value)}function We(e,t){return e.artifacts.filter(r=>{const a=e.artifactById.get(r.artifactId);return a==null?void 0:a.tags.includes(t)}).length}async function Ve(e,t,r){const a=r.exam;switch(e.op){case"addStat":ze(e.stat,e.value,t);return;case"setStatMin":t.stats[e.stat]=Math.max(t.stats[e.stat],e.value);return;case"addQuestionAccuracy":v(e.op,a).currentAccuracyBonus+=e.value;return;case"addQuestionMultiplier":v(e.op,a).questionMultiplierAdds.push(e.value);return;case"multiplyQuestionMultiplier":v(e.op,a).questionMultiplierMuls.push(e.value);return;case"multiplyQuestionMultiplierByStreak":Je(e,v(e.op,a));return;case"addQuestionScore":v(e.op,a).currentQuestionFlatScore+=e.value;return;case"convertAccuracyOverflowToQuestionMultiplier":{const n=v(e.op,a);n.questionMultiplierAdds.push(Math.max(0,n.currentFinalAccuracy-100)/100);return}case"addExamMultiplier":v(e.op,a).examMultiplierAdds.push(e.value);return;case"multiplyExamMultiplier":v(e.op,a).examMultiplierMuls.push(e.value);return;case"adjustCurrentTotalScore":ce(t,a,e.mode,e.value);return;case"addExamScore":v(e.op,a).rawScore+=e.value;return;case"addExamPostBonus":v(e.op,a).examPostBonus+=e.value;return;case"setExamScoreToFull":{const n=v(e.op,a);n.rawScore=Math.max(n.rawScore,n.fullScore);return}case"addNextExamScore":t.stats.pendingNextExamScore+=e.value;return;case"forceResult":v(e.op,a).forcedResult=e.result,v(e.op,a).currentResult=e.result;return;case"queueQuestionModifier":if(e.scope==="nextExam"){t.nextExamQuestionModifiers.push({target:e.target,value:e.value,mode:e.mode??"add",remaining:e.duration,source:r.owner.artifactId});return}v(e.op,a).questionModifiers.push({target:e.target,value:e.value,mode:e.mode??"add",remaining:e.duration,source:r.owner.artifactId});return;case"gainRandomArtifacts":await r.gainRandomArtifacts(e.count);return;case"offerDraft":await r.offerDraft(e.choices,e.picks);return;case"destroySelf":await r.destroySelf();return;case"destroyOther":await r.destroyOther(e.select);return;case"destroyAllOtherAndMultiplyCurrentTotal":{const n=await r.destroyAllOther();for(let s=0;s<n;s+=1)ce(t,a,"multiply",e.factorPerDestroyed);return}case"maximizeOnesDigit":{const n=v(e.op,a),s=await r.chooseOnesDigit(n.rawScore,n);Ze(n,s);return}case"maximizeDigitSwap":{const n=v(e.op,a),s=await r.chooseDigitSwap(n.rawScore,n);et(n,s);return}case"preventNextDiscard":t.stats.preventDiscardCharges+=1;return;case"log":$(t,e.message);return}}function ze(e,t,r){r.stats[e]+=t,e==="stamina"&&r.stats.stamina<r.stats.staminaFloor&&(r.stats.stamina=r.stats.staminaFloor)}function Je(e,t){const r=e.streak==="correct"?t.correctStreak:t.wrongStreak,a=e.usePrevious?t.previousWrongStreak:r;a>0&&t.questionMultiplierMuls.push(Math.pow(e.base,a))}function v(e,t){if(!t)throw new Error(`Effect ${e} requires an exam context.`);return t}function ce(e,t,r,a){if(r==="add"){e.stats.currentTotalAdjustment+=a;return}const n=Ke(e,t);e.stats.currentTotalAdjustment+=n*(a-1)}function Ke(e,t){return e.exams.reduce((r,a)=>r+a.score,0)+((t==null?void 0:t.rawScore)??0)+e.stats.currentTotalAdjustment}function Ze(e,t){const r=Math.round(e.rawScore),a=typeof t=="number"&&Number.isInteger(t)?Math.min(9,Math.max(0,t)):9;e.rawScore=r-Math.abs(r)%10+a}function et(e,t){const r=Math.round(e.rawScore),a=r<0?-1:1,n=Math.abs(r).toString().split("");if(t){const[o,c]=t;o>=0&&c>=0&&o<n.length&&c<n.length&&o!==c&&([n[o],n[c]]=[n[c],n[o]],e.rawScore=a*Number(n.join("")));return}let s=Math.abs(r);for(let o=0;o<n.length;o+=1)for(let c=o+1;c<n.length;c+=1){const u=[...n];[u[o],u[c]]=[u[c],u[o]],s=Math.max(s,Number(u.join("")))}e.rawScore=a*s}const A={ARTIFACT_GAINED:3e3,ARTIFACT_LOST:3100,EXAM_START:4100,QUESTION_BEFORE_ACCURACY:5100,QUESTION_RESULT_MODIFY:5300,QUESTION_SCORE_MODIFY:5500,QUESTION_END:5900,EXAM_PATTERN_TRIGGER:6200,RUN_TOTAL_MULTIPLIER:8100,OTHER_ARTIFACT_TRIGGERED:9e3};function me(e){return{RUN_START:1e3,DRAFT_OFFER:2100,ARTIFACT_GAINED:A.ARTIFACT_GAINED,ARTIFACT_LOST:A.ARTIFACT_LOST,EXAM_START:A.EXAM_START,QUESTION_BEFORE_ROLL:A.QUESTION_BEFORE_ACCURACY,QUESTION_AFTER_ROLL:A.QUESTION_RESULT_MODIFY,QUESTION_SCORE:A.QUESTION_SCORE_MODIFY,QUESTION_END:A.QUESTION_END,EXAM_END:A.EXAM_PATTERN_TRIGGER,RUN_END:A.RUN_TOTAL_MULTIPLIER,OTHER_ARTIFACT_TRIGGERED:A.OTHER_ARTIFACT_TRIGGERED}[e]}function fe(e=[]){return e.some(t=>rt(t))?200:e.some(t=>tt(t))?100:e.some(t=>t.op==="setStatMin"||t.op==="setExamScoreToFull")?300:500}function tt(e){return["addStat","addQuestionAccuracy","addQuestionMultiplier","addQuestionScore","convertAccuracyOverflowToQuestionMultiplier","addExamMultiplier","addExamScore","addExamPostBonus","addNextExamScore"].includes(e.op)||e.op==="adjustCurrentTotalScore"&&e.mode==="add"}function rt(e){return["multiplyQuestionMultiplier","multiplyQuestionMultiplierByStreak","multiplyExamMultiplier","destroyAllOtherAndMultiplyCurrentTotal"].includes(e.op)||e.op==="adjustCurrentTotalScore"&&e.mode==="multiply"}function at(e,t){const r=[...e.artifacts].flatMap((a,n)=>{const s=e.artifactById.get(a.artifactId);return((s==null?void 0:s.triggers)??[]).map((o,c)=>({owned:a,trigger:o,triggerIndex:c,slotIndex:n,phase:o.phase??me(o.timing),calcLayer:fe(o.effects),order:o.order??o.priority??500})).filter(o=>o.trigger.timing===t)});return he(r)}function he(e){return[...e].sort((t,r)=>t.phase-r.phase||t.slotIndex-r.slotIndex||t.triggerIndex-r.triggerIndex||ue(t.trigger)-ue(r.trigger)||t.calcLayer-r.calcLayer||t.order-r.order)}function ue(e){var r,a;const t=(a=(r=e.effects)==null?void 0:r[0])==null?void 0:a.op;return t?t.includes("Question")?100:t.includes("Exam")?200:t.includes("CurrentTotal")?300:500:900}function E(e,t,r,a={}){const n=it(e,t,a);let s=r;for(const o of N(n).filter(c=>c.mode==="set"))s=o.value;for(const o of N(n).filter(c=>c.mode==="add"))s+=o.value;for(const o of N(n).filter(c=>c.mode==="multiply"))s*=o.value;for(const o of N(n).filter(c=>c.mode==="min"))s=Math.max(s,o.value);for(const o of N(n).filter(c=>c.mode==="max"))s=Math.min(s,o.value);return s}function it(e,t,r){const a=[];for(const n of e.artifacts){const s=e.artifactById.get(n.artifactId);for(const o of(s==null?void 0:s.modifiers)??[])o.target===t&&D(o.condition,e,{exam:r.exam,owner:n})&&a.push(o)}return a}function N(e){return[...e].sort((t,r)=>(t.phase??0)-(r.phase??0)||(t.order??500)-(r.order??500))}const nt=20;async function ve(e,t={},r={}){var g;const a=t.seed??Le(),n=st(t.subjects),s=Pe(a,n,e),o=t.year??1,c=t.threshold??750;if(s.onLog=r.onLog,ct(s,t.carryoverStats),t.initialArtifacts){for(const m of t.initialArtifacts)t.initialArtifactMode==="load"?lt(s,m):await ee(s,m,r,t);t.initialArtifactMode==="load"&&Z(s,r)}else for(let m=0;m<(t.openingDrafts??6);m+=1)await P(s,r,t,4,"开局遗物");for(let m=0;m<n.length;m+=1)t.preExamDrafts&&await P(s,r,t,4,`第 ${o} 年考前遗物`),await Ot(s,n[m],m,r,t),(t.postExamDrafts??!0)&&await P(s,r,t,4,"考试结束奖励");await C(s,"RUN_END",void 0,r,t);const u=s.exams.reduce((m,w)=>m+w.score,0),l=Math.round(u+s.stats.currentTotalAdjustment),d={seed:a,subjects:n,year:o,threshold:c,artifactIds:s.artifacts.map(m=>m.artifactId),artifactNames:s.artifacts.map(m=>ot(s,m)),carryoverStats:ut(s),exams:s.exams,totalScore:l,log:s.log};return(g=r.onRunEnd)==null||g.call(r,d),d}function st(e){const t=e==null?void 0:e.filter(a=>!F.includes(a)),r=(t==null?void 0:t.length)===3?t:X.slice(0,3);return[...F,...r]}function ot(e,t){var r;return((r=e.artifactById.get(t.artifactId))==null?void 0:r.name)??t.artifactId}function ct(e,t){t&&(e.stats={...e.stats,...t,currentTotalAdjustment:0},e.stats.stamina=Math.max(e.stats.staminaFloor,e.stats.stamina))}function ut(e){return{...e.stats,stamina:Math.max(e.stats.staminaFloor,e.stats.baseStamina),currentTotalAdjustment:0}}function lt(e,t){if(!e.artifactById.get(t))throw new Error(`Unknown artifact: ${t}`);e.artifacts.push(ge(e,t))}function dt(e){return e.artifacts.map(t=>e.artifactById.get(t.artifactId)).filter(t=>!!t)}function Z(e,t){var r;(r=t.onArtifactsChanged)==null||r.call(t,dt(e))}async function P(e,t,r,a,n){const s=Math.max(1,a+E(e,"draftChoicesBonus",e.stats.draftChoicesBonus)+e.stats.nextDraftChoicesBonus);e.stats.nextDraftChoicesBonus=0;const o=ye(e,s);if(o.length===0){$(e,`${n}: 遗物池已空。`);return}const c=await pt(o,n,t,r,e);if(c<0){$(e,`${n}: 跳过抽取。`);return}await ee(e,o[c].id,t,r)}function ye(e,t){const r=e.artifactConfigs.filter(a=>a.draftable===!1?!1:e.artifacts.filter(s=>s.artifactId===a.id).length<(a.maxCopies??1));return e.rng.shuffle(r).slice(0,t)}async function pt(e,t,r,a,n){const s=r.chooseArtifact?await r.chooseArtifact(e,t):gt(e,a,n);return Number.isInteger(s)&&s<0?-1:be(s,e.length)}function gt(e,t,r){if(t.autoPolicy==="random")return r.rng.int(e.length);if(t.autoPolicy==="rare"){const a=["special","rare","uncommon","common"];return e.map((n,s)=>({index:s,rank:a.indexOf(n.rarity)})).sort((n,s)=>n.rank-s.rank)[0].index}return 0}function be(e,t){return Number.isInteger(e)?Math.min(t-1,Math.max(0,e)):0}async function ee(e,t,r,a){const n=e.artifactById.get(t);if(!n)throw new Error(`Unknown artifact: ${t}`);const s=ge(e,t);e.artifacts.push(s),$(e,`获得遗物: ${n.name}`),e.currentEventCount=0,await q(e,s,"ARTIFACT_GAINED",void 0,r,a),Z(e,r),await mt(e,r,a)}async function mt(e,t,r){for(;e.artifacts.length>E(e,"artifactLimit",e.stats.artifactLimit);){if(e.stats.preventDiscardCharges>0){e.stats.preventDiscardCharges-=1,$(e,"遗物上限超出，但本次丢弃被免除。");return}const a=e.artifacts.map(s=>e.artifactById.get(s.artifactId)),n=t.chooseDiscard?await t.chooseDiscard(a):ft(a,r,e);await Ee(e,be(n,e.artifacts.length),t,r)}}function ft(e,t,r){return t.autoPolicy==="random"?r.rng.int(e.length):0}async function Ee(e,t,r,a){const[n]=e.artifacts.splice(t,1);if(!n)return;const s=e.artifactById.get(n.artifactId);$(e,`失去遗物: ${(s==null?void 0:s.name)??n.artifactId}`),e.currentEventCount=0,await q(e,n,"ARTIFACT_LOST",void 0,r,a,n);for(const o of[...e.artifacts])await q(e,o,"ARTIFACT_LOST",void 0,r,a,n);Z(e,r)}async function te(e,t,r,a){const n=e.artifacts.findIndex(s=>s.instanceId===t.instanceId);n>=0&&await Ee(e,n,r,a)}async function C(e,t,r,a,n){e.currentEventCount=0;const s=at(e,t);for(const o of s)await B(e,{timing:t,owner:o.owned,triggerIndex:o.triggerIndex,trigger:o.trigger},r,a,n)}async function q(e,t,r,a,n,s,o,c){const u=e.artifactById.get(t.artifactId);if(!u)return;const l=he(u.triggers.map((d,g)=>({owned:t,trigger:d,triggerIndex:g,slotIndex:e.artifacts.findIndex(m=>m.instanceId===t.instanceId),phase:d.phase??me(d.timing),calcLayer:fe(d.effects),order:d.order??d.priority??500})).filter(d=>d.trigger.timing===r));for(const d of l)await B(e,{timing:r,owner:t,triggerIndex:d.triggerIndex,trigger:d.trigger,lostArtifact:o,sourceTrigger:c},a,n,s)}async function B(e,t,r,a,n){var w;if(e.currentEventCount>=nt)return $(e,"本次结算触发次数达到 20，后续遗物触发被跳过。"),!1;if(!D(t.trigger.condition,e,{exam:r,owner:t.owner,lostArtifact:t.lostArtifact})||!bt(e,t,r))return!1;e.currentEventCount+=1;const s=e.artifactById.get(t.owner.artifactId),o=Q(e,r),c=J(e,r),u=ht(t.trigger);for(const R of t.trigger.effects??[])await Ve(R,e,{owner:t.owner,exam:r,gainRandomArtifacts:async S=>St(e,S,a,n),offerDraft:async(S,M)=>$t(e,S,M,a,n),destroySelf:async()=>te(e,t.owner,a,n),destroyOther:async S=>wt(e,t.owner,S,a,n),destroyAllOther:async()=>At(e,t.owner,a,n),chooseOnesDigit:async(S,M)=>a.chooseOnesDigit?a.chooseOnesDigit(Math.round(S),M.subject):void 0,chooseDigitSwap:async(S,M)=>a.chooseDigitSwap?a.chooseDigitSwap(Math.round(S),M.subject):void 0});let l=!0;if(t.trigger.handler&&(l=await Mt(e,t,r,a,n)),!l)return e.currentEventCount-=1,Et(e,t,r),!1;const d=Q(e,r),g=J(e,r),m=(s==null?void 0:s.name)??t.owner.artifactId;return $(e,`触发遗物: ${m}${u?` -> ${u}`:""}`),await((w=a.onTrigger)==null?void 0:w.call(a,{artifactId:t.owner.artifactId,artifactName:m,timing:t.timing,triggerIndex:t.triggerIndex,slotIndex:e.artifacts.findIndex(R=>R.instanceId===t.owner.instanceId),effectText:u,replay:!!t.replay,before:o,after:d,scoreBefore:c,scoreAfter:g})),!t.replay&&t.timing!=="OTHER_ARTIFACT_TRIGGERED"&&await Tt(e,t,r,a,n),!0}function ht(e){const t=(e.effects??[]).map(vt).filter(Boolean);return e.handler&&t.push(`执行联动 ${e.handler}`),t.join("；")}function vt(e){switch(e.op){case"addStat":return`${le(e.stat)} ${T(e.value)}`;case"setStatMin":return`${le(e.stat)}下限至少 ${e.value}`;case"addQuestionAccuracy":return`本题正确率 ${T(e.value)}`;case"addQuestionMultiplier":return`本题倍率 ${T(e.value)}`;case"multiplyQuestionMultiplier":return`本题倍率 x${e.value}`;case"multiplyQuestionMultiplierByStreak":return`按${e.streak==="correct"?"连对":"连错"}倍率 x${e.base}`;case"addQuestionScore":return`本题额外分 ${T(e.value)}`;case"convertAccuracyOverflowToQuestionMultiplier":return"超出 100% 正确率转为本题倍率";case"addExamMultiplier":return`考试倍率 ${T(e.value)}`;case"multiplyExamMultiplier":return`考试倍率 x${e.value}`;case"adjustCurrentTotalScore":return`当前总分 ${e.mode==="add"?T(e.value):`x${e.value}`}`;case"addExamScore":return`本场分数 ${T(e.value)}`;case"addExamPostBonus":return`最终得分增加 ${T(e.value)}`;case"setExamScoreToFull":return"本场分数至少满分";case"addNextExamScore":return`下场考试分数 ${T(e.value)}`;case"forceResult":return`强制${e.result==="correct"?"改对":"改错"}`;case"queueQuestionModifier":return`后续 ${e.duration} 题${e.target==="accuracy"?"正确率":"倍率"} ${T(e.value)}`;case"gainRandomArtifacts":return`随机获得 ${e.count} 个遗物`;case"offerDraft":return`额外 ${e.choices} 选 ${e.picks}`;case"destroySelf":return"销毁自身";case"destroyOther":return"销毁其他遗物";case"destroyAllOtherAndMultiplyCurrentTotal":return`销毁其他遗物，每张当前总分 x${e.factorPerDestroyed}`;case"maximizeOnesDigit":return"将个位改成最优数字";case"maximizeDigitSwap":return"交换分数数字以最大化分数";case"preventNextDiscard":return"免除一次丢弃";case"log":return e.message}}function le(e){return{baseAccuracy:"基础正确率",stamina:"体力",staminaDecay:"体力下降",staminaFloor:"体力下限",artifactLimit:"遗物上限",draftChoicesBonus:"抽取备选数",nextDraftChoicesBonus:"下次抽取备选数",questionMultiplierBase:"常驻本题倍率"}[e]??e}function T(e){return e>=0?`+${e}`:`${e}`}function Q(e,t){return{accuracy:t?yt(e,t):e.stats.baseAccuracy,questionMultiplier:t?Se(e,t):e.stats.questionMultiplierBase,examMultiplier:t?$e(e,t):1,baseStamina:e.stats.baseStamina,stamina:Math.round(e.stats.stamina*100)/100}}function J(e,t){const r=Math.round(((t==null?void 0:t.rawScore)??0)*100)/100,a=Math.round(((t==null?void 0:t.examPostBonus)??0)*100)/100,n=Math.round(e.stats.currentTotalAdjustment*100)/100;return{currentTotal:Math.round(e.exams.reduce((o,c)=>o+c.score,0)+r+a+n),currentExamScore:r,examPostBonus:a,currentTotalAdjustment:n}}function yt(e,t){if(t.currentFinalAccuracy>0)return Math.round(t.currentFinalAccuracy*100)/100;const r=E(e,"baseAccuracy",e.stats.baseAccuracy,{exam:t}),a=E(e,"finalAccuracy",r*e.stats.stamina/100+t.currentAccuracyBonus,{exam:t});return Math.round(a*100)/100}function bt(e,t,r){const a=t.trigger.limit;if(!a)return!0;const s=`${a.scope==="exam"?`exam:${(r==null?void 0:r.index)??"none"}`:"run"}:${t.owner.instanceId}:${t.triggerIndex}`,o=e.triggerCounts.get(s)??0;return o>=a.count?!1:(e.triggerCounts.set(s,o+1),!0)}function Et(e,t,r){const a=t.trigger.limit;if(!a)return;const s=`${a.scope==="exam"?`exam:${(r==null?void 0:r.index)??"none"}`:"run"}:${t.owner.instanceId}:${t.triggerIndex}`,o=e.triggerCounts.get(s)??0;if(o<=1){e.triggerCounts.delete(s);return}e.triggerCounts.set(s,o-1)}async function St(e,t,r,a){for(let n=0;n<t;n+=1){const s=ye(e,1);s[0]&&await ee(e,s[0].id,r,a)}}async function $t(e,t,r,a,n){for(let s=0;s<r;s+=1)await P(e,a,n,t,"额外抽取")}async function wt(e,t,r,a,n){const s=e.artifacts.filter(c=>c.instanceId!==t.instanceId);if(s.length===0)return;const o=r==="random"?e.rng.pick(s):r==="rightmost"?s[s.length-1]:s[0];await te(e,o,a,n)}async function At(e,t,r,a){const n=e.artifacts.filter(s=>s.instanceId!==t.instanceId);for(const s of n)await te(e,s,r,a);return n.length}async function Tt(e,t,r,a,n){const s=[...e.artifacts].filter(o=>o.instanceId!==t.owner.instanceId);for(const o of s)await q(e,o,"OTHER_ARTIFACT_TRIGGERED",r,a,n,void 0,t)}async function Mt(e,t,r,a,n){return t.trigger.handler==="mimicRight"?xt(e,t,r,a,n):t.trigger.handler==="repeatOtherTrigger"?It(e,t,r,a,n):t.trigger.handler==="triggerRightOnOtherTrigger"?_t(e,t,r,a,n):t.trigger.handler==="luckyBlock"?Rt(e,t,r):!0}async function xt(e,t,r,a,n){const s=t.mimicDepth??0;if(s>=2)return!1;const o=e.artifacts.findIndex(g=>g.instanceId===t.owner.instanceId),c=e.artifacts[o+1];if(!c)return!1;const u=e.artifactById.get(c.artifactId),l=u==null?void 0:u.triggers.map((g,m)=>({trigger:g,triggerIndex:m})).filter(g=>g.trigger.timing===t.timing);if(!l||l.length===0)return!1;let d=!1;for(const g of l??[])d=await B(e,{timing:t.timing,owner:c,triggerIndex:g.triggerIndex,trigger:g.trigger,replay:!0,mimicDepth:s+1},r,a,n)||d;return d}async function It(e,t,r,a,n){var l,d;const s=t.sourceTrigger;if(!s||s.replay)return!1;const o=Number(((l=t.trigger.params)==null?void 0:l.chance)??0),c=Number(((d=t.trigger.params)==null?void 0:d.times)??1),u=Ct(e,"electric_gatling_pea")&&t.owner.artifactId==="gatling_peashooter"?c:0;if(e.rng.next()>=o)return!1;for(let g=0;g<c+u;g+=1)await B(e,{...s,replay:!0},r,a,n);return!0}function Ct(e,t){return e.artifacts.some(r=>r.artifactId===t)}async function _t(e,t,r,a,n){var d;const s=t.sourceTrigger;if(!s||e.rng.next()>=Number(((d=t.trigger.params)==null?void 0:d.chance)??0))return!1;const o=e.artifacts.findIndex(g=>g.instanceId===t.owner.instanceId),c=e.artifacts[o+1],u=c?e.artifactById.get(c.artifactId):void 0,l=u==null?void 0:u.triggers.map((g,m)=>({item:g,triggerIndex:m})).find(g=>g.item.timing===s.timing);return!c||!l?!1:B(e,{timing:s.timing,owner:c,triggerIndex:l.triggerIndex,trigger:l.item,replay:!0},r,a,n)}function Rt(e,t,r){var c,u;if(!r)return!1;const a=Number(((c=t.trigger.params)==null?void 0:c.chance)??.002),n=Number(((u=t.trigger.params)==null?void 0:u.value)??1e3),s=E(e,"luckyBlockChance",a,{exam:r});if(e.rng.next()>=s)return!1;const o=E(e,"luckyBlockValue",n*e.stats.luckyBlockValueMultiplier,{exam:r});return r.examPostBonus+=o,e.stats.luckyBlockValueMultiplier*=2,$(e,`幸运方块触发: 最终得分增加 +${o}，下次效果 x2`),!0}async function Ot(e,t,r,a,n){var l,d;const s=E(e,"staminaFloor",e.stats.staminaFloor);e.stats.stamina=Math.max(s,e.stats.baseStamina);const o=Nt(e,t,r);$(e,`开始考试: ${h[t]}`),(l=a.onExamStart)==null||l.call(a,{index:r,subject:t,startingScore:o.rawScore,status:Q(e,o)}),await C(e,"EXAM_START",o,a,n);for(let g=1;g<=o.questionCount;g+=1)await Qt(e,o,g,a,n);await C(e,"EXAM_END",o,a,n);const c=Math.round(o.rawScore*$e(e,o)+o.examPostBonus),u={subject:t,score:c,correctCount:o.correctCount,wrongCount:o.wrongCount,questions:o.questionLogs};e.exams.push(u),(d=a.onExamEnd)==null||d.call(a,u),$(e,`结束考试: ${h[t]} ${c} 分`)}function Nt(e,t,r){const a={index:r,subject:t,questionCount:15,pointsPerQuestion:10,fullScore:150,questionIndex:0,rawScore:e.stats.pendingNextExamScore,examMultiplier:1,correctCount:0,wrongCount:0,correctStreak:0,wrongStreak:0,previousWrongStreak:0,currentAccuracyBonus:0,currentFinalAccuracy:0,currentQuestionMultiplier:1,questionMultiplierAdds:[],questionMultiplierMuls:[],currentQuestionFlatScore:0,examMultiplierAdds:[],examMultiplierMuls:[],examPostBonus:0,questionLogs:[],questionModifiers:e.nextExamQuestionModifiers};return e.stats.pendingNextExamScore=0,e.nextExamQuestionModifiers=[],a}function Dt(e){for(const t of e.questionModifiers)t.target==="accuracy"?e.currentAccuracyBonus+=t.value:t.mode==="multiply"?e.questionMultiplierMuls.push(t.value):e.questionMultiplierAdds.push(t.value),t.remaining-=1;e.questionModifiers=e.questionModifiers.filter(t=>t.remaining>0)}async function Qt(e,t,r,a,n){var l;t.questionIndex=r,t.previousWrongStreak=t.wrongStreak,t.currentAccuracyBonus=0,t.currentQuestionMultiplier=1,t.questionMultiplierAdds=[],t.questionMultiplierMuls=[],t.currentQuestionFlatScore=0,t.forcedResult=void 0,t.currentResult=void 0,await((l=a.beforeQuestion)==null?void 0:l.call(a,{index:t.index,subject:t.subject,questionIndex:r,status:Q(e,t)})),Dt(t),await C(e,"QUESTION_BEFORE_ROLL",t,a,n);const s=E(e,"baseAccuracy",e.stats.baseAccuracy,{exam:t}),o=E(e,"finalAccuracy",s*e.stats.stamina/100+t.currentAccuracyBonus,{exam:t});t.currentFinalAccuracy=o;const c=Fe(o,0,100),u=e.rng.next()*100;t.currentResult=u<c?"correct":"wrong",await jt(e,t,c,u,a,n)}async function jt(e,t,r,a,n,s){await C(e,"QUESTION_AFTER_ROLL",t,n,s);const o=t.currentResult==="correct";o?(t.correctCount+=1,t.correctStreak+=1,t.wrongStreak=0):(t.wrongCount+=1,t.wrongStreak+=1,t.correctStreak=0),await Bt(e,t,r,a,o,n,s)}async function Bt(e,t,r,a,n,s,o){var w;await C(e,"QUESTION_SCORE",t,s,o);const c=Se(e,t),u=(n?t.pointsPerQuestion*c:0)+t.currentQuestionFlatScore;t.rawScore+=u;const l=e.stats.stamina,d={subject:t.subject,questionIndex:t.questionIndex,staminaBefore:l,staminaAfter:l,accuracy:Math.round(r*100)/100,roll:Math.round(a*100)/100,correct:n,scoreGained:Math.round(u*100)/100};t.currentQuestionLog=d,t.questionLogs.push(d);const g=E(e,"staminaFloor",e.stats.staminaFloor,{exam:t}),m=E(e,"staminaDecay",e.stats.staminaDecay,{exam:t});e.stats.stamina=Math.max(g,e.stats.stamina-m),await C(e,"QUESTION_END",t,s,o),d.staminaAfter=Math.round(e.stats.stamina*100)/100,$(e,kt(t,d,c)),(w=s.onQuestion)==null||w.call(s,d,{index:t.index,subject:t.subject,rawScore:Math.round(t.rawScore*100)/100,examPostBonus:Math.round(t.examPostBonus*100)/100,currentTotalAdjustment:Math.round(e.stats.currentTotalAdjustment*100)/100,currentTotalScore:J(e,t).currentTotal,status:Q(e,t)}),t.lastResult=t.currentResult}function kt(e,t,r){return`${h[e.subject]} Q${t.questionIndex}: ${t.correct?"正确":"错误"} | 正确率 ${t.accuracy}% | 掷骰 ${t.roll} | 体力 ${t.staminaBefore}->${t.staminaAfter} | 本题倍率 x${Math.round(r*100)/100} | 本题得分 ${t.scoreGained} | 本场累计 ${Math.round(e.rawScore)} | 连对 ${e.correctStreak} / 连错 ${e.wrongStreak}`}function Se(e,t){const a=E(e,"questionMultiplier",e.stats.questionMultiplierBase,{exam:t})+t.questionMultiplierAdds.reduce((s,o)=>s+o,0),n=t.questionMultiplierMuls.reduce((s,o)=>s*o,a);return Math.max(0,Math.round(n*1e4)/1e4)}function $e(e,t){const a=E(e,"examMultiplier",t.examMultiplier,{exam:t})+t.examMultiplierAdds.reduce((s,o)=>s+o,0),n=t.examMultiplierMuls.reduce((s,o)=>s*o,a);return Math.max(0,Math.round(n*1e4)/1e4)}const H=Lt("root"),x=Br(),i={runId:0,phase:"start",seed:De(),playerName:na(),subjects:X.slice(0,3),artifacts:[],exams:[],examQuestions:[],logs:[],visualEvents:[],triggerQueue:[],liveStatus:{accuracy:50,questionMultiplier:1,examMultiplier:1,baseStamina:100,stamina:100},chainCount:0,scoreAdjustment:0,draftSequence:0,sharedReport:Ar(),endlessActive:!1,endlessYear:1,scoreThreshold:750,autoPlay:!0,speedMs:920,debugArtifactIds:x?jr():[],debugSearch:"",footerOpen:!1};H.addEventListener("click",e=>{var c,u,l,d,g,m,w,R,S,M,ne,se;const t=e.target,r=(c=t.closest("[data-choice]"))==null?void 0:c.dataset.choice,a=(u=t.closest("[data-score-choice]"))==null?void 0:u.dataset.scoreChoice,n=(l=t.closest("[data-score-position]"))==null?void 0:l.dataset.scorePosition,s=(d=t.closest("[data-action]"))==null?void 0:d.dataset.action,o=(g=t.closest("[data-subject]"))==null?void 0:g.dataset.subject;if(r!==void 0){(m=i.choicePrompt)==null||m.resolve(Number(r));return}if(a!==void 0){Ur(Number(a));return}if(n!==void 0){Gr(Number(n));return}if(s==="skip-draft"){(w=i.choicePrompt)==null||w.resolve(-1);return}if(s==="skip-score-swap"){Xr();return}if(s==="reset-score-swap"){Hr();return}if(o){Cr(o);return}if(s==="start-run"){Lr();return}if(s==="continue-endless"){Pr();return}if(s==="copy-share-link"){$r();return}if(s==="add-debug-artifact"){const k=(R=t.closest("[data-artifact-id]"))==null?void 0:R.dataset.artifactId;k&&Dr(k);return}if(s==="remove-debug-artifact"){const k=Number((S=t.closest("[data-debug-index]"))==null?void 0:S.dataset.debugIndex);Qr(k);return}if(s==="clear-debug-build"){i.debugArtifactIds=[],ae(),f();return}if(s==="restart"){kr();return}if(s==="next-question"){(M=i.waitingNext)==null||M.call(i);return}if(s==="toggle-auto"){i.autoPlay=!i.autoPlay,(ne=i.waitingNext)==null||ne.call(i),f();return}if(s==="sprint"){i.autoPlay=!0,i.speedMs=0,(se=i.waitingNext)==null||se.call(i);return}if(s==="copy-feedback"){i.footerOpen=!0,Er();return}});H.addEventListener("toggle",e=>{const t=e.target;t.dataset.section==="footer"&&(i.footerOpen=t.open)},!0);H.addEventListener("input",e=>{const t=e.target;if(t.dataset.field==="player-name"){i.playerName=t.value;try{window.localStorage.setItem("gaokao-player-name",i.playerName)}catch{}return}t.dataset.field==="debug-search"&&(i.debugSearch=t.value,f())});f();function f(){var r,a,n,s;const e=((r=i.activeTrigger)==null?void 0:r.intensity)??((a=i.scoreFlash)==null?void 0:a.intensity)??"low",t=((n=i.activeTrigger)==null?void 0:n.kind)??((s=i.scoreFlash)==null?void 0:s.kind)??"chain:step";H.innerHTML=`
    <div class="app-shell fx-${e} kind-${ia(t)} ${i.activeTrigger?"chain-live":""}">
      ${Pt()}
      <main class="paper-field">${Ft()}</main>
      ${qt()}
      ${Ut()}
      ${br()}
    </div>
  `}function Lt(e){const t=document.getElementById(e);if(!t)throw new Error(`Missing #${e}`);return t}function Pt(){const e=re().join(" / ");return`
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">准</span>
        <span>请选择你的高考遗物</span>
      </div>
      <div class="topbar-actions">
        <span class="topbar-subjects">${p(e)}</span>
        ${x?`<span class="local-mode debug-mode-chip">DEBUG ${i.debugArtifactIds.length}</span>`:""}
        <span class="seed">SEED ${p(i.seed)}</span>
        <button class="ghost-button" type="button" data-action="restart">重开</button>
      </div>
    </header>
  `}function Ft(){return i.sharedReport&&i.phase==="start"?yr(i.sharedReport):i.phase==="start"?Yt():i.phase==="draft"&&i.choicePrompt?zt(i.choicePrompt):i.phase==="exam"&&i.activeExam?rr():i.phase==="result"&&i.result?hr(i.result):Vt()}function qt(){if(i.phase==="exam"||!i.activeTrigger)return"";const e=i.activeTrigger,t=e.scoreDelta,r=typeof t=="number"&&Math.abs(t)>1e-4?`分数 ${_(t)}`:e.effectText||"联动生效";return`
    <div class="global-trigger-toast toast-${e.tone} toast-${e.intensity}" role="status">
      <span>${e.replay?"复触发":"触发"}</span>
      <strong>${p(e.label)}</strong>
      <small>${p(r)}</small>
    </div>
  `}function Ut(){const e=i.scoreChoicePrompt;if(!e)return"";const t=e.mode==="onesDigit"?"更改个位分数":"交换分数数字",r=e.mode==="onesDigit"?"选择一个个位数字后继续结算。":"选择两个分数位数，或跳过本次交换。";return`
    <section class="score-choice-backdrop" role="dialog" aria-modal="true" aria-label="${t}">
      <div class="score-choice-panel">
        <div class="score-choice-head">
          <p class="mono-label">SCORE CORRECTION</p>
          <h2>${t}</h2>
          <span>${h[e.subject]} 原始分 ${y(e.score)}</span>
        </div>
        <p>${r}</p>
        ${e.mode==="onesDigit"?`<div class="score-choice-grid">${e.options.map((a,n)=>Gt(a,n)).join("")}</div>`:Xt(e)}
      </div>
    </section>
  `}function Gt(e,t){const r=e.delta>1e-4,a=e.delta<-1e-4;return`
    <button class="score-choice-option ${r?"better":a?"worse":"same"}" type="button" data-score-choice="${t}">
      <span>${p(e.label)}</span>
      <strong>${y(e.preview)}</strong>
      <small>${_(e.delta)}</small>
    </button>
  `}function Xt(e){const t=Oe(e.score);return`
    <div class="score-swap-picker">
      <div class="score-swap-number" aria-label="当前分数数字">
        ${t.map((r,a)=>Ht(e,r,a,t.length)).join("")}
      </div>
      <div class="score-choice-actions">
        ${e.selectedPosition!==void 0?'<button class="secondary-button" type="button" data-action="reset-score-swap">重选第一位</button>':""}
        <button class="secondary-button" type="button" data-action="skip-score-swap">跳过交换</button>
      </div>
    </div>
  `}function Ht(e,t,r,a){const n=e.selectedPosition===r,s=e.selectedPosition!==void 0&&!n,o=s?Wr(e.score,[e.selectedPosition,r]):e.score,c=V(o-e.score),u=n?"已选":s?`${y(o)} ${_(c)}`:pe(r,a);return`
    <button
      class="score-position-button ${n?"selected":""} ${s?"candidate":""}"
      type="button"
      data-score-position="${r}"
    >
      <span>${pe(r,a)}</span>
      <strong>${p(t)}</strong>
      <small>${p(u)}</small>
    </button>
  `}function Yt(){return`
    <section class="start-screen">
      <div class="start-layout">
        <section class="start-panel answer-card-panel">
          <div class="answer-card-title">
            <p class="mono-label">ADMISSION CARD</p>
            <h1>请选择你的高考遗物</h1>
          </div>
          <div class="answer-card-sheet" aria-label="答题卡开局设置">
            <div class="sheet-secret-line">姓名、准考证号填写处</div>
            ${we(i.subjects)}
            <div class="sheet-bubbles" aria-hidden="true">
              ${Array.from({length:36},(e,t)=>Wt(t)).join("")}
            </div>
          </div>
          <div class="rules-note">
            <div><span>必考</span><strong>${F.map(e=>h[e]).join(" / ")}</strong></div>
            <div><span>选科</span><strong>${Rr()}</strong></div>
            <div><span>遗物</span><strong>${x?`DEBUG ${i.debugArtifactIds.length} 件`:"开局 6 抽"}</strong></div>
          </div>
          <div class="start-actions">
            <button class="primary-button full-width" type="button" data-action="start-run">开始考试</button>
          </div>
        </section>
        <aside class="visual-ticket ${x?"answer-card-debug":""}">
          <div class="ticket-stamp">${x?"DEBUG":"开考"}</div>
          ${x?Jt():`<div class="ticket-copy">
                  <span>ANSWER SHEET</span>
                  <strong>填涂完毕后开考</strong>
                  <span>${p(re().join(" / "))}</span>
                </div>`}
        </aside>
      </div>
    </section>
  `}function Wt(e){return`<span class="${i.subjects.length*3>e||e%11===0?"filled":""}"></span>`}function Vt(){return`
    <section class="result-screen shared-result-screen">
      <div class="result-card">
        <p class="mono-label">LOADING SCORE</p>
        <h1>正在读取战报</h1>
        <p>如果这是静态 GitHub Pages 链接，稍后会自动回到本地开局。</p>
      </div>
    </section>
  `}function zt(e){const t=!e.discard&&i.exams.length===0&&!i.activeExam&&e.reason==="开局遗物",r=Math.min(6,e.sequence),a=i.subjects;return`
    <section class="draft-screen">
      <div class="draft-heading">
        <p class="mono-label">${e.discard?"OVERFLOW DISCARD":t?`OPENING ROLL ${r}/6`:"NEXT SUBJECT ROLL"}</p>
        <h1>${e.discard?"遗物已达上限":t?`请选择你的遗物 ${r}/6`:"请选择你的遗物"}</h1>
        ${e.discard?"<p>选择一件遗物丢弃，为新遗物腾出位置。</p>":""}
        ${t?we(a):""}
      </div>
      <div class="draft-grid">
        ${e.choices.map((n,s)=>er(n,s)).join("")}
      </div>
      ${e.discard?"":'<button class="secondary-button skip-draft-button" type="button" data-action="skip-draft">跳过，不拿遗物</button>'}
      ${tr()}
    </section>
  `}function we(e){return`
    <div class="ticket-profile">
      <label class="player-name-field">
        <span>考生姓名</span>
        <input
          data-field="player-name"
          value="${z(i.playerName)}"
          placeholder="输入你的名字"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
      </label>
      <div class="subject-picker" aria-label="选科">
        <div class="subject-picker-head">
          <span>选科</span>
          <strong>${re().join(" / ")}</strong>
        </div>
        <div class="subject-chip-row">
          ${X.map(t=>Zt(t,e.includes(t))).join("")}
        </div>
      </div>
    </div>
  `}function Jt(){const e=[];for(const r of i.debugArtifactIds){const a=Ae(r);a&&e.push(a)}const t=Or();return`
    <div class="debug-builder">
      <div class="debug-head">
        <div>
          <p class="mono-label">DEBUG BUILD</p>
          <h2>任意构筑遗物组</h2>
        </div>
        <button class="secondary-button" type="button" data-action="clear-debug-build">清空</button>
      </div>
      <div class="debug-selected">
        ${e.length?e.map((r,a)=>`
                    <button class="debug-selected-chip rarity-${O(r.rarity)}" type="button" data-action="remove-debug-artifact" data-debug-index="${a}">
                      <span>${p(r.name)}</span>
                      <strong>×</strong>
                    </button>
                  `).join(""):'<span class="debug-empty">未放入遗物；开始考试将以空构筑进入考试。</span>'}
      </div>
      <label class="debug-search">
        <span>搜索遗物</span>
        <input
          data-field="debug-search"
          value="${z(i.debugSearch)}"
          placeholder="名称 / 描述 / tag / id"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
      </label>
      <div class="debug-artifact-list">
        ${t.length?t.map(r=>Kt(r)).join(""):'<div class="debug-empty">没有匹配的遗物。</div>'}
      </div>
    </div>
  `}function Kt(e){const t=i.debugArtifactIds.filter(n=>n===e.id).length,r=e.maxCopies??1,a=t>=r;return`
    <button
      class="debug-artifact-option rarity-${O(e.rarity)}"
      type="button"
      data-action="add-debug-artifact"
      data-artifact-id="${z(e.id)}"
      ${a?"disabled":""}
    >
      <span class="rarity">${W(e.rarity)}</span>
      <strong>${p(e.name)}</strong>
      <small>${p(e.description)}</small>
      <em>${t}/${r}</em>
    </button>
  `}function Ae(e){return G.find(t=>t.id===e)}function Zt(e,t){return`
    <button type="button" class="${t?"subject-chip active":"subject-chip"}" data-subject="${e}">
      ${h[e]}
    </button>
  `}function er(e,t){return`
    <button class="draft-card rarity-${O(e.rarity)}" type="button" data-choice="${t}">
      <div class="draft-card-top">
        <div class="term-corner">
          <span class="rarity">${W(e.rarity)}</span>
        </div>
      </div>
      <h2>${p(e.name)}</h2>
      <p>${p(e.description)}</p>
    </button>
  `}function tr(){return i.artifacts.length===0?"":`
    <div class="existing-build">
      <span class="mono-label">CURRENT BUILD</span>
      <div class="tag-row">
        ${i.artifacts.map(e=>`<span>${p(e.name)}</span>`).join("")}
      </div>
    </div>
  `}function rr(){var n,s;const e=i.activeExam,t=i.currentQuestion,r=Math.max(0,15-Math.min(15,e.questionIndex));return`
    <section class="game-grid compact-exam-grid">
      <section class="exam-stage exam-paper fx-stage fx-${((n=i.activeTrigger)==null?void 0:n.intensity)??((s=i.scoreFlash)==null?void 0:s.intensity)??"low"}" aria-label="当前答题与词条触发">
        ${ar(e,r)}
      ${or()}
      ${sr()}
      <div class="exam-priority">
        ${ir(e,t)}
        ${cr()}
        </div>
        <div class="exam-controls">
          <button class="primary-button" type="button" data-action="next-question" ${i.waitingNext?"":"disabled"}>判定下一题</button>
          <button class="secondary-button" type="button" data-action="toggle-auto">${i.autoPlay?"暂停自动":"继续自动"}</button>
          <button class="secondary-button" type="button" data-action="sprint">快速跳过</button>
        </div>
      </section>
      <section class="support-drawers" aria-label="次要信息">
        ${lr(e,r)}
        ${dr()}
        ${gr()}
        ${mr()}
      </section>
    </section>
  `}function L(e,t,r,a="当前"){var c,u,l;const n=(u=(c=i.activeTrigger)==null?void 0:c.deltas)==null?void 0:u.find(d=>d.key===r),s=n?((l=i.activeTrigger)==null?void 0:l.intensity)??"low":"low",o=r==="questionMultiplier"||r==="examMultiplier"?aa(i.liveStatus[r]):"cool";return`
    <div class="paper-status-tile status-${r} heat-${o} ${n?`status-pulse intensity-${s}`:""}">
      ${n?`<b class="status-delta">${_(n.value,r)}</b>`:""}
      <span>${e}</span>
      <strong>${t}</strong>
      <small>${n?`${y(n.before)} -> ${y(n.after)}`:a}</small>
    </div>
  `}function ar(e,t){const r=Math.min(15,e.questionIndex),a=i.exams.reduce((c,u)=>c+u.score,0)+e.score+i.scoreAdjustment,n=Math.min(100,r/15*100),s=i.activeTrigger,o=s??i.scoreFlash;return`
    <div class="exam-paper-header compact-paper-header">
      <span class="secret-line">★ 考试状态 ★</span>
      <div class="paper-id-pattern" aria-hidden="true">
        <span>准考证号 ${p(i.seed.slice(0,10).toUpperCase())}</span>
        <i></i>
      </div>
      <div class="paper-status-layout" aria-label="当前考试状态">
        <div class="paper-title-block compact-paper-title">
          <p class="mono-label">AUTO EXAM STATUS</p>
          <h2>${h[e.subject]}</h2>
          <small>第 ${e.index+1}/${Y().length} 场 · 答题点 ${r}/15 · 剩余 ${t}</small>
        </div>
        <div class="paper-score-total score-box-total ${o?`score-flash flash-${o.intensity}`:""}">
          <span>总分</span>
          <strong class="${a>750?"over-score":""}">${Math.round(a)}</strong>
          <small>${(o==null?void 0:o.kind)==="score:add"?p(o.label):"累计"}</small>
        </div>
        <div class="paper-status-grid">
          ${L("正确率",`${y(i.liveStatus.accuracy)}%`,"accuracy")}
          ${L("本题倍率",`x${y(i.liveStatus.questionMultiplier)}`,"questionMultiplier")}
          ${L("考试倍率",`x${y(i.liveStatus.examMultiplier)}`,"examMultiplier")}
          ${L("体力",`${y(i.liveStatus.stamina)}%`,"stamina",`基础 ${y(i.liveStatus.baseStamina)}%`)}
        </div>
      </div>
      ${s?`<div class="paper-trigger-banner status-trigger-banner banner-${s.tone}">
              <span>${s.replay?"复触发":"触发"}</span>
              <strong>${p(s.label)}</strong>
              <small>${p(s.effectText||"联动生效")}</small>
            </div>`:""}
      <div class="paper-progress-row">
        <div class="budget-bar" aria-label="答题点进度"><span style="width:${n}%"></span></div>
        <div class="budget-text">
          <span>答题点 ${r} / 15</span>
          <span>CHAIN ${i.chainCount}</span>
        </div>
      </div>
    </div>
  `}function ir(e,t){const r=t?t.correct?"result-success":"result-fail":"result-pending",a=Math.max(1,e.questionIndex);return`
    <article class="question-card ${r}">
      <div class="scanline"></div>
      <div class="question-top">
        <span class="mono-label">QUESTION ${String(a).padStart(2,"0")}</span>
        <span class="score-pill">10 分</span>
      </div>
      <h1>${h[e.subject]} 第 ${a} 题</h1>
      <div class="question-meta">
        <span>${h[e.subject]}</span>
        <span>正确率 ${(t==null?void 0:t.accuracy)??"--"}%</span>
        <span>掷骰 ${(t==null?void 0:t.roll)??"--"}</span>
      </div>
      <div class="answer-grid">
        ${Array.from({length:15},(n,s)=>nr(s+1)).join("")}
      </div>
      <div class="tag-row large">
        <span>体力 ${t?`${t.staminaBefore}->${t.staminaAfter}`:"--"}</span>
        <span>本题 ${(t==null?void 0:t.scoreGained)??0} 分</span>
      </div>
      <div class="result-stamp">${t?t.correct?"成功":"失误":"等待判定"}</div>
    </article>
  `}function nr(e){var s;const t=i.examQuestions.find(o=>o.questionIndex===e),r=((s=i.activeExam)==null?void 0:s.questionIndex)===e&&!t?" active":"";if(!t)return`<span class="answer-pending${r}" data-index="${e}" title="第 ${e} 题：待判"></span>`;const a=t.correct?"answer-success":"answer-fail",n=t.correct?"成功":"失误";return`<span class="${a}${r}" data-index="${e}" title="第 ${e} 题：${n} ${t.scoreGained}/10"></span>`}function sr(){var n;const e=i.activeTrigger??i.scoreFlash;if(!e)return'<div class="trigger-overlay" aria-hidden="true"></div>';const t=(n=e.deltas)==null?void 0:n.sort((s,o)=>Math.abs(o.value)-Math.abs(s.value))[0],r=e.scoreDelta,a=typeof r=="number"&&Math.abs(r)>1e-4?`分数 ${_(r)}`:t?`${p(t.label)} ${_(t.value,t.key)}`:"";return`
    <div class="trigger-overlay" aria-hidden="true">
      <span class="float-event float-${e.tone} float-${e.intensity}">
        <strong>${p(e.label)}</strong>
        ${a?`<small>${a}</small>`:""}
      </span>
    </div>
  `}function or(){const e=i.activeTrigger??i.scoreFlash;return!e||e.intensity==="low"?'<div class="screen-fx" aria-hidden="true"></div>':`
    <div class="screen-fx screen-fx-${e.intensity}" aria-hidden="true">
      <i class="fx-scan"></i>
      <i class="fx-shockwave"></i>
      <i class="fx-sparks"></i>
    </div>
  `}function cr(){var s,o,c,u;const e=new Set([(s=i.activeTrigger)==null?void 0:s.artifactId].filter(Boolean)),t=i.artifacts.filter(l=>e.has(l.id)),r=(t.length>0?t:i.artifacts).slice(0,8),a=((o=i.activeTrigger)==null?void 0:o.intensity)??"low",n=i.triggerQueue.filter(l=>{var d;return l.id!==((d=i.activeTrigger)==null?void 0:d.id)}).slice(0,4);return`
    <aside class="trigger-term-stage chain-${a}">
      <div class="trigger-stage-head">
        <div><p class="mono-label">TRIGGER ZONE</p><h2>触发词条</h2></div>
        <span class="chain-count chain-${a}">CHAIN ${i.chainCount}</span>
      </div>
      <div class="trigger-event-stack">
        ${i.activeTrigger?[i.activeTrigger,...n].map((l,d)=>`<span class="event-chip chip-${l.tone} chip-${l.intensity} ${d===0?"current":"queued"}">${p(l.label)}</span>`).join(""):""}
      </div>
      ${i.activeTrigger?`<div class="trigger-beam beam-${i.activeTrigger.intensity}"></div>`:""}
      ${(u=(c=i.activeTrigger)==null?void 0:c.deltas)!=null&&u.length?`<div class="trigger-delta-row">
              ${i.activeTrigger.deltas.map(l=>`<span>${p(l.label)} ${_(l.value,l.key)}</span>`).join("")}
            </div>`:""}
      <div class="trigger-card-strip">
        ${r.length>0?r.map(l=>ur(l,e.has(l.id))).join(""):'<article class="trigger-mini-card empty"><strong>还没抽词条</strong></article>'}
      </div>
    </aside>
  `}function ur(e,t){return`
    <article class="trigger-mini-card rarity-${O(e.rarity)} ${t?"triggered":""}">
      <div class="term-corner mini">
        <span class="rarity">${W(e.rarity)}</span>
      </div>
      <strong>${p(e.name)}</strong>
    </article>
  `}function lr(e,t){return`
    <details class="mobile-drawer state-drawer">
      <summary><span>考试状态</span><strong>${t} 题待判</strong></summary>
      <div class="subject-list">
        ${Y().map((r,a)=>{const n=i.exams.find(c=>c.subject===r),s=e.subject===r,o=n?n.score:s?Math.round(e.score):"--";return`<div class="subject-row ${s?"active":""} ${n?"done":""}"><span>${a+1}. ${h[r]}</span><strong>${o}</strong></div>`}).join("")}
      </div>
      <div class="stat-block">
        <div class="stat-row"><span>答对</span><strong>${i.examQuestions.filter(r=>r.correct).length}</strong></div>
        <div class="stat-row"><span>答错</span><strong>${i.examQuestions.filter(r=>!r.correct).length}</strong></div>
        <div class="stat-row"><span>当前正确率</span><strong>${y(i.liveStatus.accuracy)}%</strong></div>
        <div class="stat-row"><span>本题倍率</span><strong>x${y(i.liveStatus.questionMultiplier)}</strong></div>
        <div class="stat-row"><span>考试倍率</span><strong>x${y(i.liveStatus.examMultiplier)}</strong></div>
        <div class="stat-row"><span>体力</span><strong>${y(i.liveStatus.stamina)}%</strong></div>
        <div class="stat-row"><span>基础体力</span><strong>${y(i.liveStatus.baseStamina)}%</strong></div>
        <div class="stat-row"><span>自动</span><strong>${i.autoPlay?"ON":"OFF"}</strong></div>
      </div>
    </details>
  `}function dr(){return`
    <details class="mobile-drawer terms-drawer">
      <summary><span>准考证词条库</span><strong>${i.artifacts.length} 条</strong></summary>
      <div class="panel-title">
        <p class="mono-label">ADMISSION TICKET</p>
        <h2>准考证词条</h2>
      </div>
      <div class="term-list">
        ${i.artifacts.map(e=>pr(e)).join("")}
      </div>
    </details>
  `}function pr(e){const t=i.visualEvents.some(r=>r.artifactId===e.id);return`
    <article class="term-card rarity-${O(e.rarity)} ${t?"triggered":""}">
      <div class="term-card-head">
        <div class="term-corner">
          <span class="rarity">${W(e.rarity)}</span>
        </div>
      </div>
      <h3>${p(e.name)}</h3>
      <p>${p(e.description)}</p>
    </article>
  `}function gr(){return`
    <details class="mobile-drawer help-drawer">
      <summary><span>帮助文档</span><strong>规则 / 体力 / 操作</strong></summary>
      ${Te()}
    </details>
  `}function Te(){return`
    <div class="help-doc">
      <section>
        <h3>开局</h3>
        <p>先进行 6 次开局 4 选 1 遗物，再完成语文、数学、英语和 3 门自选科目的 6 场考试。</p>
      </section>
      <section>
        <h3>题目</h3>
        <p>每科 15 题，每题基础 10 分，单科满分 150 分，六科标准满分 900 分；答对得 10 x 本题倍率，答错通常不得分。</p>
      </section>
      <section>
        <h3>正确率</h3>
        <p>判题时先算最终正确率 = 基础正确率 x 当前体力 / 100 + 本题正确率加成，再被相关遗物修正；随机掷骰小于正确率则答对，判定区间按 0% 到 100% 夹紧。</p>
      </section>
      <section>
        <h3>体力与倍率</h3>
        <p>默认基础体力 100%，每题结算后体力 -5%。每科开考前体力恢复到基础体力；本题倍率只影响当前题，本场倍率在交卷时乘到本场原始分。</p>
      </section>
      <section>
        <h3>无尽模式</h3>
        <p>分数超过 750 可进入无尽模式。之后每年保留遗物，每科前获得一次 4 选 1，通关门槛从 750 开始每年上涨 30%。</p>
      </section>
      <section>
        <h3>操作</h3>
        <p>自动模式会连续判题；暂停自动后可以手动点击“判定下一题”；“快速跳过”会把剩余流程高速播放完。</p>
      </section>
    </div>
  `}function mr(){return`
    <details class="mobile-drawer log-drawer">
      <summary><span>连锁日志</span><strong>${i.logs.length} 条</strong></summary>
      ${Me()}
    </details>
  `}function Me(){return`
    <section class="event-log">
      <div class="event-log-head"><span class="mono-label">CHAIN LOG</span><span>${i.logs.length} 条</span></div>
      <div class="event-log-list">
        ${i.logs.slice(-60).reverse().map(e=>`<p class="log-${fr(e)}">${p(e)}</p>`).join("")}
      </div>
    </section>
  `}function fr(e){return e.startsWith("触发遗物")||e.startsWith("获得遗物")?"good":e.includes("失去")||e.includes("错误")||e.includes("丢弃")?"warn":"wild"}function hr(e){const t=Math.max(0,e.totalScore-750),r=e.totalScore>e.threshold,a=Ie(e.threshold),n=xe(e.totalScore);return`
    <section class="result-screen">
      <div class="result-card">
        <p class="mono-label">${i.endlessActive?`ENDLESS YEAR ${e.year}`:"FINAL SCORE"}</p>
        <div class="final-score ${e.totalScore>750?"over-score":""}">${e.totalScore}</div>
        <h1>${n}</h1>
        <p>${p(i.playerName||"考生")} 的六科已交卷。你的准考证上共有 ${i.artifacts.length} 条词条，当前门槛 ${e.threshold} 分，溢出分 ${t}。</p>
        <div class="endless-panel ${r?"passed":"failed"}">
          <div>
            <span>${r?"无尽模式可继续":"本轮战报封存"}</span>
            <strong>${r?`下一年门槛 ${a}`:`未超过 ${e.threshold}`}</strong>
          </div>
          <p>${r?"进入下一年后，保留当前遗物组；每科开考前获得一次 4 选 1，分数门槛上涨 30%。":"超过 750 分后才可进入无尽模式；无尽年需要继续超过当年门槛。"}</p>
        </div>
        ${vr(e,n,t)}
        <div class="result-subjects">
          ${e.exams.map(s=>`<div><span>${h[s.subject]}</span><strong>${s.score}</strong></div>`).join("")}
        </div>
        <div class="result-actions">
          ${r?`<button class="primary-button" type="button" data-action="continue-endless">进入第 ${e.year+1} 年</button>`:""}
          <button class="secondary-button" type="button" data-action="copy-share-link">复制战报链接</button>
          <button class="secondary-button" type="button" data-action="restart">重新开始</button>
        </div>
      </div>
      ${Me()}
    </section>
  `}function vr(e,t,r){return`
    <section class="share-card-preview" aria-label="分享卡片预览">
      <div class="share-card-paper">
        <div class="share-card-head">
          <div><span class="mono-label">REPORT CARD</span><strong>准考证战报</strong></div>
          <span>${e.year>1?`YEAR ${e.year}`:r>0?`OVER +${r}`:"本地战报"}</span>
        </div>
        <div class="share-card-candidate"><span>考生</span><strong>${p(i.playerName||"考生")}</strong></div>
        <div class="share-card-score ${e.totalScore>750?"over-score":""}">${e.totalScore}</div>
        <h2>${t}</h2>
        <div class="share-card-meta">
          <span>SEED ${p(e.seed)}</span>
          <span>门槛 ${e.threshold}</span>
        </div>
        <div class="share-card-hand"><span>无尽年</span><strong>${e.year}</strong></div>
        <div class="share-card-subjects">
          ${e.exams.map(a=>`<span>${h[a.subject]} <strong>${a.score}</strong></span>`).join("")}
        </div>
        <div class="share-card-terms">
          ${i.artifacts.slice(-6).reverse().map(a=>`<span class="rarity-text-${O(a.rarity)}">${p(a.name)}</span>`).join("")}
        </div>
      </div>
    </section>
  `}function yr(e){const t=Math.max(0,e.score-750);return`
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
  `}function xe(e){return e>=1e3?"满分已经失去行政意义":e>850?"招生办正在刷新页面":e>750?"分数溢出了答题卡":e>620?"稳定上岸，但准考证看起来不太合法":"命题组还活着"}function Ie(e){return Math.ceil(e*1.3)}function br(){const e=Sr(),t=i.footerNotice?`<div class="footer-notice" role="status">${p(i.footerNotice)}</div>`:"";return`
    <footer class="info-footer">
      <details>
        <summary><span>帮助文档</span><strong>规则 / 体力 / 操作</strong></summary>
        <div class="footer-help">
          ${Te()}
        </div>
      </details>
      <details data-section="footer" ${i.footerOpen?"open":""}>
        <summary><span>发布信息</span><strong>反馈 / 赞赏 / 排名</strong></summary>
        <div class="footer-grid">
          <a class="footer-option" href="${z(e)}" target="_blank" rel="noreferrer">
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
  `}async function Er(){const e=Ce();try{await navigator.clipboard.writeText(e),U("Issue 模板已复制，可以直接粘贴到 GitHub。")}catch{U("浏览器禁止剪贴板写入，请直接点击提交 GitHub Issue。")}}function Sr(){return`https://github.com/WhiteGiver-Plus/GaokaoArtifact/issues/new?${new URLSearchParams({title:`[反馈] ${i.phase} / seed ${i.seed}`,body:Ce()}).toString()}`}async function $r(){const e=i.result;if(!e)return;const t=wr(e);try{await navigator.clipboard.writeText(t),U("战报链接已复制。")}catch{U(t)}}function wr(e){const t={playerName:i.playerName||"考生",seed:e.seed,score:e.totalScore,year:e.year,threshold:e.threshold,title:xe(e.totalScore),subjects:e.exams.map(n=>({label:h[n.subject],score:String(n.score)})),artifacts:i.artifacts.slice(-6).reverse().map(n=>n.name)},r=new URLSearchParams({report:Tr(t)}),a=new URL(window.location.href);return a.search=r.toString(),a.hash="",a.toString()}function Ar(){try{const e=new URLSearchParams(window.location.search).get("report");return e?Mr(JSON.parse(decodeURIComponent(escape(window.atob(e))))):void 0}catch{return}}function Tr(e){return window.btoa(unescape(encodeURIComponent(JSON.stringify(e))))}function Mr(e){if(!e||typeof e!="object")return;const t=e;if(!(typeof t.playerName!="string"||typeof t.seed!="string"||typeof t.score!="number"||typeof t.year!="number"||typeof t.threshold!="number"||typeof t.title!="string"||!Array.isArray(t.subjects)||!Array.isArray(t.artifacts)))return{playerName:t.playerName,seed:t.seed,score:Math.round(t.score),year:Math.max(1,Math.round(t.year)),threshold:Math.max(750,Math.round(t.threshold)),title:t.title,subjects:t.subjects.filter(r=>!!(r&&typeof r=="object"&&typeof r.label=="string"&&typeof r.score=="string")).slice(0,12),artifacts:t.artifacts.filter(r=>typeof r=="string").slice(0,12)}}function Ce(){const e=xr();return["反馈类型：Bug / 平衡性 / 文案 / 其它","一句话描述：","","复现步骤：","1. ","2. ","3. ","","期望表现：","","实际表现：","","诊断信息：",JSON.stringify(e,null,2)].join(`
`)}function xr(){var e;return{app:"请选择你的高考遗物",capturedAt:new Date().toISOString(),url:window.location.href,userAgent:navigator.userAgent,seed:i.seed,playerName:i.playerName||"考生",phase:i.phase,subjects:Y().map(t=>h[t]),autoPlay:i.autoPlay,speedMs:i.speedMs,liveStatus:i.liveStatus,score:((e=i.result)==null?void 0:e.totalScore)??Ir(),exams:i.exams.map(t=>({subject:h[t.subject],score:t.score})),currentExam:i.activeExam?{subject:h[i.activeExam.subject],questionIndex:i.activeExam.questionIndex,score:Math.round(i.activeExam.score)}:void 0,artifacts:i.artifacts.map(t=>({id:t.id,name:t.name,rarity:t.rarity})),recentQuestions:i.examQuestions.slice(-8).map(t=>({subject:h[t.subject],questionIndex:t.questionIndex,correct:t.correct,scoreGained:t.scoreGained})),recentLogs:i.logs.slice(-12)}}function Ir(){var e;return Math.round(i.exams.reduce((t,r)=>t+r.score,0)+(((e=i.activeExam)==null?void 0:e.score)??0)+i.scoreAdjustment)}function U(e){i.footerNotice=e,f(),window.setTimeout(()=>{i.footerNotice===e&&(i.footerNotice=void 0,f())},3200)}function Cr(e){_r()&&X.includes(e)&&(i.subjects.includes(e)||(i.subjects=[...i.subjects,e].slice(-3),f()))}function _r(){return i.phase==="start"||i.exams.length===0&&!i.activeExam&&i.artifacts.length<1}function Y(){return[...F,...i.subjects]}function re(){return Y().map(e=>h[e])}function Rr(){return i.subjects.map(e=>h[e]).join(" / ")||"未选择"}function Or(){const e=i.debugSearch.trim().toLowerCase();return(e?K().filter(r=>Nr(r).includes(e)):K()).slice(0,60)}function K(){return G}function Nr(e){return[e.id,e.name,e.description,e.rarity,e.tags.join(" ")].join(" ").toLowerCase()}function Dr(e){const t=Ae(e);!t||i.debugArtifactIds.filter(a=>a===e).length>=(t.maxCopies??1)||(i.debugArtifactIds=[...i.debugArtifactIds,e],ae(),f())}function Qr(e){!Number.isInteger(e)||e<0||e>=i.debugArtifactIds.length||(i.debugArtifactIds=i.debugArtifactIds.filter((t,r)=>r!==e),ae(),f())}function ae(){if(x)try{window.localStorage.setItem("gaokao-debug-artifacts",JSON.stringify(i.debugArtifactIds))}catch{}}function jr(){try{const e=window.localStorage.getItem("gaokao-debug-artifacts"),t=e?JSON.parse(e):[];if(!Array.isArray(t))return[];const r=new Set(K().map(a=>a.id));return t.filter(a=>typeof a=="string"&&r.has(a))}catch{return[]}}function Br(){const e=window.location.pathname.replace(/\/+$/,"");return e.endsWith("/debug")||e.endsWith("/debug/index.html")}function O(e){return e==="special"?"legendary":e==="rare"?"epic":e==="uncommon"?"rare":"common"}function W(e){return e==="special"?"传说":e==="rare"?"史诗":e==="uncommon"?"稀有":"普通"}function ie(){i.artifacts=[],i.exams=[],i.examQuestions=[],i.logs=[],i.visualEvents=[],i.triggerQueue=[],i.activeTrigger=void 0,i.liveStatus={accuracy:50,questionMultiplier:1,examMultiplier:1,baseStamina:100,stamina:100},i.chainCount=0,i.scoreFlash=void 0,i.scoreAdjustment=0,i.draftSequence=0,i.choicePrompt=void 0,i.activeExam=void 0,i.currentQuestion=void 0,i.waitingNext=void 0,i.result=void 0,i.sharedReport=void 0,i.scoreChoicePrompt=void 0,i.speedMs=920}function kr(e){i.runId+=1,i.seed=De(),ie(),i.phase="start",f()}async function Lr(e){i.runId+=1,i.endlessActive=!1,i.endlessYear=1,i.scoreThreshold=750,ie(),i.phase="loading",f();const t=i.runId,r=x?i.debugArtifactIds.slice():void 0,a={seed:i.seed,subjects:i.subjects,initialArtifacts:r,autoPolicy:r?"first":void 0};await ve(G,a,_e(t)),b(t)&&f()}async function Pr(){const e=i.result;if(!e||e.totalScore<=e.threshold)return;i.runId+=1,i.endlessActive=!0,i.endlessYear=e.year+1,i.scoreThreshold=Ie(e.threshold),i.seed=`${e.seed}-Y${i.endlessYear}`,ie(),i.phase="loading",f();const t=i.runId,r={seed:i.seed,subjects:i.subjects,initialArtifacts:e.artifactIds,initialArtifactMode:"load",carryoverStats:e.carryoverStats,year:i.endlessYear,threshold:i.scoreThreshold,openingDrafts:0,preExamDrafts:!0,postExamDrafts:!1};await ve(G,r,_e(t)),b(t)&&f()}function _e(e){return{chooseArtifact:(t,r)=>de(e,t,r,!1),chooseDiscard:t=>de(e,t,"遗物已达上限",!0),onLog:t=>{b(e)&&(i.logs=[...i.logs,t],ra(t))},onTrigger:async t=>{b(e)&&await zr(e,t)},chooseOnesDigit:async(t,r)=>await Fr(e,t,r)??9,chooseDigitSwap:(t,r)=>qr(e,t,r),onArtifactsChanged:t=>{b(e)&&(i.artifacts=t)},onExamStart:t=>{b(e)&&(i.phase="exam",i.examQuestions=[],i.visualEvents=[],i.triggerQueue=[],i.activeTrigger=void 0,i.chainCount=0,i.scoreFlash=void 0,i.scoreAdjustment=0,i.currentQuestion=void 0,i.liveStatus=t.status,i.activeExam={index:t.index,subject:t.subject,questionIndex:0,score:t.startingScore},f())},beforeQuestion:async t=>{var r;b(e)&&(i.phase="exam",i.liveStatus=t.status,i.activeTrigger=void 0,i.triggerQueue=[],i.chainCount=0,i.scoreFlash=void 0,i.activeExam={index:t.index,subject:t.subject,questionIndex:t.questionIndex,score:((r=i.activeExam)==null?void 0:r.score)??0},f(),await Vr(e))},onQuestion:(t,r)=>{if(!b(e))return;i.currentQuestion=t,i.examQuestions=[...i.examQuestions,t],i.liveStatus=r.status,i.activeExam={index:r.index,subject:r.subject,questionIndex:t.questionIndex,score:r.rawScore+r.examPostBonus},i.scoreAdjustment=r.currentTotalAdjustment;const a={id:`score-${Date.now()}-${t.questionIndex}`,label:t.correct?`+${t.scoreGained}`:"失误",tone:t.correct?"score":"fail",kind:t.correct?"score:add":"score:fail",intensity:ea(t.scoreGained,r.status)};i.scoreFlash=a,i.visualEvents=[a,...i.visualEvents].slice(0,12),f(),window.setTimeout(()=>{var n;((n=i.scoreFlash)==null?void 0:n.id)===a.id&&(i.scoreFlash=void 0,f())},i.speedMs>0?420:80)},onExamEnd:t=>{b(e)&&(i.exams=[...i.exams,t],i.activeExam=i.activeExam?{...i.activeExam,score:t.score}:i.activeExam,i.scoreAdjustment=0,f())},onRunEnd:t=>{b(e)&&(i.result=t,i.phase="result")}}}function de(e,t,r,a){return b(e)?(i.phase="draft",new Promise(n=>{const s=a?i.draftSequence:i.draftSequence+1;a||(i.draftSequence=s),i.choicePrompt={reason:r,choices:t,discard:a,sequence:s,resolve:o=>{i.choicePrompt=void 0,n(o),f()}},f()})):Promise.resolve(0)}function Fr(e,t,r){const a=Math.round(t),n=Array.from({length:10},(s,o)=>{const c=Yr(a,o);return{label:`个位 ${o}`,value:o,preview:c,delta:V(c-a)}}).sort((s,o)=>o.preview-s.preview);return Re(e,{mode:"onesDigit",subject:r,score:a,options:n}).then(s=>typeof s=="number"?s:void 0)}function qr(e,t,r){const a=Math.round(t);return Re(e,{mode:"digitSwap",subject:r,score:a,options:[]}).then(n=>Array.isArray(n)?n:void 0)}function Re(e,t){return b(e)?new Promise(r=>{i.scoreChoicePrompt={...t,resolve:a=>{i.scoreChoicePrompt=void 0,r(a),f()}},f()}):Promise.resolve(void 0)}function Ur(e){const t=i.scoreChoicePrompt;if(!t)return;const r=t.options[e];r&&t.resolve(r.value)}function Gr(e){const t=i.scoreChoicePrompt;if(!t||t.mode!=="digitSwap")return;const r=Oe(t.score);if(!(!Number.isInteger(e)||e<0||e>=r.length)){if(t.selectedPosition===void 0){i.scoreChoicePrompt={...t,selectedPosition:e},f();return}if(t.selectedPosition===e){i.scoreChoicePrompt={...t,selectedPosition:void 0},f();return}t.resolve([t.selectedPosition,e])}}function Xr(){const e=i.scoreChoicePrompt;!e||e.mode!=="digitSwap"||e.resolve([0,0])}function Hr(){const e=i.scoreChoicePrompt;!e||e.mode!=="digitSwap"||(i.scoreChoicePrompt={...e,selectedPosition:void 0},f())}function Yr(e,t){return e-Math.abs(e)%10+t}function Wr(e,t){const r=e<0?-1:1,a=Math.abs(e).toString().split(""),[n,s]=t;return n<0||s<0||n>=a.length||s>=a.length||n===s?e:([a[n],a[s]]=[a[s],a[n]],r*Number(a.join("")))}function Oe(e){return Math.abs(Math.round(e)).toString().split("")}function pe(e,t){const r=["个位","十位","百位","千位","万位","十万位","百万位","千万位","亿位"],a=t-e-1;return r[a]??`第 ${e+1} 位`}function Vr(e){return b(e)?i.autoPlay?Ne(i.speedMs):new Promise(t=>{i.waitingNext=()=>{i.waitingNext=void 0,t(),f()}}):Promise.resolve()}async function zr(e,t){const r=Jr(t);i.chainCount+=1,i.triggerQueue=[...i.triggerQueue,r],i.activeTrigger=r,i.liveStatus=t.after,i.activeExam&&(i.activeExam={...i.activeExam,score:t.scoreAfter.currentExamScore+t.scoreAfter.examPostBonus}),i.scoreAdjustment=t.scoreAfter.currentTotalAdjustment,i.visualEvents=[r,...i.visualEvents].slice(0,12),f(),i.speedMs>0&&await Ne(Math.max(500,Math.min(620,i.speedMs*.55))),b(e)&&(i.triggerQueue=i.triggerQueue.filter(a=>a.id!==r.id))}function Jr(e){const t=V(e.scoreAfter.currentTotal-e.scoreBefore.currentTotal);return{id:`${Date.now()}-${e.slotIndex}-${e.triggerIndex}-${i.visualEvents.length}`,label:e.artifactName,tone:Math.abs(t)>1e-4?t>0?"score":"fail":e.replay?"chain":"term",kind:Kr(e),intensity:Zr(e,i.chainCount+1),artifactId:e.artifactId,effectText:e.effectText,deltas:ta(e.before,e.after),scoreDelta:t,scoreBefore:e.scoreBefore.currentTotal,scoreAfter:e.scoreAfter.currentTotal,slotIndex:e.slotIndex,replay:e.replay,chainIndex:i.chainCount+1}}function Kr(e){const t=e.scoreAfter.currentTotal-e.scoreBefore.currentTotal;if(Math.abs(t)>1e-4)return t>0?"score:add":"score:fail";const r=e.after.questionMultiplier-e.before.questionMultiplier,a=e.after.examMultiplier-e.before.examMultiplier;return e.after.examMultiplier>=50||e.after.questionMultiplier>=50?"jackpot:trigger":r>0||a>0?"multiplier:increase":e.replay?"chain:step":"multiplier:increase"}function Zr(e,t){const r=Math.max(e.after.questionMultiplier,e.after.examMultiplier),a=Math.abs(e.scoreAfter.currentTotal-e.scoreBefore.currentTotal),n=Math.max(e.after.questionMultiplier-e.before.questionMultiplier,e.after.examMultiplier-e.before.examMultiplier),s=Math.abs(e.after.stamina-e.before.stamina);return a>=250?"jackpot":a>=100?"high":a>=30?"medium":r>=50||n>=25||t>=10?"jackpot":r>=25||n>=10||t>=6?"high":r>=10||n>=2||s>=40||t>=3?"medium":"low"}function ea(e,t){const r=Math.max(t.questionMultiplier,t.examMultiplier);return e>=250||r>=50?"jackpot":e>=100||r>=25?"high":e>=30||r>=10?"medium":"low"}function ta(e,t){return[["accuracy","正确率"],["questionMultiplier","本题倍率"],["examMultiplier","考试倍率"],["baseStamina","基础体力"],["stamina","体力"]].map(([a,n])=>({key:a,label:n,value:V(t[a]-e[a]),before:e[a],after:t[a]})).filter(a=>Math.abs(a.value)>1e-4)}function V(e){return Math.round(e*1e4)/1e4}function ra(e){const t="触发遗物: ",r="获得遗物: ";if(!e.startsWith(t)&&e.startsWith(r)){const a=e.slice(r.length),n={id:`${Date.now()}-${i.visualEvents.length}`,label:a,tone:"chain",kind:"chain:step",intensity:"low"};i.visualEvents=[n,...i.visualEvents].slice(0,12)}}function b(e){return e===i.runId}function Ne(e){return new Promise(t=>window.setTimeout(t,e))}function De(){return Math.random().toString(36).slice(2,10)}function y(e){return String(Math.round(e*100)/100)}function _(e,t){const r=e>0?"+":"",a=t==="stamina"||t==="baseStamina"||t==="accuracy"?"%":"";return`${r}${y(e)}${a}`}function aa(e){return e>=50?"overdrive":e>=25?"hot":e>=10?"warm":"cool"}function ia(e){return e.replace(":","-")}function na(){try{return window.localStorage.getItem("gaokao-player-name")??"考生"}catch{return"考生"}}function p(e){return String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}function z(e){return p(e)}
