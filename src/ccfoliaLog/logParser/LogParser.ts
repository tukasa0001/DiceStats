import GameSystemType from "../../GameSystem";
import { CcfoliaMessage } from "../message/CcfoliaMessage";
import { CoCLogParser } from "../logParser/CoCLogParser"
import { GeneralLogParser } from "./GeneralLogParser";

export interface LogParser {
    type: GameSystemType;
    parse(idx: number, name: string, text: string, channel: string): CcfoliaMessage | undefined
}

export const logParser = {
    general: new GeneralLogParser(),
    coc: new CoCLogParser(),
}