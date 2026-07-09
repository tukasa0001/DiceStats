import { Text, Flex, Select, IconButton } from "@radix-ui/themes"
import { LogFile } from "../file/LogFile"
import { FilteredLogView } from "./FilteredLogView"
import { useState } from "react"
import { LogViewBox } from "./LogViewBox"
import { Plus } from "lucide-react"

type MultiLogViewProps = {
    logs: LogFile[]
}

export const MultiLogView = (props: MultiLogViewProps) => {
    const { logs } = props;
    const [views, setViews] = useState<number[]>([0, 1, 2, 3]);

    const [selected, setSelected] = useState(0 < logs.length ? logs[0].filename : "ログがありません");

    if (logs.length <= 0) {
        return <>
            <Text>ログをアップロードしてください</Text>
        </>
    }

    return <Flex gap="1" mt="1" height="100%" flexBasis="0" flexGrow="1" flexShrink="1">
        {views.map(i => <LogViewBox key={i} log={logs[0]}
            onClose={views.length <= 1 ? undefined : () => setViews(views.filter(j => i !== j))} />
        )}

        {/* 表示の数が5つ未満なら追加ボタンを表示 */}
        {5 <= views.length ? null : (
            <Flex direction="column" align="center" justify="center">
                <IconButton ml="auto" mr="2" variant="soft"
                    onClick={() => setViews([...views, views[views.length - 1] + 1])}>
                    <Plus />
                </IconButton>
            </Flex>
        )}
    </Flex>
}