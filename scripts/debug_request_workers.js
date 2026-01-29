
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Find the request that is PENDING (the one user is likely looking at or just completed)
    const request = await prisma.testRequest.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: { workers: { include: { result: true } } }
    })

    if (!request) {
        console.log('No pending request found.')
        // Try to find the latest completed one
        const completedRequest = await prisma.testRequest.findFirst({
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' },
            include: { workers: { include: { result: true } } }
        })
        if (completedRequest) {
            console.log('Latest Completed Request:', completedRequest.id)
            completedRequest.workers.forEach(w => {
                console.log(`Worker: ${w.name}, Result ID: ${w.result?.id}, isHistorical: ${w.result?.isHistorical}`)
            })
        }
        return
    }

    console.log('Latest Pending Request:', request.id)
    request.workers.forEach(w => {
        console.log(`Worker: ${w.name}, Result ID: ${w.result?.id}, isHistorical: ${w.result?.isHistorical}`)
    })
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
