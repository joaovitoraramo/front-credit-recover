'use client';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Dispatch, LegacyRef, SetStateAction, useState } from 'react';

interface IProps {
    titulo: string;
    placeholder?: string;
    ref?: LegacyRef<HTMLButtonElement> | undefined;
    data: any | any[];
    selectedItem: any;
    campoMostrar: any;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    setSelected: (value: SetStateAction<any | null>) => void;
    width: number | string;
    hideLabel?: boolean;
    disabled?: boolean;
}

export default function InputItensCombobox({
    titulo,
    ref,
    selectedItem,
    campoMostrar,
    data,
    search,
    setSearch,
    setSelected,
    width,
    hideLabel,
    placeholder,
    disabled,
}: IProps) {
    const [open, setOpen] = useState(false);
    const isDataArray = Array.isArray(data);
    const dataArray = isDataArray ? data : data ? [data] : [];

    return (
        <div className="flex flex-col gap-2 w-full">
            {!hideLabel && (
                <label className="text-sm font-medium">{titulo}</label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        disabled={disabled}
                        ref={ref}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between pt-2 w-full border rounded-md focus:outline-none focus:ring-2 transition-shadow duration-300 shadow-md hover:shadow-lg focus:ring-primary focus:z-10 sm:text-sm bg-gradient-to-r from-gray-50 to-white border-gray-300 focus:border-primary hover:border-primary placeholder:text-gray-400 text-gray-800 focus:ring-opacity-50 hover:ring-opacity-50 ring-opacity-0 focus:ring-offset-2 focus:ring-offset-white"
                    >
                        {placeholder
                            ? placeholder
                            : selectedItem
                            ? selectedItem[campoMostrar]
                            : `Selecione um(a) ${titulo.toLowerCase()}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full p-0"
                    align="start"
                    sideOffset={4}
                    style={{
                        width: width,
                    }}
                >
                    <Command>
                        <CommandInput
                            placeholder={`Buscar ${titulo.toLowerCase()}...`}
                            value={search}
                            onValueChange={setSearch}
                        />
                        <CommandList>
                            <CommandEmpty>
                                Nenhum(a) {titulo.toLowerCase()} encontrado(a).
                            </CommandEmpty>
                            <CommandGroup>
                                {dataArray.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item[campoMostrar]}
                                        onSelect={() => {
                                            setSelected(item);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                selectedItem?.id === item.id
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                        {item[campoMostrar]}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
