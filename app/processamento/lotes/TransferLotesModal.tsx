"use client"

import React, {useState} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {format, parse, isValid} from "date-fns"
import {applyDateMask} from "@/lib/utils"
import {LoteReadDTO} from "@/types/lote"
import BotaoPadrao from "@/components/Botoes/BotaoPadrao"
import {CheckCircle, AlertTriangle, X} from "lucide-react"
import {Separator} from "@/components/ui/separator";

interface TransferLotesModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lotes: LoteReadDTO[]
    onTransfer: (date: string) => void
}

export default function TransferLotesModal({
                                               open,
                                               onOpenChange,
                                               lotes,
                                               onTransfer,
                                           }: TransferLotesModalProps) {
    const [transferDateInput, setTransferDateInput] = useState("")
    const [transferDate, setTransferDate] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleDateInput = (value: string) => {
        const cleanedValue = value.replace(/\D/g, "")
        if (cleanedValue.length <= 8) {
            const maskedValue = applyDateMask(cleanedValue)
            setTransferDateInput(maskedValue)

            if (cleanedValue.length === 8) {
                const date = parse(cleanedValue, "ddMMyyyy", new Date())
                if (isValid(date)) {
                    const formattedDate = format(date, "yyyy-MM-dd")
                    setTransferDate(formattedDate)
                    setErrorMessage(null)
                } else {
                    setTransferDate(null)
                    setErrorMessage("Data inválida.")
                }
            } else {
                setTransferDate(null)
            }
        }
    }

    const handleTransfer = () => {
        if (!transferDate) {
            setErrorMessage("Por favor, insira uma data válida.")
            return
        }
        onTransfer(transferDate)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transferir Lotes</DialogTitle>
                    <DialogDescription>
                        Insira a data para transferir os lotes selecionados.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Data de Transferência</label>
                            <Input
                                value={transferDateInput}
                                onChange={(e) => handleDateInput(e.target.value)}
                                placeholder="DD/MM/AAAA"
                            />
                            {errorMessage && (
                                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                            )}
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto border-b border-gray-300 pb-2">
                        <p className="text-sm font-semibold mb-2">Lotes Selecionados:</p>
                        <div className="space-y-2">
                            {lotes.map((lote) => (
                                <div key={lote.id} className="border rounded-md p-3 bg-gray-50">
                                    <p className="text-sm">
                                        <span className="font-semibold">ID:</span> {lote.id}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Bandeira:</span> {lote.bandeira.nome}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Cliente:</span> {lote.clienteNomeFantasia}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-yellow-100 border border-yellow-400 rounded-md p-4 flex items-center">
                        <AlertTriangle className="w-16 h-16 text-yellow-600 mr-2"/>
                        <p className="text-sm">
                            Caso exista um lote com a mesma bandeira na data informada, as transações serão enviadas
                            para esse lote ou um novo lote será criado.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <BotaoPadrao
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        name="Cancelar"
                        icon={<X className="w-5 h-5"/>}
                    />
                    <BotaoPadrao
                        variant="outline"
                        onClick={handleTransfer}
                        name="Transferir"
                        icon={<CheckCircle className="w-4 h-4 font-bold"/>}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}