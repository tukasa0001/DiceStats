export default class DisplayConfig {
    nameAliases: [string, string][] = [];
    startMessage: string = "";

    clone(): DisplayConfig {
        const conf = new DisplayConfig();
        conf.nameAliases = [...this.nameAliases];
        return conf;
    }

    changed(p: (conf: DisplayConfig) => void): DisplayConfig {
        const clone = this.clone();
        p(clone);
        return clone;
    }
}