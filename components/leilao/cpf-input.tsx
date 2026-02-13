'use client';

import { Input } from '@/components/ui/input';
import { formatarCPF } from '@/lib/utils-extra';

interface CpfInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CpfInput({ value, onChange, error }: CpfInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCPF(e.target.value);
    onChange(formatted);
  };

  return (
    <div>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="000.000.000-00"
        maxLength={14}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
