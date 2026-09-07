import GameSystemType from "../GameSystem";
import { LogParser, logParser } from "./logParser/LogParser";
import { CcfoliaMessage } from "./message/CcfoliaMessage";

type ParseResult = ParseResultSuccess | ParseResultFail;
type ParseResultSuccess = {
    success: true
    msgs: CcfoliaMessage[],
    gameSystemType: GameSystemType
};
type ParseResultFail = {
    success: false,
    reason: string
}

const parseCcfoliaLog = async (file: File): Promise<ParseResult> => {
    let reg = file.name.match(/([^\.]*)$/);
    if (reg === null) {
        return {
            success: false,
            reason: "非対応のファイル"
        };
    }
    const ext = reg[1];
    if (ext === "htm" || ext === "html") {
        const text = await file.text();
        return {
            success: true,
            ...parseOldHtmlLog(text)
        };
    }

    return {
        success: false,
        reason: `非対応のファイル (.${ext})`
    };
}

const parseOldHtmlLog = (log: string): { msgs: CcfoliaMessage[], gameSystemType: GameSystemType } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(log, 'text/html');

    const dedicatedParsers = [logParser.coc];
    let mainParser: LogParser | undefined = undefined;
    const fallbackParser = logParser.general;

    let msgs: CcfoliaMessage[] = [];

    let idx = 0;
    for (let p of doc.body.children) {
        const span = p.getElementsByTagName("span");
        if (span.length != 3) continue;
        const channel = span[0].textContent.substring(2, span[0].textContent.length - 1);
        const name = span[1].textContent.trim();
        const text = span[2].textContent.trim();

        let msg: CcfoliaMessage | undefined;
        if (mainParser) {
            msg = mainParser.parse({ idx, name, text, channel });
        }
        else {
            let msg: CcfoliaMessage | undefined;
            for (const parser of dedicatedParsers) {
                if (msg = parser.parse({ idx, name, text, channel })) {
                    mainParser = parser;
                    break;
                }
            }
        }

        if (!msg) {
            msg = fallbackParser.parse({ idx, name, text, channel });
        }

        if (msg) {
            msgs.push(msg);
        }

        idx++;
    }

    return { msgs, gameSystemType: mainParser?.type ?? "None" };
}

export default parseCcfoliaLog;