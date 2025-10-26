import { CcfoliaMessage } from "./CcfoliaMessage";

export class ParamChangeMessage implements CcfoliaMessage {
    channel: string;
    sender: string;
    paramName: string;
    prevValue: number;
    value: number;

    constructor(channel: string, sender: string, paramName: string, prevValue: number, value: number) {
        this.channel = channel;
        this.sender = sender;
        this.paramName = paramName;
        this.prevValue = prevValue;
        this.value = value;
    }

    toString() {
        return `[${this.channel}] ${this.sender} : ${this.paramName} ${this.prevValue} => ${this.value}`;
    }
}