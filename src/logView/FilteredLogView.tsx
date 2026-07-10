import { Flex, Select, TextField } from "@radix-ui/themes"
import { useContext, useState } from "react"
import { LogView } from "./LogView"
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { LogFile } from "../file/LogFile";

const ccfoliaMessageTypeTexts = new Map<string, string>([
    ["CoCSkillRollMessage", "技能判定"],
    ["ParamChangeMessage", "パラメータ変動"],
    ["SanityCheckMessage", "SANチェック"],
    ["TalkMessage", "会話"],
    ["UnknownSecretDiceMessage", "不明なシークレットダイス"],
]);

type FilteredLogViewProps = {
    logs: LogFile
    onClick?: (msg: CcfoliaMessage, i: number) => void
};

export const FilteredLogView = (props: FilteredLogViewProps) => {
    const UNFILTERED = "$unfiltered";

    const { logs, onClick } = props;
    const allMessageTypes = [...new Set([...logs.log].map(msg => msg.constructor.name))];
    const allCharacters = [...new Set([...logs.log].map(msg => msg.sender))];

    const [hiddenMessageTypes, setHiddenMessageTypes] = useState<string[]>([]);
    const [hiddenCharacters, setHiddenCharacters] = useState<string[]>([]);
    const [searchText, setSearchText] = useState("");

    return <Flex direction="column" maxHeight="100%">
        <Flex my="2" gap="2" justify="center">
            {/*種類フィルター*/}
            <Select.Root defaultValue={UNFILTERED} onValueChange={sel => setHiddenMessageTypes(sel === UNFILTERED ? [] : allMessageTypes.filter(val => val !== sel))}>
                <Select.Trigger />
                <Select.Content position="popper">
                    <Select.Group>
                        <Select.Item value={UNFILTERED}>全種類</Select.Item>
                        {allMessageTypes
                            .sort((a, b) => a[0].localeCompare(b[0], "ja"))
                            .map((name, i) => <Select.Item key={i} value={name}>{ccfoliaMessageTypeTexts.get(name) || name}</Select.Item>)}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            {/*発言者フィルター*/}
            <Select.Root defaultValue={UNFILTERED} onValueChange={sel => setHiddenCharacters(sel === UNFILTERED ? [] : allCharacters.filter(val => val !== sel))}>
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
            <TextField.Root value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="検索">
                <TextField.Slot />
            </TextField.Root>
            {/*フィルタークリア*/}
        </Flex>
        <LogView log={logs.log.filter(msg => !hiddenMessageTypes.includes(msg.constructor.name) &&
            !hiddenCharacters.includes(msg.sender) &&
            (searchText === "" || msg.toDisplayText().includes(searchText))
        )}
            onClick={onClick} highlight={searchText} />
    </Flex>
}