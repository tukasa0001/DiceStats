import { Box, Button, DropdownMenu, Flex, IconButton, Text } from "@radix-ui/themes"
import { Ellipsis } from "lucide-react"
import { FilteredLogView } from "./FilteredLogView"
import { LogFile } from "../file/LogFile"
import { LogView } from "./LogView"

export const LogViewBox = (props: {
    log: LogFile
}) => {

    const { log } = props;

    return (
        <Box maxHeight="100%" flexBasis="0" flexGrow="1" flexShrink="1">
            <Header />
            <Box minHeight="0" flexGrow="1">
                {/*<LogView logs={log} />*/}
            </Box>
        </Box>
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