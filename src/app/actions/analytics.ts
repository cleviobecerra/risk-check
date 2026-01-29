'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function getFilterOptions(businessUnit?: string, year?: string, month?: string) {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value?.toUpperCase()

    if (!userId) return { businessUnits: [], subAreas: [], years: [], months: [], days: [] }

    const whereReq = userRole === 'SOLICITANTE' ? { solicitanteId: userId } : {}

    // Fetch dates from TestResult (source of truth for analytics)
    const results = await prisma.testResult.findMany({
        where: {
            worker: {
                testRequest: whereReq
            }
        },
        select: {
            worker: {
                select: {
                    testRequest: {
                        select: { scheduledFor: true }
                    }
                }
            }
        }
    })

    const yearsSet = new Set<string>()
    const monthsSet = new Set<string>()
    const daysSet = new Set<string>()

    results.forEach(res => {
        const d = new Date(res.worker.testRequest.scheduledFor)
        const reqYear = d.getFullYear().toString()
        const reqMonth = (d.getMonth() + 1).toString()
        const reqDay = d.getDate().toString()

        yearsSet.add(reqYear)

        if (year && reqYear === year) {
            monthsSet.add(reqMonth)

            if (month && reqMonth === month) {
                daysSet.add(reqDay)
            }
        } else if (!year) {
            monthsSet.add(reqMonth)
        }
    })

    // Fetch distinct Business Units
    const units = await prisma.worker.findMany({
        where: { testRequest: whereReq },
        select: { businessUnit: true },
        distinct: ['businessUnit']
    })

    // Fetch distinct SubAreas
    const subAreaWhere: any = { testRequest: whereReq }
    if (businessUnit && businessUnit !== 'all') {
        subAreaWhere.businessUnit = businessUnit
    }

    const areas = await prisma.worker.findMany({
        where: subAreaWhere,
        select: { subArea: true },
        distinct: ['subArea']
    })

    // Sort Years, Months and Days
    const years = Array.from(yearsSet).sort()
    const months = Array.from(monthsSet).map(Number).sort((a, b) => a - b).map(String)
    const days = Array.from(daysSet).map(Number).sort((a, b) => a - b).map(String)

    return {
        businessUnits: units.map(u => u.businessUnit).filter(Boolean),
        subAreas: areas.map(a => a.subArea).filter(Boolean),
        years,
        months,
        days
    }
}

interface AnalyticsFilters {
    year?: string
    month?: string
    day?: string
    businessUnit?: string
    subArea?: string
}

export async function getAnalyticsData(filters?: AnalyticsFilters) {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const userRole = cookieStore.get('userRole')?.value

    if (!userId) return null

    // Initialize worker query object
    const workerQuery: any = {
        testRequest: {}
    }

    // Role-based security filter
    if (userRole?.toUpperCase() === 'SOLICITANTE') {
        workerQuery.testRequest.solicitanteId = userId
    }

    // Apply Year/Month Filters
    if (filters?.year) {
        const year = parseInt(filters.year)
        // Construct date range for the Year
        let startDate = new Date(year, 0, 1)
        let endDate = new Date(year, 11, 31, 23, 59, 59)

        if (filters.month) {
            const month = parseInt(filters.month)

            if (filters.day) {
                const day = parseInt(filters.day)
                startDate = new Date(year, month - 1, day, 0, 0, 0)
                endDate = new Date(year, month - 1, day, 23, 59, 59)
            } else {
                startDate = new Date(year, month - 1, 1)
                endDate = new Date(year, month, 0, 23, 59, 59) // Last day of month
            }
        }

        workerQuery.testRequest.scheduledFor = {
            gte: startDate,
            lte: endDate
        }
    }

    // Apply Worker Attribute Filters
    if (filters?.businessUnit && filters.businessUnit !== 'all') {
        workerQuery.businessUnit = filters.businessUnit
    }

    if (filters?.subArea && filters.subArea !== 'all') {
        workerQuery.subArea = filters.subArea
    }

    // Compose final where clause for TestResult
    const whereClause = {
        worker: workerQuery
    }

    console.log('Fetching analytics with where:', JSON.stringify(whereClause, null, 2))

    // Fetch all relevant results
    const results = await prisma.testResult.findMany({
        where: whereClause,
        include: {
            worker: {
                select: {
                    name: true,
                    rut: true,
                    businessUnit: true,
                    subArea: true,
                    testRequest: {
                        select: { scheduledFor: true }
                    }
                }
            }
        },
        orderBy: {
            worker: {
                testRequest: { scheduledFor: 'asc' }
            }
        }
    })


    // Calculate Totals
    const totalProcessed = results.length
    const historicalCount = results.filter(r => r.isHistorical).length
    const realResults = results.filter(r => !r.isHistorical)
    const realTestsCount = realResults.length

    // Pass Rates (Calculated ONLY on REAL tests)

    const passed = realResults.filter(r => r.status === 'SAFE').length
    const failed = realResults.filter(r => r.status === 'UNSAFE').length
    const neutral = realResults.filter(r => r.status === 'NEUTRAL').length

    // Status Distribution for Pie Chart
    const statusDistribution = [
        { name: 'Seguro', value: passed, fill: '#22c55e' },
        { name: 'Inseguro', value: failed, fill: '#ef4444' },
        { name: 'Neutro', value: neutral, fill: '#eab308' },
    ].filter(i => i.value > 0)

    // Monthly Trends for Bar Chart
    const trendsMap = new Map<string, { date: string, total: number, safe: number, unsafe: number, neutral: number }>()

    realResults.forEach(res => {
        const date = new Date(res.worker.testRequest.scheduledFor)
        const key = `${date.getMonth() + 1}/${date.getFullYear()}` // MM/YYYY

        if (!trendsMap.has(key)) {
            trendsMap.set(key, { date: key, total: 0, safe: 0, unsafe: 0, neutral: 0 })
        }

        const entry = trendsMap.get(key)!
        entry.total++
        if (res.status === 'SAFE') entry.safe++
        if (res.status === 'UNSAFE') entry.unsafe++
        if (res.status === 'NEUTRAL') entry.neutral++
    })

    const trends = Array.from(trendsMap.values())
        .sort((a, b) => {
            const [mA, yA] = a.date.split('/').map(Number)
            const [mB, yB] = b.date.split('/').map(Number)
            return yA - yB || mA - mB
        })

    // Business Unit Stats for Table
    const buStatsMap = new Map<string, { unit: string, safe: number, neutral: number, unsafe: number, total: number }>()

    realResults.forEach(res => {
        const unit = res.worker.businessUnit || 'Sin Unidad' // Handle potential nulls though schema implies string
        if (!buStatsMap.has(unit)) {
            buStatsMap.set(unit, { unit, safe: 0, neutral: 0, unsafe: 0, total: 0 })
        }
        const entry = buStatsMap.get(unit)!
        entry.total++
        if (res.status === 'SAFE') entry.safe++
        if (res.status === 'NEUTRAL') entry.neutral++
        if (res.status === 'UNSAFE') entry.unsafe++
    })

    const businessUnitStats = Array.from(buStatsMap.values()).sort((a, b) => b.total - a.total)

    // Detailed Results for Individual Table
    const detailedResults = realResults.map(r => ({
        id: r.id,
        date: r.worker.testRequest.scheduledFor,
        workerName: r.worker.name || 'Sin Nombre', // Schema might allow nulls? Worker usually has name.
        workerRut: r.worker.rut,
        businessUnit: r.worker.businessUnit,
        subArea: r.worker.subArea,
        status: r.status
    }))

    return {
        totalProcessed,
        realTestsCount,
        historicalCount,
        passRate: realTestsCount > 0 ? Math.round((passed / realTestsCount) * 100) : 0,
        statusDistribution,
        trends,
        businessUnitStats,
        detailedResults
    }
}
