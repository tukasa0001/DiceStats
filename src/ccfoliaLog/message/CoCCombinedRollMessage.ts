import { CcfoliaMessage } from "./CcfoliaMessage";
import { CoCSkillRollMessage } from "./CoCSkillRollMessage";

export class CoCCombinedRollMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    index: number;
    skill: string;
    diceValue: number;
    successValue: [number, number];
    isSecret: boolean;

    constructor(channel: string, sender: string, index: number, skill: string, diceValue: number, successValue: [number, number], isSecret: boolean = false) {
        this.channel = channel;
        this.sender = sender;
        this.index = index;
        this.skill = skill;
        this.diceValue = diceValue;
        this.successValue = successValue;
        this.isSecret = isSecret;
    }

    isSuccess(): [boolean, boolean] {
        return [this.diceValue <= this.successValue[0], this.diceValue <= this.successValue[1]];
    }
    isFailure(): [boolean, boolean] {
        const [s1, s2] = this.isSuccess();
        return [!s1, !s2];
    }
    isCritical(): [boolean, boolean] {
        if (5 < this.diceValue) return [false, false];
        return this.isSuccess()
    }
    isSpCritical(): [boolean, boolean] {
        if (this.diceValue !== 1) return [false, false];
        return this.isSuccess();
    }
    isFumble(): [boolean, boolean] {
        if (this.diceValue <= 95) return [false, false];
        return this.isFailure();
    }
    isSpFumble(): [boolean, boolean] {
        return this.diceValue === 100 ? [true, true] : [false, false];
    }

    successNum(): number {
        // 両成功=>1, 片成功=>0.5, 全失敗=>0
        const [a, b] = this.isSuccess();
        return a && b ? 1 : a || b ? 0.5 : 0;
    }
    failureNum(): number {
        const [a, b] = this.isFailure();
        return a && b ? 1 : a || b ? 0.5 : 0;
    }
    criticalNum(): number {
        const [a, b] = this.isCritical();
        return a && b ? 1 : a || b ? 0.5 : 0;
    }
    fumbleNum(): number {
        const [a, b] = this.isFumble();
        return a && b ? 1 : a || b ? 0.5 : 0;
    }
    spCriticalNum(): number {
        const [a, b] = this.isSpCritical();
        return a && b ? 1 : a || b ? 0.5 : 0;
    }
    spFumbleNum(): number {
        const [a, b] = this.isSpFumble();
        return a && b ? 1 : a || b ? 0.5 : 0;
    }

    toString() {
        const result = [0, 1].map(i => this.isCritical()[i] ? "Critical"
            : this.isFumble()[i] ? "Fumble"
                : this.isSuccess()[i] ? "Success"
                    : "Fail")
        return `[${this.channel}] ${this.sender} : 技能判定 [${this.skill}] > ${this.diceValue} > ${result}`;
    }

    toDisplayText(): string {
        const result = [0, 1].map(i => this.isCritical()[i] ? "クリティカル"
            : this.isFumble()[i] ? "ファンブル"
                : this.isSuccess()[i] ? "成功"
                    : "失敗");
        return `技能判定[${this.skill}]([${this.successValue}]): ${this.diceValue} > ${result}`
    }
}