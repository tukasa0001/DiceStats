import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage"
import GameSystemType from "../GameSystem"
import { CoCStat } from "../StatsCalculator/CoCStats"

type LogFile = {
    filename: string,
    log: CcfoliaMessage[],
    stat: CoCStat,
    startIdx: number,
    endIdx: number,
    ingoredChannels: string[],
    gameSystem: GameSystemType,
}

export {
    type LogFile
}