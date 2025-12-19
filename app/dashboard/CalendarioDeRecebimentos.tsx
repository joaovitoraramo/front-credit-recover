import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { forwardRef, useState } from "react";
import { CalendarDay, Modifiers } from "react-day-picker";
import { Recebimento, Bandeira } from "@/app/dashboard/page";
import { useEffect } from "react";
import Image from "next/image";
import { stringSvgToDataUrl } from "@/components/Util/utils";

interface IProps {
    dataInicial: Date | null | undefined;
    recebimentos: Recebimento[] | null;
}

interface CustomDayProps {
    day: CalendarDay;
    selected?: Date;
    modifiers?: Modifiers;
    onSelect?: (date: Date | undefined) => void;
    className?: string;
    "aria-label"?: string;
    tabIndex?: number;
}

const CalendarioDeRecebimentos = ({ dataInicial, recebimentos }: IProps) => {
    if (!recebimentos) return null;
    const [date, setDate] = useState<Date>(() => {
        if (dataInicial instanceof Date && isValid(dataInicial)) {
            return dataInicial;
        }
        return new Date();
    });
    const [selectedDayRecebimentos, setSelectedDayRecebimentos] = useState<Recebimento[]>([]);
    const [open, setOpen] = useState(false);
    const [programmaticOpen, setProgrammaticOpen] = useState(false);

    useEffect(() => {
        if (date) {
            const formattedDay = format(date, "dd/MM/yyyy");
            const dayRecebimentos = recebimentos.filter(
                (recebimento) => recebimento.periodo === formattedDay
            );
            setSelectedDayRecebimentos(dayRecebimentos);
            if (dayRecebimentos.length > 0 && programmaticOpen) {
                setOpen(true);
            } else if (dayRecebimentos.length === 0) {
                setOpen(false);
            }
            setProgrammaticOpen(false);
        }
    }, [date, recebimentos, programmaticOpen]);

    const handleDayClick = (day: Date) => {
        setDate(day);
        setProgrammaticOpen(true);
    };

    const handlePopoverOpenChange = (newOpen: boolean) => {
        console.log(newOpen);
        setOpen(newOpen);
        if (!newOpen) {
            setProgrammaticOpen(false);
        }
    };

    const CustomDay = forwardRef<HTMLButtonElement, CustomDayProps>(
        ({ day, className, selected, modifiers, onSelect, ...props }, ref) => {
            const date = day?.date;
            const formattedDate = date ? format(date, "dd/MM/yyyy") : "";
            const hasRecebimento = recebimentos.some(
                (recebimento) => recebimento.periodo === formattedDate
            );
            const isHighlighted = Array.isArray(modifiers?.highlighted) && date
                ? modifiers.highlighted.some(highlightedDate =>
                    highlightedDate.getFullYear() === date?.getFullYear() &&
                    highlightedDate.getMonth() === date?.getMonth() &&
                    highlightedDate.getDate() === date?.getDate()
                )
                : false;
            const isSelected = date && selected ? format(date, "yyyy-MM-dd") === format(selected, "yyyy-MM-dd") : false;

            return (
                <button
                    ref={ref}
                    className={cn(
                        className,
                        "relative h-9 w-9 p-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        isSelected && "bg-accent text-accent-foreground rounded-md",
                        isHighlighted && !isSelected && "text-primary font-semibold",
                    )}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect?.(date);
                    }}
                    {...props}
                >
                    {format(date!, "d")}
                    {hasRecebimento && !isSelected && date && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                </button>
            );
        }
    );
    CustomDay.displayName = "CustomDay";

    return (
        <div className="w-full max-w-md md:max-w-lg mt-8 bg-white  rounded-lg shadow-md">
            <Popover open={open} onOpenChange={handlePopoverOpenChange}>
                <PopoverTrigger asChild>
                    <div className="rounded-md border shadow-sm bg-card text-card-foreground">
                        <Calendar
                            mode="single"
                            required
                            selected={date}
                            onSelect={handleDayClick}
                            locale={ptBR}
                            className="rounded-md border-none shadow-none p-4 w-full"
                            defaultMonth={date}
                            classNames={{
                                weekdays: "grid grid-cols-7 gap-1",
                                weekday: "text-center text-sm font-normal text-muted-foreground",
                                month: "space-y-4 mt-2",
                            }}
                            styles={{
                                weekday: {
                                    width: 'calc(100% / 7)',
                                },
                            }}
                            modifiers={{
                                highlighted: recebimentos.map((recebimento) => {
                                    const [day, month, year] = recebimento.periodo.split("/").map(Number);
                                    return new Date(year, month - 1, day);
                                }),
                            }}
                            components={{
                                Day: (props) => (
                                    <CustomDay
                                        day={props.day}
                                        modifiers={props.modifiers}
                                        className={props.className}
                                        selected={props.day.date === date ? props.day.date : undefined}
                                        onSelect={(newDate) => {
                                            if (newDate) {
                                                handleDayClick(newDate);
                                            }
                                        }}
                                    />
                                ),
                            }}
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 sm:w-96 p-4 space-y-2 border shadow-md bg-popover text-popover-foreground rounded-md">
                    {date && (
                        <h4 className="font-semibold text-lg">
                            Recebimentos em {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </h4>
                    )}
                    {selectedDayRecebimentos.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-2">
                            {selectedDayRecebimentos.map((recebimento, index) => (
                                <li key={index} className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">Valor Total:</span>
                                        {recebimento.valorTotal.toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </div>
                                    {recebimento.bandeiras.length > 0 && (
                                        <div className="pl-4">
                                            <h6 className="font-semibold text-sm text-muted-foreground">Por Bandeira:</h6>
                                            <ul className="mt-1 space-y-1">
                                                {recebimento.bandeiras.map((bandeira, idx) => (
                                                    <li key={idx} className="flex items-center space-x-2 text-sm">
                                                        <div className="w-8 h-8 relative flex-shrink-0">
                                                            <Image src={stringSvgToDataUrl(bandeira.logo)} alt={bandeira.nome} fill style={{ objectFit: 'contain' }} />
                                                        </div>
                                                        <span className="truncate">{bandeira.nome}</span>
                                                        <span className="ml-auto font-medium">
                                                            {bandeira.valor.toLocaleString("pt-BR", {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            })}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhum recebimento neste dia.</p>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default CalendarioDeRecebimentos;