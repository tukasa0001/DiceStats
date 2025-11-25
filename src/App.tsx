import { createContext, useContext, useState } from 'react'
import type { FC } from 'react'
//import './App.css'
import "@radix-ui/themes/styles.css"
import UploadForm from './UploadForm'
import Stats from './Stats';
import ConfigCard from './config/ConfigCard';
import DisplayConfig from './config/DisplayConfig';
import Footer from './Footer';
import { CcfoliaMessage } from './ccfoliaLog/message/CcfoliaMessage';
import { Grid, Container, Heading, Theme, Box } from '@radix-ui/themes'
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import "./UploadArea.css";

export const configCtx = createContext(new DisplayConfig());
export const setConfigCtx = createContext((x: DisplayConfig) => { });

const App: FC = () => {
    const [log, setLog] = useState<CcfoliaMessage[] | undefined>(undefined);
    const [config, setConfig] = useState(new DisplayConfig());
    const [isDropping, setDropping] = useState(false);

    const onFileUploaded = async (files: File[]) => {
        const msg: CcfoliaMessage[] = [];
        for (let file of files) {
            const str = await file.text();
            const parsed = parseCcfoliaLog(str);
            msg.splice(msg.length, 0, ...parsed); // = msg.addAll(parsed);
        }
        setLog(msg);
    }

    return (
        <configCtx.Provider value={config}>
            <setConfigCtx.Provider value={setConfig}>
                <Theme accentColor='purple' radius='large'>
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

                        <Grid rows="1" columns="4" style={{ textWrap: "nowrap" }}>
                            <Box>
                                <Heading size="7">TRPG統計ツール</Heading>
                            </Box>
                        </Grid>
                        <Container align="center">
                            <UploadForm onLogFileChanged={onFileUploaded} />
                            {log !== undefined ? <Stats logFile={log} /> : ""}
                            <ConfigCard log={log} />
                            <Footer />
                        </Container>

                        {isDropping ? <div className='upload_area'>
                            <div>
                                <p>
                                    ファイルをドロップしてアップロード
                                </p>
                            </div>
                        </div> : null}
                    </div>
                </Theme>
            </setConfigCtx.Provider>
        </configCtx.Provider >
    );
}

export default App
