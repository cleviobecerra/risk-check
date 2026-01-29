
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Get the latest pending request
    const request = await prisma.testRequest.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: { workers: { include: { result: true } } }
    })

    if (!request) {
        console.log('No pending request found.')
        return
    }

    console.log(`Processing Request ID: ${request.id} created at ${request.createdAt}`)

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const workersToUpdate = []

    for (const worker of request.workers) {
        // Skip if already has a result (unless we want to overwrite, but assume we only fill missing ones)
        if (worker.result) continue;

        console.log(`Checking history for worker ${worker.name} (${worker.rut})...`)

        // Find latest valid result for this RUT in LAST 6 MONTHS, excluding THIS request
        const pastResult = await prisma.testResult.findFirst({
            where: {
                worker: {
                    rut: worker.rut,
                    requestId: { not: request.id }, // Exclude current request
                    testRequest: {
                        createdAt: { gte: sixMonthsAgo }
                    }
                },
                isDraft: false
            },
            include: {
                worker: {
                    include: { testRequest: true }
                }
            },
            orderBy: {
                worker: {
                    testRequest: {
                        scheduledFor: 'desc'
                    }
                }
            }
        })

        if (pastResult) {
            console.log(`  Found match! Status: ${pastResult.status} from ${pastResult.worker.testRequest.scheduledFor}`)
            workersToUpdate.push({
                workerId: worker.id,
                status: pastResult.status,
                date: pastResult.worker.testRequest.scheduledFor
            })
        } else {
            console.log(`  No recent history found.`)
        }
    }

    console.log(`Updating ${workersToUpdate.length} workers...`)

    for (const update of workersToUpdate) {
        await prisma.testResult.create({
            data: {
                workerId: update.workerId,
                status: update.status,
                isDraft: false,
                isHistorical: true,
                notes: `Validación Histórica (${update.date.toLocaleDateString('es-CL')})`
            }
        })
    }

    console.log('Done!')
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
