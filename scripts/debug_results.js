
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const results = await prisma.testResult.findMany({
        include: { worker: true }
    })

    console.log('All Test Results:')
    results.forEach(r => {
        console.log(`Worker: ${r.worker.name}, Status: ${r.status}, isDraft: ${r.isDraft}, isHistorical: ${r.isHistorical}, Notes: ${r.notes}`)
    })
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
