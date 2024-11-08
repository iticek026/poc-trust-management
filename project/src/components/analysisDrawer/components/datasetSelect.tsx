import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  onValueChange: (value?: string) => void;
  availableOptions: { id: string; label: string; seed: string }[];
  value?: string;
};

export const DatasetSelect: React.FC<Props> = ({ onValueChange, availableOptions, value }) => {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a simulation" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Simulations</SelectLabel>
          {availableOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label} ({option.seed})
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
