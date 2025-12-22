import { CoCSkillRollMessage } from '../ccfoliaLog/message/CoCSkillRollMessage';
import { ParamChangeMessage } from '../ccfoliaLog/message/ParamChangeMessage';
import { TalkMessage } from '../ccfoliaLog/message/TalkMessasge';
import { SanityCheckMessage } from '../ccfoliaLog/message/SanityCheckMessage';
import { JSX, useContext, useState } from 'react';
import { CcfoliaMessage } from '../ccfoliaLog/message/CcfoliaMessage';
import { UnknownSecretDiceMessage } from '../ccfoliaLog/message/UnknownSecretDiceMessage';
import { configCtx, setConfigCtx } from '../App';
import { ErrorBlock, InfoBlock } from '../Utils';
import { Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField, CheckboxCards, Text, Theme } from '@radix-ui/themes';
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
    const [playerName, setPlayerName] = useState("");

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

    const skillRanking = [...skillStats].sort((a, b) => b[1].skillRollNum - a[1].skillRollNum)

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
        <Theme>
            <Box my="2">
                <Heading my="2">あなたの名前を入力してください</Heading>
                <TextField.Root value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="名無しの探索者">
                    <TextField.Slot />
                </TextField.Root>
                <Heading my="2">あなたのキャラを選択してください</Heading>
                <CheckboxCards.Root value={selectedCharacters}
                    onValueChange={val => setSelectedCharacters(val)}>
                    {[...allCharacters].map(name => <CheckboxCards.Item key={name} value={name}>
                        <Flex direction="column" width="100%">
                            <Text weight="bold">{name}</Text>
                        </Flex>
                    </CheckboxCards.Item>)}
                </CheckboxCards.Root>
                <Flex my="2" direction="column" align="center">
                    <Button asChild={true}><a href="#playerStats">表示</a></Button>
                </Flex>

                <Flex id="playerStats" mt="9" py="2" gap="5" width="100%" height="100vh" direction="column" align="stretch" justify="center">
                    <Heading size="8" align="center">TRPG成績表</Heading>
                    <Flex align="center" justify="center">
                        <Table.Root>
                            <Table.Body>
                                <Table.Row>
                                    <Table.RowHeaderCell><Text size="4">名前</Text></Table.RowHeaderCell>
                                    <Table.Cell><Text size="4">{playerName === "" ? "名無しの探索者" : playerName}</Text></Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.RowHeaderCell><Text size="4">技能判定総数</Text></Table.RowHeaderCell>
                                    <Table.Cell><Text size="4">{sumOf(skillRanking.map(elem => elem[1].skillRollNum))}回</Text></Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table.Root>
                    </Flex>
                    <Flex justify="center" gap="9">
                        <Box>
                            <Heading align="center">技能別成績</Heading>
                            <Table.Root>
                                <Table.Body>
                                    <SkillRankingRow stats={skillRanking} rank={1} />
                                    <SkillRankingRow stats={skillRanking} rank={2} />
                                    <SkillRankingRow stats={skillRanking} rank={3} />
                                </Table.Body>
                            </Table.Root>
                        </Box>
                        <Box>
                            <Heading align="center">全技能成績</Heading>
                            <Table.Root>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.RowHeaderCell><Text size="4">判定回数</Text></Table.RowHeaderCell>
                                        <Table.Cell><Text size="4">{sumOf(skillRanking.map(elem => elem[1].skillRollNum))}</Text></Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.RowHeaderCell><Text size="4">成功率</Text></Table.RowHeaderCell>
                                        <Table.Cell><Text size="4">{percentageFormatter.format(
                                            sumOf(skillRanking.map(elem => elem[1].successNum)) / sumOf(skillRanking.map(elem => elem[1].skillRollNum))
                                        )}</Text></Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.RowHeaderCell><Text size="4">クリティカル率</Text></Table.RowHeaderCell>
                                        <Table.Cell><Text size="4">{percentageFormatter.format(
                                            sumOf(skillRanking.map(elem => elem[1].criticalNum)) / sumOf(skillRanking.map(elem => elem[1].skillRollNum))
                                        )}</Text></Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.RowHeaderCell><Text size="4">ファンブル率</Text></Table.RowHeaderCell>
                                        <Table.Cell><Text size="4">{percentageFormatter.format(
                                            sumOf(skillRanking.map(elem => elem[1].fumbleNum)) / sumOf(skillRanking.map(elem => elem[1].skillRollNum))
                                        )}</Text></Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    </Flex>
                    <Flex justify="between" gap="4">
                        <Flex direction="column">
                            <Box className='valueBox'>
                                <Text as="div" size="1" mr="2">発言数</Text>
                                <Text as="div" align="right">{talkStat.talkNum}回</Text>
                            </Box>
                            <Box className='valueBox'>
                                <Text as="div" size="1" mr="2">キャラ発言数</Text>
                                <Text as="div" align="right">{talkStat.pcTalkNum}回</Text>
                            </Box>
                        </Flex>
                        <Flex direction="column">
                            <Box className='valueBox'>
                                <Text as="div" size="1" mr="2">総喪失HP</Text>
                                <Text as="div" align="right">{statusStat.totalDamage}回</Text>
                            </Box>
                            <Box className='valueBox'>
                                <Text as="div" size="1" mr="2">総喪失SAN</Text>
                                <Text as="div" align="right">{statusStat.totalLostSAN}回</Text>
                            </Box>
                        </Flex>
                        <Flex direction="column">
                            <Box className='valueBox'>
                                <Text as="div" size="1" mr="2">SANチェック回数</Text>
                                <Text as="div" align="right">{sanityCheckStat.checkNum}回</Text>
                            </Box>
                            <Box className='valueBox'>
                                <Text as="div" size="1" mr="2">SANチェック成功率</Text>
                                <Text as="div" align="right">{percentageFormatter.format(sanityCheckStat.successNum / sanityCheckStat.checkNum)}</Text>
                            </Box>
                        </Flex>
                    </Flex>
                </Flex>
            </Box>
        </Theme>
    );
}

const SkillRankingRow = (props: {
    stats: [string, SkillStat][],
    rank: number
}) => {
    const percentageFormatter = Intl.NumberFormat("ja-JP", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const localeHanidec = Intl.NumberFormat(new Intl.Locale(
        'ja-jp',
        {
            numberingSystem: "hanidec"
        }
    ));

    const { stats, rank } = props;
    if (rank < 1) {
        return "Invalid rank: " + rank;
    }

    const stat = stats[rank - 1];
    if (stat === undefined) {
        return null;
    }

    return (<Table.Row>
        <Table.RowHeaderCell><Text size="4">{localeHanidec.format(rank)}位</Text></Table.RowHeaderCell>
        <Table.Cell><Text size="4">{stat[0]}</Text></Table.Cell>
        <Table.Cell><Text size="4">{stat[1].skillRollNum}回</Text></Table.Cell>
        <Table.Cell><Text size="1">成功率</Text><Text size="4">{percentageFormatter.format(stat[1].successNum / stat[1].skillRollNum)}</Text></Table.Cell>
    </Table.Row>)
}

const sumOf = (array: number[]) => {
    let sum = 0;
    for (let elem of array) {
        sum += elem;
    }
    return sum;
}

export default PlayerStats
