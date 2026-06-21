import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { CoCCombinedRollMessage } from "../ccfoliaLog/message/CoCCombinedRollMessage";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";

class CoCStatsCounter {
    createDefaultOption = (): Required<CoCStatOptions> => ({
        filter: (msg) => true,
        nameAliases: [],
        startIdx: 0,
        endIdx: Infinity,
        ignoredChannels: []
    })

    calc = (log: CcfoliaMessage[], _option?: CoCStatOptions) => {
        const option: Required<CoCStatOptions> = { ...this.createDefaultOption(), ..._option };
        let stat = new CoCStat()
        for (let msg of log.slice(option.startIdx, option.endIdx + 1)) {
            let sender = msg.sender;
            // チャンネルフィルター処理
            if (option.ignoredChannels.includes(msg.channel)) {
                continue;
            }
            // 名前エイリアス処理
            for (let [before, after] of option.nameAliases) {
                if (sender === before) {
                    sender = after;
                }
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

    incrementStat = (stat: CharacterStat, msg: CcfoliaMessage) => {
        if (msg instanceof CoCSkillRollMessage || msg instanceof CoCCombinedRollMessage) {
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

    incrementSkillStat = (stat: SkillStat, msg: CoCSkillRollMessage | SanityCheckMessage | CoCCombinedRollMessage) => {
        stat.rollNum++;
        stat.valueSum += msg.diceValue;
        stat.successNum += msg.successNum();
        stat.failNum += msg.failureNum();
        stat.criticalNum += msg.criticalNum();
        stat.fumbleNum += msg.fumbleNum();
        stat.spCriticalNum += msg.spCriticalNum();
        stat.spFumbleNum += msg.spFumbleNum();
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
    endIdx?: number,
    ignoredChannels?: readonly string[]
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

    clone(): CoCStat {
        const data = new CoCStat();
        data.total = this.total.clone();
        data.perCharacter = new Map([...this.perCharacter].map(tp => [tp[0], tp[1].clone()]))
        return data;
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

    clone(): CharacterStat {
        const data = new CharacterStat();
        data.skillRoll = Object.assign(this.skillRoll.clone(), {
            perSkill: new Map([...this.skillRoll.perSkill].map(tp => [tp[0], tp[1].clone()]))
        });
        data.sanityCheck = this.sanityCheck.clone();
        data.status = this.status.clone();
        data.talk = this.talk.clone();
        return data;
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

    clone(): SkillStat {
        const data = new SkillStat();
        data.rollNum = this.rollNum;
        data.valueSum = this.valueSum;
        data.successNum = this.successNum;
        data.failNum = this.failNum;
        data.criticalNum = this.criticalNum;
        data.spCriticalNum = this.spCriticalNum;
        data.fumbleNum = this.fumbleNum;
        data.spFumbleNum = this.spFumbleNum;
        return data;
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

    clone(): StatusStat {
        const data = new StatusStat();
        data.totalDamage = this.totalDamage;
        data.minHealth = this.minHealth;
        data.totalLostSAN = this.totalLostSAN;
        data.minSAN = this.minSAN;
        return data;
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

    clone(): TalkStat {
        const data = new TalkStat();
        data.talkNum = this.talkNum;
        data.charNum = this.charNum;
        data.pcTalkNum = this.pcTalkNum;
        data.pcCharNum = this.pcCharNum;
        return data;
    }
}


const cocstats = new CoCStatsCounter();
export default cocstats;