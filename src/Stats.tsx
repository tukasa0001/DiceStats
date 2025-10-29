import './App.css'
import parseCcfoliaLog from './ccfoliaLog/CcfoliaLog';
import { CoCSkillRollMessage } from './ccfoliaLog/message/CoCSkillRollMessage';
import "./Stats.css"
import { ParamChangeMessage } from './ccfoliaLog/message/ParamChangeMessage';
import { TalkMessage } from './ccfoliaLog/message/TalkMessasge';
import DisplayConfig from './config/DisplayConfig';
import { SanityCheckMessage } from './ccfoliaLog/message/SanityCheckMessage';
import { useState } from 'react';

class SkillStat {
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

    increment(msg: CoCSkillRollMessage) {
        this.skillRollNum++;
        this.skillRollSum += msg.diceValue;
        if (msg.isSuccess()) {
            this.successNum++;
            if (msg.isCritical()) {
                this.criticalNum++;
                if (msg.diceValue === 1) {
                    this.spCriticalNum++;
                }
            }
        }
        else {
            this.failNum++;
            if (msg.isFumble()) {
                this.fumbleNum++;
                if (msg.diceValue === 100) {
                    this.spFumbleNum++;
                }
            }
        }
        this.skillRolls.set(msg.skill, (this.skillRolls.get(msg.skill) ?? 0) + 1);
    }
}
class SanityCheckStat {
    // SANチェック
    checkNum: number = 0;
    successNum: number = 0;
    criticalNum: number = 0;
    fumbleNum: number = 0;
};
class StatusStat {
    // ステータス関連
    totalDamage: number = 0;
    minHealth: number | undefined = undefined;
    totalLostSAN: number = 0;
    minSAN: number | undefined = undefined;
}
class OtherStat {
    // その他
    talkNum: number = 0;
    charNum: number = 0;
};

type StatsProps = {
    logFile: string
    config: DisplayConfig
}

const Stats = (props: StatsProps) => {
    const [skillFilter, setSkillFinter] = useState("");

    const log = parseCcfoliaLog(props.logFile);

    const skillStats = new Map<string, SkillStat>();
    const filteredSkillStats = new Map<string, SkillStat>();
    const statusStats = new Map<string, StatusStat>();
    const sanityCheckStatus = new Map<string, SanityCheckStat>();
    const otherStats = new Map<string, OtherStat>();
    const allSkills = new Set<string>();
    const getStat = <T,>(map: Map<string, T>, name: string, factory: new () => T): T => {
        let stat = map.get(name);
        if (stat === undefined) {
            stat = new factory();
            map.set(name, stat);
        }
        return stat;
    }

    let isStarted: boolean = props.config.startMessage === "";
    for (let msg of log) {
        // 開始メッセージまで無視
        if (!isStarted && msg instanceof TalkMessage && props.config.startMessage === msg.text) {
            isStarted = true;
            skillStats.clear();
            filteredSkillStats.clear();
            statusStats.clear();
            sanityCheckStatus.clear();
            otherStats.clear();
        }

        let sender = msg.sender;
        for (let [before, after] of props.config.nameAliases) {
            if (sender === before) {
                sender = after;
                break;
            }
        }
        // 送信者名が空文字列の場合は無視
        if (sender === "") {
            continue;
        }
        if (msg instanceof CoCSkillRollMessage) {
            const stat = getStat(skillStats, sender, SkillStat);
            stat.increment(msg);
            if (msg.skill === skillFilter) {
                const stat2 = getStat(filteredSkillStats, sender, SkillStat);
                stat2.increment(msg);
            }
            allSkills.add(msg.skill);
        }
        else if (msg instanceof ParamChangeMessage) {
            if (msg.paramName === "HP") {
                // HP変動
                const stat = getStat(statusStats, sender, StatusStat);
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
                const stat = getStat(statusStats, sender, StatusStat);
                if (stat.minSAN === undefined || msg.value < stat.minSAN) {
                    stat.minSAN = msg.value;
                }
                if (msg.value < msg.prevValue) {
                    // SAN減少
                    stat.totalLostSAN += msg.prevValue - msg.value;
                }
            }
        }
        else if (msg instanceof SanityCheckMessage) {
            const stat = getStat(sanityCheckStatus, sender, SanityCheckStat);
            stat.checkNum++;
            if (msg.isSuccess()) stat.successNum++;
            if (msg.isCritical()) stat.criticalNum++;
            if (msg.isFumble()) stat.fumbleNum++;
        }
        else if (msg instanceof TalkMessage) {
            const stat = getStat(otherStats, sender, OtherStat);
            stat.talkNum++;
            stat.charNum += msg.text.length;
        }
    }

    const skills = [...skillStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const filteredSkills = [...filteredSkillStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const status = [...statusStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const sanity = [...sanityCheckStatus].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const others = [...otherStats].sort((a, b) => a[0].localeCompare(b[0], "ja"));

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
        <div className="card stats_card">
            {isStarted ? "" : <div className="errorBlock">
                開始メッセージが見つかりませんでした<br />
                ログの最初からの統計を表示します
            </div>}
            <h2>技能振り統計</h2>
            <StatTable characters={skills.map(tp => tp[0])} data={[
                Data("技能振り回数", skills.map(tp => tp[1].skillRollNum)),
                Data("平均出目", skills.map(tp => tp[1].skillRollNum == 0 ? "N/A" : avgFormatter.format(tp[1].skillRollSum / tp[1].skillRollNum))),
                Data("一番振った技能", skills.map(tp => {
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

                Data("成功数", skills.map(tp => tp[1].successNum), { separate: true }),
                Data("失敗数", skills.map(tp => tp[1].failNum)),
                Data("クリティカル数", skills.map(tp => tp[1].criticalNum)),
                Data("内1クリ", skills.map(tp => tp[1].spCriticalNum), { indent: true }),
                Data("ファンブル数", skills.map(tp => tp[1].fumbleNum)),
                Data("内100ファン", skills.map(tp => tp[1].spFumbleNum), { indent: true }),

                Data("成功率", skills.map(tp => percentageFormatter.format(tp[1].successNum / tp[1].skillRollNum)), { separate: true }),
                Data("失敗率", skills.map(tp => percentageFormatter.format(tp[1].failNum / tp[1].skillRollNum))),
                Data("クリティカル率", skills.map(tp => percentageFormatter.format(tp[1].criticalNum / tp[1].skillRollNum))),
                Data("内1クリ", skills.map(tp => percentageFormatter.format(tp[1].spCriticalNum / tp[1].skillRollNum)), { indent: true }),
                Data("ファンブル率", skills.map(tp => percentageFormatter.format(tp[1].fumbleNum / tp[1].skillRollNum))),
                Data("内100ファン", skills.map(tp => percentageFormatter.format(tp[1].spFumbleNum / tp[1].skillRollNum)), { indent: true })
            ]} />

            <h2>ステータス統計</h2>
            <StatTable characters={status.map(tp => tp[0])} data={[
                Data("合計被ダメージ", status.map(tp => tp[1].totalDamage)),
                Data("最低HP", status.map(tp => tp[1].minHealth ?? "N/A")),
                Data("合計喪失SAN", status.map(tp => tp[1].totalLostSAN)),
                Data("最低SAN", status.map(tp => tp[1].minSAN ?? "N/A"))
            ]} />
            <h2>SANチェック統計</h2>
            <StatTable characters={sanity.map(tp => tp[0])} data={[
                Data("合計回数", sanity.map(tp => tp[1].checkNum)),
                Data("成功回数", sanity.map(tp => tp[1].successNum)),
                Data("失敗回数", sanity.map(tp => tp[1].checkNum - tp[1].successNum)),
                Data("成功率", sanity.map(tp => tp[1].checkNum == 0 ? "N/A" : percentageFormatter.format(tp[1].successNum / tp[1].checkNum))),
                Data("クリティカル回数", sanity.map(tp => tp[1].criticalNum), { separate: true }),
                Data("ファンブル回数", sanity.map(tp => tp[1].fumbleNum))
            ]} />

            <h2>技能当たりの統計</h2>
            <select name="skill" defaultValue="未選択" onChange={e => setSkillFinter(e.target.value)}>
                <option value="">未選択</option>
                {[...allSkills].sort((a, b) => a[0].localeCompare(b[0], "ja"))
                    .map((skill, i) => <option key={i} value={skill}>{skill}</option>)}
            </select>
            {skillFilter !== "" ? <StatTable characters={filteredSkills.map(tp => tp[0])} data={[
                Data("技能振り回数", filteredSkills.map(tp => tp[1].skillRollNum)),
                Data("平均出目", filteredSkills.map(tp => tp[1].skillRollNum == 0 ? "N/A" : avgFormatter.format(tp[1].skillRollSum / tp[1].skillRollNum))),

                Data("成功数", filteredSkills.map(tp => tp[1].successNum), { separate: true }),
                Data("失敗数", filteredSkills.map(tp => tp[1].failNum)),
                Data("クリティカル数", filteredSkills.map(tp => tp[1].criticalNum)),
                Data("内1クリ", filteredSkills.map(tp => tp[1].spCriticalNum), { indent: true }),
                Data("ファンブル数", filteredSkills.map(tp => tp[1].fumbleNum)),
                Data("内100ファン", filteredSkills.map(tp => tp[1].spFumbleNum), { indent: true }),

                Data("成功率", filteredSkills.map(tp => percentageFormatter.format(tp[1].successNum / tp[1].skillRollNum)), { separate: true }),
                Data("失敗率", filteredSkills.map(tp => percentageFormatter.format(tp[1].failNum / tp[1].skillRollNum))),
                Data("クリティカル率", filteredSkills.map(tp => percentageFormatter.format(tp[1].criticalNum / tp[1].skillRollNum))),
                Data("内1クリ", filteredSkills.map(tp => percentageFormatter.format(tp[1].spCriticalNum / tp[1].skillRollNum)), { indent: true }),
                Data("ファンブル率", filteredSkills.map(tp => percentageFormatter.format(tp[1].fumbleNum / tp[1].skillRollNum))),
                Data("内100ファン", filteredSkills.map(tp => percentageFormatter.format(tp[1].spFumbleNum / tp[1].skillRollNum)), { indent: true })
            ]} /> : null}

            <h2>その他の統計</h2>
            <StatTable characters={others.map(tp => tp[0])} data={[
                Data("発言数", others.map(tp => tp[1].talkNum)),
                Data("発言文字数", others.map(tp => tp[1].charNum)),
                Data("平均文字数", others.map(tp => avgFormatter.format(tp[1].charNum / tp[1].talkNum))),
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
        <div className='statsTable'>
            <table>
                <thead>
                    <tr>
                        <th className='value_title'>-</th>
                        {props.characters.map(name => <th key={name}>{name}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {props.data.map((data, i) => {
                        return (
                            <tr key={`${data.title}-${i}`} className={`${data.indent ? "indent1" : ""} ${data.separate || i === 0 ? "separate" : ""}`}>
                                <td className='value_title'>{data.title}</td>
                                {data.values.map((val, i) => <td key={`${props.characters[i]}-${data.title}`}>{val}</td>)}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
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
