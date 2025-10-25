import { createElement, useState } from 'react'
import type { FC } from 'react'
import parseCcfoliaLog from "./ccfoliaLog/CcfoliaLog"
import { jsx } from 'react/jsx-runtime';
import { CoCSkillRollMessage } from './ccfoliaLog/message/CoCSkillRollMessage';

const UploadForm: FC = () => {
    const [file, setFile] = useState("");
    const [display, setDisplay] = useState("no data");

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
        <div className="step">
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
            {parseCcfoliaLog(file).map((msg, i) => createElement("p", { key: i + 3000 }, msg.toString()))}
        </div>
    )
}

export default UploadForm
