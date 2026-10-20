import { Input } from '@/components/ui/input';
import { formatFixedDecimalBrInput } from '@/utils/dimensional-input';

type FormattedDimensionalInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  fractionDigits: 2 | 3;
  disabled?: boolean;
  placeholder?: string;
};

export function FormattedDimensionalInput({
  id,
  value,
  onChange,
  fractionDigits,
  disabled,
  placeholder,
}: FormattedDimensionalInputProps) {
  return (
    <Input
      id={id}
      inputMode="numeric"
      autoComplete="off"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) =>
        onChange(formatFixedDecimalBrInput(event.target.value, fractionDigits))
      }
    />
  );
}
