"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SchemaFormBuilderProps {
    schema: any
    onSubmit: (data: any) => Promise<void>
    isExecuting?: boolean
}

export function SchemaFormBuilder({ schema, onSubmit, isExecuting = false }: SchemaFormBuilderProps) {
    // For simplicity without strict Zod mapping yet, we'll use local state map or uncontrolled inputs
    // But controlled with comprehensive state is better for complex forms. 
    // Let's use a simple state object for now as strict react-hook-form + dynamic schema is complex to setup quickly without libs like @hookform/resolvers

    const [formData, setFormData] = useState<Record<string, any>>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    if (!schema || !schema.properties) {
        return <div className="text-muted-foreground p-4">No input parameters defined for this tool.</div>
    }

    const fields = Object.entries(schema.properties).map(([key, field]: [string, any]) => {
        const isRequired = schema.required?.includes(key)
        return { key, ...field, required: isRequired }
    })

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
                {fields.map((field) => (
                    <div key={field.key} className="grid gap-2">
                        <Label htmlFor={field.key}>
                            {field.title || field.key}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>

                        {/* Text / String */}
                        {(!field.enum && (field.type === 'string' || field.type === undefined)) && (
                            <Input
                                id={field.key}
                                required={field.required}
                                placeholder={field.placeholder || `Enter ${field.title}`}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                disabled={isExecuting}
                            />
                        )}

                        {/* Long Text */}
                        {/* We need a hint in schema for textarea, usually 'format': 'textarea' or strictly defined in our builder */}
                        {/* reusing type string for now, could add detection logic if needed */}

                        {/* Number */}
                        {field.type === 'number' && (
                            <Input
                                id={field.key}
                                type="number"
                                required={field.required}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(field.key, Number(e.target.value))}
                                disabled={isExecuting}
                            />
                        )}

                        {/* Boolean */}
                        {field.type === 'boolean' && (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={field.key}
                                    checked={formData[field.key] || false}
                                    onCheckedChange={(c) => handleChange(field.key, c)}
                                    disabled={isExecuting}
                                />
                                <Label htmlFor={field.key} className="font-normal text-muted-foreground">
                                    {field.description || "Enable this option"}
                                </Label>
                            </div>
                        )}

                        {/* Select / Enum */}
                        {/* Note: JSON Schema uses 'enum' array */}
                        {/* Our builder simplified it to 'type': 'select' but standard schema is 'enum' */}
                        {/* We'll check if 'enum' exists or type is select */}
                        {(field.enum || field.type === 'select') && (
                            <Select
                                value={formData[field.key]}
                                onValueChange={(val) => handleChange(field.key, val)}
                                disabled={isExecuting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(field.enum || []).map((opt: string) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {field.description && <p className="text-[0.8rem] text-muted-foreground">{field.description}</p>}
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={isExecuting} className="w-full">
                {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isExecuting ? 'Running Tool...' : 'Execute Tool'}
            </Button>
        </form>
    )
}
