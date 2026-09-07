import { CcfoliaMessage, CcfoliaMessageData } from "./../CcfoliaMessage";

export class CoCSkillRollMessage extends CcfoliaMessage {
    skill: string;
    diceValue: number;
    successValue: number;
    isSecret: boolean

    constructor(data: CcfoliaMessageData, skill: string, diceValue: number, successValue: number, isSecret: boolean = false) {
        super(data);
        this.skill = skill;
        this.diceValue = diceValue;
        this.successValue = successValue;
        this.isSecret = isSecret;
    }

    isSuccess(): boolean {
        return this.diceValue <= this.successValue && this.diceValue !== 100;
    }

    isCritical(): boolean {
        return this.isSuccess() && this.diceValue <= 5;
    }

    isFumble(): boolean {
        return !this.isSuccess() && 96 <= this.diceValue || this.diceValue === 100;
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
        return `[${this.channel}] ${this.sender} : 技能判定 [${this.skill}] > ${this.diceValue} > ${result}`;
    }

    toDisplayText(): string {
        const result = this.isCritical() ? "クリティカル"
            : this.isFumble() ? "ファンブル"
                : this.isSuccess() ? "成功"
                    : "失敗"
        return `技能判定[${this.skill}](${this.successValue}): ${this.diceValue} > ${result}`
    }
}