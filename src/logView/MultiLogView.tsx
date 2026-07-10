import { Text, Flex, Select, IconButton, Box, Checkbox, Card } from "@radix-ui/themes"
import { LogFile } from "../file/LogFile"
import { useRef, useState } from "react"
import { LogViewBox } from "./LogViewBox"
import { Plus } from "lucide-react"
import { LogViewScroller } from "./LogView"

type MultiLogViewProps = {
    logs: LogFile[]
}

type ViewInfo = {
    id: number,
    log?: LogFile,
    noSync?: boolean
}

export const MultiLogView = (props: MultiLogViewProps) => {
    const { logs } = props;
    const [activeViewIdx, setActiveViewIdx] = useState(-1);
    const [views, setViews] = useState<ViewInfo[]>([{ id: 0 }]);
    const scrollerRefs = useRef(new Map<number, LogViewScroller>());
    const defaultLog = logs[0];

    const setScrollerRef = (id: number, scroller: LogViewScroller | null) => {
        if (scroller) {
            scrollerRefs.current.set(id, scroller);
        } else {
            scrollerRefs.current.delete(id);
        }
    };


    const syncScroll = (src: ViewInfo, idx: number) => {
        if (src.id !== activeViewIdx || src.noSync) return;
        for (const view of views) {
            if (view !== src && (view.log ?? logs[0]) === (src.log ?? logs[0]) && !view.noSync) {
                const scroller = scrollerRefs.current.get(view.id);
                if (scroller) {
                    scroller.scrollToIndex(idx);
                }
            }
        }
    }

    if (logs.length <= 0) {
        return <>
            <Text>ログをアップロードしてください</Text>
        </>
    }

    return <Flex gap="1" mt="1" height="100%" flexBasis="0" flexGrow="1" flexShrink="1" minWidth="0">
        {views.map(view => (
            <Flex key={view.id} direction="column" onMouseEnter={() => setActiveViewIdx(view.id)}
                flexBasis="0" flexGrow="1" flexShrink="1" minWidth="0">
                <LogViewBox log={view.log?.log ?? defaultLog.log}
                    scrollerRef={sc => setScrollerRef(view.id, sc)}
                    onScrolled={sc => {
                        syncScroll(view, sc.getCurrentIndex());
                    }}
                    onClose={views.length <= 1 ? undefined : () => setViews(prev => prev.filter(v => view !== v))} />
                <Flex direction="column" my="1" px="3" gap="1" justify="center" minWidth="0">
                    <Flex>
                        <Card asChild style={{ padding: "4px 12px", flex: "1" }}>
                            <label>
                                <Flex align="center" justify="center" gap="1">
                                    <Text>同期</Text>
                                    <Checkbox checked={!view.noSync}
                                        onCheckedChange={val => setViews(prev => prev.map(v => v.id === view.id ? { ...v, noSync: !val } : v))} />
                                </Flex>
                            </label>
                        </Card>
                    </Flex>
                    <Select.Root
                        value={view.log?.filename ?? defaultLog.filename}
                        onValueChange={sel => setViews(prev => prev.map(v => v.id === view.id ? { id: v.id, log: logs.find(l => l.filename === sel) } : v))}
                    >
                        <Select.Trigger style={{ width: "100%" }} />
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
                    onClick={() => setViews(prev => [...prev, { id: prev[prev.length - 1].id + 1, log: prev[prev.length - 1].log }])}>
                    <Plus />
                </IconButton>
            </Flex>
        )}
    </Flex>
}