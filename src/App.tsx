import { useState } from 'react'
import type { FC } from 'react'
import './App.css'
import UploadForm from './UploadForm'
import Stats from './Stats';

const App: FC = () => {
    const [log, setLog] = useState<string | undefined>(undefined);

    return (
        <>
            <UploadForm onLogFileChanged={setLog} />
            {log !== undefined ? <Stats logFile={log} /> : ""}
        </>
    )
}

export default App
