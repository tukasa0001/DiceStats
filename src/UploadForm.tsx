type UploadFormProps = {
    onLogFileChanged: (x: string) => void
};

const UploadForm = (props: UploadFormProps) => {
    const onFileChanged = async (file: File) => {
        const str = await file.text();
        props.onLogFileChanged(str);
    }

    return (
        <div className="card">
            <h1>TRPG統計ツール</h1>
            <p>
                Ccfoliaのログからダイスロールなどの統計を取得します。<br />
                CoC6版のみ対応しています。
            </p>
            <form>
                <label>Ccfoliaのログをアップロードしてください： </label>
                <input type="file" accept=".html,.htm" onChange={e => {
                    if (e.target.files != null) {
                        const file = e.target.files[0];
                        onFileChanged(file);
                    }
                }}></input>
            </form>
        </div>
    )
}

export default UploadForm
