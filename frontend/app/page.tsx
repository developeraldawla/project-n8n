import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getHeroContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/cms/public?section=hero`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function Home() {
  const heroContent = await getHeroContent();
  const content = heroContent?.content || {
    headline: "Unleash the Power of AI Tools",
    subheadline: "Access a suite of premium AI utilities designed to boost your productivity.",
    cta: "Start Free Trial"
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b">
        <span className="font-bold text-xl">Alhosni SAAS</span>
        <nav className="space-x-4">
          <Link href="/auth/login" className="text-sm font-medium hover:underline">Login</Link>
          <Button asChild><Link href="/auth/signup">Get Started</Link></Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mb-6">
          {content.headline}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          {content.subheadline}
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/signup">{content.cta}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">Browse Tools</Link>
          </Button>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        &copy; 2024 Alhosni SAAS. All rights reserved.
      </footer>
    </div>
  );
}
