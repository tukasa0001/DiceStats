import GameSystemType from "../GameSystem";
import { LogParser, logParser, RawMessage } from "./logParser/LogParser";
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

const failed = (reason: string): ParseResultFail => ({ success: false, reason })

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
        return parseHtmlLog(text);
    }

    return {
        success: false,
        reason: `非対応のファイル (.${ext})`
    };
}

const parseHtmlLog = (log: string): ParseResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(log, 'text/html');

    // タイトル要素の有無で旧html/新htmlを判別
    if (doc.querySelector("h1.log-title") !== null) {
        return parseNewHtmlLog(log);
    }
    else {
        return parseOldHtmlLog(log);
    }
}

/**
 * 新html形式の解析処理
 */
const parseNewHtmlLog = (log: string): ParseResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(log, 'text/html');

    const dedicatedParsers = [logParser.coc];
    let mainParser: LogParser | undefined = undefined;
    const fallbackParser = logParser.general;

    let msgs: CcfoliaMessage[] = [];

    let idx = 0;
    var main = doc.querySelector("main.message-list");
    if (main === null) return failed("[新html形式] mainタグが見つからない");
    for (let article of main.children) {
        if (article.tagName !== "ARTICLE") continue;
        const isSystemMsg = article.classList.contains("system");

        const name = isSystemMsg ? "system" : article.querySelector("span.speaker")?.textContent ?? "##エラー##";
        const channel = article.querySelector("span.channel-name")?.textContent?.slice(1, -1) ?? "不明";
        let text = article.querySelector("div.message-text")?.textContent ?? "##エラー##";

        // ダイスロール結果の取得 & textに追加
        const rollResultTag = article.querySelector("span.roll-result");
        if (rollResultTag !== null) {
            text += " " + rollResultTag.textContent;
        }

        // 送信日時の取得
        const timeTag = article.querySelector("time.timestamp");
        const timestamp = timeTag instanceof HTMLTimeElement ? new Date(timeTag.dateTime) : undefined;

        // アイコンIDの取得
        let iconId: string | undefined = undefined;
        const avatarSpan = article.querySelector("span.avatar");
        if (avatarSpan !== null) {
            for (const className of avatarSpan.classList) {
                if (className !== "avatar") {
                    iconId = className;
                    break;
                }
            }
        }

        const rawMsg: RawMessage = {
            idx, name, text, channel, iconId,
            date: timestamp,
            messageType: isSystemMsg ? "system" : "text",
        };

        let msg: CcfoliaMessage | undefined;
        if (mainParser) {
            msg = mainParser.parse(rawMsg);
        }
        else {
            let msg: CcfoliaMessage | undefined;
            for (const parser of dedicatedParsers) {
                if (msg = parser.parse(rawMsg)) {
                    mainParser = parser;
                    break;
                }
            }
        }

        if (!msg) {
            msg = fallbackParser.parse(rawMsg);
        }

        if (msg) {
            msgs.push(msg);
        }

        idx++;
    }

    return { success: true, msgs, gameSystemType: mainParser?.type ?? "None" };
}

/**
 * 旧html形式のログの解析処理
 */
const parseOldHtmlLog = (log: string): ParseResult => {
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

    return { success: true, msgs, gameSystemType: mainParser?.type ?? "None" };
}

export default parseCcfoliaLog;