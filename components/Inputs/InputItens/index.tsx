'use client';

import { Cog, Settings, X } from 'lucide-react';
import InputPadrao, {
    IInputPadraoProps,
} from '@/components/Inputs/InputPadrao';
import CheckBoxPadrao from '@/components/Botoes/CheckBoxPadrao';
import React, { useState, useRef } from 'react';
import BotaoPadrao from '@/components/Botoes/BotaoPadrao';

interface IProps extends IInputPadraoProps {
    data: any | any[];
    onSelectAction: (e: any) => void;
    onDeselectAction: (e: any) => void;
    filtered: any[];
    campoExibir: string;
    optionAdd?: boolean;
    onClickOptionAdd?: (e: any) => void;
}

export default function ({
    data,
    onSelectAction,
    onDeselectAction,
    id,
    name,
    type,
    autoComplete,
    required,
    value,
    onChange,
    placeholder,
    filtered,
    campoExibir,
    optionAdd,
    onClickOptionAdd,
}: IProps) {
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isMouseOverOptions, setIsMouseOverOptions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isDataArray = Array.isArray(data);
    const dataArray = isDataArray ? data : data ? [data] : [];

    const handleSelect = (e: any) => {
        onSelectAction(e);
        setIsInputFocused(true);
        if (onChange) {
            onChange({
                target: { value: '' },
            } as React.ChangeEvent<HTMLInputElement>);
        }
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {dataArray.map((e: any) => (
                    <div
                        key={e.id}
                        className="flex flex-row items-center rounded-md p-2 space-x-2 transition-all duration-300 hover:-translate-z-1 hover:scale-110 z-10 cursor-pointer bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/50 mb-2"
                    >
                        <span className="text-base font-sm truncate max-w-[200px]">
                            {e[campoExibir]}
                        </span>
                        <BotaoPadrao
                            onClick={() => onDeselectAction(e)}
                            variant="destructive"
                            transparent
                            icon={<X size={14} />}
                        />
                    </div>
                ))}
                <div className="flex items-center w-full">
                    <InputPadrao
                        type={type}
                        id={id}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => {
                            setTimeout(() => {
                                if (!isMouseOverOptions) {
                                    setIsInputFocused(false);
                                }
                            }, 200);
                        }}
                        autoComplete={autoComplete}
                        required={required}
                        placeholder={placeholder}
                        ref={inputRef}
                    />
                    {optionAdd && (
                        <BotaoPadrao
                            onClick={onClickOptionAdd}
                            variant="ghost"
                            className="ml-2"
                            icon={<Settings className="w-5 h-5" />}
                        />
                    )}
                </div>
            </div>
            {filtered.length > 0 && (isInputFocused || isMouseOverOptions) && (
                <ul
                    className="absolute z-10 mt-1 w-auto bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                    onMouseEnter={() => setIsMouseOverOptions(true)}
                    onMouseLeave={() => setIsMouseOverOptions(false)}
                >
                    {filtered.map((e) => (
                        <li
                            key={e.id}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
                            onClick={() => handleSelect(e)}
                        >
                            <div className="flex items-center">
                                <CheckBoxPadrao
                                    checked={dataArray.some(
                                        (c: any) => c.id === e.id,
                                    )}
                                    onChange={() => handleSelect(e)}
                                />
                                <span className="ml-3 block truncate">
                                    {e[campoExibir]}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
