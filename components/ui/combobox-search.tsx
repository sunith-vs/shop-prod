"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxSearchProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  name?: string
  placeholder?: string
  searchPlaceholder?: string
  className?: string
}

export function ComboboxSearch({
  options,
  value,
  onValueChange,
  name,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  className,
}: ComboboxSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredItems = React.useMemo(() => {
    if (!search) return options

    const searchLower = search.toLowerCase()
    return options.filter((item) => {
      const titleMatch = item.label.toLowerCase().includes(searchLower)
      const idMatch = item.value.toLowerCase().includes(searchLower)
      return titleMatch || idMatch
    })
  }, [options, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            onValueChange={setSearch}
            value={search}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredItems.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onValueChange(option.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>{option.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  (ID: {option.value})
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
      {name && <input type="hidden" name={name} value={value || ""} />}
    </Popover>
  )
}
