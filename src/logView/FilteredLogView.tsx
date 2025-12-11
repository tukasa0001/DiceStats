import { Flex, Select, TextField, ThickCheckIcon } from "@radix-ui/themes"
import { useContext, useState } from "react"
import { LogView } from "./LogView"
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { EMPTY_FILTER } from "./LogViewFilter";
import { Select as SelectPrimitive } from "radix-ui";
import { MultiSelectRoot, MultiSelectItem, MultiSelectAllItem } from "../MultiSelect/MultiSelect"

const ccfoliaMessageTypeTexts = new Map<string, string>([
    ["CoCSkillRollMessage", "技能判定"],
    ["ParamChangeMessage", "パラメータ変動"],
    ["SanityCheckMessage", "SANチェック"],
    ["TalkMessage", "会話"],
    ["UnknownSecretDiceMessage", "不明なシークレットダイス"],
]);

type FilteredLogViewProps = {
    logs: CcfoliaMessage[]
};

export const FilteredLogView = (props: FilteredLogViewProps) => {
    const UNFILTERED = "$unfiltered";

    const { logs } = props;
    const [filter, setFilter] = useState(EMPTY_FILTER);
    const allMessageTypes = [...new Set([...logs].map(msg => msg.constructor.name))];
    const allCharacters = [...new Set([...logs].map(msg => msg.sender))];

    function reverseArray<T>(arr: readonly T[], all: readonly T[]): readonly T[] {
        return all.filter(val => !arr.includes(val));
    }

    return <Flex direction="column">
        <Flex my="2" gap="2" justify="center">
            {/*種類フィルター*/}
            <MultiSelectRoot
                value={reverseArray(filter.hiddenMessageTypes, allMessageTypes)}
                onValueChange={sel => setFilter({ ...filter, hiddenMessageTypes: reverseArray(sel, allMessageTypes) })}
                allValues={allMessageTypes}
                valueText={arr => arr.length === 0 ? "表示なし"
                    : arr.length === 1 ? ccfoliaMessageTypeTexts.get(arr[0]) || arr[0]
                        : arr.length === allMessageTypes.length ? "全て表示"
                            : `${arr.length}個選択`}>
                <Select.Content position="popper">
                    <Select.Group>
                        <MultiSelectAllItem>全て表示</MultiSelectAllItem>
                        {allMessageTypes
                            .sort((a, b) => a[0].localeCompare(b[0], "ja"))
                            .map((name, i) => <MultiSelectItem key={i} value={name}>{ccfoliaMessageTypeTexts.get(name) || name}</MultiSelectItem>)}
                    </Select.Group>
                </Select.Content>
            </MultiSelectRoot>
            {/*発言者フィルター*/}
            <Select.Root defaultValue={UNFILTERED} onValueChange={sel => setFilter({ ...filter, hiddenCharacters: sel === UNFILTERED ? [] : allCharacters.filter(val => val !== sel) })}>
                <Select.Trigger />
                <Select.Content position="popper">
                    <Select.Group>
                        <Select.Item value={UNFILTERED}>全員を表示</Select.Item>
                        {allCharacters
                            .map(str => str === "" ? "noname" : str)
                            .sort((a, b) => a.localeCompare(b, "ja"))
                            .map((name, i) => <Select.Item key={i} value={name}>{name}</Select.Item>)}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            {/*内容検索*/}
            <TextField.Root value={filter.searchText} onChange={e => setFilter({ ...filter, searchText: e.target.value })} placeholder="検索">
                <TextField.Slot />
            </TextField.Root>
            {/*フィルタークリア*/}
        </Flex>
        <LogView logs={logs} filter={filter} />
    </Flex>
}