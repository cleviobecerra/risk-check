'use client'

import { useState } from 'react'
import { saveResult } from '@/app/actions/testing'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkerCardProps {
    worker: {
        id: string
        name: string
        rut: string
        subArea: string
        result?: {
            status: string
            isHistorical: boolean
            notes?: string | null
        } | null
    }
    initialStatus?: string | null
}

export function WorkerCard({ worker, initialStatus }: WorkerCardProps) {
    const [status, setStatus] = useState<string | null>(initialStatus || null)
    const [saving, setSaving] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        const nextStatus = status === newStatus ? null : newStatus
        setStatus(nextStatus)
        setSaving(true)
        try {
            await saveResult(worker.id, nextStatus)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{worker.name}</h4>
                    {worker.result?.isHistorical && (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Histórico
                            </span>
                            <span className="text-xs text-slate-500">
                                {worker.result.notes?.replace('Validación Histórica ', '')}
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-sm text-slate-500 flex gap-2">
                    <span>{worker.rut}</span>
                    <span>•</span>
                    <span>{worker.subArea}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('SAFE')}
                    className={cn(
                        "flex-1 sm:flex-none border-green-200 hover:bg-green-50 hover:text-green-700",
                        status === 'SAFE' && "bg-green-100 text-green-700 border-green-500 ring-1 ring-green-500"
                    )}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Seguro
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('NEUTRAL')}
                    className={cn(
                        "flex-1 sm:flex-none border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700",
                        status === 'NEUTRAL' && "bg-yellow-100 text-yellow-700 border-yellow-500 ring-1 ring-yellow-500"
                    )}
                >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Neutro
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('UNSAFE')}
                    className={cn(
                        "flex-1 sm:flex-none border-red-200 hover:bg-red-50 hover:text-red-700",
                        status === 'UNSAFE' && "bg-red-100 text-red-700 border-red-500 ring-1 ring-red-500"
                    )}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Inseguro
                </Button>

                <div className="w-6 flex justify-center">
                    {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
            </div>
        </Card >
    )
}
