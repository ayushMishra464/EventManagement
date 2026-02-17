// ============================================
// Member 6: Users list – improved UI, responsive
// ============================================

import { useEffect, useState } from 'react'
import { Mail, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usersApi } from '@/services/api'
import type { User as UserType } from '@/types'

export function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    usersApi
      .getAll()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Loading users…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Users</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
            No users yet.
          </div>
        ) : (
          users.map((u) => (
            <Card
              key={u.id}
              className="overflow-hidden border-border/60 shadow-soft hover:shadow-glow/30 transition-shadow duration-300"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 line-clamp-1">
                  <User className="h-5 w-5 shrink-0 text-primary/80" />
                  {u.firstName} {u.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 line-clamp-1">
                  <Mail className="h-4 w-4 shrink-0" />
                  {u.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                {u.phone && (
                  <p className="text-muted-foreground mb-2 line-clamp-1">{u.phone}</p>
                )}
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                  {u.role}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
