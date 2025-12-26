"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

const brandingSchema = z.object({
    appName: z.string().min(2, "Name must be at least 2 characters"),
    primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid HEX color"),
    secondaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid HEX color"),
    logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

const landingSchema = z.object({
    heroHeadline: z.string().min(5),
    heroSubheadline: z.string().min(5),
    heroCta: z.string().min(2),
})

export default function ContentManagerPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const brandingForm = useForm<z.infer<typeof brandingSchema>>({
        resolver: zodResolver(brandingSchema),
        defaultValues: {
            appName: "Alhosni SAAS",
            primaryColor: "#000000",
            secondaryColor: "#ffffff",
            logoUrl: "",
        }
    })

    const landingForm = useForm<z.infer<typeof landingSchema>>({
        resolver: zodResolver(landingSchema),
        defaultValues: {
            heroHeadline: "Unleash the Power of AI Tools",
            heroSubheadline: "Access a suite of premium AI utilities designed to boost your productivity.",
            heroCta: "Start Free Trial",
        }
    })

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const [brandingRes, landingRes] = await Promise.all([
                api.get("/cms/config/branding"),
                api.get("/cms/public?section=hero")
            ])

            if (brandingRes.data?.value) {
                brandingForm.reset(brandingRes.data.value)
            }

            if (landingRes.data?.content) {
                landingForm.reset(landingRes.data.content)
            }
        } catch (error) {
            toast.error("Failed to load configuration")
        } finally {
            setIsLoading(false)
        }
    }

    const onSaveBranding = async (data: z.infer<typeof brandingSchema>) => {
        setIsSaving(true)
        try {
            await api.put("/cms/config/branding", { value: data })
            toast.success("Branding updated successfully! Refresh to see changes.")
            // Ideally trigger a global refresh or context update here
            if (typeof window !== 'undefined') {
                // Force reload to apply theme changes if we don't have dynamic context yet
                // window.location.reload() 
                // For now just toast
            }
        } catch (error) {
            toast.error("Failed to save branding")
        } finally {
            setIsSaving(false)
        }
    }

    const onSaveLanding = async (data: z.infer<typeof landingSchema>) => {
        setIsSaving(true)
        try {
            await api.put("/cms/content/hero", { content: data, language: 'en' })
            toast.success("Landing page content updated!")
        } catch (error) {
            toast.error("Failed to save content")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Content Manager</h2>
                <p className="text-muted-foreground">Manage platform branding, logos, and textual content.</p>
            </div>

            <Tabs defaultValue="branding" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="branding">Branding & Appearance</TabsTrigger>
                    <TabsTrigger value="landing">Landing Page</TabsTrigger>
                </TabsList>

                <TabsContent value="branding">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Branding</CardTitle>
                            <CardDescription>Customize the look and feel of your SaaS.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={brandingForm.handleSubmit(onSaveBranding)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Platform Name</Label>
                                        <Input {...brandingForm.register("appName")} placeholder="My SaaS" />
                                        {brandingForm.formState.errors.appName && <p className="text-xs text-red-500">{brandingForm.formState.errors.appName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Logo URL</Label>
                                        <Input {...brandingForm.register("logoUrl")} placeholder="https://..." />
                                        {brandingForm.formState.errors.logoUrl && <p className="text-xs text-red-500">{brandingForm.formState.errors.logoUrl.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" {...brandingForm.register("primaryColor")} className="w-12 p-1 h-10" />
                                            <Input {...brandingForm.register("primaryColor")} placeholder="#000000" />
                                        </div>
                                        {brandingForm.formState.errors.primaryColor && <p className="text-xs text-red-500">{brandingForm.formState.errors.primaryColor.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" {...brandingForm.register("secondaryColor")} className="w-12 p-1 h-10" />
                                            <Input {...brandingForm.register("secondaryColor")} placeholder="#ffffff" />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Branding
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="landing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Section</CardTitle>
                            <CardDescription>Edit the main banner on the home page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={landingForm.handleSubmit(onSaveLanding)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Headline</Label>
                                    <Input {...landingForm.register("heroHeadline")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subheadline</Label>
                                    <Textarea {...landingForm.register("heroSubheadline")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA Text</Label>
                                    <Input {...landingForm.register("heroCta")} />
                                </div>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Content
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
