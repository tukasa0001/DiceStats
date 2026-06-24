import { Badge, Box, Card, Code, Flex, ScrollArea } from "@radix-ui/themes";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { Heading, Text } from "@radix-ui/themes";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";
import LogViewFilter, { EMPTY_FILTER } from "./LogViewFilter";
import { LogFile } from "../file/LogFile";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type LogViewProps = {
    logs: LogFile
    filter?: LogViewFilter
    onClick?: (msg: CcfoliaMessage, i: number) => void
};

export const LogView = (props: LogViewProps) => {
    const { logs, onClick } = props;
    const scrollAreaRef = useRef<HTMLDivElement>(null);

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

    const filteredLog = logs.log.filter(msg => testFilter(msg))

    const virtualizer = useVirtualizer({
        count: filteredLog.length,
        getScrollElement: () => scrollAreaRef.current,
        estimateSize: () => 72,
        overscan: 20,
        gap: 16,
    })

    return (
        <ScrollArea scrollbars="vertical" ref={scrollAreaRef} style={{
            maxHeight: "100%"
        }}>
            <Box mt="4" height={`${virtualizer.getTotalSize()}px`} position="relative" ref={virtualizer.containerRef}>
                {virtualizer.getVirtualItems().map(vItem => (
                    <Card key={vItem.key} data-index={vItem.index}
                        ref={virtualizer.measureElement} asChild={onClick !== undefined}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${vItem.start}px)`,
                        }}>
                        {onClick === undefined
                            // 通常
                            ? <MessageCardContent msg={filteredLog[vItem.index]} filter={filter} />
                            // クリック可能
                            : <button onClick={() => onClick(filteredLog[vItem.index], vItem.index)}>
                                <MessageCardContent msg={filteredLog[vItem.index]} filter={filter} />
                            </button>}
                    </Card>

                ))}
            </Box>
        </ScrollArea>
    )
};

const MessageCardContent = (props: { msg: CcfoliaMessage, filter: LogViewFilter }) => {
    const { msg, filter } = props;
    return <>
        <Flex gap="2" direction="row">
            <Heading size="4">{msg.sender}</Heading>
            {msg instanceof CoCSkillRollMessage ? <Badge color="lime">技能判定</Badge> : null}
            {msg instanceof SanityCheckMessage ? <Badge color="ruby">SANチェック</Badge> : null}
            {msg instanceof ParamChangeMessage ? <Badge color="blue">{msg.paramName}変動</Badge> : null}
        </Flex>
        {
            filter.searchText === "" ? <Text>{msg.toDisplayText()}</Text> : <Text>
                {msg.toDisplayText().split(filter.searchText)
                    .map((text, i) => i === 0 ? text : <>
                        <u style={{ textDecorationColor: "lime" }}>{filter.searchText}</u>{text}
                    </>)}
            </Text>
        }
    </>
}