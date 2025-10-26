import { createElement, useContext, type FC } from 'react'
import './App.css'
import { LogCtx } from './App';
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import { CoCSkillRollMessage } from './ccfoliaLog/message/CoCSkillRollMessage';

class Stat {
    skillRollNum: number = 0;
    skillRollSum: number = 0;
    successNum: number = 0;
    failNum: number = 0;
    criticalNum: number = 0;
    spCriticalNum: number = 0;
    fumbleNum: number = 0;
    spFumbleNum: number = 0;
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
        }
    }

    const list = [...stats];

    return (
        <div className="card">
            <table>
                <thead>
                    <tr>
                        <th>-</th>
                        {list.map((tp) => tp[0]).map(name => createElement("th", { key: `stats-table-head-${name}` }, name))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>クリティカル</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>内1クリ</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>ファンブル</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>内100ファン</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Stats
