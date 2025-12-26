import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";

class CoCStatsCounter {
    createDefaultOption = (): Required<CoCStatOptions> => ({
        filter: (msg) => true,
        nameAliases: [],
        startIdx: 0,
        endIdx: Infinity
    })

    calc = (log: CcfoliaMessage[], _option?: CoCStatOptions) => {
        const option: Required<CoCStatOptions> = { ...this.createDefaultOption(), ..._option };
        let stat = new CoCStat()
        for (let msg of log.slice(option.startIdx, option.endIdx + 1)) {
            let sender = msg.sender;
            // 名前エイリアス処理
            for (let [before, after] of option.nameAliases) {
                if (sender === before) {
                    sender = after;
                }
            }
            if (msg.sender !== sender) {
                msg = { ...msg, sender };
            }
            // フィルター処理
            if (!option.filter(msg)) {
                continue;
            }
            // 統計追加処理
            this.incrementStat(stat.total, msg);
            if (sender !== "") {
                if (!stat.perCharacter.has(sender)) {
                    stat.perCharacter.set(sender, new CharacterStat());
                }
                this.incrementStat(stat.perCharacter.get(sender)!, msg);
            }
        }
        return stat;
    }

    calcAsync = async (log: CcfoliaMessage[], _option?: CoCStatOptions) => {
        const yieldNow = () => new Promise(resolve => setTimeout(resolve, 0));
        const option: Required<CoCStatOptions> = { ...this.createDefaultOption(), ..._option };
        let stat = new CoCStat()
        let i = 0;
        for (let msg of log.slice(option.startIdx, option.endIdx + 1)) {
            let sender = msg.sender;
            // 名前エイリアス処理
            for (let [before, after] of option.nameAliases) {
                if (sender === before) {
                    sender = after;
                }
            }
            if (msg.sender !== sender) {
                msg = { ...msg, sender };
            }
            // フィルター処理
            if (!option.filter(msg)) {
                continue;
            }
            // 統計追加処理
            this.incrementStat(stat.total, msg);
            if (sender !== "") {
                if (!stat.perCharacter.has(sender)) {
                    stat.perCharacter.set(sender, new CharacterStat());
                }
                this.incrementStat(stat.perCharacter.get(sender)!, msg);
            }
            if (i % 100 === 0) {
                await yieldNow();
            }
            i++;
        }
        return stat;
    }

    incrementStat = (stat: CharacterStat, msg: CcfoliaMessage) => {
        if (msg instanceof CoCSkillRollMessage) {
            this.incrementSkillStat(stat.skillRoll, msg);
            if (!stat.skillRoll.perSkill.has(msg.skill)) {
                stat.skillRoll.perSkill.set(msg.skill, new SkillStat());
            }
            this.incrementSkillStat(stat.skillRoll.perSkill.get(msg.skill)!, msg);
        }
        else if (msg instanceof ParamChangeMessage) {
            this.incrementStatusStat(stat, msg);
        }
        else if (msg instanceof SanityCheckMessage) {
            this.incrementSkillStat(stat.sanityCheck, msg);
        }
        else if (msg instanceof TalkMessage) {
            this.incrementTalkStat(stat, msg);
        }
    }

    incrementSkillStat = (stat: SkillStat, msg: CoCSkillRollMessage | SanityCheckMessage) => {
        stat.rollNum++;
        stat.valueSum += msg.diceValue;
        if (msg.isSuccess()) {
            stat.successNum++;
            if (msg.isCritical()) {
                stat.criticalNum++;
                if (msg.diceValue === 1) {
                    stat.spCriticalNum++;
                }
            }
        }
        else {
            stat.failNum++;
            if (msg.isFumble()) {
                stat.fumbleNum++;
                if (msg.diceValue === 100) {
                    stat.spFumbleNum++;
                }
            }
        }
    }

    incrementStatusStat = (stat: CharacterStat, msg: ParamChangeMessage) => {
        if (msg.paramName === "HP") {
            // HP変動
            if (stat.status.minHealth === undefined || msg.value < stat.status.minHealth) {
                stat.status.minHealth = msg.value;
            }
            if (msg.value < msg.prevValue) {
                // HP減少
                stat.status.totalDamage += msg.prevValue - msg.value;
            }
        }
        if (msg.paramName === "SAN") {
            // SAN変動
            if (stat.status.minSAN === undefined || msg.value < stat.status.minSAN) {
                stat.status.minSAN = msg.value;
            }
            if (msg.value < msg.prevValue) {
                // SAN減少
                stat.status.totalLostSAN += msg.prevValue - msg.value;
            }
        }
    }

    incrementTalkStat = (stat: CharacterStat, msg: TalkMessage) => {
        stat.talk.talkNum++;
        stat.talk.charNum += msg.text.length;
        const regex = msg.text.match(/^「(.*)」/);
        if (regex !== null) {
            stat.talk.pcTalkNum++;
            stat.talk.pcCharNum += regex[1].length;
        }
    }
}

export type CoCStatOptions = {
    filter?: (msg: CcfoliaMessage) => boolean
    nameAliases?: readonly [string, string][],
    startIdx?: number,
    endIdx?: number
}

export class CoCStat {
    total: CharacterStat = new CharacterStat()
    perCharacter: Map<string, CharacterStat> = new Map()

    merge(other: CoCStat): CoCStat {
        return Object.assign(new CoCStat(), {
            total: this.total.merge(other.total),
            perCharacter: (() => {
                const map = new Map<string, CharacterStat>()
                for (let [name, stat] of [...this.perCharacter, ...other.perCharacter]) {
                    const stat2 = map.get(name);
                    if (stat2 === undefined) {
                        map.set(name, stat);
                    }
                    else {
                        map.set(name, stat.merge(stat2));
                    }
                }
                return map;
            })()
        })
    }
};

export class CharacterStat {
    skillRoll: SkillStat & {
        perSkill: Map<string, SkillStat>
    } = Object.assign(new SkillStat(), { perSkill: new Map() })
    sanityCheck = new SkillStat()
    status = new StatusStat()
    talk = new TalkStat()

    merge(other: CharacterStat): CharacterStat {
        return Object.assign(new CharacterStat(), {
            skillRoll: Object.assign(new SkillStat(), {
                ...this.skillRoll.merge(other.skillRoll),
                perSkill: (() => {
                    const map = new Map<string, SkillStat>()
                    for (let [name, stat] of [...this.skillRoll.perSkill, ...other.skillRoll.perSkill]) {
                        const stat2 = map.get(name);
                        if (stat2 === undefined) {
                            map.set(name, stat);
                        }
                        else {
                            map.set(name, stat.merge(stat2));
                        }
                    }
                    return map;
                })()
            }),
            sanityCheck: this.sanityCheck.merge(other.sanityCheck),
            status: this.status.merge(other.status),
            talk: this.talk.merge(other.talk)
        })
    }
}

export class SkillStat {
    rollNum = 0
    valueSum = 0
    successNum = 0
    failNum = 0
    criticalNum = 0
    spCriticalNum = 0
    fumbleNum = 0
    spFumbleNum = 0

    merge(other: SkillStat): SkillStat {
        return Object.assign(new SkillStat(), {
            rollNum: this.rollNum + other.rollNum,
            valueSum: this.valueSum + other.valueSum,
            successNum: this.successNum + other.successNum,
            failNum: this.failNum + other.failNum,
            criticalNum: this.criticalNum + other.criticalNum,
            spCriticalNum: this.spCriticalNum + other.spCriticalNum,
            fumbleNum: this.fumbleNum + other.fumbleNum,
            spFumbleNum: this.spFumbleNum + other.spFumbleNum
        })
    }
}

export class StatusStat {
    totalDamage = 0
    minHealth: number | undefined = undefined
    totalLostSAN = 0
    minSAN: number | undefined = undefined

    merge(other: StatusStat): StatusStat {
        const min = (a?: number, b?: number) => {
            if (a === undefined && b === undefined) return undefined;
            if (a === undefined) return a;
            if (b === undefined) return a;
            return Math.min(a, b);
        }
        return Object.assign(new StatusStat(), {
            totalDamage: this.totalDamage + other.totalDamage,
            totalLostSAN: this.totalLostSAN + other.totalLostSAN,
            minHealth: min(this.minHealth, other.minHealth),
            minSAN: min(this.minSAN, other.minSAN),
        })
    }
}

export class TalkStat {
    talkNum = 0
    charNum = 0
    pcTalkNum = 0
    pcCharNum = 0

    merge(other: TalkStat): TalkStat {
        return Object.assign(new TalkStat(), {
            talkNum: this.talkNum + other.talkNum,
            charNum: this.charNum + other.charNum,
            pcTalkNum: this.pcTalkNum + other.pcTalkNum,
            pcCharNum: this.pcCharNum + other.pcCharNum,
        })
    }
}


const cocstats = new CoCStatsCounter();
export default cocstats;