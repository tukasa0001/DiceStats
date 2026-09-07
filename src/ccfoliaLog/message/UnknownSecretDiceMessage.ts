import { CcfoliaMessage } from "./CcfoliaMessage";

export class UnknownSecretDiceMessage extends CcfoliaMessage {
    toString() {
        return `[${this.channel}] ${this.sender} : Secret Dice`;
    }

    toDisplayText(): string {
        return "【シークレットダイス】"
    }
}