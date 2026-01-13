import { Button, IconButton, Table, TextField } from "@radix-ui/themes";
import { Trash } from "lucide-react";


type NameAliasConfigProps = {
    value: [string, string][],
    onValueChanged: (value: [string, string][]) => void
};

const NameAliasConfig = (props: NameAliasConfigProps) => {
    const { value, onValueChanged } = props;

    return <>
        <p>
            指定した名前を別の名前に変換します。<br />
            変換先が重複した場合、それらの記録は統合されます。
        </p>
        {value.length === 0 ? "" :
            <Table.Root className="nameAliasTable">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>元の名前</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>変換後の名前</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="del" justify="center">削除</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {value.map(([before, after], i) => <Table.Row key={i}>
                        <Table.Cell>
                            <TextField.Root
                                value={before}
                                onChange={e => onValueChanged(value.map((tp, idx) => idx === i ? [e.target.value, tp[1]] : tp))}>
                                <TextField.Slot />
                            </TextField.Root>
                        </Table.Cell>
                        <Table.Cell>
                            <TextField.Root
                                value={after}
                                onChange={e => onValueChanged(value.map((tp, idx) => idx === i ? [tp[0], e.target.value] : tp))}
                                placeholder="統計から除外">
                                <TextField.Slot />
                            </TextField.Root>
                        </Table.Cell>
                        <Table.Cell className="del" justify="center">
                            <IconButton variant="surface" onClick={() => onValueChanged(value.filter((_, idx) => idx != i))}>
                                <Trash />
                            </IconButton>
                        </Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table.Root>
        }
        <Button variant="surface" my="2" onClick={() => onValueChanged([...value, ["", ""]])}>追加</Button>
    </>
}

export default NameAliasConfig;