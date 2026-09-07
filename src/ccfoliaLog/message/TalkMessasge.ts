import { CcfoliaMessage, CcfoliaMessageData } from "./CcfoliaMessage";

export class TalkMessage extends CcfoliaMessage {
    text: string;

    constructor(data: CcfoliaMessageData, text: string) {
        super(data);
        this.text = text;
    }

    toString() {
        return `[${this.channel}] ${this.sender} : ${this.text}`;
    }

    toDisplayText(): string {
        return this.text;
    }
}