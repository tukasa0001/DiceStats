import { JSX, useState } from "react";
import DisplayConfig from "./DisplayConfig";
import "./ConfigCard.css"

type ConfigCardProps = {
    config: DisplayConfig
}

const ConfigCard = (props: ConfigCardProps) => {
    const [show, setShow] = useState(false);

    return (
        <div className="card">
            <h2>詳細設定</h2>
            <ToggleBox title="名前を読み替える" elem={<p>todo</p>} />
        </div>
    )
}

const ToggleBox = (props: { title: string, elem: JSX.Element }) => {
    const [show, setShow] = useState(false);

    return (
        <div>
            <p className="toggleButton" onClick={() => setShow(!show)}>{`${show ? "▼" : "▶"} ${props.title}`}</p>
            {show ? <div className="toggleBox">{props.elem}</div> : null}
        </div>
    );
}

export default ConfigCard;