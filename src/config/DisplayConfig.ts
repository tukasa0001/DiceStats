type Conf = Readonly<DisplayConfig>;

export default class DisplayConfig {
    readonly nameAliases: readonly [string, string][];
    readonly startMessage: string;
    readonly endMessage: string;
    readonly ignoreSecretDice: boolean;

    constructor(nameAliases: readonly [string, string][] = [],
        startMessage: string = "",
        endMessage: string = "",
        ignoreSecretDice: boolean = true) {
        this.nameAliases = nameAliases;
        this.startMessage = startMessage;
        this.endMessage = endMessage;
        this.ignoreSecretDice = ignoreSecretDice;
    }

    withNameAliases(action: (array: readonly [string, string][]) => [string, string][]) {
        return new DisplayConfig(action(this.nameAliases), this.startMessage, this.endMessage, this.ignoreSecretDice);
    }

    withStartMessage(msg: string) {
        return new DisplayConfig(this.nameAliases, msg, this.endMessage, this.ignoreSecretDice);
    }

    withEndMessage(msg: string) {
        return new DisplayConfig(this.nameAliases, this.startMessage, msg, this.ignoreSecretDice);
    }

    withIgnoreSecretDice(val: boolean) {
        return new DisplayConfig(this.nameAliases, this.startMessage, this.endMessage, val);
    }
}