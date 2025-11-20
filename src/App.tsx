import { useState } from 'react'
import type { FC } from 'react'
import './App.css'
import UploadForm from './UploadForm'
import Stats from './Stats';
import ConfigCard from './config/ConfigCard';
import DisplayConfig from './config/DisplayConfig';
import Footer from './Footer';
import { CcfoliaMessage } from './ccfoliaLog/message/CcfoliaMessage';
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import "./UploadArea.css";

const App: FC = () => {
    const [log, setLog] = useState<CcfoliaMessage[] | undefined>(undefined);
    const [config, setConfig] = useState(new DisplayConfig());
    const [isDropping, setDropping] = useState(false);

    const onFileChanged = async (file: File) => {
        const str = await file.text();
        const parsed = parseCcfoliaLog(str);
        setLog(parsed);
    }

    return <>
        <div onDrop={e => {
            alert("dropped");
            setDropping(false);
            e.preventDefault();
        }}
            onDragOver={e => {
                e.preventDefault();
            }}
            onDragEnter={e => setDropping(true)}
            onDragExit={e => setDropping(false)}>
            <UploadForm onLogFileChanged={setLog} />
            {log !== undefined ? <Stats logFile={log} config={config} /> : ""}
            <ConfigCard log={log} config={config} onConfigChanged={setConfig} />
            <Footer />

            {isDropping ? <div className='upload_area'>
                <div>
                    <p>
                        ファイルをドロップしてアップロード
                    </p>
                </div>
            </div> : null}
        </div>
    </>
}

export default App
