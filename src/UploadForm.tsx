import { Box, Button, Container, Flex, Heading, Section, Text, Theme } from "@radix-ui/themes";
import parseCcfoliaLog from "./ccfoliaLog/CcfoliaLog";
import { CcfoliaMessage } from "./ccfoliaLog/message/CcfoliaMessage";
import { LogFile } from "./file/LogFile";
import { LogFileInfo } from "./file/LogFileInfo";

type UploadFormProps = {
    logs: LogFile[],
    setLogs: (logs: LogFile[]) => void
    onLogFileChanged: (files: File[]) => Promise<void>
};

const UploadForm = (props: UploadFormProps) => {
    const { logs, setLogs } = props;
    const showUploadDialog = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.htm';
        input.multiple = true;
        input.onchange = () => {
            if (input.files != null) {
                props.onLogFileChanged([...input.files]);
            }
            input.remove();
        };
        input.style = "display:none;";
        input.click();
    }

    return (
        <Box py="6">
            <Text my="2" as="div">
                Ccfoliaのログからダイスロールなどの統計を取得します。<br />
                CoC6版のみ対応しています。<br />
                ログファイルをドラッグ&ドロップするか、ファイルを選択してください<br />
                <Button mt="2" onClick={showUploadDialog}>ファイルを選択</Button>
            </Text>
            <Flex direction="column" gap="2">
                {props.logs.map((log, i) => (<LogFileInfo key={i}
                    log={log}
                    setLog={log => setLogs(logs.map((x, idx) => i === idx ? log : x))} />))}
            </Flex>
        </Box>
    )
}

export default UploadForm
