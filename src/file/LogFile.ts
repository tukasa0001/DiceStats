import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage"
import { CoCStat } from "../StatsCalculator/CoCStats"

type LogFile = {
    filename: string,
    log: CcfoliaMessage[],
    stat: CoCStat,
    startIdx: number,
    endIdx: number,
    ingoredChannels: string[],
    nameAliases?: [string, string][]
}

export {
    type LogFile
}

// オプションをすべてログに付属するようにする
// 共通オプションを削除する