import { createContext, useContext, useState } from 'react'
import type { FC } from 'react'
import "@radix-ui/themes/styles.css"
import UploadForm from './UploadForm'
import Stats from './Stats';
import ConfigCard from './config/ConfigCard';
import DisplayConfig from './config/DisplayConfig';
import Footer from './Footer';
import { CcfoliaMessage } from './ccfoliaLog/message/CcfoliaMessage';
import { Grid, Container, Heading, Theme, Box, Flex, Tabs, Button } from '@radix-ui/themes'
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import "./UploadArea.css";
import { MoonIcon, SunIcon } from 'lucide-react';
import { LogView } from './logView/LogView';
import { FilteredLogView } from './logView/FilteredLogView';

export const configCtx = createContext(new DisplayConfig());
export const setConfigCtx = createContext((x: DisplayConfig) => { });

const App: FC = () => {
    // 初期値は端末の設定に依存する (TODO:状態をcookieに保存したい)
    const [isDark, setIsDark] = useState(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [log, setLog] = useState<CcfoliaMessage[] | undefined>(undefined);
    const [config, setConfig] = useState(new DisplayConfig());
    const [tab, setTab] = useState("upload");
    const [isDropping, setDropping] = useState(false);

    const onFileUploaded = async (files: File[]) => {
        const msg: CcfoliaMessage[] = [];
        for (let file of files) {
            const str = await file.text();
            const parsed = parseCcfoliaLog(str);
            msg.splice(msg.length, 0, ...parsed); // = msg.addAll(parsed);
        }
        setLog(msg);
        setTab("stats");
    }

    return (
        <configCtx.Provider value={config}>
            <setConfigCtx.Provider value={setConfig}>
                <div onDrop={e => {
                    onFileUploaded([...e.dataTransfer.files]);
                    setDropping(false);
                    e.preventDefault();
                }}
                    onDragOver={e => {
                        e.preventDefault();
                    }}
                    onDragEnter={e => setDropping(true)}
                    onDragExit={e => setDropping(false)}>
                    <Theme accentColor="indigo" radius='large' appearance={isDark ? "dark" : "light"}>
                        <Tabs.Root value={tab} onValueChange={tab => setTab(tab)}>
                            <Tabs.List>
                                <Grid mx="4" rows="1" columns="3" width="100%" style={{ textWrap: "nowrap" }}>
                                    <Box>
                                        <Heading size="7">TRPG統計ツール</Heading>
                                    </Box>
                                    <Flex align="center" justify="center">
                                        <Tabs.Trigger value="upload">ログ選択</Tabs.Trigger>
                                        <Tabs.Trigger value="stats">統計</Tabs.Trigger>
                                        <Tabs.Trigger value="logView">表示</Tabs.Trigger>
                                    </Flex>
                                    <Flex align="center" justify="end">
                                        <Button variant="ghost" onClick={e => setIsDark(!isDark)}>
                                            {isDark ? <SunIcon /> : <MoonIcon />}
                                        </Button>
                                    </Flex>
                                </Grid>
                            </Tabs.List>

                            <Tabs.Content value="upload">
                                <Flex direction="column" mx="4">
                                    <UploadForm onLogFileChanged={onFileUploaded} />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="stats">
                                <Flex direction="column" mx="4">
                                    <Stats logFile={log ?? []} />
                                    <ConfigCard log={log} />
                                </Flex>
                            </Tabs.Content>
                            <Tabs.Content value="logView">
                                <Flex direction="column" mx="4">
                                    <FilteredLogView logs={log ?? []} />
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
