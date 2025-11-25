import { Blockquote } from "@radix-ui/themes";
import { JSX } from "react";

export const ErrorQuote = (props: { children: JSX.Element | string }) => {
    return <Blockquote color="red">
        {props.children}
    </Blockquote>
}

export const InfoQuote = (props: { children: JSX.Element | string }) => {
    return <Blockquote>
        {props.children}
    </Blockquote>
}