import { Box, Card, Text } from "@radix-ui/themes"
import { LogFile } from "./LogFile"

type LogFileInfoProps = {
    log: LogFile
}

export const LogFileInfo = (props: LogFileInfoProps) => {
    const { log } = props;
    return <Box>
        <Card>
            <Text as="div" weight="bold">{log.filename}</Text>
        </Card>
    </Box>
}