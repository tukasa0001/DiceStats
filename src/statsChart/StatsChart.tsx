import { useContext, useEffect, useRef, useState } from "react";
import { LogFile } from "../file/LogFile"
import { configCtx } from "../App";
import { Text, Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField, ScrollArea, RadioCards, Grid, CheckboxCards, Spinner, Switch } from '@radix-ui/themes';
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import cocstats, { CharacterStat, CoCStat } from "../StatsCalculator/CoCStats";
import { Search } from "lucide-react";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";

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
    logs: LogFile[],
}

type StatusStats = {
    [name: string]: {
        [status: string]: number | undefined
    } | undefined
}

function cloneStatusStats(original: StatusStats): StatusStats {
    var copy: StatusStats = {};
    for (const [key, value] of Object.entries(original)) {
        copy[key] = { ...value };
    }
    return copy;
}

type ChartDisplayMode = {
    name: string,
    calc: (params: {
        name: string,
        stat?: CharacterStat,
        status: StatusStats,
        customStatusName: string,
    }) => number,
    special?: "CustomStatus"
}

const cdm = {
    simple(name: string, func: (stat: CharacterStat) => number): ChartDisplayMode {
        return {
            name,
            calc({ stat }) {
                return stat ? func(stat) : 0;
            }
        }
    },
    status(name: string, func: (name: string, status: StatusStats) => number): ChartDisplayMode {
        return {
            name,
            calc({ name, status }) {
                return func(name, status);
            }
        }
    },
    customStatus(name: string): ChartDisplayMode {
        return {
            name,
            calc({ name, status, customStatusName }) {
                return status[name]?.[customStatusName] ?? 0
            },
            special: "CustomStatus"
        }
    }
}

const chartDisplayModes: ChartDisplayMode[] = [
    cdm.simple("技能ロール回数", stat => stat.skillRoll.rollNum),
    cdm.simple("成功回数", stat => stat.skillRoll.successNum),
    cdm.simple("失敗回数", stat => stat.skillRoll.failNum),
    cdm.simple("クリティカル回数", stat => stat.skillRoll.criticalNum),
    cdm.simple("ファンブル回数", stat => stat.skillRoll.fumbleNum),
    cdm.simple("キャラ発言数", stat => stat.talk.pcTalkNum),
    cdm.simple("キャラ発言文字数", stat => stat.talk.pcCharNum),
    cdm.status("HP", (name, status) => status[name]?.HP ?? 0),
    cdm.status("SAN値", (name, status) => status[name]?.SAN ?? 0),
    cdm.customStatus("その他のステータス"),
]

const StatsChart = (props: StatsChartProps) => {
    const { logs } = props;
    const config = useContext(configCtx);

    const [isInProgress, setInProgress] = useState(false);

    const [stats, setStats] = useState<CoCStat[]>([]);
    const [statusStats, setStatusStats] = useState<StatusStats[]>([]);

    const [deltaDisplay, setDeltaDisplay] = useState(false);

    const [chartDisplayMode, setChartDisplayMode] = useState<ChartDisplayMode>(chartDisplayModes[0]);
    const [activeCharacters, setActiveCharacters] = useState<string[]>([]);
    const [customStatusName, setCustomStatusName] = useState("");

    const [split, setSplit] = useState(10);

    const log = logs[0];

    useEffect(() => {
        if (log === undefined || log.log.length <= split) {
            return;
        }
        setInProgress(true);

        // SAN初期値を取得
        const initialStatusStat: StatusStats = {};
        for (let i = log.startIdx; i <= log.endIdx && i < log.log.length; i++) {
            const msg = log.log[i];
            if (msg instanceof ParamChangeMessage) {
                let status = initialStatusStat[msg.sender] ?? {};
                if (status[msg.paramName] === undefined) {
                    status[msg.paramName] = msg.prevValue;
                    initialStatusStat[msg.sender] = status;
                }
            }
        }

        function progress(stats: CoCStat[], statusStats: StatusStats[], i: number) {
            const logLength = log.endIdx - log.startIdx + 1;

            const startIdx = log.startIdx + Math.floor(logLength * (i - 1) * (1 / split));
            const endIdx = log.startIdx + Math.floor(logLength * i * (1 / split)) - 1;

            const prevStat = stats[i - 1].clone();
            const sectionStat = cocstats.calc(log.log, {
                ...config, startIdx, endIdx,
                ignoredChannels: log.ingoredChannels
            });
            const stat = sectionStat.merge(prevStat);
            stats.push(stat);

            // ステータス値の記録を行う
            const statusStat = cloneStatusStats(statusStats[i - 1]); // Make a copy
            for (let i = startIdx; i <= endIdx && i < log.log.length; i++) {
                const msg = log.log[i];
                let sender = msg.sender

                // 名前エイリアス処理
                for (let [before, after] of config.nameAliases) {
                    if (sender === before) {
                        sender = after;
                    }
                }

                // 統計加算
                if (msg instanceof ParamChangeMessage) {
                    let status = statusStat[sender] ?? {};
                    status[msg.paramName] = msg.value;
                    statusStat[sender] = status;
                }
            }
            statusStats.push(statusStat);

            if (i < split) {
                setTimeout(() => progress(stats, statusStats, i + 1), 10);
            }
            else {
                setStats(stats);
                setStatusStats(statusStats);
                setInProgress(false);
            }
        }
        progress([new CoCStat()], [initialStatusStat], 1);
    }, [logs, split]);

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
        name: `${i * (100 / split)}%`,
        ...activeCharacters.map(name => ({
            [name]: (() => {
                const props = {
                    name: name,
                    stat: stat.perCharacter.get(name),
                    status: statusStats[i],
                    customStatusName
                }
                if (1 <= i && deltaDisplay) {
                    const prevStat = stats[i - 1].perCharacter.get(name);
                    const prevStatusStat = statusStats[i - 1];
                    const prevProps = {
                        name: name,
                        stat: prevStat,
                        status: prevStatusStat,
                        customStatusName
                    };
                    return chartDisplayMode.calc(props) - chartDisplayMode.calc(prevProps);
                }
                else if (deltaDisplay) {
                    return 0; // 0%時点での変化量
                }
                return chartDisplayMode.calc(props);
            })()
        })).reduce((a, b) => ({ ...a, ...b }), {})
    }));

    return (
        <Box my="2">
            <Heading my="4">表示するキャラを選択</Heading>
            <CheckboxCards.Root my="2" value={activeCharacters} onValueChange={val => setActiveCharacters(val)}
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
            {/* 表示設定 */}
            <Flex direction="row" my="2" align="center" gap="2">
                {/* 分割数切り替え */}
                <Select.Root value={split.toString()} onValueChange={val => setSplit(Number(val))} disabled={isInProgress}>
                    <Select.Trigger />
                    <Select.Content>
                        <Select.Group>
                            <Select.Item value="10">10%刻み</Select.Item>
                            <Select.Item value="20">5%刻み</Select.Item>
                        </Select.Group>
                    </Select.Content>
                </Select.Root>

                {/* 変化量表示モード */}
                <Text as="label">
                    <Flex gap="1" align="center">
                        <Switch
                            checked={deltaDisplay}
                            onCheckedChange={val => setDeltaDisplay(val)} />
                        変化量を表示
                    </Flex>
                </Text>

                {/* カスタムステータス名 */}
                {chartDisplayMode.special === "CustomStatus" ? (
                    <TextField.Root placeholder="ステータス名を入力"
                        value={customStatusName} onChange={e => setCustomStatusName(e.target.value)}>
                        <TextField.Slot>

                        </TextField.Slot>
                    </TextField.Root>
                ) : null}


                {/*計算中表示*/}
                {isInProgress ? <Spinner /> : null}
            </Flex>
            <Flex direction="row" my="2">
                <RadioCards.Root defaultValue="0" onValueChange={val => {
                    const idx = Number(val);
                    setChartDisplayMode(() => chartDisplayModes[idx]);
                }}>
                    <Flex direction="column" gap="2">
                        {chartDisplayModes.map(({ name }, i) => (
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
                    {activeCharacters.filter(name => allCharacters.includes(name)).map((name, i) => <Line
                        key={name} dataKey={name}
                        stroke={colors[i]}
                        isAnimationActive={split <= 20}
                    />)}
                </LineChart>
            </Flex>
        </Box >
    )
}

export default StatsChart;