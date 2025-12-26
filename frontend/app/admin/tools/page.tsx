"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash, Play, Activity } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Tool {
    id: string
    name: string
    slug: string
    category: string
    status: 'DRAFT' | 'ACTIVE' | 'DISABLED' | 'MAINTENANCE'
    currentVersion: number
}

export default function ToolsListPage() {
    const [tools, setTools] = useState<Tool[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchTools()
    }, [])

    const fetchTools = async () => {
        try {
            const res = await api.get('/tools')
            setTools(res.data)
        } catch (error) {
            toast.error("Failed to load tools")
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'DRAFT': return 'bg-gray-100 text-gray-800'
            case 'DISABLED': return 'bg-red-100 text-red-800'
            case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Tools</h2>
                    <p className="text-muted-foreground">Manage your AI tools ecosystem.</p>
                </div>
                <Link href="/admin/tools/builder">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Tool
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tools.map((tool) => (
                            <TableRow key={tool.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{tool.name}</span>
                                        <span className="text-xs text-muted-foreground">{tool.slug}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{tool.category}</TableCell>
                                <TableCell>v{tool.currentVersion}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                                        {tool.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/dashboard/tools/${tool.id}`}>
                                            <Button variant="ghost" size="icon" title="Test Tool">
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/tools/builder?id=${tool.id}`}>
                                            <Button variant="ghost" size="icon" title="Edit Schema">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {tools.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No tools found. Start building the future!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
