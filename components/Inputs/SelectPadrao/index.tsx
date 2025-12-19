"use client";

import React, {useEffect, useState} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import CheckBoxPadrao from "@/components/Botoes/CheckBoxPadrao";

export interface ISelectOption {
    value: string;
    label: string;
}

interface ISelectPadraoProps {
    id: string;
    name?: string;
    options: ISelectOption[];
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    placeholder?: string;
    label?: string;
    canMultiSelect?: boolean;
    closeOnSelect?: boolean;
}

export default function ({
                             id,
                             name,
                             options,
                             value,
                             onChange,
                             placeholder,
                             label,
                             canMultiSelect = false,
                             closeOnSelect = false,
                         }: ISelectPadraoProps) {
    const [selectedValue, setSelectedValue] = useState<string | string[]>(value || (canMultiSelect ? [] : ""));
    const [isFocused, setIsFocused] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<string | undefined>(options.find((e) => e.value === value)?.label);
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    useEffect(() => {
        if (value) {
            setSelectedLabel(options.find((e) => e.value === value)?.label);
            setSelectedValue(value);
        }
    }, [value]);

    const handleChange = (newValue: string | string[]) => {
        setSelectedValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleSingleSelectChange = (newValue: string) => {
        handleChange(newValue);
        if (closeOnSelect) {
            setIsSelectOpen(false);
        }
    };

    const handleMultiSelectChange = (newValue: string) => {
        if (canMultiSelect) {
            const currentValues = Array.isArray(selectedValue) ? [...selectedValue] : [];
            if (currentValues.includes(newValue)) {
                const updatedValues = currentValues.filter((val) => val !== newValue);
                handleChange(updatedValues);
            } else {
                handleChange([...currentValues, newValue]);
            }
        } else {
            handleChange(newValue);
        }
        if (closeOnSelect) {
            setIsSelectOpen(false);
        }
    };

    const getSelectedLabel = () => {
        if (canMultiSelect && Array.isArray(selectedValue) && selectedValue.length > 0) {
            return selectedValue
                .map((val) => options.find((opt) => opt.value === val)?.label || val)
                .join(", ");
        } else if (typeof selectedValue === "string" && selectedValue) {
            return options.find((opt) => opt.value === selectedValue)?.label || selectedValue;
        }
        return placeholder || "Selecione uma opção...";
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const labelClasses = `
        absolute left-4 top-2
        pointer-events-none
        transition-all duration-300
        ${(!isFocused && (selectedValue === "" || (canMultiSelect && (!Array.isArray(selectedValue) || selectedValue.length === 0)))) && "text-gray-400 text-sm"} 
        ${(isFocused || (selectedValue !== "" && (!canMultiSelect || (Array.isArray(selectedValue) && selectedValue.length > 0)))) && "top-[-10px] left-2 bg-white px-1 text-xs text-primary"}
    `;

    return (
        <div className="relative w-full">
            <Select
                open={isSelectOpen}
                onOpenChange={(isOpen) => {
                    setIsSelectOpen(isOpen)
                    if (isOpen) {
                        handleFocus();
                    } else {
                        handleBlur();
                    }
                }}
            >
                <SelectTrigger
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
                >
                    <SelectValue placeholder={getSelectedLabel()}/>
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (canMultiSelect) {
                                    handleMultiSelectChange(option.value);
                                } else {
                                    handleSingleSelectChange(option.value);
                                }
                            }}
                        >
                            <CheckBoxPadrao
                                checked={
                                    canMultiSelect
                                        ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
                                        : selectedValue === option.value
                                }
                                onChange={(checked) => {
                                    if (canMultiSelect) {
                                        handleMultiSelectChange(option.value);
                                    } else {
                                        handleSingleSelectChange(option.value);
                                    }
                                }}
                            />
                            <span className="ml-2">{option.label}</span>
                        </div>
                    ))}
                </SelectContent>
            </Select>
            {label && (
                <label htmlFor={id} className={labelClasses}>
                    {label}
                </label>
            )}
        </div>
    );
}