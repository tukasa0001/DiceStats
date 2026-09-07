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
    icons: { [key: string]: string }
}

export {
    type LogFile
}