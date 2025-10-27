import { useState } from 'react'
import type { FC } from 'react'
import './App.css'
import UploadForm from './UploadForm'
import Stats from './Stats';
import ConfigCard from './config/ConfigCard';
import DisplayConfig from './config/DisplayConfig';

const App: FC = () => {
    const [log, setLog] = useState<string | undefined>(undefined);
    const [config] = useState(new DisplayConfig());

    return (
        <>
            <UploadForm onLogFileChanged={setLog} />
            {log !== undefined ? <Stats logFile={log} /> : ""}
            <ConfigCard config={config} />
        </>
    )
}

export default App
