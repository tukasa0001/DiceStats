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
        <div className="card">
            <h1>TRPG統計ツール</h1>
            <p>
                Ccfoliaのログからダイスロールなどの統計を取得します。<br />
                CoC6版のみ対応しています。<br />
                ログファイルをドラッグ&ドロップしてください。<br />
                または、 <button onClick={showUploadDialog}>ファイルを選択</button>
            </p>
        </div >
    )
}

export default UploadForm
