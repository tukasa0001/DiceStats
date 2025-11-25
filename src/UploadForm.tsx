import { Box, Container, Heading, Section, Text, Theme } from "@radix-ui/themes";
import parseCcfoliaLog from "./ccfoliaLog/CcfoliaLog";
import { CcfoliaMessage } from "./ccfoliaLog/message/CcfoliaMessage";

type UploadFormProps = {
    onLogFileChanged: (files: File[]) => Promise<void>
};

const UploadForm = (props: UploadFormProps) => {
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
            <Text>
                Ccfoliaのログからダイスロールなどの統計を取得します。<br />
                CoC6版のみ対応しています。<br />
                ログファイルをドラッグ&ドロップしてください。<br />
                または、 <button onClick={showUploadDialog}>ファイルを選択</button>
            </Text>
        </Box>
    )
}

export default UploadForm
