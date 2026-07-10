import { Box, Button, Card, Checkbox, DropdownMenu, Flex, IconButton, ScrollArea, Select, Tabs, Text, TextField } from "@radix-ui/themes"
import { Check, ChevronDown, ChevronUp, Ellipsis, X } from "lucide-react"
import { LogView, LogViewScroller } from "./LogView"
import { Ref, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage"
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge"

type OtherFilterParams = {
    msg: CcfoliaMessage,
    searchText: string
}

const otherFilters: { [key: string]: (params: OtherFilterParams) => boolean } = {
    "フィルタなし": () => true,
    "キャラ発言のみ": ({ msg }) => msg instanceof TalkMessage && msg.text.match(/^[「『].*[」』]/) !== null,
    "検索ワードでフィルタ": ({ msg, searchText }) => msg.toDisplayText().includes(searchText)
}

export const LogViewBox = (props: {
    log: CcfoliaMessage[],
    onClose?: () => void,
    scrollerRef?: Ref<LogViewScroller>,
    onScrolled?: (scroller: LogViewScroller) => void
}) => {
    const { log, onClose, scrollerRef: parentScrollerRef, onScrolled } = props;

    const [currentTab, setTab] = useState("@ALL");
    const [searchText, setSearchText] = useState("");
    const { allChannels, allCharacters } = useMemo(() => {
        const channels = new Set<string>();
        const characters = new Map<string, number>();
        for (const msg of log) {
            channels.add(msg.channel);
            characters.set(msg.sender, (characters.get(msg.sender) ?? 0) + 1);
        }
        return {
            allChannels: [...channels],
            allCharacters: [...characters].sort(([, a], [, b]) => b - a).map(([name,]) => name),
        };
    }, [log]);
    const [charaFilter, setCharaFilter] = useState(() => allCharacters);
    const [otherFilter, setOtherFilter] = useState("フィルタなし");

    const filteredLog = useMemo(() => log.filter(msg =>
        (currentTab === "@ALL" || msg.channel === currentTab) &&
        charaFilter.includes(msg.sender) &&
        otherFilters[otherFilter]({ msg, searchText })
    ), [log, currentTab, charaFilter, otherFilter, searchText]);

    useEffect(() => {
        setCharaFilter(allCharacters);
    }, [allCharacters]);

    const scrollerRef = useRef<LogViewScroller>(null);
    useImperativeHandle(parentScrollerRef, () => scrollerRef.current!, [scrollerRef.current]);

    return (
        <Flex direction="column" flexBasis="0" flexGrow="1" flexShrink="1">
            <Box minHeight="0" height="1px" flexGrow="1" flexShrink="1" overflowY="hidden">
                <LogView log={filteredLog}
                    highlight={searchText}
                    scrollerRef={scrollerRef} onScrolled={onScrolled} />
            </Box>
            <Tabs.Root value={currentTab} onValueChange={setTab}>
                <Tabs.List>
                    <ScrollArea scrollbars="horizontal">
                        <Flex maxWidth="1px" mb="3">
                            <Tabs.Trigger value="@ALL">全て</Tabs.Trigger>
                            {allChannels.map(channel => (
                                <Tabs.Trigger key={channel} value={channel}>{channel}</Tabs.Trigger>
                            ))}
                        </Flex>
                    </ScrollArea>
                    {onClose ? (
                        <IconButton ml="auto" mr="2" color="red" variant="soft"
                            onClick={onClose}
                            style={{
                                alignSelf: "center"
                            }}>
                            <X />
                        </IconButton>
                    ) : null}
                </Tabs.List>
            </Tabs.Root>
            <Flex my="1" mx="3" gap="1">
                {/*内容検索*/}
                <TextField.Root value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="検索" style={{ flex: "2" }}>
                    <TextField.Slot />
                </TextField.Root>

                {/* 内容検索/1つ上へ */}
                <IconButton variant="surface"
                    onClick={() => {
                        const scroller = scrollerRef.current;
                        if (!scroller || searchText === "") return;
                        const idx = scroller.getCurrentIndex();
                        for (const msg of filteredLog.filter(m => m.index < idx).reverse()) {
                            if (msg.toDisplayText().includes(searchText)) {
                                scroller.scrollToIndex(msg.index);
                                break;
                            }
                        }
                    }}>
                    <ChevronUp />
                </IconButton>

                {/* 内容検索/1つ下へ */}
                <IconButton variant="surface"
                    onClick={() => {
                        const scroller = scrollerRef.current;
                        if (!scroller || searchText === "") return;
                        const idx = scroller.getCurrentIndex();
                        for (const msg of filteredLog.filter(m => idx < m.index)) {
                            if (msg.toDisplayText().includes(searchText)) {
                                scroller.scrollToIndex(msg.index);
                                break;
                            }
                        }
                    }}>
                    <ChevronDown />
                </IconButton>

                {/* キャラフィルター */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger style={{ flex: "1" }}>
                        <Button variant="outline"
                            color={charaFilter.length === allCharacters.length ? "gray" : charaFilter.length === 0 ? "red" : undefined}
                            style={{
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textAlign: "left"
                            }}>
                            <Text style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {charaFilter.length === allCharacters.length ? "全員"
                                    : charaFilter.length === 1 ? charaFilter[0]
                                        : charaFilter.length === 0 ? "-"
                                            : "複数人"
                                }
                            </Text>
                            <DropdownMenu.TriggerIcon />
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Item onClick={e => {
                            if (charaFilter.length === allCharacters.length) {
                                setCharaFilter([]);
                            }
                            else {
                                setCharaFilter(allCharacters);
                            }
                            e.preventDefault();
                        }}>
                            全員表示 {charaFilter.length === allCharacters.length ? <Check /> : null}
                        </DropdownMenu.Item>
                        {allCharacters.map((chara, idx) => (
                            <DropdownMenu.Item key={`${idx}-${chara}`}
                                onClick={e => {
                                    // 全員選択 => 単体選択
                                    if (charaFilter.length === allCharacters.length) {
                                        setCharaFilter([chara]);
                                    }
                                    // フィルター切り替え
                                    else if (charaFilter.includes(chara)) {
                                        setCharaFilter(charaFilter.filter(c => c !== chara));
                                    }
                                    else {
                                        setCharaFilter([...charaFilter, chara]);
                                    }
                                    e.preventDefault();
                                }}>
                                {chara} {charaFilter.length !== allCharacters.length && charaFilter.includes(chara) ? <Check /> : null}
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <Select.Root defaultValue={"フィルタなし"} onValueChange={sel => setOtherFilter(sel)}>
                    <Select.Trigger color="blue" variant="surface" style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }} />
                    <Select.Content position="popper">
                        <Select.Group>
                            {Object.keys(otherFilters).map((name, i) => <Select.Item key={i} value={name}>{name}</Select.Item>)}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>

            </Flex>
        </Flex>
    )
}

const Header = () => {
    return (
        <Flex minHeight="64px" align="center" justify="between" mx="6" flexGrow="0">
            <Flex align="center" justify="start" flexBasis="0" flexGrow="1" flexShrink="1">
            </Flex>

            <Flex align="center" justify="center" flexBasis="0" flexGrow="1" flexShrink="1">
                <Button
                    variant="ghost"
                    color="gray"
                    /*onClick={onTitleClick}
                    style={{
                        cursor: onTitleClick ? "pointer" : "default",
                    }}*/
                    aria-label="シナリオを選択"
                >
                    <Text size="6" style={{ color: "white" }}>Title Here</Text>
                </Button>
            </Flex>
            <Flex align="center" justify="end" flexBasis="0" flexGrow="1" flexShrink="1">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <IconButton variant="ghost" color="gray">
                            <Ellipsis />
                        </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Item>Work</DropdownMenu.Item>
                        <DropdownMenu.Item>In</DropdownMenu.Item>
                        <DropdownMenu.Item>Progress</DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        {/*<DropdownMenu.Item color="red" onClick={onClose} disabled={!onClose}>
                            閉じる
                        </DropdownMenu.Item>*/}
                    </DropdownMenu.Content>

                </DropdownMenu.Root>
            </Flex>
        </Flex >
    )
}