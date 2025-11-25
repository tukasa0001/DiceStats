import { Blockquote } from "@radix-ui/themes";
import { JSX } from "react";

export const ErrorBlock = (props: { children: JSX.Element | string }) => {
    return <Blockquote color="red">
        {props.children}
    </Blockquote>
}

export const InfoBlock = (props: { children: JSX.Element | string }) => {
    return <Blockquote>
        {props.children}
    </Blockquote>
}