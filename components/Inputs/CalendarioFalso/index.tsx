// src/components/Inputs/CalendarioFalso.tsx
'use client';

import React from 'react';

// Definimos as propriedades que o componente irá receber
interface CalendarioFalsoProps {
    selectedValues: string; // Dias atualmente selecionados, como string "1;15;30"
    onSelect: (updatedValues: string) => void; // Função para ser chamada quando um dia é selecionado/desselecionado
}

export default function CalendarioFalso({ selectedValues, onSelect }: CalendarioFalsoProps) {
    // Geramos um array com os números de 1 a 31 para os dias
    const dias = Array.from({ length: 31 }, (_, i) => i + 1);

    // Converte a string de valores selecionados para um Set para verificações rápidas
    // Filtra para garantir que apenas números válidos (1-31) e positivos sejam considerados
    const selectedSet = new Set(
        selectedValues.split(';')
            .map(Number)
            .filter(n => n > 0 && n <= 31)
    );

    // Array de cores para alternar entre os dias selecionados
    // Você pode adicionar mais cores a esta lista, se desejar
    const highlightColors = [
        'bg-blue-600',    // Azul
        'bg-green-600',   // Verde
        'bg-purple-600',  // Roxo
        'bg-orange-600',  // Laranja
        'bg-red-600',     // Vermelho
        'bg-teal-600',    // Verde-azulado
        'bg-indigo-600'   // Índigo
    ];

    const handleDayClick = (day: number) => {
        let updatedSet = new Set(selectedSet);

        if (day === 0) { // Clicou em "Não se aplica" / "Limpar Seleção"
            onSelect(''); // Limpa todas as seleções
            return;
        }

        if (updatedSet.has(day)) {
            updatedSet.delete(day); // Desseleciona o dia
        } else {
            updatedSet.add(day); // Seleciona o dia
        }

        // Converte o Set de volta para uma string ordenada por ponto e vírgula
        const newSelectedValues = Array.from(updatedSet)
            .sort((a, b) => a - b)
            .join(';');
        onSelect(newSelectedValues);
    };

    return (
        <div>
            {/* Botão para a opção "Não se aplica", que corresponde a limpar a seleção */}
            <button
                type="button"
                onClick={() => handleDayClick(0)}
                className={`w-full text-sm py-2 px-4 rounded-md mb-2 transition-colors duration-150 ${
                    selectedSet.size === 0
                        ? 'bg-red-500 text-white font-bold'
                        : 'bg-gray-200 hover:bg-red-400 hover:text-white'
                }`}
            >
                Não se aplica (Limpar Seleção)
            </button>

            {/* Container do nosso calendário em formato de grid */}
            <div className="grid grid-cols-7 gap-1">
                {dias.map((dia) => {
                    const isSelected = selectedSet.has(dia);

                    // Se o dia estiver selecionado, determinamos sua cor
                    let selectedColorClass = '';
                    if (isSelected) {
                        // Para cada dia selecionado, encontra seu índice na lista de dias selecionados
                        // e usa isso para ciclar pelas cores disponíveis
                        const selectedDaysArray = Array.from(selectedSet).sort((a,b) => a-b);
                        const indexInSelected = selectedDaysArray.indexOf(dia);
                        selectedColorClass = highlightColors[indexInSelected % highlightColors.length];
                    }

                    return (
                        <button
                            key={dia}
                            type="button"
                            onClick={() => handleDayClick(dia)}
                            // Lógica de classes para estilização dinâmica
                            className={`
                                h-10 w-10 flex items-center justify-center
                                rounded-full text-sm font-semibold transition-all duration-150
                                ${
                                isSelected
                                    ? `${selectedColorClass} text-white scale-110 shadow-lg` // Estilo para o dia selecionado com cor específica
                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-200' // Estilo para os outros dias
                            }
                            `}
                        >
                            {dia}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}