import { CcfoliaMessage } from "./message/CcfoliaMessage";
import { CoCSkillRollMessage } from "./message/CoCSkillRollMessage";
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

        if (text.startsWith("CCB<=")) {
            // CCB<={successValue} 【{skillName}】 (1D100<={successValue}) ＞ {diceValue} ＞ {結果}
            const successValue = Number(text.match(/CCB<=([0-9]*)/)?.[1] ?? "0");
            const skillName = text.match(/【(.*)】/)?.[1] ?? "";
            const diceValue = Number(text.match(/＞ ([0-9]*) ＞/)?.[1] ?? "0");

            msgs.push(new CoCSkillRollMessage(channel, name, skillName, diceValue, successValue));
        }
        else {
            // msgs.push(new TalkMessage(channel, name, text));
        }
    }

    return msgs;
}

export default parseCcfoliaLog;