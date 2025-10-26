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

    const avgFormatter = Intl.NumberFormat("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

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
                        <td>技能振り回数</td>
                        {list.map(tp => createElement("td", { key: `stats-rollnum-${tp[0]}` }, tp[1].skillRollNum))}
                    </tr>
                    <tr>
                        <td>平均出目</td>
                        {list.map(tp => createElement("td", { key: `stats-rollavg-${tp[0]}` }, tp[1].skillRollNum == 0 ? "N/A" : avgFormatter.format(tp[1].skillRollSum / tp[1].skillRollNum)))}
                    </tr>
                    <tr>
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
                    <tr>
                        <td>内1クリ</td>
                        {list.map(tp => createElement("td", { key: `stats-spcrit-${tp[0]}` }, tp[1].spCriticalNum))}
                    </tr>
                    <tr>
                        <td>ファンブル</td>
                        {list.map(tp => createElement("td", { key: `stats-fum-${tp[0]}` }, tp[1].fumbleNum))}
                    </tr>
                    <tr>
                        <td>内100ファン</td>
                        {list.map(tp => createElement("td", { key: `stats-spfum-${tp[0]}` }, tp[1].spFumbleNum))}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Stats
