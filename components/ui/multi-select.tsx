"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface MultiSelectProps<T = string> {
  options: Option<T>[];
  value?: T[];
  onChange?: (value: T[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  className?: string;
  "aria-label"?: string;
}

export function MultiSelect<T = string>({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  disabled = false,
  id,
  label,
  className,
  "aria-label": ariaLabel,
}: MultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<T[]>(value);

  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (option: Option<T>) => {
    const newSelected = selected.includes(option.value)
      ? selected.filter((item) => item !== option.value)
      : [...selected, option.value];
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleRemove = (optionValue: T) => {
    const newSelected = selected.filter((item) => item !== optionValue);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <Command className={cn("relative", className)}>
      <div
        className="flex flex-wrap gap-1 border rounded-md p-2 min-h-[2.5rem]"
        onClick={() => !disabled && setOpen(true)}
      >
        {selected.length > 0 ? (
          selected.map((item) => {
            const option = options.find((opt) => opt.value === item);
            return option ? (
              <Badge
                key={String(option.value)}
                variant="secondary"
                className="max-w-[200px]"
              >
                <span className="truncate">{option.label}</span>
                {!disabled && (
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(option.value);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleRemove(option.value)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </Badge>
            ) : null;
          })
        ) : (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}
      </div>
      <div className="relative mt-2">
        {open && !disabled && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto max-h-[200px]">
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={String(option.value)}
                    onSelect={() => handleSelect(option)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground",
                      isSelected && "bg-accent text-accent-foreground",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex-1 truncate">{option.label}</div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
}