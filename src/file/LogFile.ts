import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage"

type LogFile = {
    log: CcfoliaMessage[],
    startIdx: number,
    endIdx: number
}

export {
    type LogFile
}