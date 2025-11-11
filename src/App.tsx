import { useState } from 'react'
import type { FC } from 'react'
import './App.css'
import UploadForm from './UploadForm'
import Stats from './Stats';
import ConfigCard from './config/ConfigCard';
import DisplayConfig from './config/DisplayConfig';
import Footer from './Footer';
import { CcfoliaMessage } from './ccfoliaLog/message/CcfoliaMessage';

const App: FC = () => {
    const [log, setLog] = useState<CcfoliaMessage[] | undefined>(undefined);
    const [config, setConfig] = useState(new DisplayConfig());

    return (
        <>
            <UploadForm onLogFileChanged={setLog} />
            {log !== undefined ? <Stats logFile={log} config={config} /> : ""}
            <ConfigCard log={log} config={config} onConfigChanged={setConfig} />
            <Footer />
        </>
    )
}

export default App
