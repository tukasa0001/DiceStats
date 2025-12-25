import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage"

type LogFile = {
    filename: string,
    log: CcfoliaMessage[],
    startIdx: number,
    endIdx: number
}

export {
    type LogFile
}