import { Text, Flex, Select, IconButton, Box } from "@radix-ui/themes"
import { LogFile } from "../file/LogFile"
import { useState } from "react"
import { LogViewBox } from "./LogViewBox"
import { Plus } from "lucide-react"

type MultiLogViewProps = {
    logs: LogFile[]
}

type ViewInfo = {
    id: number,
    log?: LogFile
}

export const MultiLogView = (props: MultiLogViewProps) => {
    const { logs } = props;
    const [views, setViews] = useState<ViewInfo[]>([{ id: 0 }]);

    if (logs.length <= 0) {
        return <>
            <Text>ログをアップロードしてください</Text>
        </>
    }

    return <Flex gap="1" mt="1" height="100%" flexBasis="0" flexGrow="1" flexShrink="1">
        {views.map(view => (
            <Flex direction="column" flexBasis="0" flexGrow="1" flexShrink="1">
                <LogViewBox key={view.id} log={view.log ?? logs[0]}
                    onClose={views.length <= 1 ? undefined : () => setViews(views.filter(v => view !== v))} />
                <Flex direction="column" my="1" px="3" justify="center">
                    <Select.Root
                        value={view.log?.filename ?? logs[0].filename}
                        onValueChange={sel => setViews(views.map(v => v.id === view.id ? { id: v.id, log: logs.find(l => l.filename === sel) } : v))}
                    >
                        <Select.Trigger />
                        <Select.Content >
                            <Select.Group>
                                {logs.map((log, i) => <Select.Item key={i} value={log.filename}>
                                    {log.filename}
                                </Select.Item>)}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </Flex>
            </Flex>
        ))}

        {/* 表示の数が5つ未満なら追加ボタンを表示 */}
        {5 <= views.length ? null : (
            <Flex direction="column" align="center" justify="center">
                <IconButton ml="auto" mr="2" variant="soft"
                    onClick={() => setViews([...views, { id: views[views.length - 1].id + 1, log: views[views.length - 1].log }])}>
                    <Plus />
                </IconButton>
            </Flex>
        )}
    </Flex>
}