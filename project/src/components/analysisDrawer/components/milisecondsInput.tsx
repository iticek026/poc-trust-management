import { Input } from "@/components/ui/input";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export const MilisecondsInput: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Input
      type="number"
      placeholder="Miliseconds graph scale"
      value={value}
      onChange={(e) => onChange(parseInt(e.currentTarget.value))}
      min={0}
    />
  );
};
