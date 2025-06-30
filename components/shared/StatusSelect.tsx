"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusSelectProps {
  id?: string;
  value?: string[];
  onChange: (value: string[]) => void;
  className?: string;
  "aria-label"?: string;
}

const statusOptions = [
  { label: "Drafted", value: "DRAFTED" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function StatusSelect({
  id,
  value = [],
  onChange,
  className,
  "aria-label": ariaLabel,
}: StatusSelectProps) {
  const handleValueChange = (newValue: string) => {
    const newValues = value.includes(newValue)
      ? value.filter((v) => v !== newValue)
      : [...value, newValue];
    onChange(newValues);
  };

  return (
    <Select
      value={value[0] || ""}
      onValueChange={handleValueChange}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Select status" aria-label={ariaLabel} />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}