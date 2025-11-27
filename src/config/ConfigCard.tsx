import { JSX, useContext, useEffect, useState } from "react";
import DisplayConfig from "./DisplayConfig";
import "./ConfigCard.css"
import { PinIcon, Trash, X } from "lucide-react";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";
import { configCtx, setConfigCtx } from "../App";
import { Box, Button, Flex, IconButton, Table, TextField, Text } from "@radix-ui/themes";

type ConfigCardProps = {
    log?: CcfoliaMessage[]
}

const ConfigCard = (props: ConfigCardProps) => {
    const config = useContext(configCtx);
    const setConf = useContext(setConfigCtx);
    const [isPinned, setPinned] = useState(false);
    const log = props.log ?? [];

    // 開始メッセージ・終了メッセージの有効性を確認
    let isStartMessageValid = config.startMessage === "";
    let isEndMessageValid = config.endMessage === "";
    for (let msg of log) {
        if (msg instanceof TalkMessage) {
            if (!isStartMessageValid && msg.text === config.startMessage) {
                isStartMessageValid = true;
                isEndMessageValid = config.endMessage === ""; // ここからまた終了メッセージの検索を開始
            }
            if (!isEndMessageValid && msg.text === config.endMessage) {
                isEndMessageValid = true;
                // 全てのチェックが終わったらbreak
                if (isStartMessageValid) {
                    break;
                }
            }
        }
    }

    return (
        <div className={`card configCard ${isPinned ? "pinned" : ""}`}>
            <h2>詳細設定</h2>
            <button className="pin" onClick={() => setPinned(!isPinned)}>
                {isPinned ? <X /> : <PinIcon />}
            </button>
            <ToggleBox title="名前の変換設定" elem={<>
                <p>
                    指定した名前を別の名前に変換します。<br />
                    変換先が重複した場合、それらの記録は統合されます。
                </p>
                {config.nameAliases.length === 0 ? "" :
                    <Table.Root className="nameAliasTable">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell>元の名前</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>変換後の名前</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell className="del" justify="center">削除</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {config.nameAliases.map(([before, after], i) => <Table.Row key={i}>
                                <Table.Cell>
                                    <TextField.Root
                                        value={before}
                                        onChange={e => setConf(config.withNameAliases(arr => arr.map((tp, idx) => idx === i ? [e.target.value, tp[1]] : tp)))}>
                                        <TextField.Slot />
                                    </TextField.Root>
                                </Table.Cell>
                                <Table.Cell>
                                    <TextField.Root
                                        value={after}
                                        onChange={e => setConf(config.withNameAliases(arr => arr.map((tp, idx) => idx === i ? [tp[0], e.target.value] : tp)))}
                                        placeholder="統計から除外">
                                        <TextField.Slot />
                                    </TextField.Root>
                                </Table.Cell>
                                <Table.Cell className="del" justify="center">
                                    <IconButton variant="surface" onClick={() => setConf(config.withNameAliases(arr => arr.filter((_, idx) => idx != i)))}>
                                        <Trash />
                                    </IconButton>
                                </Table.Cell>
                            </Table.Row>)}
                        </Table.Body>
                    </Table.Root>
                }
                <Button variant="surface" my="2" onClick={() => setConf(config.withNameAliases(arr => [...arr, ["", ""]]))}>追加</Button>
            </>} />

            <ToggleBox title="統計範囲を変更" elem={<>
                <p>
                    特定の発言をトリガーに、範囲内の統計を出力します
                </p>
                <div className="stats-range-config">
                    <Flex align="center" py="1">
                        <Text>範囲：</Text>
                        <TextField.Root
                            value={config.startMessage}
                            onChange={e => setConf(config.withStartMessage(e.target.value.trim()))}
                            placeholder="最初から">
                            <TextField.Slot />
                        </TextField.Root>
                        <Text mx="2"> ～ </Text>
                        <TextField.Root
                            value={config.endMessage}
                            onChange={e => setConf(config.withEndMessage(e.target.value.trim()))}
                            placeholder="最後まで">
                            <TextField.Slot />
                        </TextField.Root>
                    </Flex>
                </div>
            </>} />
            <ToggleBox title="その他の設定" elem={<>
                <label className="checkbox-label">
                    <input type="checkbox"
                        checked={config.ignoreSecretDice}
                        onChange={e => setConf(config.withIgnoreSecretDice(e.target.checked))}
                    />
                    シークレットダイスを無視する
                </label>
            </>} />
        </div>
    )
}

const ToggleBox = (props: { title: string, elem: JSX.Element }) => {
    const [show, setShow] = useState(false);

    return (
        <Box className={`toggleBox ${show ? "active" : "inactive"}`}>
            <Button size="3" variant="surface" highContrast={true} className="toggleButton" onClick={() => setShow(!show)}>{`${show ? "▼" : "▶"} ${props.title}`}</Button>
            <div className="toggleElement"><div>{props.elem}</div></div>
        </Box>
    );
}

export default ConfigCard;