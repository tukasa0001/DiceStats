type Conf = Readonly<DisplayConfig>;

export default class DisplayConfig {
    readonly nameAliases: readonly [string, string][];
    readonly startMessage: string;
    readonly ignoreSecretDice: boolean;

    constructor(nameAliases: readonly [string, string][] = [], startMessage: string = "", ignoreSecretDice: boolean = true) {
        this.nameAliases = nameAliases;
        this.startMessage = startMessage;
        this.ignoreSecretDice = ignoreSecretDice;
    }

    withNameAliases(action: (array: readonly [string, string][]) => [string, string][]) {
        return new DisplayConfig(action(this.nameAliases), this.startMessage, this.ignoreSecretDice);
    }

    withStartMessage(msg: string) {
        return new DisplayConfig(this.nameAliases, msg, this.ignoreSecretDice);
    }

    withIgnoreSecretDice(val: boolean) {
        return new DisplayConfig(this.nameAliases, this.startMessage, val);
    }
}