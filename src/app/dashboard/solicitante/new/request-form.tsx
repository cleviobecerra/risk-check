'use client'

import { useState } from 'react'
import { createRequest } from '@/app/actions/requests'
import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { es } from 'date-fns/locale'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={pending}>
            {pending ? 'Creando Solicitud...' : 'Agendar Testeos'}
        </Button>
    )
}

export function RequestForm() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [fileName, setFileName] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || droppedFile.type === "application/vnd.ms-excel") {
                setFile(droppedFile)
                setFileName(droppedFile.name)
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setFileName(e.target.files[0].name)
        }
    }

    return (
        <form action={(formData) => {
            // If we have a dropped file but input is empty (drag & drop case often needs help), append it manually or ensure input has it.
            // But since native action might not see state file easily without hydratation tricks, 
            // easiest is to manually set the specific input files property OR append to formData here if we intercept.
            // Let's use the interception approach.
            if (file) {
                formData.set('file', file)
            }
            createRequest(formData)
        }} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Clasificación del listado
                </label>
                <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor="dropzone-file"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors relative overflow-hidden",
                            dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {fileName ? (
                                <>
                                    <div className="bg-green-100 text-green-700 rounded-full p-2 mb-2">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">{fileName}</p>
                                    <p className="text-xs text-slate-500 mt-1">Click o arrastra para cambiar</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className={cn("w-8 h-8 mb-2", dragActive ? "text-blue-500" : "text-slate-500")} />
                                    <p className="text-sm text-slate-500"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                                    <p className="text-xs text-slate-500">Excel (.xlsx, .xls)</p>
                                </>
                            )}
                        </div>
                        <input
                            id="dropzone-file"
                            name="file" // Keep name but we override in action
                            type="file"
                            className="hidden"
                            accept=".xlsx, .xls"
                            onChange={handleChange}
                        // We don't strictly need required if we validate manually in action or state, but let's keep it if !file
                        />
                    </label>
                </div>
                <div className="text-center mt-2">
                    <a href="/template.xlsx" download className="text-sm text-blue-600 hover:underline hover:text-blue-800 inline-flex items-center">
                        <UploadCloud className="w-4 h-4 mr-1 rotate-180" /> Descargar Template de Ejemplo
                    </a>
                </div>
            </div>

            <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium leading-none">Fecha del Testeo</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <input type="hidden" name="date" value={date ? date.toISOString() : ''} />
            </div>

            <SubmitButton />
        </form>
    )
}
