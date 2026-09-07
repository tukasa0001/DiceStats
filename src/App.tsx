import { createContext, useContext, useState } from 'react'
import type { FC } from 'react'
import "@radix-ui/themes/styles.css"
import HomeTab from './Home'
import Stats from './Stats';
import ConfigCard from './config/ConfigCard';
import DisplayConfig from './config/DisplayConfig';
import Footer from './Footer';
import { CcfoliaMessage } from './ccfoliaLog/message/CcfoliaMessage';
import { Grid, Container, Heading, Theme, Box, Flex, Tabs, Button, Text, Tooltip } from '@radix-ui/themes'
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import "./UploadArea.css";
import { MoonIcon, SunIcon } from 'lucide-react';
import { LogView } from './logView/LogView';
import { FilteredLogView } from './logView/FilteredLogView';
import PlayerStats from './PlayerStats/PlayerStats';
import { LogFile } from './file/LogFile';
import { MultiLogView } from './logView/MultiLogView';
import cocstats from './StatsCalculator/CoCStats';
import StatsChart from './statsChart/StatsChart';

export const configCtx = createContext(new DisplayConfig());
export const setConfigCtx = createContext((x: DisplayConfig) => { });

const App: FC = () => {
    // 初期値は端末の設定に依存する (TODO:状態をcookieに保存したい)
    const [isDark, setIsDark] = useState(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [log, setLog] = useState<LogFile[]>([]);
    const [config, setConfig] = useState(new DisplayConfig());
    const [tab, setTab] = useState("home");
    const [isDropping, setDropping] = useState(false);

    const onFileUploaded = async (files: File[]) => {
        const logs: LogFile[] = [];
        for (let file of files) {
            const result = await parseCcfoliaLog(file);
            if (!result.success) {
                //失敗
                console.warn(result.reason);
                return;
            }
            const { msgs, gameSystemType, icons } = result;
            const stat = cocstats.calc(msgs, {
                ...config,
                startIdx: 0,
                endIdx: msgs.length - 1
            })
            logs.push({
                filename: file.name,
                gameSystem: gameSystemType,
                log: msgs,
                stat: stat,
                startIdx: 0,
                endIdx: msgs.length - 1,
                ingoredChannels: [],
                icons
            })
        }
        setLog(logs);
        if (tab === "home") {
            setTab("stats");
        }
    }

    return (
        <configCtx.Provider value={config}>
            <setConfigCtx.Provider value={setConfig}>
                <div onDrop={e => {
                    if (!e.dataTransfer.types.includes("Files")) return;
                    onFileUploaded([...e.dataTransfer.files]);
                    setDropping(false);
                    e.preventDefault();
                }}
                    onDragOver={e => {
                        if (!e.dataTransfer.types.includes("Files")) return;
                        e.preventDefault();
                    }}
                    onDragEnter={e => {
                        if (!e.dataTransfer.types.includes("Files")) return;
                        setDropping(true)
                    }}
                    onDragExit={e => {
                        if (!e.dataTransfer.types.includes("Files")) return;
                        setDropping(false)
                    }}>
                    <Theme accentColor="indigo" radius='large' appearance={isDark ? "dark" : "light"}>
                        <Tabs.Root value={tab} onValueChange={tab => setTab(tab)} style={{
                            minHeight: "100dvh",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <Tabs.List>
                                <Grid mx="4" rows="1" columns="3" width="100%" style={{ textWrap: "nowrap" }}>
                                    <Box />
                                    <Flex align="center" justify="center">
                                        <Tabs.Trigger value="home">
                                            <Tooltip content="ファイルのアップロードや統計範囲の設定を行う">
                                                <Text>ホーム</Text>
                                            </Tooltip>
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="stats">
                                            <Tooltip content="キャラごとの統計を見る">
                                                <Text>統計</Text>
                                            </Tooltip>
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="charts">
                                            <Tooltip content="統計をグラフで見る">
                                                <Text>グラフ</Text>
                                            </Tooltip>
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="logView">
                                            <Tooltip content="ログの内容を見る">
                                                <Text>ログ</Text>
                                            </Tooltip>
                                        </Tabs.Trigger>
                                        <Tabs.Trigger value="plStats">
                                            <Tooltip content="あなたの統計を見る">
                                                <Text>成績表</Text>
                                            </Tooltip>
                                        </Tabs.Trigger>
                                    </Flex>
                                    <Flex align="center" justify="end">
                                        <Button variant="ghost" onClick={e => setIsDark(!isDark)}>
                                            {isDark ? <SunIcon /> : <MoonIcon />}
                                        </Button>
                                    </Flex>
                                </Grid>
                            </Tabs.List>

                            <Tabs.Content value="home">
                                <Flex direction="column" mx="4">
                                    <HomeTab logs={log} setLogs={setLog} onLogFileChanged={onFileUploaded} />
                                    <Footer />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="stats">
                                <Flex direction="column" mx="4">
                                    <Stats logs={log} />
                                    <ConfigCard />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="charts">
                                <Flex direction="column" mx="4">
                                    <StatsChart logs={log} />
                                    <ConfigCard />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="logView" asChild>
                                <Flex direction="column" mx="4" style={{
                                    flexGrow: 1
                                }}>
                                    <MultiLogView logs={log} />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="plStats">
                                <Flex direction="column" mx="4">
                                    <PlayerStats logs={log} />
                                </Flex>
                            </Tabs.Content>
                        </Tabs.Root>

                        {isDropping ? <div className='upload_area'>
                            <div>
                                <p>
                                    ファイルをドロップしてアップロード
                                </p>
                            </div>
                        </div> : null}
                    </Theme>
                </div>
            </setConfigCtx.Provider>
        </configCtx.Provider >
    );
}

export default App
