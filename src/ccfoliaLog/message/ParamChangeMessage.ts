import { CcfoliaMessage } from "./CcfoliaMessage";

export class ParamChangeMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    index: number;
    paramName: string;
    prevValue: number;
    value: number;

    constructor(channel: string, sender: string, index: number, paramName: string, prevValue: number, value: number) {
        this.channel = channel;
        this.sender = sender;
        this.index = index;
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