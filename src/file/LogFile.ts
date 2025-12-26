import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage"
import { CoCStat } from "../StatsCalculator/CoCStats"

type LogFile = {
    filename: string,
    log: CcfoliaMessage[],
    stat?: CoCStat,
    startIdx: number,
    endIdx: number
}

export {
    type LogFile
}