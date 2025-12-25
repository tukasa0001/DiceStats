import { CoCSkillRollMessage } from '../ccfoliaLog/message/CoCSkillRollMessage';
import { ParamChangeMessage } from '../ccfoliaLog/message/ParamChangeMessage';
import { TalkMessage } from '../ccfoliaLog/message/TalkMessasge';
import { SanityCheckMessage } from '../ccfoliaLog/message/SanityCheckMessage';
import React, { JSX, ReactNode, useContext, useMemo, useState } from 'react';
import { CcfoliaMessage } from '../ccfoliaLog/message/CcfoliaMessage';
import { UnknownSecretDiceMessage } from '../ccfoliaLog/message/UnknownSecretDiceMessage';
import { configCtx, setConfigCtx } from '../App';
import { ErrorBlock, InfoBlock } from '../Utils';
import { Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField, CheckboxCards, Text, Theme, Grid, Spinner, Separator, Switch } from '@radix-ui/themes';
import "./PlayerStats.css"
import domtoimage from "dom-to-image"
import cocstats, { CoCStat, SkillStat } from '../StatsCalculator/CoCStats';
import { LogFile } from '../file/LogFile';

type StatsProps = {
    logs: LogFile[]
}

const PlayerStats = (props: StatsProps) => {
    const log = props.logs;
    if (log.length <= 0) {
        return <Text>ログをアップロードしてください</Text>
    }

    const generalSkills = ["目星", "聞き耳", "図書館", "知識", "アイデア", "幸運"];
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const [playerName, setPlayerName] = useState("");
    const [isSaving, setSaving] = useState(false);
    const [unrankedSkills, setUnrankedSkills] = useState<string[]>(generalSkills);
    const [stats, setStats] = useState<CoCStat | null>(null)
    const allCharacterList = useMemo(() => [...new Set(log
        .flatMap(l => l.log)
        .map(msg => msg.sender))]
        .sort((a, b) => a.localeCompare(b, "ja")), [log]
    )

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
    const calcStats = () => {
        setStats(props.logs
            .map(file => cocstats.calc(file.log, {
                ...config,
                startIdx: file.startIdx,
                endIdx: file.endIdx,
                filter: msg => selectedCharacters.includes(msg.sender)
            }))
            .reduce((a, b) => a.merge(b)));
    }

    const config = useContext(configCtx);

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
                        <Text as="label" key={skill}>
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

                <Flex mt="5" direction="column" align="center">
                    <Button onClick={() => calcStats()}>成績表を表示</Button>
                </Flex>

                {stats === null ? null : <>
                    <PlayerStatsDisplay playerName={playerName} stats={stats} unrankedSkills={unrankedSkills} />
                    <Flex mt="5" direction="column" align="center">
                        <Button onClick={saveImg}>画像として保存{isSaving ? <Spinner /> : null}</Button>
                    </Flex>
                </>}
            </Box>
        </Theme>
    );
}

const InnerPlayerStatsDisplay = (props: { playerName: string, stats: CoCStat, unrankedSkills: string[] }) => {
    const { playerName, stats, unrankedSkills } = props;

    const skillStat = stats.total.skillRoll;
    const skillRanking = [...skillStat.perSkill]
        .filter(([name,]) => !unrankedSkills.includes(name))
        .sort(([, stat1], [, stat2]) => stat2.rollNum - stat1.rollNum)

    const avgFormatter = Intl.NumberFormat("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const percentageFormatter = Intl.NumberFormat("ja-JP", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return <Flex id="playerStats" py="2" gap="5" minHeight="100vh" direction="column" align="stretch" justify="center" position="relative" style={{
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
                        <Table.Cell><Text size="4">{skillStat.rollNum}回</Text></Table.Cell>
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
                        <SkillRankingRow stats={skillRanking} rank={1} />
                        <SkillRankingRow stats={skillRanking} rank={2} />
                        <SkillRankingRow stats={skillRanking} rank={3} />
                    </Table.Body>
                </Table.Root>
                <Grid columns="2">
                    <MiniSkillRankingRow stats={skillRanking} rank={4} />
                    <MiniSkillRankingRow stats={skillRanking} rank={5} />
                </Grid>
            </Box>
            <Box>
                <Heading align="left">全技能成績</Heading>
                <Table.Root>
                    <Table.Body style={{ verticalAlign: "bottom" }}>
                        <Table.Row>
                            <Table.RowHeaderCell><Text size="4">技能成功</Text></Table.RowHeaderCell>
                            <Table.Cell>
                                <ValueCell title="回数">
                                    {skillStat.successNum}回
                                </ValueCell>
                            </Table.Cell>
                            <Table.Cell>
                                <ValueCell title="確率">
                                    {percentageFormatter.format(skillStat.successNum / skillStat.rollNum)}
                                </ValueCell>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.RowHeaderCell><Text size="4">クリティカル</Text></Table.RowHeaderCell>
                            <Table.Cell>
                                <ValueCell title="回数">
                                    {skillStat.criticalNum}回
                                </ValueCell>
                            </Table.Cell>
                            <Table.Cell>
                                <ValueCell title="確率">
                                    {percentageFormatter.format(skillStat.criticalNum / skillStat.rollNum)}
                                </ValueCell>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.RowHeaderCell><Text size="4">ファンブル</Text></Table.RowHeaderCell>
                            <Table.Cell>
                                <ValueCell title="回数">
                                    {skillStat.fumbleNum}回
                                </ValueCell>
                            </Table.Cell>
                            <Table.Cell>
                                <ValueCell title="確率">
                                    {percentageFormatter.format(skillStat.fumbleNum / skillStat.rollNum)}
                                </ValueCell>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>

                <Grid columns="2">
                    <Flex mt="1" gap="2" style={{
                        borderBottom: "1px solid var(--gray-6)"
                    }}>
                        <Text size="2">1クリ</Text>
                        <Text size="2">{skillStat.spCriticalNum}回/{percentageFormatter.format(skillStat.spCriticalNum / skillStat.rollNum)}</Text>
                    </Flex>
                    <Flex mt="1" gap="2" style={{
                        borderBottom: "1px solid var(--gray-6)"
                    }}>
                        <Text size="2">100ファン</Text>
                        <Text size="2">{skillStat.spFumbleNum}回/{percentageFormatter.format(skillStat.spFumbleNum / skillStat.rollNum)}</Text>
                    </Flex>
                </Grid>
            </Box>
        </Flex>
        <Flex justify="center" gap="9">
            <Box>
                <Heading align="left">その他の成績</Heading>
                <Grid columns="6">
                    <ValueBlock title="発言数">
                        {stats.total.talk.talkNum}回
                    </ValueBlock>
                    <ValueBlock title="キャラ発言数">
                        {stats.total.talk.pcTalkNum}回
                    </ValueBlock>
                    <ValueBlock title="総喪失HP">
                        {stats.total.status.totalDamage}pt
                    </ValueBlock>
                    <ValueBlock title="総喪失SAN">
                        {stats.total.status.totalLostSAN}pt
                    </ValueBlock>
                    <ValueBlock title="SANチェック回数">
                        {stats.total.sanityCheck.rollNum}回
                    </ValueBlock>
                    <ValueBlock title="SANチェック成功率">
                        {percentageFormatter.format(stats.total.sanityCheck.successNum / stats.total.sanityCheck.rollNum)}
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
}

const PlayerStatsDisplay = React.memo(InnerPlayerStatsDisplay);

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
                    {stat[1].rollNum}回
                </ValueCell>
            </Table.Cell>
            <Table.Cell>
                <ValueCell title="成功回数">
                    {stat[1].successNum}回
                </ValueCell>
            </Table.Cell>
            <Table.Cell>
                <ValueCell title="成功率">
                    {percentageFormatter.format(stat[1].successNum / stat[1].rollNum)}
                </ValueCell>
            </Table.Cell>
        </Table.Row >)
}

const MiniSkillRankingRow = (props: {
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
        <Flex mt="1" gap="2" style={{
            borderBottom: "1px solid var(--gray-6)"
        }}>
            <Text size="2">{localeHanidec.format(rank)}位</Text>
            <Text size="2">{stat[0]}</Text>
            <Text size="2">
                {stat[1].rollNum}回/{stat[1].successNum}回/{percentageFormatter.format(stat[1].successNum / stat[1].rollNum)}
            </Text>
        </Flex>)
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
