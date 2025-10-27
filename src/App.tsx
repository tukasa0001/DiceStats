import { useState } from 'react'
import type { FC } from 'react'
import './App.css'
import UploadForm from './UploadForm'
import Stats from './Stats';

const App: FC = () => {
    const [log, setLog] = useState("");

    return (
        <>
            <UploadForm onLogFileChanged={setLog} />
            <Stats logFile={log} />
        </>
    )
}

export default App
