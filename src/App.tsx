import { createContext, useState } from 'react'
import type { FC } from 'react'
import './App.css'
import UploadForm from './UploadForm'
import Stats from './Stats';

type LogState = [string, (React.Dispatch<React.SetStateAction<string>>)];
export const LogCtx: React.Context<LogState> = createContext(["", a => { }]);

const App: FC = () => {
    const [log, setLog] = useState("");

    return (
        <LogCtx.Provider value={[log, setLog]}>
            <UploadForm />
            <Stats />
        </LogCtx.Provider>
    )
}

export default App
