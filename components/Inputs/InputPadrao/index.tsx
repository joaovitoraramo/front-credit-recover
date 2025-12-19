"use client";

import React, {useState} from "react";
import {
    ChangeEventHandler,
    FocusEventHandler,
    HTMLInputAutoCompleteAttribute,
    HTMLInputTypeAttribute,
} from "react";
import {Input} from "@/components/ui/input";

export interface IInputPadraoProps {
    id: string;
    name?: string | undefined;
    type?: HTMLInputTypeAttribute | undefined;
    autoComplete?: HTMLInputAutoCompleteAttribute | undefined;
    required?: boolean | undefined;
    value?: string | number | readonly string[] | undefined;
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
    onFocus?: FocusEventHandler<HTMLInputElement> | undefined;
    onBlur?: FocusEventHandler<HTMLInputElement> | undefined;
    placeholder?: string | undefined;
    label?: string | undefined;
    ref?: React.LegacyRef<HTMLInputElement> | undefined;
    step?: string | number | undefined
    disabled?: boolean | undefined
}

export default function ({
                             id,
                             name,
                             type,
                             autoComplete,
                             required,
                             value,
                             onChange,
                             onFocus,
                             onBlur,
                             placeholder,
                             label,
                             ref,
                             step,
                             disabled
                         }: IInputPadraoProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (onFocus) {
            onFocus(e);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (onBlur) {
            onBlur(e);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e);
        }
    };

    const labelClasses = `
        absolute left-4 top-2
        pointer-events-none
        transition-all duration-300
        ${(!isFocused || value) && "text-gray-400 text-sm"} 
        ${(isFocused || value || type === 'date' || type === 'file' || type === 'number') && "top-[-10px] left-2 bg-white px-1 text-xs text-primary"}
    `;

    return (
        <div className="relative w-full">
            <Input
                disabled={disabled}
                step={step}
                ref={ref}
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`
                    pt-2
                    w-full
                    border rounded-md
                    focus:outline-none
                    focus:ring-2
                    transition-shadow duration-300
                    shadow-md hover:shadow-lg
                    focus:ring-primary
                    focus:z-10
                    sm:text-sm
                    bg-gradient-to-r from-gray-50 to-white
                    border-gray-300 focus:border-primary
                    hover:border-primary
                    placeholder:text-gray-400
                    text-gray-800
                    focus:ring-opacity-50
                    hover:ring-opacity-50
                    ring-opacity-0
                    focus:ring-offset-2
                    focus:ring-offset-white
                `}
            />
            <label htmlFor={id} className={labelClasses}>
                {label ? label : name}
            </label>
        </div>
    );
}