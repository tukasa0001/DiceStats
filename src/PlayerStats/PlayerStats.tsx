import { CoCSkillRollMessage } from '../ccfoliaLog/message/CoCSkillRollMessage';
import { ParamChangeMessage } from '../ccfoliaLog/message/ParamChangeMessage';
import { TalkMessage } from '../ccfoliaLog/message/TalkMessasge';
import { SanityCheckMessage } from '../ccfoliaLog/message/SanityCheckMessage';
import { JSX, useContext, useState } from 'react';
import { CcfoliaMessage } from '../ccfoliaLog/message/CcfoliaMessage';
import { UnknownSecretDiceMessage } from '../ccfoliaLog/message/UnknownSecretDiceMessage';
import { configCtx, setConfigCtx } from '../App';
import { ErrorBlock, InfoBlock } from '../Utils';
import { Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField, CheckboxCards, Text } from '@radix-ui/themes';
import "./PlayerStats.css"

class SkillStat {
    // 技能ごとの統計
    skillRollNum: number = 0;
    successNum: number = 0;
    failNum: number = 0;
    criticalNum: number = 0;
    fumbleNum: number = 0;

    increment(msg: CoCSkillRollMessage) {
        this.skillRollNum++;
        if (msg.isSuccess()) {
            this.successNum++;
            if (msg.isCritical()) {
                this.criticalNum++;
            }
        }
        else {
            this.failNum++;
            if (msg.isFumble()) {
                this.fumbleNum++;
            }
        }
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
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const [skillFilter, setSkillFinter] = useState("none");

    const log = props.logFile;
    const config = useContext(configCtx);

    const allCharacters = new Set<string>();
    const skillStats = new Map<string, SkillStat>();
    const statusStat = new StatusStat();
    const sanityCheckStat = new SanityCheckStat();
    const talkStat = new TalkStat();
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
            allCharacters.clear();
            skillStats.clear();
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
        // 全キャラリストを作成
        allCharacters.add(sender);
        // 未選択のキャラは除外
        if (!selectedCharacters.includes(sender)) {
            continue;
        }
        // 技能ロール
        if (msg instanceof CoCSkillRollMessage && (!msg.isSecret || !config.ignoreSecretDice)) {
            const stat = getStat(skillStats, msg.skill, SkillStat);
            stat.increment(msg);
        }
        else if (msg instanceof ParamChangeMessage) {
            if (msg.paramName === "HP") {
                // HP変動
                const stat = statusStat;
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
                const stat = statusStat;
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
            const stat = sanityCheckStat;
            stat.checkNum++;
            if (msg.isSuccess()) stat.successNum++;
            if (msg.isCritical()) stat.criticalNum++;
            if (msg.isFumble()) stat.fumbleNum++;
        }
        else if (msg instanceof TalkMessage) {
            const stat = talkStat;
            stat.talkNum++;
            stat.charNum += msg.text.length;
            const regex = msg.text.match(/^「(.*)」/);
            if (regex !== null) {
                stat.pcTalkNum++;
                stat.pcCharNum += regex[1].length;
            }
        }
    }

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
            <CheckboxCards.Root value={selectedCharacters}
                onValueChange={val => setSelectedCharacters(val)}
                columns={{ initial: "1", sm: "3" }}>
                { }
                <CheckboxCards.Item value="1">
                    <Flex direction="column" width="100%">
                        <Text weight="bold">A1 Keyboard</Text>
                        <Text>US Layout</Text>
                    </Flex>
                </CheckboxCards.Item>
                <CheckboxCards.Item value="2">
                    <Flex direction="column" width="100%">
                        <Text weight="bold">Pro Mouse</Text>
                        <Text>Zero-lag wireless</Text>
                    </Flex>
                </CheckboxCards.Item>
                <CheckboxCards.Item value="3">
                    <Flex direction="column" width="100%">
                        <Text weight="bold">Lightning Mat</Text>
                        <Text>Wireless charging</Text>
                    </Flex>
                </CheckboxCards.Item>
            </CheckboxCards.Root>

        </Box>
    );
}

export default PlayerStats
