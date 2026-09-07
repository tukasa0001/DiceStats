import { CcfoliaMessage } from "../message/CcfoliaMessage";
import { CoCCombinedRollMessage } from "../message/CoC/CoCCombinedRollMessage";
import { CoCSanityCheckMessage } from "../message/CoC/CoCSanityCheckMessage";
import { CoCSkillRollMessage } from "../message/CoC/CoCSkillRollMessage";
import { LogParser, RawMessage } from "./LogParser";

export class CoCLogParser implements LogParser {
    type: "CoC" = "CoC";

    parse(data: RawMessage): CcfoliaMessage | undefined {
        let reg: RegExpMatchArray | null = null;
        const { idx, name, text, channel } = data;

        // 技能ロール
        if ((reg = text.match(/^(S|s)?(CCB|ccb)<=/)) || (reg = text.match(/^x[0-9]+\s(S|s)?(CCB|ccb)<=/))) {
            const regSkillName = text.match(/【(.*)】/);
            const skillName = regSkillName?.[1] ?? "";

            for (let reg2 of text.matchAll(/\(1D100<=([0-9]+)\) ＞ ([0-9]+) ＞/g)) {
                const successValue = Number(reg2[1]);
                const diceValue = Number(reg2[2]);
                return new CoCSkillRollMessage(data, skillName === "" ? "不明な技能" : skillName, diceValue, successValue, reg[1] !== undefined);
            }
        }
        // 対抗ロール
        else if ((reg = text.match(/^S?RESB\(/i)) || (reg = text.match(/^x[0-9]+\S?RESB\(/i))) {
            const regSkillName = text.match(/【(.*)】/);
            const skillName = regSkillName?.[1] ?? "";

            for (let reg2 of text.matchAll(/\(1d100<=([0-9]+)\) ＞ ([0-9]+) ＞/g)) {
                const successValue = Number(reg2[1]);
                const diceValue = Number(reg2[2]);
                return new CoCSkillRollMessage(data, skillName === "" ? "対抗ロール" : skillName, diceValue, successValue, reg[1] !== undefined);
            }
        }
        // 組み合わせロール
        else if ((reg = text.match(/^S?CBRB\(/i)) || (reg = text.match(/^x[0-9]+\S?CBRB\(/i))) {
            const regSkillName = text.match(/【(.*)】/);
            const skillName = regSkillName?.[1] ?? "";

            for (let reg2 of text.matchAll(/\(1d100<=([0-9]+),([0-9]+)\) ＞ ([0-9]+)\[/g)) {
                const successValue: [number, number] = [Number(reg2[1]), Number(reg2[2])];
                const diceValue = Number(reg2[3]);
                return new CoCCombinedRollMessage(data, skillName === "" ? "不明な組み合わせロール" : skillName, diceValue, successValue, reg[1] !== undefined);
            }
        }
        else if (reg = text.match(/^(S|s)?1d100<=([0-9]+)\s*【正気度ロール】\s*\(1D100<=[0-9]+\) ＞ ([0-9]+) ＞/)) {
            // 1d100<={successValue} 【正気度ロール】 (1D100<={successValue}) ＞ {diceValue} ＞ 成功
            return new CoCSanityCheckMessage(data, Number(reg[3]), Number(reg[2]));
        }
        return undefined;
    }
}