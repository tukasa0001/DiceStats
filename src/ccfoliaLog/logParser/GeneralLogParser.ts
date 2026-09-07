import { CcfoliaMessage } from "../message/CcfoliaMessage";
import { ParamChangeMessage } from "../message/ParamChangeMessage";
import { TalkMessage } from "../message/TalkMessasge";
import { UnknownSecretDiceMessage } from "../message/UnknownSecretDiceMessage";
import { LogParser, RawMessage } from "./LogParser";

export class GeneralLogParser implements LogParser {
    type: "None" = "None";

    parse(data: RawMessage): CcfoliaMessage | undefined {
        let reg: RegExpMatchArray | null = null;
        const { idx, name, text, channel } = data;

        // シークレットダイス
        if (text === "シークレットダイス ???") {
            return new UnknownSecretDiceMessage(data);
        }
        // ステータス変動
        else if (name === "system" && (reg = text.match(/\[ (.+) \] (.+) : ([+-]?\d+) → ([+-]?\d+)/))) {
            // [ {name} ] {param} : {prev} → {value}
            return new ParamChangeMessage({ ...data, name: reg[1] }, reg[2], Number(reg[3]), Number(reg[4]));
        }
        // その他:会話
        else {
            return new TalkMessage(data, text);
        }
    }

}