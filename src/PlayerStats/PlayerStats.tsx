import { CoCSkillRollMessage } from '../ccfoliaLog/message/CoCSkillRollMessage';
import { ParamChangeMessage } from '../ccfoliaLog/message/ParamChangeMessage';
import { TalkMessage } from '../ccfoliaLog/message/TalkMessasge';
import { SanityCheckMessage } from '../ccfoliaLog/message/SanityCheckMessage';
import { JSX, useContext, useState } from 'react';
import { CcfoliaMessage } from '../ccfoliaLog/message/CcfoliaMessage';
import { UnknownSecretDiceMessage } from '../ccfoliaLog/message/UnknownSecretDiceMessage';
import { configCtx, setConfigCtx } from '../App';
import { ErrorBlock, InfoBlock } from '../Utils';
import { Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField } from '@radix-ui/themes';
import "./PlayerStats.css"

class SkillStat {
    // 技能関連
    skillRollNum: number = 0;
    skillRollSum: number = 0;
    successNum: number = 0;
    failNum: number = 0;
    criticalNum: number = 0;
    spCriticalNum: number = 0;
    fumbleNum: number = 0;
    spFumbleNum: number = 0;
    skillRolls: Map<string, number> = new Map<string, number>();

    increment(msg: CoCSkillRollMessage) {
        this.skillRollNum++;
        this.skillRollSum += msg.diceValue;
        if (msg.isSuccess()) {
            this.successNum++;
            if (msg.isCritical()) {
                this.criticalNum++;
                if (msg.diceValue === 1) {
                    this.spCriticalNum++;
                }
            }
        }
        else {
            this.failNum++;
            if (msg.isFumble()) {
                this.fumbleNum++;
                if (msg.diceValue === 100) {
                    this.spFumbleNum++;
                }
            }
        }
        this.skillRolls.set(msg.skill, (this.skillRolls.get(msg.skill) ?? 0) + 1);
    }
}
class SanityCheckStat {
    // SANチェック
    checkNum: number = 0;
    successNum: number = 0;
    criticalNum: number = 0;
    fumbleNum: number = 0;
};
class StatusStat {
    // ステータス関連
    totalDamage: number = 0;
    minHealth: number | undefined = undefined;
    totalLostSAN: number = 0;
    minSAN: number | undefined = undefined;
}
class TalkStat {
    // 会話関連
    talkNum: number = 0;
    charNum: number = 0;
    pcTalkNum = 0;
    pcCharNum = 0;
};
class OtherStat {
    // その他
    secretDiceCount = 0;
}

type StatsProps = {
    logFile: CcfoliaMessage[]
}

const PlayerStats = (props: StatsProps) => {
    const [selectedCharacters, setSelectedCharacters] = useState<readonly string[]>([]);
    const [skillFilter, setSkillFinter] = useState("none");

    const log = props.logFile;
    const config = useContext(configCtx);

    const skillStats = new Map<string, SkillStat>();
    const filteredSkillStats = new Map<string, SkillStat>();
    const statusStats = new Map<string, StatusStat>();
    const sanityCheckStatus = new Map<string, SanityCheckStat>();
    const talkStats = new Map<string, TalkStat>();
    const otherStats = new Map<string, OtherStat>();
    const allSkills = new Set<string>();
    const getStat = <T,>(map: Map<string, T>, name: string, factory: new () => T): T => {
        let stat = map.get(name);
        if (stat === undefined) {
            stat = new factory();
            map.set(name, stat);
        }
        return stat;
    }

    let isStarted: boolean = config.startMessage === "";
    for (let msg of log) {
        // 開始メッセージまで無視
        if (!isStarted && msg instanceof TalkMessage && config.startMessage === msg.text) {
            isStarted = true;
            skillStats.clear();
            filteredSkillStats.clear();
            statusStats.clear();
            sanityCheckStatus.clear();
            talkStats.clear();
            otherStats.clear();
        }
        // 終了メッセージが来たらbreak
        else if (config.endMessage !== "" && msg instanceof TalkMessage && config.endMessage === msg.text) {
            break;
        }

        let sender = msg.sender;
        for (let [before, after] of config.nameAliases) {
            if (sender === before) {
                sender = after;
            }
        }
        // 送信者名が空文字列の場合は無視
        if (sender === "") {
            continue;
        }
        if (msg instanceof CoCSkillRollMessage && (!msg.isSecret || !config.ignoreSecretDice)) {
            const stat = getStat(skillStats, sender, SkillStat);
            stat.increment(msg);
            if (msg.skill === skillFilter) {
                const stat2 = getStat(filteredSkillStats, sender, SkillStat);
                stat2.increment(msg);
            }
            allSkills.add(msg.skill);
        }
        else if (msg instanceof ParamChangeMessage) {
            if (msg.paramName === "HP") {
                // HP変動
                const stat = getStat(statusStats, sender, StatusStat);
                if (stat.minHealth === undefined || msg.value < stat.minHealth) {
                    stat.minHealth = msg.value;
                }
                if (msg.value < msg.prevValue) {
                    // HP減少
                    stat.totalDamage += msg.prevValue - msg.value;
                }
            }
            if (msg.paramName === "SAN") {
                // SAN変動
                const stat = getStat(statusStats, sender, StatusStat);
                if (stat.minSAN === undefined || msg.value < stat.minSAN) {
                    stat.minSAN = msg.value;
                }
                if (msg.value < msg.prevValue) {
                    // SAN減少
                    stat.totalLostSAN += msg.prevValue - msg.value;
                }
            }
        }
        else if (msg instanceof SanityCheckMessage) {
            const stat = getStat(sanityCheckStatus, sender, SanityCheckStat);
            stat.checkNum++;
            if (msg.isSuccess()) stat.successNum++;
            if (msg.isCritical()) stat.criticalNum++;
            if (msg.isFumble()) stat.fumbleNum++;
        }
        else if (msg instanceof TalkMessage) {
            const stat = getStat(talkStats, sender, TalkStat);
            stat.talkNum++;
            stat.charNum += msg.text.length;
            const regex = msg.text.match(/^「(.*)」/);
            if (regex !== null) {
                stat.pcTalkNum++;
                stat.pcCharNum += regex[1].length;
            }
        }
        else if (msg instanceof UnknownSecretDiceMessage) {
            const stat = getStat(otherStats, sender, OtherStat);
            stat.secretDiceCount++;
        }
    }

    const skills = [...skillStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const filteredSkills = [...filteredSkillStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const status = [...statusStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const sanity = [...sanityCheckStatus].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const talks = [...talkStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const others = [...otherStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));

    const avgFormatter = Intl.NumberFormat("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const percentageFormatter = Intl.NumberFormat("ja-JP", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <Box my="2">

        </Box>
    );
}

export default PlayerStats
