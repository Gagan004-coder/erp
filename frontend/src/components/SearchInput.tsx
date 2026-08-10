import { ChangeEvent } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search...', id }: Props) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
      <input
        id={id}
        type="text"
        className="input pl-9 w-full sm:w-72"
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  );
}
