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
  availableOptions: string[];
  value?: string;
};

export const RobotSelect: React.FC<Props> = ({ onValueChange, availableOptions, value }) => {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a robot" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem key={"None"} value={"None"}>
          None
        </SelectItem>
        <SelectGroup>
          <SelectLabel>Robots</SelectLabel>
          {availableOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
