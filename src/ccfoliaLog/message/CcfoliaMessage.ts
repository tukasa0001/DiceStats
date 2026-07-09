export interface CcfoliaMessage {
    channel: string
    sender: string
    index: number
    toDisplayText(): string
}