import { createElement, useContext, useState, type FC } from 'react'
import './App.css'
import { LogCtx } from './App';
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import { CoCSkillRollMessage } from './ccfoliaLog/message/CoCSkillRollMessage';
import "./Stats.css"
import { ParamChangeMessage } from './ccfoliaLog/message/ParamChangeMessage';

class Stat {
    // 技能関連
    skillRollNum: number = 0;
    skillRollSum: number = 0;
    successNum: number = 0;
    failNum: number = 0;
    criticalNum: number = 0;
    spCriticalNum: number = 0;
    fumbleNum: number = 0;
    spFumbleNum: number = 0;
    skillRolls: Map<string, number> = new Map<string, number>();

    // ステータス関連
    totalDamage: number = 0;
    minHealth: number | undefined = undefined;
    totalLostSAN: number = 0;
    minSAN: number | undefined = undefined
};

const Stats: FC = () => {
    const [showPercentage, setShowPercentage] = useState(false);

    const [file] = useContext(LogCtx);
    const log = parseCcfoliaLog(file);

    const stats = new Map<string, Stat>();
    const getStat = (name: string) => {
        let stat = stats.get(name);
        if (stat === undefined) {
            stat = new Stat();
            stats.set(name, stat);
        }
        return stat;
    }

    for (let msg of log) {
        if (msg instanceof CoCSkillRollMessage) {
            const stat = getStat(msg.sender);
            stat.skillRollNum++;
            stat.skillRollSum += msg.diceValue;
            if (msg.isSuccess()) {
                stat.successNum++;
                if (msg.isCritical()) {
                    stat.criticalNum++;
                    if (msg.diceValue === 1) {
                        stat.spCriticalNum++;
                    }
                }
            }
            else {
                stat.failNum++;
                if (msg.isFumble()) {
                    stat.fumbleNum++;
                    if (msg.diceValue === 100) {
                        stat.spFumbleNum++;
                    }
                }
            }
            stat.skillRolls.set(msg.skill, (stat.skillRolls.get(msg.skill) ?? 0) + 1);
        }
        else if (msg instanceof ParamChangeMessage) {
            if (msg.paramName === "HP") {
                // HP変動
                const stat = getStat(msg.sender);
                if (stat.minHealth === undefined || msg.value < stat.minHealth) {
                    stat.minHealth = msg.value;
                }
                if (msg.value < msg.prevValue) {
                    // HP減少
                    stat.totalDamage += msg.prevValue - msg.value;
                }
            }
            if (msg.paramName === "SAN") {
                // SAN変動
                const stat = getStat(msg.sender);
                if (stat.minSAN === undefined || msg.value < stat.minSAN) {
                    stat.minSAN = msg.value;
                }
                if (msg.value < msg.prevValue) {
                    // SAN減少
                    stat.totalLostSAN += msg.prevValue - msg.value;
                }
            }
        }
    }

    const list = [...stats];

    const avgFormatter = Intl.NumberFormat("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const percentageFormatter = Intl.NumberFormat("ja-JP", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <div className="card">
            <h2>技能振り統計</h2>
            <label>
                <input type="checkbox" checked={showPercentage} onChange={e => setShowPercentage(e.target.checked)} />
                割合で表示
            </label>
            <StatTable characters={list.map(tp => tp[0])} data={[
                Data("技能振り回数", list.map(tp => tp[1].skillRollNum)),
                Data("平均出目", list.map(tp => tp[1].skillRollNum == 0 ? "N/A" : avgFormatter.format(tp[1].skillRollSum / tp[1].skillRollNum))),
                Data("一番振った技能", list.map(tp => {
                    if (tp[1].skillRolls.size == 0) {
                        return "N/A";
                    }
                    let sorted = [...tp[1].skillRolls]
                        .sort((a, b) => b[1] - a[1]); // 技能振り数降順に並べ替え
                    return sorted
                        .filter(x => x[1] == sorted[0][1]) // 一番多く振った技能と同じ回数振った技能のみ残す
                        .map(x => x[0]) // 技能名のみ残す
                        .join(", ") + ` (${sorted[0][1]}回)`; // 技能名を結合し、末尾に回数を付け加える
                })),

                Data("成功数", list.map(tp => tp[1].successNum), { separate: true }),
                Data("失敗数", list.map(tp => tp[1].failNum)),
                Data("クリティカル数", list.map(tp => tp[1].criticalNum)),
                Data("内1クリ", list.map(tp => tp[1].spCriticalNum), { indent: true }),
                Data("ファンブル数", list.map(tp => tp[1].fumbleNum)),
                Data("内100ファン", list.map(tp => tp[1].spFumbleNum), { indent: true }),

                Data("成功率", list.map(tp => percentageFormatter.format(tp[1].successNum / tp[1].skillRollNum)), { separate: true }),
                Data("失敗率", list.map(tp => percentageFormatter.format(tp[1].failNum / tp[1].skillRollNum))),
                Data("クリティカル率", list.map(tp => percentageFormatter.format(tp[1].criticalNum / tp[1].skillRollNum))),
                Data("内1クリ", list.map(tp => percentageFormatter.format(tp[1].spCriticalNum / tp[1].skillRollNum)), { indent: true }),
                Data("ファンブル率", list.map(tp => percentageFormatter.format(tp[1].fumbleNum / tp[1].skillRollNum))),
                Data("内100ファン", list.map(tp => percentageFormatter.format(tp[1].spFumbleNum / tp[1].skillRollNum)), { indent: true })
            ]} />

            <h2>ステータス統計</h2>
            <StatTable characters={list.map(tp => tp[0])} data={[
                Data("合計被ダメージ", list.map(tp => tp[1].totalDamage)),
                Data("最低HP", list.map(tp => tp[1].minHealth ?? "N/A")),
                Data("合計喪失SAN", list.map(tp => tp[1].totalLostSAN)),
                Data("最低SAN", list.map(tp => tp[1].minSAN ?? "N/A"))
            ]} />
        </div>
    );
}

type StatTableProps = {
    characters: string[],
    data: StatTableData[]
};

type StatTableData = {
    title: string,
    values: (string | number)[],
    indent: boolean,
    separate: boolean
};

const StatTable = (props: StatTableProps) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>-</th>
                    {props.characters.map(name => <th key={name}>{name}</th>)}
                </tr>
            </thead>
            <tbody>
                {props.data.map((data, i) => {
                    return (
                        <tr key={`${data.title}-${i}`} className={`${data.indent ? "indent1" : ""} ${data.separate ? "separate" : ""}`}>
                            <td>{data.title}</td>
                            {data.values.map((val, i) => <td key={`${props.characters[i]}-${data.title}`}>{val}</td>)}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

const Data = (title: string, values: (string | number)[], props: { indent?: boolean, separate?: boolean } = {}): StatTableData => {
    return {
        title: title,
        values: values,
        indent: props.indent ?? false,
        separate: props.separate ?? false
    }
}

export default Stats
