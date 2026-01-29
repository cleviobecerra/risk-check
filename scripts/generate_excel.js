const XLSX = require('xlsx');
const path = require('path');

const data = [
    { Nombre: "Juan Perez", RUT: "12.345.678-9", "Centro de Costo": "CC-101", "Unidad de Negocio": "Minería", SubArea: "Mantención" },
    { Nombre: "Maria Gonzalez", RUT: "9.876.543-2", "Centro de Costo": "CC-102", "Unidad de Negocio": "Energía", SubArea: "Operaciones" },
    { Nombre: "Carlos Diaz", RUT: "15.432.198-K", "Centro de Costo": "CC-101", "Unidad de Negocio": "Minería", SubArea: "Seguridad" },
    { Nombre: "Ana Silva", RUT: "18.999.888-1", "Centro de Costo": "CC-103", "Unidad de Negocio": "Construcción", SubArea: "Obras Civiles" },
    { Nombre: "Pedro Rojas", RUT: "20.123.456-7", "Centro de Costo": "CC-102", "Unidad de Negocio": "Energía", SubArea: "Proyectos" }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Trabajadores");

const outputPath = path.join(__dirname, '../workers_example.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Excel file created at: ${outputPath}`);
