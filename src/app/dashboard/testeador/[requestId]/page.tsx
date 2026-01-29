import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { WorkerCard } from './worker-card'
import { Button } from '@/components/ui/button'
import { finalizeRequest } from '@/app/actions/testing'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ requestId: string }>
}

export default async function RequestDetailPage({ params }: PageProps) {
    const { requestId } = await params

    const request = await prisma.testRequest.findUnique({
        where: { id: requestId },
        include: {
            workers: {
                include: { result: true }
            }
        }
    })

    if (!request) notFound()

    // Calculate progress
    const total = request.workers.length
    const rated = request.workers.filter(w => w.result?.status).length
    const progress = Math.round((rated / total) * 100)

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900">Evaluación de Riesgo</h1>
                    <p className="text-slate-500">
                        Fecha: {format(new Date(request.scheduledFor), "PPP", { locale: es })}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{progress}%</div>
                    <div className="text-sm text-slate-500">Completado ({rated}/{total})</div>
                </div>
            </div>

            <div className="space-y-4">
                {request.workers.map(worker => (
                    <WorkerCard
                        key={worker.id}
                        worker={worker}
                        initialStatus={worker.result?.status}
                    />
                ))}
            </div>

            <div className="sticky bottom-4 z-10 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between">
                <Link href="/dashboard/testeador">
                    <Button variant="outline">Volver</Button>
                </Link>
                <p className="text-slate-600 font-medium absolute left-1/2 -translate-x-1/2 hidden sm:block">
                    {rated < total ? `Faltan ${total - rated}` : 'Listo'}
                </p>
                <form action={finalizeRequest.bind(null, request.id)}>
                    <Button type="submit" disabled={rated < total} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Resultados
                    </Button>
                </form>
            </div>
        </div>
    )
}
