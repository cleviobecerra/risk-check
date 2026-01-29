'use client'

import { User } from '@prisma/client'
import { login } from './actions/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCircle, ShieldCheck } from 'lucide-react'

interface LoginFormProps {
    users: User[]
}

export function LoginForm({ users }: LoginFormProps) {
    return (
        <div className="grid gap-4">
            {users.map((user) => (
                <Button
                    key={user.id}
                    variant="outline"
                    className="h-auto w-full justify-start p-4 text-left hover:border-slate-400 hover:bg-slate-50"
                    onClick={() => login(user.id, user.role)}
                >
                    {user.role === 'SOLICITANTE' ? (
                        <UserCircle className="mr-4 h-8 w-8 text-blue-600" />
                    ) : (
                        <ShieldCheck className="mr-4 h-8 w-8 text-green-600" />
                    )}
                    <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.role}</div>
                    </div>
                </Button>
            ))}
        </div>
    )
}
