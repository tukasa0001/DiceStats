import GameSystemType from "../../GameSystem";
import { CcfoliaMessage } from "../message/CcfoliaMessage";
import { CoCLogParser } from "../logParser/CoCLogParser"
import { GeneralLogParser } from "./GeneralLogParser";

export type RawMessage = {
    idx: number,
    channel: string,
    name: string,
    text: string,

    date?: Date,
    iconId?: string,
    messageType?: "text" | "system" | "note"
}

export interface LogParser {
    type: GameSystemType;
    parse(data: RawMessage): CcfoliaMessage | undefined
}

export const logParser = {
    general: new GeneralLogParser(),
    coc: new CoCLogParser(),
}