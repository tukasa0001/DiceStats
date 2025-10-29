import { CcfoliaMessage } from "./message/CcfoliaMessage";
import { CoCSkillRollMessage } from "./message/CoCSkillRollMessage";
import { ParamChangeMessage } from "./message/ParamChangeMessage";
import { SanityCheckMessage } from "./message/SanityCheckMessage";
import { TalkMessage } from "./message/TalkMessasge";

const parseCcfoliaLog = (log: string): CcfoliaMessage[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(log, 'text/html');

    let msgs: CcfoliaMessage[] = [];

    for (let p of doc.body.children) {
        const span = p.getElementsByTagName("span");
        if (span.length != 3) continue;
        const channel = span[0].textContent.substring(2, span[0].textContent.length - 1);
        const name = span[1].textContent.trim();
        const text = span[2].textContent.trim();
        let reg: RegExpMatchArray | null = null;

        if (name === "system" && (reg = text.match(/\[ (.+) \] (.+) : ([+-]?\d+) → ([+-]?\d+)/))) {
            // [ {name} ] {param} : {prev} → {value}
            msgs.push(new ParamChangeMessage(channel, reg[1], reg[2], Number(reg[3]), Number(reg[4])));
        }
        else if ((reg = text.match(/^(S|s)?(CCB|ccb)<=/)) || (reg = text.match(/^x[0-9]+ (S|s)?(CCB|ccb)<=/))) {
            const regSkillName = text.match(/【(.*)】/);
            const skillName = regSkillName?.[1] ?? "";

            for (let reg2 of text.matchAll(/\(1D100<=([0-9]+)\) ＞ ([0-9]+) ＞/g)) {
                const successValue = Number(reg2[1]);
                const diceValue = Number(reg2[2]);
                msgs.push(new CoCSkillRollMessage(channel, name, skillName === "" ? "不明な技能" : skillName, diceValue, successValue, reg[1] !== undefined));
            }
        }
        else if (reg = text.match(/^(S|s)?1d100<=([0-9]+)\s*【正気度ロール】\s*\(1D100<=[0-9]+\) ＞ ([0-9]+) ＞/)) {
            // 1d100<={successValue} 【正気度ロール】 (1D100<={successValue}) ＞ {diceValue} ＞ 成功
            msgs.push(new SanityCheckMessage(channel, name, Number(reg[3]), Number(reg[2])));
        }
        else {
            msgs.push(new TalkMessage(channel, name, text));
        }
    }

    return msgs;
}

export default parseCcfoliaLog;