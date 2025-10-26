import { createElement, useContext, useState } from 'react'
import type { FC } from 'react'
import parseCcfoliaLog from "./ccfoliaLog/CcfoliaLog"
import { CoCSkillRollMessage } from './ccfoliaLog/message/CoCSkillRollMessage';
import { LogCtx } from './App';

const UploadForm: FC = () => {
    const [file, setFile] = useContext(LogCtx);

    const onFileChanged = async (file: File) => {
        const str = await file.text();
        setFile(str);
    }

    return (
        <div className="card">
            <h1>TRPG統計ツール</h1>
            <p>
                Ccfoliaのログからダイスロールなどの統計を取得します。<br />
                CoC6版のみ対応しています。
            </p>
            <form>
                <label>Ccfoliaのログをアップロードしてください： </label>
                <input type="file" accept=".html,.htm" onChange={e => {
                    if (e.target.files != null) {
                        const file = e.target.files[0];
                        onFileChanged(file);
                    }
                }}></input>
            </form>
        </div>
    )
}

export default UploadForm
