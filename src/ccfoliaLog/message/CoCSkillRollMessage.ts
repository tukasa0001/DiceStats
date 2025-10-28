import { CcfoliaMessage } from "./CcfoliaMessage";

export class CoCSkillRollMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    skill: string;
    diceValue: number;
    successValue: number;
    isSecret: boolean

    constructor(channel: string, sender: string, skill: string, diceValue: number, successValue: number, isSecret: boolean = false) {
        this.channel = channel;
        this.sender = sender;
        this.skill = skill;
        this.diceValue = diceValue;
        this.successValue = successValue;
        this.isSecret = isSecret;
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
        return `[${this.channel}] ${this.sender} : 技能判定 [${this.skill}] > ${this.diceValue} > ${result}`;
    }
}