type Conf = Readonly<DisplayConfig>;

export default class DisplayConfig {
    readonly nameAliases: readonly [string, string][];
    readonly ignoreSecretDice: boolean;

    constructor(nameAliases: readonly [string, string][] = [],
        ignoreSecretDice: boolean = true) {
        this.nameAliases = nameAliases;
        this.ignoreSecretDice = ignoreSecretDice;
    }

    withNameAliases(action: (array: readonly [string, string][]) => [string, string][]) {
        return new DisplayConfig(action(this.nameAliases), this.ignoreSecretDice);
    }

    withIgnoreSecretDice(val: boolean) {
        return new DisplayConfig(this.nameAliases, val);
    }
}