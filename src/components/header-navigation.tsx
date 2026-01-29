'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function HeaderNavigation() {
    const pathname = usePathname()

    // Logic: Show back button if path has more than 3 segments (e.g. /dashboard/testeador/123)
    // Base paths are /dashboard/solicitante and /dashboard/testeador (3 segments)
    const segments = pathname.split('/').filter(Boolean)
    const isDetailPage = segments.length > 2

    if (!isDetailPage) return null

    // Determine back path
    const backPath = `/${segments.slice(0, segments.length - 1).join('/')}`

    return (
        <Link href={backPath} className="mr-4">
            <Button variant="ghost" size="sm" className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
            </Button>
        </Link>
    )
}
