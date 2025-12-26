"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface Field {
    id: string
    key: string
    label: string
    type: 'text' | 'number' | 'textarea' | 'select' | 'file' | 'boolean'
    required: boolean
}

function ToolBuilderContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const toolId = searchParams.get('id')
    const [isLoading, setIsLoading] = useState(false)

    // Basic Info
    const [basicInfo, setBasicInfo] = useState({
        name: "",
        slug: "",
        category: "general",
        description: "",
        webhookUrl: ""
    })

    // Schema Builder State
    const [fields, setFields] = useState<Field[]>([])

    // Load existing if editing
    useEffect(() => {
        if (toolId) {
            // Fetch tool details logic here
        }
    }, [toolId])

    const addField = () => {
        setFields([...fields, {
            id: crypto.randomUUID(),
            key: "",
            label: "New Field",
            type: "text",
            required: true
        }])
    }

    const updateField = (id: string, updates: Partial<Field>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id))
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            // Construct JSON Schema from fields
            const inputSchema = {
                type: "object",
                properties: fields.reduce((acc: any, field) => {
                    acc[field.key || field.label] = {
                        type: field.type === 'number' ? 'number' : 'string', // Simplification
                        title: field.label,
                        // Add more schema props
                    }
                    return acc
                }, {}),
                required: fields.filter(f => f.required).map(f => f.key || f.label)
            }

            const payload = {
                ...basicInfo,
                inputSchema,
                outputSchema: {}, // TODO: Output mapping builder
                toolId: toolId // If updating
            }

            if (toolId) {
                await api.put(`/admin/tools/${toolId}`, payload)
                toast.success("Tool updated successfully")
            } else {
                await api.post('/admin/tools', payload)
                toast.success("Tool created successfully")
                router.push('/admin/tools')
            }
        } catch (error) {
            toast.error("Failed to save tool")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {toolId ? 'Edit Tool' : 'New Tool Builder'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Define schema, connection, and settings.
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Tool'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Settings */}
                <div className="space-y-6 lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tool Name</Label>
                                <Input
                                    value={basicInfo.name}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                    placeholder="e.g. SEO Generator"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input
                                    value={basicInfo.slug}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, slug: e.target.value })}
                                    placeholder="seo-generator-v1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={basicInfo.category}
                                    onValueChange={(val) => setBasicInfo({ ...basicInfo, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="writing">Writing</SelectItem>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="data">Data Analysis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={basicInfo.description}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                    placeholder="What does this tool do?"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Connection</CardTitle>
                            <CardDescription>n8n Webhook Configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Webhook URL (POST)</Label>
                                <Input
                                    value={basicInfo.webhookUrl}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, webhookUrl: e.target.value })}
                                    placeholder="https://n8n.instance/webhook/..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Schema Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Input Schema</CardTitle>
                                <CardDescription>Define the form fields the user will see.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={addField}>
                                <Plus className="mr-2 h-4 w-4" /> Add Field
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                                    No fields added. Click "Add Field" to start.
                                </div>
                            )}
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <div className="grid grid-cols-12 gap-4 flex-1">
                                        <div className="col-span-4 space-y-2">
                                            <Label className="text-xs">Label</Label>
                                            <Input
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-2">
                                            <Label className="text-xs">Variable Key</Label>
                                            <Input
                                                value={field.key}
                                                onChange={(e) => updateField(field.id, { key: e.target.value })}
                                                placeholder="variable_name"
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-2">
                                            <Label className="text-xs">Type</Label>
                                            <Select
                                                value={field.type}
                                                onValueChange={(val: any) => updateField(field.id, { type: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text (Short)</SelectItem>
                                                    <SelectItem value="textarea">Text (Long)</SelectItem>
                                                    <SelectItem value="number">Number</SelectItem>
                                                    <SelectItem value="file">File Upload</SelectItem>
                                                    <SelectItem value="select">Dropdown</SelectItem>
                                                    <SelectItem value="boolean">Toggle</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-center pt-6">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`req-${field.id}`}
                                                    checked={field.required}
                                                    onCheckedChange={(c) => updateField(field.id, { required: !!c })}
                                                />
                                                <Label htmlFor={`req-${field.id}`} className="text-xs truncate">Req?</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="mt-6 text-red-500 hover:text-red-700" onClick={() => removeField(field.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function ToolBuilderPage() {
    return (
        <Suspense fallback={<div>Loading builder...</div>}>
            <ToolBuilderContent />
        </Suspense>
    )
}
