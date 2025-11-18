import { Box, Container, Heading, Section, Text, Theme } from "@radix-ui/themes";
import parseCcfoliaLog from "./ccfoliaLog/CcfoliaLog";
import { CcfoliaMessage } from "./ccfoliaLog/message/CcfoliaMessage";

type UploadFormProps = {
    onLogFileChanged: (x: CcfoliaMessage[]) => void
};

const UploadForm = (props: UploadFormProps) => {
    const onFileChanged = async (file: File) => {
        const str = await file.text();
        const parsed = parseCcfoliaLog(str);
        props.onLogFileChanged(parsed);
    }

    return (
        <Box py="6">
            <Text>
                Ccfoliaのログからダイスロールなどの統計を取得します。<br />
                CoC6版のみ対応しています。
            </Text>
            <form>
                <label>Ccfoliaのログをアップロードしてください： </label>
                <input type="file" accept=".html,.htm" onChange={e => {
                    if (e.target.files != null) {
                        const file = e.target.files[0];
                        onFileChanged(file);
                    }
                }}></input>
            </form>
        </Box>
    )
}

export default UploadForm
