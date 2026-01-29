import { RequestForm } from "./request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewRequestPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nueva Solicitud</h1>
                <p className="text-slate-500">Sube la nómina de trabajadores y agenda la fecha del testeo.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Solicitud</CardTitle>
                    <CardDescription>
                        Asegúrate que el Excel tenga las columnas: Nombre, RUT, Centro de Costo, Unidad de Negocio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RequestForm />
                </CardContent>
            </Card>
        </div>
    )
}
