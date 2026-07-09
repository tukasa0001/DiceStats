import { Box, Button, DropdownMenu, Flex, IconButton, ScrollArea, Tabs, Text } from "@radix-ui/themes"
import { Ellipsis, X } from "lucide-react"
import { FilteredLogView } from "./FilteredLogView"
import { LogFile } from "../file/LogFile"
import { LogView } from "./LogView"
import { useMemo, useState } from "react"

export const LogViewBox = (props: {
    log: LogFile,
    onClose?: () => void
}) => {
    const { log, onClose } = props;

    const [currentTab, setTab] = useState("@ALL");
    const allChannels = useMemo(() => [...new Set([...log.log].map(msg => msg.channel))], [log]);

    return (
        <Flex direction="column" flexBasis="0" flexGrow="1" flexShrink="1">
            <Box minHeight="0" height="1px" flexGrow="1" flexShrink="1" overflowY="hidden">
                <LogView logs={log} />
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