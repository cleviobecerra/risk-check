import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">R</div>
                            <span className="font-bold text-xl text-slate-900 hidden sm:inline-block">RiskCheck</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            <a href="/dashboard/solicitante" className="text-sm font-medium text-slate-600 hover:text-slate-900">Inicio</a>
                            <a href="/dashboard/analytics" className="text-sm font-medium text-slate-600 hover:text-slate-900">Estadísticas</a>
                        </nav>
                    </div>
                    <form action={logout}>
                        <Button variant="ghost" type="submit" className="text-slate-600 hover:text-slate-900">
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </header>
            <main className="container mx-auto p-4 py-8 max-w-7xl">
                {children}
            </main>
        </div >
    )
}
