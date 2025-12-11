import { Select, ThickCheckIcon } from "@radix-ui/themes"
import { Select as SelectPrimitive } from "radix-ui";
import React, { createContext, JSX, useContext } from "react";

const selection = createContext<readonly string[]>([]);
const setSelection = createContext<(val: readonly string[]) => void>(val => { });

type MultiSelectProps = {
    value: readonly string[]
    onValueChange: (val: readonly string[]) => void
    valueText: (x: readonly string[]) => string
    children: React.ReactNode
};

const MultiSelectRoot = (props: MultiSelectProps) => {
    const { value, onValueChange } = props;

    const toggle = (val: string) => {
        if (value.includes(val)) {
            // remove val
            onValueChange(value.filter(v => v !== val));
        }
        else {
            // add val
            onValueChange([...value, val]);
        }
    }

    return <selection.Provider value={value}>
        <setSelection.Provider value={onValueChange}>
            <Select.Root value="#dummy" onValueChange={toggle}>
                <Select.Trigger>{props.valueText(value)}</Select.Trigger>
                {props.children}
            </Select.Root>
        </setSelection.Provider>
    </selection.Provider>
}

type MultiSelectItemProps = {
    value: string
    children: React.ReactNode
}

const MultiSelectItem = (props: MultiSelectItemProps) => {
    const value = useContext(selection);
    const setValue = useContext(setSelection);

    return <SelectPrimitive.Item
        value={props.value}
        asChild={false}
        className='rt-SelectItem'
    >
        {value.includes(props.value) ? <div className="rt-SelectItemIndicator">
            <ThickCheckIcon className="rt-SelectItemIndicatorIcon" />
        </div> : null}
        <SelectPrimitive.ItemText>{props.children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
}

export {
    MultiSelectRoot,
    MultiSelectItem,
}

export type {
    MultiSelectProps,
    MultiSelectItemProps,
}