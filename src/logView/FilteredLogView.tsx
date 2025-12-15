import { Flex, Select, TextField } from "@radix-ui/themes"
import { useContext, useState } from "react"
import { LogView } from "./LogView"
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { EMPTY_FILTER } from "./LogViewFilter";
import { MultiSelect } from "primereact/multiselect";

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
    const allMessageTypes = [...new Set([...logs].map(msg => msg.constructor.name))].sort((a, b) => a[0].localeCompare(b[0], "ja"));
    const allCharacters = [...new Set([...logs].map(msg => msg.sender))].sort((a, b) => a[0].localeCompare(b[0], "ja"));

    function reverseArray<T>(arr: readonly T[], all: readonly T[]): readonly T[] {
        return all.filter(val => !arr.includes(val));
    }

    return <Flex direction="column">
        <Flex my="2" gap="2" justify="center">
            {/*種類フィルター*/}
            <MultiSelect
                value={reverseArray(filter.hiddenMessageTypes, allMessageTypes)}
                onChange={(e) => setFilter({ ...filter, hiddenMessageTypes: reverseArray(e.value, allMessageTypes) })}
                options={allMessageTypes
                    .map(str => {
                        return {
                            name: ccfoliaMessageTypeTexts.get(str) || str,
                            value: str.length === 0 ? "EMPTY" : str
                        }
                    })}
                optionLabel="name"
                optionValue="value"
                placeholder="選択してください"
                selectAllLabel="全て表示"
                emptyMessage="選択肢なし"
                selectedItemsLabel="{0}個選択"
                maxSelectedLabels={1}
                appendTo="self"
                showSelectAll={false} />
            {/*発言者フィルター*/}
            <MultiSelect
                value={reverseArray(filter.hiddenCharacters, allCharacters)}
                onChange={(e) => setFilter({ ...filter, hiddenCharacters: reverseArray(e.value, allCharacters) })}
                options={allCharacters
                    .map(str => {
                        return {
                            name: ccfoliaMessageTypeTexts.get(str) || str,
                            value: str.length === 0 ? "EMPTY" : str
                        }
                    })}
                optionLabel="name"
                optionValue="value"
                placeholder="選択してください"
                selectAllLabel="全て表示"
                emptyMessage="選択肢なし"
                selectedItemsLabel="{0}個選択"
                maxSelectedLabels={1}
                appendTo="self"
                showSelectAll={false} />
            {/*内容検索*/}
            <TextField.Root value={filter.searchText} onChange={e => setFilter({ ...filter, searchText: e.target.value })} placeholder="検索">
                <TextField.Slot />
            </TextField.Root>
            {/*フィルタークリア*/}
        </Flex>
        <LogView logs={logs} filter={filter} />
    </Flex>
}