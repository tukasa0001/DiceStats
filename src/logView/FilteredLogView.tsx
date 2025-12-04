import { Flex } from "@radix-ui/themes"
import { useState } from "react"
import { LogView } from "./LogView"
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";

type FilteredLogViewProps = {
    logs: CcfoliaMessage[]
};

export const FilteredLogView = (props: FilteredLogViewProps) => {
    const { logs } = props;

    return <Flex direction="column">
        <Flex gap="2">
            {/*種類フィルター*/}
            {/*発言者フィルター*/}
            {/*内容検索*/}
            {/*フィルタークリア*/}
        </Flex>
        <LogView logs={logs} />
    </Flex>
}