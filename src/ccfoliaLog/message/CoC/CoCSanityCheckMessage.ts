import { CcfoliaMessage } from "./../CcfoliaMessage";

export class CoCSanityCheckMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    index: number;
    diceValue: number;
    successValue: number;

    constructor(channel: string, sender: string, index: number, diceValue: number, successValue: number) {
        this.channel = channel;
        this.sender = sender;
        this.index = index;
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

    successNum(): number {
        return this.isSuccess() ? 1 : 0;
    }
    failureNum(): number {
        return this.isSuccess() ? 0 : 1;
    }
    criticalNum(): number {
        return this.isCritical() ? 1 : 0;
    }
    fumbleNum(): number {
        return this.isFumble() ? 1 : 0;
    }
    spCriticalNum(): number {
        return this.isSuccess() && this.diceValue === 1 ? 1 : 0;
    }
    spFumbleNum(): number {
        return this.diceValue === 100 ? 1 : 0;
    }

    toString() {
        const result = this.isCritical() ? "Critical"
            : this.isFumble() ? "Fumble"
                : this.isSuccess() ? "Success"
                    : "Fail"
        return `[${this.channel}] ${this.sender} : SANチェック > ${this.diceValue} > ${result}`;
    }

    toDisplayText(): string {
        const result = this.isSuccess() ? "成功" : "失敗"
        return `SANチェック(${this.successValue}): ${this.diceValue} > ${result}`;
    }
}