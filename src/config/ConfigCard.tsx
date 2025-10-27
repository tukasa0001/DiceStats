import { JSX, useEffect, useState } from "react";
import DisplayConfig from "./DisplayConfig";
import "./ConfigCard.css"

type ConfigCardProps = {
    config: DisplayConfig
}

const ConfigCard = (props: ConfigCardProps) => {
    const config = props.config;
    const [show, setShow] = useState(false);

    return (
        <div className="card">
            <h2>詳細設定</h2>
            <ToggleBox title="名前の読み替え設定" elem={<>
                <p>
                    ある名前を別の名前として処理します<br />
                    名前を省略できるほか、複数の名前の記録を統合することもできます
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>元の名前</th>
                            <th>読み替え後の名前</th>
                            <th>削除</th>
                        </tr>
                    </thead>
                    <tbody>
                        {config.nameAliases.map(([before, after], i) => <tr key={i}>
                            <td><input type="text" value={before} onChange={e => config.nameAliases[i][0] = e.target.value} /></td>
                            <td><input type="text" value={after} onChange={e => config.nameAliases[i][1] = e.target.value} /></td>
                            <td><button onClick={() => config.nameAliases.splice(i, 1)}>削除</button></td>
                        </tr>)}
                    </tbody>
                </table>
                <button onClick={() => config.nameAliases.push(["", ""])}>追加</button>
            </>} />
        </div>
    )
}

const ToggleBox = (props: { title: string, elem: JSX.Element }) => {
    const [show, setShow] = useState(false);

    return (
        <div>
            <button className="toggleButton" onClick={() => setShow(!show)}>{`${show ? "▼" : "▶"} ${props.title}`}</button>
            {show ? <div className="toggleBox">{props.elem}</div> : null}
        </div>
    );
}

export default ConfigCard;