'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface ComboboxProps {
    options: { label: string; value: string }[]
    value: string
    onChange: (value: string) => void
    onFocus?: () => void // Add onFocus prop
    placeholder?: string,
    disabled?:boolean
}

export function Combobox({
    options,
    value,
    onChange,
    onFocus, // Accept onFocus as a prop
    placeholder,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')
    const selectedRef = React.useRef<HTMLDivElement | null>(null)

    const filteredOptions = React.useMemo(() => {
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                option.value.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [searchTerm, options])

    React.useEffect(() => {
        if (open) {
            queueMicrotask(() => {
                if (selectedRef.current) {
                    selectedRef.current.scrollIntoView({
                        behavior: 'instant',
                        block: 'center',
                    })
                }
            })
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    onClick={() => onFocus && onFocus()} 
                    disabled={disabled}
                >
                    {value
                        ? options.find((option) => option.value === value)
                              ?.label
                        : placeholder || 'Select an option'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            {!disabled && (
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput
                        placeholder="Search..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {filteredOptions.length === 0 ? (
                            <CommandEmpty>No options found.</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(option.value)
                                            setOpen(false)
                                            setSearchTerm('')
                                        }}
                                        ref={
                                            option.value === value
                                                ? selectedRef
                                                : null
                                        }
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${
                                                value === option.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            }`}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>)
}
        </Popover>
    )
}
