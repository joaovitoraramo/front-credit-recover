'use client';

import React, { useEffect, useState } from 'react';
import { Check, CircleCheck, Dot, Plus } from 'lucide-react';

interface IProps {
    label?: string;
    onChange: (checked: boolean) => void;
    checked?: boolean;
    className?: string;
    disabled?: boolean;
}

export default function ({
    label,
    onChange,
    checked,
    className,
    disabled,
}: IProps) {
    const [isChecked, setIsChecked] = useState(checked || false);

    useEffect(() => {
        setIsChecked(checked || false);
    }, [checked]);

    const handleChange = () => {
        setIsChecked(!isChecked);
        onChange(!isChecked);
    };

    return (
        <div
            className={`flex items-center`}
            onClick={(e) => disabled && e.preventDefault()}
        >
            <label
                className={`relative inline-flex items-center ${
                    disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                } transition-all duration-300 hover:-translate-z-1 hover:scale-110 z-10`}
            >
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={handleChange}
                />
                <span
                    className={`
                          w-6 h-6 bg-white border border-gray-300 rounded-full shadow-sm
                          transition-colors duration-200 ease-in-out
                          ${
                              isChecked
                                  ? `bg-primary-500 border-primary-500`
                                  : ''
                          }
                    `}
                >
                    {isChecked && (
                        <CircleCheck className="w-full h-full font-bold text-primary" />
                    )}
                </span>
                {label && <span className="ml-2 text-gray-700">{label}</span>}
            </label>
        </div>
    );
}
