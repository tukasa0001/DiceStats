import { Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes"
import { LogFile } from "./LogFile"
import { useState } from "react"

type LogFileInfoProps = {
    log: LogFile
}

export const LogFileInfo = (props: LogFileInfoProps) => {
    const { log } = props;
    const [startMsg, setStartMsg] = useState("");
    const [endMsg, setEndMsg] = useState("");

    return <Box>
        <Card>
            <Text as="div" weight="bold">{log.filename}</Text>
            <Flex ml="4" my="1" direction="column" gap="2">
                <Flex gap="2" align="center">
                    <Text>
                        開始位置：
                    </Text>
                    <TextField.Root
                        value={startMsg}
                        onChange={e => {
                            setStartMsg(e.target.value.trim())
                        }}
                        placeholder="最初から">
                        <TextField.Slot />
                    </TextField.Root>
                    <Button variant="outline">選択</Button>
                </Flex>
                <Flex gap="2" align="center">
                    <Text>
                        終了位置：
                    </Text>
                    <TextField.Root
                        value={endMsg}
                        onChange={e => {
                            setEndMsg(e.target.value.trim())
                        }}
                        placeholder="最後まで">
                        <TextField.Slot />
                    </TextField.Root>
                    <Button variant="outline">選択</Button>
                </Flex>
            </Flex>
        </Card>
    </Box>
}