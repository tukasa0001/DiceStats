import { useContext, useEffect, useRef, useState } from "react";
import { LogFile } from "../file/LogFile"
import { configCtx } from "../App";
import { Text, Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField, ScrollArea, RadioCards, Grid, CheckboxCards, Spinner } from '@radix-ui/themes';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import cocstats, { CharacterStat, CoCStat } from "../StatsCalculator/CoCStats";
import { Search } from "lucide-react";

const colors = [
    ...Array.from({ length: 6 }, (_, i) => i)
        .map(i => `hsl(${i * 60}deg, 100%, 80%)`),

    ...Array.from({ length: 6 }, (_, i) => i)
        .map(i => `hsl(${i * 60 + 30}deg, 80%, 80%)`),

    ...Array.from({ length: 6 }, (_, i) => i)
        .map(i => `hsl(${i * 60}deg, 100%, 50%)`),

    ...Array.from({ length: 6 }, (_, i) => i)
        .map(i => `hsl(${i * 60 + 30}deg, 100%, 50%)`),

    // alt
    ...Array.from({ length: 6 }, (_, i) => i)
        .map(i => `hsl(${i * 60 + 15}deg, 100%, 50%)`),

    ...Array.from({ length: 6 }, (_, i) => i)
        .map(i => `hsl(${i * 60 + 45}deg, 100%, 50%)`),
]

type StatsChartProps = {
    logs: LogFile[]
}

type DataPoint = {
    name: string,
    rollNum: number,
    successNum: number,
    failNum: number,
    critNum: number,
    fumbleNum: number,
}

type ValueDisplay = (stat: CharacterStat) => number;

const valueDisplays: [string, ValueDisplay][] = [
    ["技能ロール回数", stat => stat.skillRoll.rollNum],
    ["成功回数", stat => stat.skillRoll.successNum],
    ["クリティカル回数", stat => stat.skillRoll.criticalNum],
    ["ファンブル回数", stat => stat.skillRoll.fumbleNum],
    ["キャラ発言数", stat => stat.talk.pcTalkNum],
    ["キャラ発言文字数", stat => stat.talk.pcCharNum],
]

const StatsChart = (props: StatsChartProps) => {
    const { logs } = props;
    const config = useContext(configCtx);

    const [stats, setStats] = useState<CoCStat[]>([]);

    const [valueDisplay, setValueDisplay] = useState<ValueDisplay>(() => valueDisplays[0][1]);
    const [activeCharacters, setActiveCharacters] = useState<string[]>([]);

    const log = logs[0];

    useEffect(() => {
        if (log === undefined || log.log.length <= 10) {
            return;
        }
        function progress(stats: CoCStat[], i: number) {
            const logLength = log.endIdx - log.startIdx + 1;
            console.log(`${i}: ${log.startIdx + Math.floor(logLength * (i - 1) * 0.1)} ~ ${log.startIdx + Math.floor(logLength * i * 0.1) - 1}`);

            const prevStat = stats[i - 1].clone();
            const sectionStat = cocstats.calc(log.log, {
                ...config,
                startIdx: log.startIdx + Math.floor(logLength * (i - 1) * 0.1),
                endIdx: log.startIdx + Math.floor(logLength * i * 0.1) - 1,
                ignoredChannels: log.ingoredChannels
            });
            const stat = sectionStat.merge(prevStat);
            stats.push(stat);
            if (i < 10) {
                setTimeout(() => progress(stats, i + 1), 10);
            }
            else {
                setStats(stats);
            }
        }
        progress([new CoCStat()], 1);
    }, [logs]);

    const jpnTextComparer = (a: readonly [string, any], b: readonly [string, any]) => a[0].localeCompare(b[0], "ja");

    if (logs.length <= 0) {
        return <Text>ログをアップロードしてください</Text>
    }

    if (log.endIdx - log.startIdx < 10) {
        return <Text>ログが短すぎます</Text>
    }

    if (stats.length === 0) {
        return <Flex align="center" justify="center" mt="2">
            <Text>読み込み中</Text><Spinner />
        </Flex>;
    }

    const totalStat = stats[stats.length - 1];
    const nameRollPair = [...totalStat.perCharacter]
        .sort(jpnTextComparer)
        .map(([name, stat]) => [name, stat.skillRoll.rollNum] as [string, number])

    const allCharacters = nameRollPair.map(([name, _]) => name);

    const data = stats.map((stat, i) => ({
        name: `${i * 10}%`,
        ...allCharacters.map(name => ({ [name]: 0 })).reduce((a, b) => ({ ...a, ...b }), {}),
        ...[...stat.perCharacter].map(([name, stat]) => ({
            [name]: valueDisplay(stat)
        })).reduce((a, b) => ({ ...a, ...b }), {})
    }));

    return (
        <Box my="2">
            <Heading my="4">表示するキャラを選択</Heading>
            <CheckboxCards.Root mt="2" value={activeCharacters} onValueChange={val => setActiveCharacters(val)}
                columns={{ initial: "2", sm: "6" }}>
                {[...nameRollPair]
                    .sort(([name1, roll1], [name2, roll2]) => roll2 - roll1)
                    .map(([name, roll]) => (
                        <CheckboxCards.Item key={name} value={name}>
                            <Flex direction="column" width="100%">
                                <Text weight="bold">{name}</Text>
                                <Text>技能ロール回数: {roll}</Text>
                            </Flex>
                        </CheckboxCards.Item>
                    ))}
            </CheckboxCards.Root>
            <Heading my="4">技能振り統計</Heading>
            <Flex direction="row">
                <RadioCards.Root defaultValue="0" onValueChange={val => {
                    const idx = Number(val);
                    setValueDisplay(() => valueDisplays[idx][1]);
                }}>
                    <Flex direction="column" gap="2">
                        {valueDisplays.map(([name, _], i) => (
                            <RadioCards.Item key={i} value={i.toString()}>
                                <Flex direction="column" width="100%">
                                    <Text weight="bold">{name}</Text>
                                </Flex>
                            </RadioCards.Item>
                        ))}
                    </Flex>
                </RadioCards.Root>
                <LineChart style={{ flexGrow: 1, aspectRatio: 1.618, maxWidth: "80vw", maxHeight: "80vh" }} responsive data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-4)" />
                    <XAxis dataKey="name" stroke="var(--accent-9)" />
                    <YAxis width={60} stroke="var(--accent-9)" />
                    <Tooltip contentStyle={{
                        opacity: 0.7,
                        backgroundColor: 'var(--gray-2)',
                        borderColor: 'var(--gray-6)',
                    }} />
                    <Legend />
                    {activeCharacters.map((name, i) => <Line
                        key={name} dataKey={name}
                        stroke={colors[i]}
                    />)}
                </LineChart>
            </Flex>
        </Box >
    )
}

export default StatsChart;