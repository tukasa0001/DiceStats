import { Flex, TextField } from "@radix-ui/themes"
import { useContext, useState } from "react"
import { LogView } from "./LogView"
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";

type FilteredLogViewProps = {
    logs: CcfoliaMessage[]
};

export const FilteredLogView = (props: FilteredLogViewProps) => {
    const { logs } = props;
    const [searchText, setSearchText] = useState("");

    return <Flex direction="column">
        <Flex my="2" gap="2" justify="center">
            {/*種類フィルター*/}
            {/*発言者フィルター*/}
            {/*内容検索*/}
            <TextField.Root value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="検索">
                <TextField.Slot />
            </TextField.Root>
            {/*フィルタークリア*/}
        </Flex>
        <LogView logs={logs} filter={msg => {
            if (searchText !== "" && !msg.toDisplayText().includes(searchText)) {
                return false;
            }
            return true;
        }} />
    </Flex>
}