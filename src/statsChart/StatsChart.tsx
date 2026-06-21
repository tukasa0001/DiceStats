import { useContext, useState } from "react";
import { LogFile } from "../file/LogFile"
import { configCtx } from "../App";
import { Text, Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField, ScrollArea, RadioCards } from '@radix-ui/themes';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import cocstats, { CharacterStat, CoCStat } from "../StatsCalculator/CoCStats";

const colors = [
    ...Array.from({ length: 12 }, (_, i) => i)
        .map(i => `hsl(${i * 60}deg, 80%, 80%)`),

    ...Array.from({ length: 12 }, (_, i) => i)
        .map(i => `hsl(${i * 60}deg, 100%, 60%)`),
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

const valueDisplays: ValueDisplay[] = [
    stat => stat.skillRoll.rollNum,
    stat => stat.skillRoll.successNum,
    stat => stat.skillRoll.criticalNum,
    stat => stat.skillRoll.fumbleNum,
]

const StatsChart = (props: StatsChartProps) => {
    const { logs } = props;
    const config = useContext(configCtx);

    const [valueDisplay, setValueDisplay] = useState<ValueDisplay>(() => valueDisplays[0]);

    const jpnTextComparer = (a: string, b: string) => a.localeCompare(b, "ja");

    if (logs.length <= 0) {
        return <Text>ログをアップロードしてください</Text>
    }

    const log = logs[0];

    if (log.log.length <= 10) {
        return <Text>ログが短すぎます</Text>
    }

    const stats: CoCStat[] = [new CoCStat()];

    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        const prevStat = stats[i - 1].clone();
        const sectionStat = cocstats.calc(log.log, {
            ...config,
            startIdx: Math.floor(log.log.length * (i - 1) * 0.1),
            endIdx: Math.floor(log.log.length * i * 0.1) - 1,
        });
        const stat = sectionStat.merge(prevStat);
        stats.push(stat);
    }

    const totalStat = stats[stats.length - 1];
    const allCharacters = [...totalStat.perCharacter]
        .map(([name, _]) => name)
        .sort(jpnTextComparer);

    const data = stats.map((stat, i) => ({
        name: `${i * 10}%`,
        ...allCharacters.map(name => ({ [name]: 0 })).reduce((a, b) => ({ ...a, ...b }), {}),
        ...[...stat.perCharacter].map(([name, stat]) => ({
            [name]: valueDisplay(stat)
        })).reduce((a, b) => ({ ...a, ...b }), {})
    }));

    console.log(data);

    return (
        <Box my="2">
            <Heading my="4">技能振り統計</Heading>
            <Flex direction="row">
                <RadioCards.Root defaultValue="0" onValueChange={val => {
                    const idx = Number(val);
                    setValueDisplay(() => valueDisplays[idx]);
                }}>
                    <Flex direction="column" gap="2">
                        <RadioCards.Item value="0">
                            <Flex direction="column" width="100%">
                                <Text weight="bold">技能ロール</Text>
                            </Flex>
                        </RadioCards.Item>
                        <RadioCards.Item value="1">
                            <Flex direction="column" width="100%">
                                <Text weight="bold">技能成功</Text>
                            </Flex>
                        </RadioCards.Item>
                        <RadioCards.Item value="2">
                            <Flex direction="column" width="100%">
                                <Text weight="bold">クリティカル</Text>
                            </Flex>
                        </RadioCards.Item>
                        <RadioCards.Item value="3">
                            <Flex direction="column" width="100%">
                                <Text weight="bold">ファンブル</Text>
                            </Flex>
                        </RadioCards.Item>
                    </Flex>
                </RadioCards.Root>
                <LineChart style={{ flexGrow: 1, aspectRatio: 1.618, maxWidth: "80vw", maxHeight: "80vh" }} responsive data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-4)" />
                    <XAxis dataKey="name" stroke="var(--accent-9)" />
                    <YAxis width="auto" stroke="var(--accent-9)" />
                    <Tooltip contentStyle={{
                        opacity: 0.7,
                        backgroundColor: 'var(--gray-2)',
                        borderColor: 'var(--gray-6)',
                    }} />
                    <Legend />
                    {allCharacters.map((name, i) => <Line
                        key={name} dataKey={name}
                        stroke={colors[i]}
                    />)}
                </LineChart>
            </Flex>
        </Box >
    )
}

export default StatsChart;