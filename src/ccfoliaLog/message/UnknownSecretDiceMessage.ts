import { CcfoliaMessage } from "./CcfoliaMessage";

export class UnknownSecretDiceMessage implements CcfoliaMessage {
    channel: string;
    sender: string;

    constructor(channel: string, sender: string) {
        this.channel = channel;
        this.sender = sender;
    }

    toString() {
        return `[${this.channel}] ${this.sender} : Secret Dice`;
    }

    toDisplayText(): string {
        return "【シークレットダイス】"
    }
}