'use client';

import {BandeiraDTO} from '@/types/bandeira';
import {Banco} from '@/types/banco';
import {Usuario} from '@/types/usuario';
import {Encargo} from '@/types/encargo';
import {Adquirente} from "@/types/adquirente";

export interface Lote {
    id: number;
}

export interface LoteReadDTO {
    id: number;
    clienteId: number;
    clienteNomeFantasia: string;
    bandeira: BandeiraDTO;
    dataPagamento: string;
    valorLiquido: number;
    valorTransacao: number;
    banco: Banco;
    valorTaxa: number;
    valorEncargos: number;
    taxa: number;
    dataBaixa: string | null;
    horaBaixa: string | null;
    usuarioBaixa: Usuario | null;
    encargos: Encargo[];
    adquirente: Adquirente
}
