"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash, Check, X } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface Plan {
    id: string
    name: string
    slug: string
    priceMonthly: number
    priceYearly: number
    description: string
    isTrialEnabled: boolean
    isActive: boolean
    features: any
    limits: any
}

export default function PlansPage() {
    // const { toast } = useToast() // Removed
    const [plans, setPlans] = useState<Plan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

    // Form State (Simplified for now)
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        priceMonthly: 0,
        priceYearly: 0,
        isTrialEnabled: false,
        trialDays: 0,
        features: {}, // Use JSON editor or simple toggles later
        limits: {},
        isActive: true
    })

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            const res = await api.get('/admin/plans')
            setPlans(res.data)
        } catch (error) {
            toast.error("Failed to load plans")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingPlan) {
                await api.put(`/admin/plans/${editingPlan.id}`, formData)
                toast.success("Plan updated successfully")
            } else {
                await api.post('/admin/plans', formData)
                toast.success("Plan created successfully")
            }
            setIsDialogOpen(false)
            fetchPlans()
            resetForm()
        } catch (error) {
            toast.error("Operation failed")
        }
    }

    const resetForm = () => {
        setEditingPlan(null)
        setFormData({
            name: "",
            slug: "",
            priceMonthly: 0,
            priceYearly: 0,
            isTrialEnabled: false,
            trialDays: 0,
            features: {},
            limits: {},
            isActive: true
        })
    }

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan)
        setFormData({
            name: plan.name,
            slug: plan.slug,
            priceMonthly: Number(plan.priceMonthly),
            priceYearly: Number(plan.priceYearly) || 0,
            isTrialEnabled: plan.isTrialEnabled,
            trialDays: 0, // Need to add to Plan interface/DB if not there
            features: plan.features,
            limits: plan.limits,
            isActive: plan.isActive
        })
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
                    <p className="text-muted-foreground">Manage pricing tiers and feature access.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Create Plan
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Daily Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Trial</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                    <TableCell>${plan.priceMonthly}/mo</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{plan.isTrialEnabled ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {plans.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No plans found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
                        <DialogDescription>
                            Define the pricing and limits for this subscription tier.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Plan Name</Label>
                                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pro Plan" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (Unique ID)</Label>
                                <Input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. pro-monthly" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Monthly Price ($)</Label>
                                <Input type="number" step="0.01" min="0" required value={formData.priceMonthly} onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Yearly Price ($)</Label>
                                <Input type="number" step="0.01" min="0" value={formData.priceYearly} onChange={(e) => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) })} />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="trial" checked={formData.isTrialEnabled} onCheckedChange={(c) => setFormData({ ...formData, isTrialEnabled: c })} />
                            <Label htmlFor="trial">Enable Free Trial (3 Days)</Label>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingPlan ? 'Save Changes' : 'Create Plan'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
