import { CcfoliaMessage } from "./CcfoliaMessage";

export class TalkMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    index: number;
    text: string;

    constructor(channel: string, sender: string, index: number, text: string) {
        this.channel = channel;
        this.sender = sender;
        this.index = index;
        this.text = text;
    }

    toString() {
        return `[${this.channel}] ${this.sender} : ${this.text}`;
    }

    toDisplayText(): string {
        return this.text;
    }
}