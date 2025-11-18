import { useState } from 'react'
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

const App: FC = () => {
    const [log, setLog] = useState<CcfoliaMessage[] | undefined>(undefined);
    const [config, setConfig] = useState(new DisplayConfig());

    return (
        <Theme accentColor='purple' radius='large'>
            <Grid rows="1" columns="4" style={{ textWrap: "nowrap" }}>
                <Box>
                    <Heading size="7">TRPG統計ツール</Heading>
                </Box>
            </Grid>
            <Container align="center">
                <UploadForm onLogFileChanged={setLog} />
                {log !== undefined ? <Stats logFile={log} config={config} /> : ""}
                <ConfigCard log={log} config={config} onConfigChanged={setConfig} />
                <Footer />
            </Container>
        </Theme>
    )
}

export default App
