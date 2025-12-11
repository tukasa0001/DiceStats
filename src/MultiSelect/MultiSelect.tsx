import { Select, ThickCheckIcon } from "@radix-ui/themes"
import { Select as SelectPrimitive } from "radix-ui";
import React, { createContext, JSX, useContext } from "react";

const selectAllKey = "@ALL";

const multiSelectContext = createContext<MultiSelectProps>(null!);

type MultiSelectProps = {
    value: readonly string[]
    onValueChange: (val: readonly string[]) => void
    allValues: readonly string[]
    valueText: (x: readonly string[]) => string
    children: React.ReactNode
};

const MultiSelectRoot = (props: MultiSelectProps) => {
    const { value, onValueChange, allValues } = props;

    const toggle = (val: string) => {
        if (val === selectAllKey) {
            if (value.length === allValues.length) {
                // unselect all
                onValueChange([]);
            }
            else {
                // select all
                onValueChange(allValues);
            }
        }
        else if (value.includes(val)) {
            // remove val
            onValueChange(value.filter(v => v !== val));
        }
        else {
            // add val
            onValueChange([...value, val]);
        }
    }

    return <multiSelectContext.Provider value={props}>
        <Select.Root value="#dummy" onValueChange={toggle}>
            <Select.Trigger>{props.valueText(value)}</Select.Trigger>
            {props.children}
        </Select.Root>
    </multiSelectContext.Provider>
}

type MultiSelectItemProps = {
    value: string
    children: React.ReactNode
}

const MultiSelectItem = (props: MultiSelectItemProps) => {
    const { value } = useContext(multiSelectContext);

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

const MultiSelectAllItem = (props: { children: React.ReactNode }) => {
    const { value, allValues } = useContext(multiSelectContext);

    return <SelectPrimitive.Item
        value={selectAllKey}
        asChild={false}
        className='rt-SelectItem'
    >
        {value.length === allValues.length ? <div className="rt-SelectItemIndicator">
            <ThickCheckIcon className="rt-SelectItemIndicatorIcon" />
        </div> : null}
        <SelectPrimitive.ItemText>{props.children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
}

export {
    MultiSelectRoot,
    MultiSelectItem,
    MultiSelectAllItem
}

export type {
    MultiSelectProps,
    MultiSelectItemProps,
}