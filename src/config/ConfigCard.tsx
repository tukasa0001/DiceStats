import { JSX, useEffect, useState } from "react";
import DisplayConfig from "./DisplayConfig";
import "./ConfigCard.css"
import { PinIcon, Trash, X } from "lucide-react";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";

type ConfigCardProps = {
    log?: CcfoliaMessage[],
    config: DisplayConfig,
    onConfigChanged: (x: DisplayConfig) => void
}

const ConfigCard = (props: ConfigCardProps) => {
    const config = props.config;
    const setConf = props.onConfigChanged;
    const [isPinned, setPinned] = useState(false);
    const log = props.log ?? [];

    // 開始メッセージ・終了メッセージの有効性を確認
    let isStartMessageValid = config.startMessage === "";
    let isEndMessageValid = config.endMessage === "";
    for (let msg of log) {
        if (msg instanceof TalkMessage) {
            if (!isStartMessageValid && msg.text === config.startMessage) {
                isStartMessageValid = true;
                isEndMessageValid = config.endMessage === ""; // ここからまた終了メッセージの検索を開始
            }
            if (!isEndMessageValid && msg.text === config.endMessage) {
                isEndMessageValid = true;
                // 全てのチェックが終わったらbreak
                if (isStartMessageValid) {
                    break;
                }
            }
        }
    }

    return (
        <div className={`card configCard ${isPinned ? "pinned" : ""}`}>
            <h2>詳細設定</h2>
            <button className="pin" onClick={() => setPinned(!isPinned)}>
                {isPinned ? <X /> : <PinIcon />}
            </button>
            <ToggleBox title="名前の変換設定" elem={<>
                <p>
                    指定した名前を別の名前に変換します。<br />
                    変換先が重複した場合、それらの記録は統合されます。
                </p>
                {config.nameAliases.length === 0 ? "" :
                    <table className="nameAliasTable">
                        <thead>
                            <tr>
                                <th>元の名前</th>
                                <th>変換後の名前</th>
                                <th className="del">削除</th>
                            </tr>
                        </thead>
                        <tbody>
                            {config.nameAliases.map(([before, after], i) => <tr key={i}>
                                <td><input type="text"
                                    value={before}
                                    onChange={e => setConf(config.withNameAliases(arr => arr.map((tp, idx) => idx === i ? [e.target.value, tp[1]] : tp)))}
                                /></td>
                                <td><input type="text"
                                    value={after}
                                    onChange={e => setConf(config.withNameAliases(arr => arr.map((tp, idx) => idx === i ? [tp[0], e.target.value] : tp)))}
                                    placeholder="（統計から除外）"
                                /></td>
                                <td className="del"><button onClick={() => setConf(config.withNameAliases(arr => arr.filter((_, idx) => idx != i)))}><Trash /></button></td>
                            </tr>)}
                        </tbody>
                    </table>
                }
                <button onClick={() => setConf(config.withNameAliases(arr => [...arr, ["", ""]]))}>追加</button>
            </>} />

            <ToggleBox title="統計範囲を変更" elem={<>
                <p>
                    特定の発言をトリガーに、範囲内の統計を出力します
                </p>
                <div className="stats-range-config">
                    <span>範囲：</span>
                    <input type="text"
                        className={isStartMessageValid ? "" : "error-text-box"}
                        value={props.config.startMessage}
                        onChange={e => setConf(props.config.withStartMessage(e.target.value.trim()))}
                        placeholder="最初から"
                    />
                    <span> ～ </span>
                    <input type="text"
                        className={isEndMessageValid ? "" : "error-text-box"}
                        value={props.config.endMessage}
                        onChange={e => setConf(props.config.withEndMessage(e.target.value.trim()))}
                        placeholder="最後まで"
                    />
                </div>
            </>} />
            <ToggleBox title="その他の設定" elem={<>
                <label className="checkbox-label">
                    <input type="checkbox"
                        checked={config.ignoreSecretDice}
                        onChange={e => setConf(config.withIgnoreSecretDice(e.target.checked))}
                    />
                    シークレットダイスを無視する
                </label>
            </>} />
        </div>
    )
}

const ToggleBox = (props: { title: string, elem: JSX.Element }) => {
    const [show, setShow] = useState(false);

    return (
        <div className={`toggleBox ${show ? "active" : "inactive"}`}>
            <button className="toggleButton" onClick={() => setShow(!show)}>{`${show ? "▼" : "▶"} ${props.title}`}</button>
            <div className="toggleElement"><div>{props.elem}</div></div>
        </div>
    );
}

export default ConfigCard;