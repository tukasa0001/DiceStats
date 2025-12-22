import { CoCSkillRollMessage } from '../ccfoliaLog/message/CoCSkillRollMessage';
import { ParamChangeMessage } from '../ccfoliaLog/message/ParamChangeMessage';
import { TalkMessage } from '../ccfoliaLog/message/TalkMessasge';
import { SanityCheckMessage } from '../ccfoliaLog/message/SanityCheckMessage';
import React, { JSX, ReactNode, useContext, useState } from 'react';
import { CcfoliaMessage } from '../ccfoliaLog/message/CcfoliaMessage';
import { UnknownSecretDiceMessage } from '../ccfoliaLog/message/UnknownSecretDiceMessage';
import { configCtx, setConfigCtx } from '../App';
import { ErrorBlock, InfoBlock } from '../Utils';
import { Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField, CheckboxCards, Text, Theme, Grid, Spinner, Separator, Switch } from '@radix-ui/themes';
import "./PlayerStats.css"
import domtoimage from "dom-to-image"

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
    const generalSkills = ["目星", "聞き耳", "図書館", "知識", "アイデア", "幸運"];
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const [playerName, setPlayerName] = useState("");
    const [isSaving, setSaving] = useState(false);
    const [unrankedSkills, setUnrankedSkills] = useState<string[]>(generalSkills);

    const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const saveImg = async () => {
        if (isSaving) return;
        const node = document.getElementById("playerStats");
        if (node !== null) {
            setSaving(true);
            try {
                await wait(1); // 一瞬待機することでロードマークを付ける
                const url = await domtoimage.toPng(node)
                const link = document.createElement('a');
                link.download = 'TRPG成績表.png';
                link.href = url;
                link.click();
                link.remove();
            }
            catch (error) {
                alert("画像の保存に失敗しました\n詳細情報:" + error)
            }
            finally {
                setSaving(false);
            }
        }
    }

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

    const allCharacterList = [...allCharacters].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const skillRanking = [...skillStats].sort((a, b) => b[1].skillRollNum - a[1].skillRollNum)
    const skillRankingFiltered = skillRanking.filter(skill => !unrankedSkills.includes(skill[0]))

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
            <Box my="2" style={{
                backgroundColor: "var(--gray-1)"
            }}>
                <Heading my="2">あなたの名前を入力してください</Heading>
                <TextField.Root value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="名無しの探索者">
                    <TextField.Slot />
                </TextField.Root>
                <Heading my="2">あなたのキャラを選択してください</Heading>
                <CheckboxCards.Root value={selectedCharacters}
                    onValueChange={val => setSelectedCharacters(val)}>
                    {[...allCharacterList].map(name => <CheckboxCards.Item key={name} value={name}>
                        <Flex direction="column" width="100%">
                            <Text weight="bold">{name}</Text>
                        </Flex>
                    </CheckboxCards.Item>)}
                </CheckboxCards.Root>
                <Heading my="2">オプションを選択してください</Heading>
                <Flex direction="column" gap="2">
                    {generalSkills.map(skill => (
                        <Text as="label">
                            <Flex gap="1" align="center">
                                <Switch checked={unrankedSkills.includes(skill)} onCheckedChange={val => {
                                    if (val) {
                                        setUnrankedSkills([...unrankedSkills, skill]);
                                    }
                                    else {
                                        setUnrankedSkills(unrankedSkills.filter(s => s !== skill));
                                    }
                                }} />
                                {skill}をランキングから除外
                            </Flex>
                        </Text>
                    ))}
                </Flex>
                <Flex id="playerStats" py="2" gap="5" minHeight="100vh" direction="column" align="stretch" justify="center" position="relative" style={{
                    backgroundColor: "var(--gray-1)",
                    overflowX: "auto",
                    textWrap: "nowrap"
                }}>
                    <Heading size="8" align="center">TRPG成績表</Heading>
                    <Flex align="center" justify="center">
                        <Table.Root>
                            <Table.Body>
                                <Table.Row>
                                    <Table.RowHeaderCell><Text size="4">名前</Text></Table.RowHeaderCell>
                                    <Table.Cell><Text size="4">{playerName === "" ? "名無しの探索者" : playerName}</Text></Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.RowHeaderCell><Text size="4">技能振り総数</Text></Table.RowHeaderCell>
                                    <Table.Cell><Text size="4">{sumOf(skillRanking.map(elem => elem[1].skillRollNum))}回</Text></Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table.Root>
                    </Flex>
                    <Flex justify="center" gap="9">
                        <Box>
                            <Flex align="baseline" gap="1">
                                <Heading align="left">技能別成績</Heading>
                                {0 < unrankedSkills.length ? <Text size="1">{unrankedSkills.reduce((a, b) => a + "," + b)}を除く</Text> : null}
                            </Flex>
                            <Table.Root>
                                <Table.Body>
                                    <SkillRankingRow stats={skillRankingFiltered} rank={1} />
                                    <SkillRankingRow stats={skillRankingFiltered} rank={2} />
                                    <SkillRankingRow stats={skillRankingFiltered} rank={3} />
                                </Table.Body>
                            </Table.Root>
                        </Box>
                        <Box>
                            <Heading align="left">全技能成績</Heading>
                            <Table.Root>
                                <Table.Body style={{ verticalAlign: "bottom" }}>
                                    <Table.Row>
                                        <Table.RowHeaderCell><Text size="4">技能成功</Text></Table.RowHeaderCell>
                                        <Table.Cell>
                                            <ValueCell title="回数">
                                                {sumOf(skillRanking.map(elem => elem[1].successNum))}回
                                            </ValueCell>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <ValueCell title="確率">
                                                {percentageFormatter.format(sumOf(skillRanking.map(elem => elem[1].successNum)) / sumOf(skillRanking.map(elem => elem[1].skillRollNum)))}
                                            </ValueCell>
                                        </Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.RowHeaderCell><Text size="4">クリティカル</Text></Table.RowHeaderCell>
                                        <Table.Cell>
                                            <ValueCell title="回数">
                                                {sumOf(skillRanking.map(elem => elem[1].criticalNum))}回
                                            </ValueCell>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <ValueCell title="確率">
                                                {percentageFormatter.format(sumOf(skillRanking.map(elem => elem[1].criticalNum)) / sumOf(skillRanking.map(elem => elem[1].skillRollNum)))}
                                            </ValueCell>
                                        </Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.RowHeaderCell><Text size="4">ファンブル</Text></Table.RowHeaderCell>
                                        <Table.Cell>
                                            <ValueCell title="回数">
                                                {sumOf(skillRanking.map(elem => elem[1].fumbleNum))}回
                                            </ValueCell>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <ValueCell title="確率">
                                                {percentageFormatter.format(sumOf(skillRanking.map(elem => elem[1].fumbleNum)) / sumOf(skillRanking.map(elem => elem[1].skillRollNum)))}
                                            </ValueCell>
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    </Flex>
                    <Flex justify="center" gap="9">
                        <Box>
                            <Heading align="left">その他の成績</Heading>
                            <Grid columns="6">
                                <ValueBlock title="発言数">
                                    {talkStat.talkNum}回
                                </ValueBlock>
                                <ValueBlock title="キャラ発言数">
                                    {talkStat.pcTalkNum}回
                                </ValueBlock>
                                <ValueBlock title="総喪失HP">
                                    {statusStat.totalDamage}pt
                                </ValueBlock>
                                <ValueBlock title="総喪失SAN">
                                    {statusStat.totalLostSAN}pt
                                </ValueBlock>
                                <ValueBlock title="SANチェック回数">
                                    {sanityCheckStat.checkNum}回
                                </ValueBlock>
                                <ValueBlock title="SANチェック成功率">
                                    {percentageFormatter.format(sanityCheckStat.successNum / sanityCheckStat.checkNum)}
                                </ValueBlock>
                            </Grid>
                        </Box>
                    </Flex>
                    <Text size="1" style={{
                        position: "absolute",
                        left: "1em",
                        bottom: "1em"
                    }}>DiceStats: https://tukasa0001.github.io/DiceStats/</Text>
                </Flex>

                <Flex mt="5" direction="column" align="center">
                    <Button onClick={saveImg}>画像として保存{isSaving ? <Spinner /> : null}</Button>
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

    return (
        <Table.Row style={{ verticalAlign: "bottom" }}>
            <Table.RowHeaderCell>
                <Text size="4">{localeHanidec.format(rank)}位</Text>
            </Table.RowHeaderCell>
            <Table.Cell>
                <Text size="4">{stat[0]}</Text>
            </Table.Cell>
            <Table.Cell>
                <ValueCell title="使用回数">
                    {stat[1].skillRollNum}回
                </ValueCell>
            </Table.Cell>
            <Table.Cell>
                <ValueCell title="成功回数">
                    {stat[1].successNum}回
                </ValueCell>
            </Table.Cell>
            <Table.Cell>
                <ValueCell title="成功率">
                    {percentageFormatter.format(stat[1].successNum / stat[1].skillRollNum)}
                </ValueCell>
            </Table.Cell>
        </Table.Row >)
}

const ValueCell = (props: {
    title: string
    children: ReactNode
}) => {
    return <Box>
        <Text as="div" size="2" mr="1">{props.title}</Text>
        <Text as="div" size="4" ml="2" align="right">{props.children}</Text>
    </Box>
}

const ValueBlock = (props: {
    title: string
    children: ReactNode
}) => {
    return <Box m="2" style={{
        borderBottom: "1px solid var(--gray-6)",
        textWrap: "wrap"
    }}>
        <Text as="div" size="2" mr="2">{props.title}</Text>
        <Text as="div" size="4" ml="2" align="right">{props.children}</Text>
    </Box>
}

const sumOf = (array: number[]) => {
    let sum = 0;
    for (let elem of array) {
        sum += elem;
    }
    return sum;
}

export default PlayerStats
