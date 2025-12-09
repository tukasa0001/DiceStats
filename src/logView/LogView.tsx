import { Badge, Card, Code, Flex } from "@radix-ui/themes";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { Heading, Text } from "@radix-ui/themes";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";
import LogViewFilter, { EMPTY_FILTER } from "./LogViewFilter";

type LogViewProps = {
    logs: CcfoliaMessage[]
    filter?: LogViewFilter
};

export const LogView = (props: LogViewProps) => {
    const { logs } = props;
    const filter = props.filter ?? EMPTY_FILTER;

    const testFilter = (msg: CcfoliaMessage) => {
        if (filter.hiddenMessageTypes.includes(msg.constructor.name)) {
            return false;
        }
        if (filter.hiddenCharacters.includes(msg.sender)) {
            return false;
        }
        if (filter.searchText !== "" && !msg.toDisplayText().includes(filter.searchText)) {
            return false;
        }
        return true;
    }

    return <Flex gap="4" direction="column" mt="4">
        {logs.map((msg, i) => !testFilter(msg) ? null :
            <Card key={i}>
                <Flex gap="2" direction="row">
                    <Heading size="4">{msg.sender}</Heading>
                    {msg instanceof CoCSkillRollMessage ? <Badge color="lime">技能判定</Badge> : null}
                    {msg instanceof SanityCheckMessage ? <Badge color="ruby">SANチェック</Badge> : null}
                    {msg instanceof ParamChangeMessage ? <Badge color="blue">{msg.paramName}変動</Badge> : null}
                </Flex>
                {filter.searchText === "" ? <Text>{msg.toDisplayText()}</Text> : <Text>
                    {msg.toDisplayText().split(filter.searchText)
                        .map((text, i) => i === 0 ? text : <><Code color="lime">{filter.searchText}</Code>{text}</>
                        )}
                </Text>}
            </Card>)}
    </Flex>
};