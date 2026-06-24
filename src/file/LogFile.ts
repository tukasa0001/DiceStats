import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage"
import { CoCStat } from "../StatsCalculator/CoCStats"

type LogFile = {
    filename: string,
    log: CcfoliaMessage[],
    stat: CoCStat | undefined, // undefined means that calculating is not finished.
    startIdx: number,
    endIdx: number,
    ingoredChannels: string[]
}

const copyLog = (log: LogFile): LogFile => {
    return {
        ...log,
        log: [...log.log],
        ingoredChannels: [...log.ingoredChannels]
    }
}

export {
    type LogFile,
    copyLog
}