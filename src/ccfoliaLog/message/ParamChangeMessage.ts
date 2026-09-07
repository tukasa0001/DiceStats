import { CcfoliaMessage, CcfoliaMessageData } from "./CcfoliaMessage";

export class ParamChangeMessage extends CcfoliaMessage {
    paramName: string;
    prevValue: number;
    value: number;

    constructor(data: CcfoliaMessageData, paramName: string, prevValue: number, value: number) {
        super(data);
        this.paramName = paramName;
        this.prevValue = prevValue;
        this.value = value;
    }

    toString() {
        return `[${this.channel}] ${this.sender} : ${this.paramName} ${this.prevValue} => ${this.value}`;
    }

    toDisplayText(): string {
        return `${this.paramName}変動: ${this.prevValue} => ${this.value}`;
    }
}