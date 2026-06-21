import { useContext } from "react";
import { LogFile } from "../file/LogFile"
import { configCtx } from "../App";
import { Text, Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField } from '@radix-ui/themes';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import cocstats, { CoCStat } from "../StatsCalculator/CoCStats";

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

const StatsChart = (props: StatsChartProps) => {
    const { logs } = props;
    const config = useContext(configCtx);

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
            [name]: stat.skillRoll.rollNum
        })).reduce((a, b) => ({ ...a, ...b }), {})
    }));

    console.log(data);

    return (
        <Box my="2">
            <Heading my="4">技能振り統計</Heading>
            <LineChart style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }} responsive data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-4)" />
                <XAxis dataKey="name" stroke="var(--accent-9)" />
                <YAxis width="auto" stroke="var(--accent-9)" />
                <Tooltip />
                <Legend />
                {allCharacters.map((name, i) => <Line
                    key={name} dataKey={name}
                    stroke={colors[i]}
                />)}
            </LineChart>
        </Box>
    )
}

export default StatsChart;