import { Badge, Card, Flex } from "@radix-ui/themes";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { Heading, Text } from "@radix-ui/themes";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";

type LogViewProps = {
    logs: CcfoliaMessage[]
    filter?: (msg: CcfoliaMessage) => boolean
};

export const LogView = (props: LogViewProps) => {
    const { logs, filter } = props;

    return <Flex gap="4" direction="column" mt="4">
        {logs.map((msg, i) => filter !== undefined && !filter(msg) ? null :
            <Card key={i}>
                <Flex gap="2" direction="row">
                    <Heading size="4">{msg.sender}</Heading>
                    {msg instanceof CoCSkillRollMessage ? <Badge color="lime">技能判定</Badge> : null}
                    {msg instanceof SanityCheckMessage ? <Badge color="ruby">SANチェック</Badge> : null}
                    {msg instanceof ParamChangeMessage ? <Badge color="blue">{msg.paramName}変動</Badge> : null}
                </Flex>
                <Text>{msg.toDisplayText()}</Text>
            </Card>)}

    </Flex>
};