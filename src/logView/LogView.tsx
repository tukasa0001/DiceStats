import { Badge, Box, Button, Card, Code, Flex, IconButton, ScrollArea } from "@radix-ui/themes";
import { CcfoliaMessage } from "../ccfoliaLog/message/CcfoliaMessage";
import { Heading, Text } from "@radix-ui/themes";
import { CoCSkillRollMessage } from "../ccfoliaLog/message/CoCSkillRollMessage";
import { SanityCheckMessage } from "../ccfoliaLog/message/SanityCheckMessage";
import { ParamChangeMessage } from "../ccfoliaLog/message/ParamChangeMessage";
import { CSSProperties, Ref, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { Check, Copy } from "lucide-react";

export type LogViewScroller = {
    getCurrentIndex(): number,
    scrollToIndex(idx: number): void
}

const createScroller = (virtualizer: Virtualizer<HTMLDivElement, Element>, log: CcfoliaMessage[]): LogViewScroller => {
    return ({
        getCurrentIndex() {
            const virtualItems = virtualizer.getVirtualItems();
            const scrollOffset = virtualizer.scrollOffset;
            if (!scrollOffset) return 0;

            const topVisibleItem = virtualItems.find(item => item.end > scrollOffset);
            if (!topVisibleItem) return 0;
            return log[topVisibleItem.index]?.index ?? 0;
        },
        scrollToIndex(idx) {
            let rawIdx = 0;
            for (const msg of log) {
                if (idx <= msg.index) {
                    break;
                }
                rawIdx++;
            }
            virtualizer.scrollToIndex(rawIdx, { align: "start", behavior: "smooth" });
        },
    });
}

type LogViewProps = {
    log: CcfoliaMessage[]
    onClick?: (msg: CcfoliaMessage, i: number) => void,
    scrollerRef?: Ref<LogViewScroller>,
    onScrolled?: (scroller: LogViewScroller) => void,
    highlight?: string,
    showTab?: boolean
};

export const LogView = (props: LogViewProps) => {
    const { log, onClick, scrollerRef, onScrolled, highlight } = props;
    const showTab = props.showTab ?? false;
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: log.length,
        getScrollElement: () => scrollAreaRef.current,
        estimateSize: () => 81.6,
        overscan: 20,
        onChange(instance, sync) {
            if (!onScrolled) return;
            if (sync) {
                onScrolled(scroller);
            }
        },
    });
    const scroller = useMemo(() => createScroller(virtualizer, log), [virtualizer, log]);
    useImperativeHandle(scrollerRef, () => scroller, [scroller]);


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
                            msg={log[vItem.index]} highlight={highlight}
                            onClick={onClick ? () => onClick(log[vItem.index], vItem.index) : undefined}
                            miniText={showTab ? `No.${log[vItem.index].index} - ${log[vItem.index].channel}` : `No.${log[vItem.index].index}`}
                        />
                    </Box>
                ))}
            </Box>
        </ScrollArea>
    )
};

const MessageEntry = (props: {
    msg: CcfoliaMessage, highlight?: string,
    onClick?: () => void,
    miniText?: string
}) => {
    const { msg, highlight, onClick, miniText: debugText } = props;
    const displayText = msg.toDisplayText();

    const [showCopyButton, setShowCopyButton] = useState(false);
    const [isCopied, setCopied] = useState(false);

    const blockStyle: CSSProperties = {
        display: "block"
    }

    return <>
        <Box px="4" py="2" position="relative"
            onMouseEnter={onClick ? undefined : () => setShowCopyButton(true)}
            onMouseLeave={onClick ? undefined : () => {
                setShowCopyButton(false);
                setCopied(false);
            }}>
            <Flex gap="2" direction="row" position="relative">
                <Heading size="4">{msg.sender}</Heading>
                {msg instanceof CoCSkillRollMessage ? <Badge color="lime">技能判定</Badge> : null}
                {msg instanceof SanityCheckMessage ? <Badge color="ruby">SANチェック</Badge> : null}
                {msg instanceof ParamChangeMessage ? <Badge color="blue">{msg.paramName}変動</Badge> : null}
                {debugText ? <Text size="1" color="gray">{debugText}</Text> : null}
                {showCopyButton ? (
                    <IconButton variant="ghost" size="2" color="gray"
                        style={{
                            position: "absolute",
                            top: 0,
                            right: "4px"
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(displayText);
                            setCopied(true);
                        }}>
                        {isCopied ? <Check size="1.25em" /> : <Copy size="1.25em" />}
                    </IconButton>
                ) : null}
            </Flex>
            {highlight === undefined || highlight === "" ? <Text style={blockStyle}>{displayText}</Text> :
                <Text style={blockStyle}>
                    {displayText.split(highlight)
                        .map((text, i) => i === 0 ? text : <>
                            <u style={{ textDecorationColor: "lime" }}>{highlight}</u>{text}
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