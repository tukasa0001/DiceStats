import { createContext, useContext, useState } from 'react'
import type { FC } from 'react'
import "@radix-ui/themes/styles.css"
import HomeTab from './Home'
import Stats from './Stats';
import ConfigCard from './config/ConfigCard';
import DisplayConfig from './config/DisplayConfig';
import Footer from './Footer';
import { CcfoliaMessage } from './ccfoliaLog/message/CcfoliaMessage';
import { Grid, Container, Heading, Theme, Box, Flex, Tabs, Button, Text } from '@radix-ui/themes'
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import "./UploadArea.css";
import { MoonIcon, SunIcon } from 'lucide-react';
import { LogView } from './logView/LogView';
import { FilteredLogView } from './logView/FilteredLogView';
import PlayerStats from './PlayerStats/PlayerStats';
import { LogFile } from './file/LogFile';
import { MultiLogView } from './logView/MultiLogView';
import cocstats, { CoCStat } from './StatsCalculator/CoCStats';

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
            const str = await file.text();
            const parsed = parseCcfoliaLog(str);
            const idx = logs.push({
                filename: file.name,
                log: parsed,
                startIdx: 0,
                endIdx: parsed.length - 1
            });
            (async () => {
                const stat = await cocstats.calcAsync(parsed, {
                    ...config,
                    startIdx: 0,
                    endIdx: parsed.length - 1
                })
                // FIXIT: logが下のsetLogを行う前の空配列になる
                setLog(log.map((logFile, i) => idx === i ? { ...logFile, stat } : logFile))
            })();
        }
        setLog(logs);
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
                        <Tabs.Root value={tab} onValueChange={tab => setTab(tab)}>
                            <Tabs.List>
                                <Grid mx="4" rows="1" columns="3" width="100%" style={{ textWrap: "nowrap" }}>
                                    <Box />
                                    <Flex align="center" justify="center">
                                        <Tabs.Trigger value="home">ホーム</Tabs.Trigger>
                                        <Tabs.Trigger value="stats">統計</Tabs.Trigger>
                                        <Tabs.Trigger value="logView">表示</Tabs.Trigger>
                                        <Tabs.Trigger value="plStats">成績表</Tabs.Trigger>
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
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="stats">
                                <Flex direction="column" mx="4">
                                    <Stats logs={log} />
                                    <ConfigCard />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="logView">
                                <Flex direction="column" mx="4">
                                    <MultiLogView logs={log} />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="plStats">
                                <Flex direction="column" mx="4">
                                    <PlayerStats logs={log} />
                                </Flex>
                            </Tabs.Content>
                            <Flex direction="column" mx="4">
                                <Footer />
                            </Flex>
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
