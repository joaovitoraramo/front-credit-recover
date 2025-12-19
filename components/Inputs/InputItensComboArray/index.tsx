'use client';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    tituloInput?: string;
    ref?: LegacyRef<HTMLButtonElement> | undefined;
    data: any | any[];
    selectedItems: any[];
    campoMostrar: any;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    setSelected: (items: any[]) => void;
    width: number | string;
    hideLabel?: boolean;
    placeholder?: string;
}

export default function InputItensComboboxArray({
    titulo,
    ref,
    selectedItems,
    campoMostrar,
    data,
    search,
    setSearch,
    setSelected,
    width,
    hideLabel,
    tituloInput,
    placeholder,
}: IProps) {
    const [open, setOpen] = useState(false);
    const isDataArray = Array.isArray(data);
    const dataArray = isDataArray ? data : data ? [data] : [];

    const handleItemSelection = (item: any) => {
        const isSelected = selectedItems.some(
            (selectedItem) => selectedItem.id === item.id,
        );
        let newSelectedItems;

        if (isSelected) {
            newSelectedItems = selectedItems.filter(
                (selectedItem) => selectedItem.id !== item.id,
            );
        } else {
            newSelectedItems = [...selectedItems, item];
        }

        setSelected(newSelectedItems);
    };

    const removeItem = (itemId: number) => {
        setSelected(selectedItems.filter((b) => b.id !== itemId));
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {!hideLabel && (
                <label className="text-sm font-medium">{titulo}</label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between pt-2 w-full border rounded-md focus:outline-none focus:ring-2 transition-shadow duration-300 shadow-md hover:shadow-lg focus:ring-primary focus:z-10 sm:text-sm bg-gradient-to-r from-gray-50 to-white border-gray-300 focus:border-primary hover:border-primary placeholder:text-gray-400 text-gray-800 focus:ring-opacity-50 hover:ring-opacity-50 ring-opacity-0 focus:ring-offset-2 focus:ring-offset-white"
                    >
                        {placeholder
                            ? placeholder
                            : selectedItems.length > 1
                            ? `${selectedItems.length} itens selecionados`
                            : selectedItems.length === 1
                            ? selectedItems[0][campoMostrar]
                            : tituloInput
                            ? `Selecionar ${tituloInput.toLowerCase()}`
                            : `Selecionar ${titulo.toLowerCase()}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full p-0"
                    align="start"
                    sideOffset={4}
                    style={{ width: width }}
                >
                    <Command>
                        <CommandInput
                            placeholder={
                                tituloInput
                                    ? `Buscar ${tituloInput.toLowerCase()}...`
                                    : `Buscar ${titulo.toLowerCase()}...`
                            }
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
                                        onSelect={() =>
                                            handleItemSelection(item)
                                        }
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                selectedItems.some(
                                                    (selectedItem) =>
                                                        selectedItem.id ===
                                                        item.id,
                                                )
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
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedItems.map((item) => {
                        return (
                            <Badge
                                key={item.id}
                                onClick={() => removeItem(item.id)}
                                className="flex items-center gap-1 bg-primary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:-translate-z-1 hover:scale-110 z-10"
                            >
                                {item[campoMostrar]}
                                <X className="h-3 w-3 cursor-pointer" />
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
