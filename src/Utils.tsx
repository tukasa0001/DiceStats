import { Callout } from "@radix-ui/themes";
import { InfoIcon, TriangleAlert } from "lucide-react";
import { JSX } from "react";

export const ErrorBlock = (props: { children: JSX.Element | string }) => {
    return <Callout.Root color="red">
        <Callout.Icon>
            <TriangleAlert />
        </Callout.Icon>
        <Callout.Text>
            {props.children}
        </Callout.Text>
    </Callout.Root>
}

export const InfoBlock = (props: { children: JSX.Element | string }) => {
    return <Callout.Root>
        <Callout.Icon>
            <InfoIcon />
        </Callout.Icon>
        <Callout.Text>
            {props.children}
        </Callout.Text>
    </Callout.Root>

}