import { Text, Flex, Select } from "@radix-ui/themes"
import { LogFile } from "../file/LogFile"
import { FilteredLogView } from "./FilteredLogView"
import { useState } from "react"

type MultiLogViewProps = {
    logs: LogFile[]
}

export const MultiLogView = (props: MultiLogViewProps) => {
    const { logs } = props;
    const [selected, setSelected] = useState(0 < logs.length ? logs[0].filename : "ログがありません");

    if (logs.length <= 0) {
        return <>
            <Text>ログをアップロードしてください</Text>
        </>
    }

    return <Flex direction="column" gap="1" mt="1">
        <Select.Root
            value={selected}
            onValueChange={sel => setSelected(sel)}
        >
            <Select.Trigger />
            <Select.Content>
                <Select.Group>
                    {logs.map((log, i) => <Select.Item key={i} value={log.filename}>
                        {log.filename}
                    </Select.Item>)}
                </Select.Group>
            </Select.Content>
        </Select.Root>

        <FilteredLogView logs={logs.filter(l => l.filename === selected)[0]} />
    </Flex>
}