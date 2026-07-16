import { logParser } from "./logParser/LogParser";
import { CcfoliaMessage } from "./message/CcfoliaMessage";

const parseCcfoliaLog = (log: string): CcfoliaMessage[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(log, 'text/html');

    let msgs: CcfoliaMessage[] = [];

    let idx = 0;
    for (let p of doc.body.children) {
        const span = p.getElementsByTagName("span");
        if (span.length != 3) continue;
        const channel = span[0].textContent.substring(2, span[0].textContent.length - 1);
        const name = span[1].textContent.trim();
        const text = span[2].textContent.trim();
        let msg: CcfoliaMessage | undefined;
        if (msg = logParser.coc.parse(idx, name, text, channel)) {
            msgs.push(msg);
        }
        else if (msg = logParser.general.parse(idx, name, text, channel)) {
            msgs.push(msg);
        }

        idx++;
    }

    return msgs;
}

export default parseCcfoliaLog;