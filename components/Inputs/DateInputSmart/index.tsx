import {Calendar} from "lucide-react";
import {forwardRef} from "react";

interface DateInputSmartProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onComplete?: () => void;
}

export const DateInputSmart = forwardRef<HTMLInputElement, DateInputSmartProps>(
    ({ label, value, onChange, onComplete }, ref) => {

        function normalizeDate(input: string) {
            const cleaned = input.replace(/\/$/, "");
            const parts = cleaned.split("/");

            // DD/MM → completa ano
            if (parts.length === 2 && parts[0].length === 2 && parts[1].length === 2) {
                const year = new Date().getFullYear();
                return `${parts[0]}/${parts[1]}/${year}`;
            }

            return input;
        }

        function handleBlur() {
            if (!value) return;

            const normalized = normalizeDate(value);

            if (normalized !== value) {
                onChange(normalized);
            }

            if (normalized.length === 10) {
                onComplete?.();
            }
        }

        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            let v = e.target.value.replace(/[^\d]/g, "");

            if (v.length > 8) v = v.slice(0, 8);

            if (v.length >= 5) {
                v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
            } else if (v.length >= 3) {
                v = `${v.slice(0, 2)}/${v.slice(2)}`;
            }

            onChange(v);

            if (v.length === 10) {
                onComplete?.();
            }
        }

        return (
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                    {label}
                </label>

                <div className="relative">
                    <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        ref={ref}
                        type="text"
                        inputMode="numeric"
                        placeholder="DD/MM/AAAA"
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="
                            w-full pl-10 pr-3 py-2
                            rounded-lg border border-gray-300
                            text-sm
                            focus:outline-none
                            focus:ring-2 focus:ring-primary/50
                        "
                    />
                </div>
            </div>
        );
    }
);

DateInputSmart.displayName = "DateInputSmart";
