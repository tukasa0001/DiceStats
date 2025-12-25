import { Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes"
import { LogFile } from "./LogFile"
import { useState } from "react"
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge"
import { TriangleAlert } from "lucide-react"

type LogFileInfoProps = {
    log: LogFile,
    setLog: (log: LogFile) => void
}

export const LogFileInfo = (props: LogFileInfoProps) => {
    const { log, setLog } = props;
    const [startMsg, setStartMsg] = useState("");
    const [endMsg, setEndMsg] = useState("");

    const textToIndex = (text: string) => {
        if (text === "") {
            return undefined;
        }
        for (let i = 0; i < log.log.length; i++) {
            const msg = log.log[i];
            if (msg instanceof TalkMessage && msg.text === text) {
                return i;
            }
        }
        return undefined;
    }

    return <Box>
        <Card>
            <Text as="div" weight="bold">{log.filename} ({log.endIdx - log.startIdx + 1}メッセージ)</Text>
            <Flex ml="4" my="1" direction="column" gap="2">
                <Flex gap="2" align="center">
                    <Text>
                        開始位置：
                    </Text>
                    <TextField.Root
                        value={startMsg}
                        onChange={e => {
                            setStartMsg(e.target.value.trim())
                            const idx = textToIndex(e.target.value.trim());
                            setLog({ ...log, startIdx: idx ?? 0 })
                        }}
                        placeholder="最初から">
                        <TextField.Slot />
                    </TextField.Root>
                    {log.startIdx === 0 && startMsg !== "" ? <TriangleAlert /> : null}
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
                            const idx = textToIndex(e.target.value.trim());
                            setLog({ ...log, endIdx: idx ?? log.log.length })
                        }}
                        placeholder="最後まで">
                        <TextField.Slot />
                    </TextField.Root>
                    {log.endIdx === log.log.length && endMsg !== "" ? <TriangleAlert /> : null}
                    <Button variant="outline">選択</Button>
                </Flex>
            </Flex>
        </Card>
    </Box>
}