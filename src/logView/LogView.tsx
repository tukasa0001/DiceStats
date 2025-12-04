import { Card, Flex } from "@radix-ui/themes";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { Heading, Text } from "@radix-ui/themes";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";

type LogViewProps = {
    logs: CcfoliaMessage[]
};

export const LogView = (props: LogViewProps) => {
    const { logs } = props;

    return <Flex gap="4" direction="column">
        {logs.map((msg, i) => <Card key={i}>
            <Heading size="4">{msg.sender}</Heading>
            <Text>{msg.toDisplayText()}</Text>
        </Card>)}

    </Flex>
};