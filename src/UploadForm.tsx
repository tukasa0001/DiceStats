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

        // === 簡易統計処理 ===
        const logs = parseCcfoliaLog(str);
        console.log("==stats==")
        let table: any = {};
        logs.forEach(msg => {
            let dice = msg as CoCSkillRollMessage;
            if (table[dice.sender] == undefined) {
                table[dice.sender] = { crit: 0, fum: 0 };
            }
            if (dice.isCritical()) {
                table[dice.sender].crit += 1;
            }
            if (dice.isFumble()) {
                table[dice.sender].fum += 1;
            }
        });

        console.log(table);
    }

    return (
        <div className="card">
            <h1>1.ログをアップロード</h1>
            <p>Ccfoliaのログをアップロードしてください</p>
            <form>
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
