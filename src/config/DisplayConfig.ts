type Conf = Readonly<DisplayConfig>;

export default class DisplayConfig {
    readonly nameAliases: readonly [string, string][];
    readonly startIdx: number;
    readonly endIdx: number;
    readonly ignoreSecretDice: boolean;

    constructor(nameAliases: readonly [string, string][] = [],
        startMessage: number = 0,
        endMessage: number = Infinity,
        ignoreSecretDice: boolean = true) {
        this.nameAliases = nameAliases;
        this.startIdx = startMessage;
        this.endIdx = endMessage;
        this.ignoreSecretDice = ignoreSecretDice;
    }

    withNameAliases(action: (array: readonly [string, string][]) => [string, string][]) {
        return new DisplayConfig(action(this.nameAliases), this.startIdx, this.endIdx, this.ignoreSecretDice);
    }

    withStartIdx(idx: number) {
        return new DisplayConfig(this.nameAliases, idx, this.endIdx, this.ignoreSecretDice);
    }

    withEndIdx(idx: number) {
        return new DisplayConfig(this.nameAliases, this.startIdx, idx, this.ignoreSecretDice);
    }

    withIgnoreSecretDice(val: boolean) {
        return new DisplayConfig(this.nameAliases, this.startIdx, this.endIdx, val);
    }
}