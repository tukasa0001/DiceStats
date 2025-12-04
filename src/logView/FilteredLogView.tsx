import { Flex, Select, TextField } from "@radix-ui/themes"
import { useContext, useState } from "react"
import { LogView } from "./LogView"
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";

type FilteredLogViewProps = {
    logs: CcfoliaMessage[]
};

export const FilteredLogView = (props: FilteredLogViewProps) => {
    const UNFILTERED = "$unfiltered";

    const { logs } = props;
    const [searchText, setSearchText] = useState("");
    const [selectedCharacter, setSelectedCharacter] = useState<string>(UNFILTERED);

    return <Flex direction="column">
        <Flex my="2" gap="2" justify="center">
            {/*種類フィルター*/}
            {/*発言者フィルター*/}
            <Select.Root defaultValue={UNFILTERED} onValueChange={sel => setSelectedCharacter(sel)}>
                <Select.Trigger />
                <Select.Content position="popper">
                    <Select.Group>
                        <Select.Item value={UNFILTERED}>全員を表示</Select.Item>
                        {[...new Set([...logs].map(msg => msg.sender))]
                            .sort((a, b) => a[0].localeCompare(b[0], "ja"))
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
        <LogView logs={logs} filter={msg => {
            if (selectedCharacter !== UNFILTERED && msg.sender !== selectedCharacter) {
                return false;
            }
            if (searchText !== "" && !msg.toDisplayText().includes(searchText)) {
                return false;
            }
            return true;
        }} />
    </Flex>
}