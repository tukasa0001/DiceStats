export interface CcfoliaMessage {
    channel: string
    sender: string
    toDisplayText(): string
}