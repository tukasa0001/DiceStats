import { createElement, useContext, type FC } from 'react'
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
};

const Stats: FC = () => {
    const [file] = useContext(LogCtx);
    const log = parseCcfoliaLog(file);

    const stats = new Map<string, Stat>();

    for (let msg of log) {
        if (msg instanceof CoCSkillRollMessage) {
            let stat = stats.get(msg.sender);
            if (stat === undefined) {
                stat = new Stat();
                stats.set(msg.sender, stat);
            }
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
            if (msg.paramName === "HP" && msg.value < msg.prevValue) {
                // HP減少
                let stat = stats.get(msg.sender);
                if (stat === undefined) {
                    stat = new Stat();
                    stats.set(msg.sender, stat);
                }
                stat.totalDamage += msg.prevValue - msg.value;
            }
        }
    }

    const list = [...stats];

    const avgFormatter = Intl.NumberFormat("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <div className="card">
            <h1>統計情報</h1>
            <table>
                <thead>
                    <tr>
                        <th>-</th>
                        {list.map((tp) => tp[0]).map(name => createElement("th", { key: `stats-table-head-${name}` }, name))}
                    </tr>
                </thead>
                <tbody>
                    <tr className="separate">
                        <td>技能振り回数</td>
                        {list.map(tp => createElement("td", { key: `stats-rollnum-${tp[0]}` }, tp[1].skillRollNum))}
                    </tr>
                    <tr>
                        <td>平均出目</td>
                        {list.map(tp => createElement("td", { key: `stats-rollavg-${tp[0]}` }, tp[1].skillRollNum == 0 ? "N/A" : avgFormatter.format(tp[1].skillRollSum / tp[1].skillRollNum)))}
                    </tr>
                    <tr>
                        <td>一番振った技能</td>
                        {list.map(tp => {
                            if (tp[1].skillRolls.size == 0) {
                                return createElement("td", { key: `stats-mostskill-${tp[0]}` }, "N/A");
                            }
                            let sorted = [...tp[1].skillRolls]
                                .sort((a, b) => b[1] - a[1]); // 技能振り数降順に並べ替え
                            let skills = sorted
                                .filter(x => x[1] == sorted[0][1]) // 一番多く振った技能と同じ回数振った技能のみ残す
                                .map(x => x[0]) // 技能名のみ残す
                                .join(", ") + ` (${sorted[0][1]}回)`; // 技能名を結合し、末尾に回数を付け加える
                            return createElement("td", { key: `stats-mostskill-${tp[0]}` }, skills);
                        })}
                    </tr>
                    <tr className="separate">
                        <td>成功</td>
                        {list.map(tp => createElement("td", { key: `stats-success-${tp[0]}` }, tp[1].successNum))}
                    </tr>
                    <tr>
                        <td>失敗</td>
                        {list.map(tp => createElement("td", { key: `stats-fail-${tp[0]}` }, tp[1].failNum))}
                    </tr>
                    <tr>
                        <td>クリティカル</td>
                        {list.map(tp => createElement("td", { key: `stats-crit-${tp[0]}` }, tp[1].criticalNum))}
                    </tr>
                    <tr className='indent1'>
                        <td>内1クリ</td>
                        {list.map(tp => createElement("td", { key: `stats-spcrit-${tp[0]}` }, tp[1].spCriticalNum))}
                    </tr>
                    <tr>
                        <td>ファンブル</td>
                        {list.map(tp => createElement("td", { key: `stats-fum-${tp[0]}` }, tp[1].fumbleNum))}
                    </tr>
                    <tr className='indent1'>
                        <td>内100ファン</td>
                        {list.map(tp => createElement("td", { key: `stats-spfum-${tp[0]}` }, tp[1].spFumbleNum))}
                    </tr>

                    <tr className="separate">
                        <td>受けたダメージ</td>
                        {list.map(tp => createElement("td", { key: `stats-damage-${tp[0]}` }, tp[1].totalDamage))}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Stats
