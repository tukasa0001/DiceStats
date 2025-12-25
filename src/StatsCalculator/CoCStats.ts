import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";

class CoCStatsCounter {
    createStat = (): CoCStat => ({
        total: this.createCharacterStat(),
        perCharacter: new Map()
    })

    createSkillStat = (): SkillStat => ({
        rollNum: 0,
        valueSum: 0,
        successNum: 0,
        failNum: 0,
        criticalNum: 0,
        spCriticalNum: 0,
        fumbleNum: 0,
        spFumbleNum: 0
    })

    createCharacterStat = (): CharacterStat => ({
        skillRoll: { ...this.createSkillStat(), perSkill: new Map() },
        sanityCheck: this.createSkillStat(),
        status: {
            totalDamage: 0,
            minHealth: undefined,
            totalLostSAN: 0,
            minSAN: undefined,
        },
        talk: {
            talkNum: 0,
            charNum: 0,
            pcTalkNum: 0,
            pcCharNum: 0,
        }
    })

    createDefaultOption = (): Required<CoCStatOptions> => ({
        filter: (msg) => true,
        nameAliases: [],
        startIdx: 0,
        endIdx: Infinity
    })

    calc = (log: CcfoliaMessage[], _option?: CoCStatOptions) => {
        const option: Required<CoCStatOptions> = { ...this.createDefaultOption(), ..._option };
        let stat = this.createStat();
        for (let msg of log.slice(option.startIdx, option.endIdx)) {
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
                    stat.perCharacter.set(sender, this.createCharacterStat());
                }
                this.incrementStat(stat.perCharacter.get(sender)!, msg);
            }
        }
        return stat;
    }

    incrementStat = (stat: CharacterStat, msg: CcfoliaMessage) => {
        if (msg instanceof CoCSkillRollMessage) {
            this.incrementSkillStat(stat.skillRoll, msg);
            if (!stat.skillRoll.perSkill.has(msg.skill)) {
                stat.skillRoll.perSkill.set(msg.skill, this.createSkillStat());
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

export type CoCStat = {
    total: CharacterStat
    perCharacter: Map<string, CharacterStat>
};

export type CharacterStat = {
    skillRoll: SkillStat & {
        perSkill: Map<string, SkillStat>
    },
    sanityCheck: SkillStat,
    status: {
        totalDamage: number
        minHealth: number | undefined
        totalLostSAN: number
        minSAN: number | undefined
    },
    talk: {
        talkNum: number
        charNum: number
        pcTalkNum: number
        pcCharNum: number
    }
}

export type SkillStat = {
    rollNum: number
    valueSum: number
    successNum: number
    failNum: number
    criticalNum: number
    spCriticalNum: number
    fumbleNum: number
    spFumbleNum: number
}


const cocstats = new CoCStatsCounter();
export default cocstats;