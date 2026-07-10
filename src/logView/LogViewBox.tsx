import { Box, Button, Card, Checkbox, DropdownMenu, Flex, IconButton, ScrollArea, Tabs, Text, TextField } from "@radix-ui/themes"
import { Check, Ellipsis, X } from "lucide-react"
import { LogFile } from "../file/LogFile"
import { LogView, LogViewScroller } from "./LogView"
import { Ref, useEffect, useMemo, useState } from "react"

export const LogViewBox = (props: {
    log: LogFile,
    onClose?: () => void,
    scrollerRef?: Ref<LogViewScroller>,
    onScrolled?: (scroller: LogViewScroller) => void
}) => {
    const { log, onClose, scrollerRef, onScrolled } = props;

    const [currentTab, setTab] = useState("@ALL");
    const [searchText, setSearchText] = useState("");
    const { allChannels, allCharacters } = useMemo(() => {
        const channels = new Set<string>();
        const characters = new Map<string, number>();
        for (const msg of log.log) {
            channels.add(msg.channel);
            characters.set(msg.sender, (characters.get(msg.sender) ?? 0) + 1);
        }
        return {
            allChannels: [...channels],
            allCharacters: [...characters].sort(([, a], [, b]) => b - a).map(([name,]) => name),
        };
    }, [log.log]);
    const [charaFilter, setCharaFilter] = useState(() => allCharacters);
    useEffect(() => {
        setCharaFilter(allCharacters);
    }, [allCharacters]);
    const hiddenCharacters = useMemo(() => allCharacters.filter(chara => !charaFilter.includes(chara)), [allCharacters, charaFilter]);
    const filter = useMemo(() => ({
        searchText,
        hiddenCharacters,
        hiddenMessageTypes: [] as string[],
    }), [searchText, hiddenCharacters]);

    return (
        <Flex direction="column" flexBasis="0" flexGrow="1" flexShrink="1">
            <Box minHeight="0" height="1px" flexGrow="1" flexShrink="1" overflowY="hidden">
                <LogView logs={log} tab={currentTab === "@ALL" ? undefined : currentTab}
                    scrollerRef={scrollerRef} onScrolled={onScrolled}
                    filter={filter} />
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

                {/* キャラフィルター */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger style={{ flex: "1" }}>
                        <Button variant="surface" style={{
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