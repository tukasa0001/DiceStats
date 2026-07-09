import { Badge, Box, Button, Card, Code, Flex, ScrollArea } from "@radix-ui/themes";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { Heading, Text } from "@radix-ui/themes";
import { TalkMessage } from "../ccfoliaLog/message/TalkMessasge";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";
import LogViewFilter, { EMPTY_FILTER } from "./LogViewFilter";
import { LogFile } from "../file/LogFile";
import { CSSProperties, Ref, useImperativeHandle, useRef } from "react";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";

export type LogViewScroller = {
    getCurrentIndex(): number,
    scrollToIndex(idx: number): void
}

const createScroller = (virtualizer: Virtualizer<HTMLDivElement, Element>, log: CcfoliaMessage[]): LogViewScroller => {
    return ({
        getCurrentIndex() {
            const rawIdx = virtualizer.getVirtualIndexes()[20];
            return log[rawIdx]?.index ?? 0;
        },
        scrollToIndex(idx) {
            let rawIdx = 0;
            for (const msg of log) {
                if (idx <= msg.index) {
                    break;
                }
                rawIdx++;
            }
            if (rawIdx) {
                virtualizer.scrollToIndex(rawIdx, { align: "start", behavior: "smooth" });
            }
        },
    });
}

type LogViewProps = {
    logs: LogFile
    filter?: LogViewFilter
    onClick?: (msg: CcfoliaMessage, i: number) => void,
    scrollerRef?: Ref<LogViewScroller>,
    onScrolled?: (scroller: LogViewScroller) => void
};

export const LogView = (props: LogViewProps) => {
    const { logs, onClick, scrollerRef, onScrolled } = props;
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
        estimateSize: () => 81.6,
        overscan: 20,
        onChange(instance, sync) {
            if (!onScrolled) return;
            if (sync) {
                onScrolled(createScroller(instance, filteredLog));
            }
        },
    });
    useImperativeHandle(scrollerRef, () => createScroller(virtualizer, filteredLog));


    return (
        <ScrollArea scrollbars="vertical" size="2" ref={scrollAreaRef} style={{
            maxHeight: "100%"
        }}>
            <Box mt="4" height={`${virtualizer.getTotalSize()}px`} position="relative" ref={virtualizer.containerRef}>
                {virtualizer.getVirtualItems().map(vItem => (
                    <Box key={vItem.key} data-index={vItem.index} style={{
                        width: "100%",
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: `translateY(${vItem.start}px)`,
                    }} ref={virtualizer.measureElement}>
                        <MessageEntry
                            msg={filteredLog[vItem.index]} filter={filter}
                            onClick={onClick ? () => onClick(filteredLog[vItem.index], vItem.index) : undefined}
                            debugText={`idx-${vItem.index}`}
                        />
                    </Box>
                ))}
            </Box>
        </ScrollArea>
    )
};

const MessageEntry = (props: {
    msg: CcfoliaMessage, filter: LogViewFilter,
    onClick?: () => void,
    debugText?: string
}) => {
    const { msg, filter, onClick, debugText } = props;

    const blockStyle: CSSProperties = {
        display: "block"
    }

    return <>
        <Box px="4" py="2" position="relative">
            <Flex gap="2" direction="row">
                <Heading size="4">{msg.sender}</Heading>
                {msg instanceof CoCSkillRollMessage ? <Badge color="lime">技能判定</Badge> : null}
                {msg instanceof SanityCheckMessage ? <Badge color="ruby">SANチェック</Badge> : null}
                {msg instanceof ParamChangeMessage ? <Badge color="blue">{msg.paramName}変動</Badge> : null}
                {debugText ? <Badge color="purple">{debugText}</Badge> : null}
            </Flex>
            {filter.searchText === "" ? <Text style={blockStyle}>{msg.toDisplayText()}</Text> :
                <Text style={blockStyle}>
                    {msg.toDisplayText().split(filter.searchText)
                        .map((text, i) => i === 0 ? text : <>
                            <u style={{ textDecorationColor: "lime" }}>{filter.searchText}</u>{text}
                        </>)}
                </Text>
            }

            {onClick === undefined ? null : (
                <Button variant="ghost" onClick={onClick} style={{
                    position: "absolute",
                    bottom: "1em",
                    right: "1.5em",
                }}>
                    選択
                </Button>
            )}
        </Box>

        <hr style={{
            borderColor: "#3f3f3f",
            marginLeft: "var(--space-4)",
            marginRight: "var(--space-4)",
        }} />
    </>
}