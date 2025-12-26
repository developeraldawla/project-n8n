"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Settings, CreditCard, Hammer, Shield, Users, Activity } from 'lucide-react'

const sidebarItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Plans', href: '/admin/plans', icon: CreditCard },
    { name: 'Tools', href: '/admin/tools', icon: Hammer },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Audit Logs', href: '/admin/audit', icon: Shield },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Alhosni Admin
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start", isActive && "bg-gray-100 dark:bg-gray-700")}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500">v1.0.0</div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold capitalize">
                        {pathname.split('/').pop()}
                    </h2>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">Logout</Button>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
