import { CcfoliaMessage } from "./CcfoliaMessage";

export class UnknownSecretDiceMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    index: number;

    constructor(channel: string, sender: string, index: number) {
        this.channel = channel;
        this.sender = sender;
        this.index = index;
    }

    toString() {
        return `[${this.channel}] ${this.sender} : Secret Dice`;
    }

    toDisplayText(): string {
        return "【シークレットダイス】"
    }
}