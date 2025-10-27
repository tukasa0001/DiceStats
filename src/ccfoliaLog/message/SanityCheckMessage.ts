import { CcfoliaMessage } from "./CcfoliaMessage";

export class SanityCheckMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    diceValue: number;
    successValue: number;

    constructor(channel: string, sender: string, diceValue: number, successValue: number) {
        this.channel = channel;
        this.sender = sender;
        this.diceValue = diceValue;
        this.successValue = successValue;
    }

    isSuccess(): boolean {
        return this.diceValue <= this.successValue;
    }

    isCritical(): boolean {
        return this.isSuccess() && this.diceValue <= 5;
    }

    isFumble(): boolean {
        return !this.isSuccess() && 96 <= this.diceValue;
    }

    toString() {
        const result = this.isCritical() ? "Critical"
            : this.isFumble() ? "Fumble"
                : this.isSuccess() ? "Success"
                    : "Fail"
        return `[${this.channel}] ${this.sender} : SANチェック > ${this.diceValue} > ${result}`;
    }
}