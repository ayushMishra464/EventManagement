// ============================================
// Member 6: Main layout – responsive header, nav, auth actions
// ============================================

import { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Home, Menu, X, LogOut, User, LayoutDashboard, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = useMemo(() => {
    const items = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/events', label: 'Events', icon: Calendar },
    ]
    if (user?.role === 'ADMIN') {
      items.push(
        { path: '/venues', label: 'Venues', icon: MapPin },
        { path: '/users', label: 'Users', icon: Users },
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      )
    } else if (user?.role === 'ORGANIZER') {
      items.push(
        { path: '/venues', label: 'Venues', icon: MapPin },
        { path: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      )
    } else if (user?.role === 'ATTENDEE') {
      items.push(
        { path: '/bookings', label: 'My Bookings', icon: Ticket },
        { path: '/attendee/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      )
    } else {
      // Guest - show venues but not users
      items.push({ path: '/venues', label: 'Venues', icon: MapPin })
    }
    return items
  }, [user?.role])

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    toast.success('Logged out successfully.')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-primary shrink-0"
          >
            <Calendar className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="hidden xs:inline">EventHub</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  location.pathname === path ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[120px]">
                  {user.firstName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur">
            <nav className="container flex flex-col gap-1 px-4 py-3">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    location.pathname === path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 container py-6 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        {children}
      </main>

      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container px-4 sm:px-6 text-center text-sm text-muted-foreground">
          Event Management System — Internship Project
        </div>
      </footer>
    </div>
  )
}
