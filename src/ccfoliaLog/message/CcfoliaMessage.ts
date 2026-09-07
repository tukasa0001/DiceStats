export type CcfoliaMessageData = {
    channel: string,
    name: string,
    idx: number,
    date?: Date,
    iconId?: string
}

export abstract class CcfoliaMessage {
    channel: string
    sender: string
    index: number
    date?: Date
    iconId?: string

    constructor(data: CcfoliaMessageData) {
        this.channel = data.channel;
        this.sender = data.name;
        this.index = data.idx;
        this.date = data.date;
        this.iconId = data.iconId;
    }

    abstract toDisplayText(): string
}