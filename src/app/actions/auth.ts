'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(userId: string, role: string) {
    const cookieStore = await cookies()
    cookieStore.set('userId', userId)
    cookieStore.set('userRole', role)

    if (role === 'SOLICITANTE') {
        redirect('/dashboard/solicitante')
    } else {
        redirect('/dashboard/testeador')
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    cookieStore.delete('userRole')
    redirect('/')
}
