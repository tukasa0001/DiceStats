import { JSX, useState } from "react";
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