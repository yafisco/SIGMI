import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { AppRole } from '@/types'

const PUBLIC_PATHS = ['/', '/login', '/register', '/auth/callback']

const ROUTE_ROLES: Record<string, AppRole[]> = {
  '/dashboard': ['direction_generale', 'back_office', 'commercial', 'finance_comptabilite', 'responsable_pole'],
  '/commercial': ['direction_generale', 'commercial', 'responsable_pole'],
  '/clients': ['direction_generale', 'commercial', 'finance_comptabilite', 'responsable_pole', 'back_office'],
  '/contacts': ['direction_generale', 'commercial', 'finance_comptabilite', 'responsable_pole', 'back_office'],
  '/opportunites': ['direction_generale', 'commercial', 'responsable_pole'],
  '/pipeline': ['direction_generale', 'commercial', 'responsable_pole'],
  '/interactions': ['direction_generale', 'commercial', 'responsable_pole'],
  '/taches': ['direction_generale', 'commercial', 'finance_comptabilite', 'responsable_pole', 'back_office'],
  '/documents': ['direction_generale', 'commercial', 'finance_comptabilite', 'responsable_pole', 'back_office'],
  '/gestion-commerciale': ['direction_generale', 'commercial', 'responsable_pole', 'back_office'],
  '/finance': ['direction_generale', 'finance_comptabilite'],
  '/tresorerie': ['direction_generale', 'finance_comptabilite'],
  '/marketing': ['direction_generale', 'commercial'],
  '/recrutement': ['direction_generale', 'back_office'],
  '/projets': ['direction_generale', 'finance_comptabilite', 'responsable_pole', 'back_office'],
  '/collaborateurs': ['direction_generale', 'commercial', 'finance_comptabilite', 'responsable_pole', 'back_office', 'admin'],
  '/admin': ['admin'],
  '/poles': ['responsable_pole', 'direction_generale'],
}

function getAllowedRoles(pathname: string): AppRole[] | null {
  if (ROUTE_ROLES[pathname]) return ROUTE_ROLES[pathname]

  const segments = pathname.split('/').filter(Boolean)
  for (let i = segments.length - 1; i >= 1; i--) {
    const prefix = '/' + segments.slice(0, i).join('/')
    if (ROUTE_ROLES[prefix]) return ROUTE_ROLES[prefix]
  }

  if (segments.length > 0) {
    const topLevel = '/' + segments[0]
    if (ROUTE_ROLES[topLevel]) return ROUTE_ROLES[topLevel]
  }

  return null
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.includes(pathname)) {
    let res = NextResponse.next({ request: req })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            res = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
          },
        },
      }
    )
    await supabase.auth.getUser()
    return res
  }

  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, actif')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !profile.actif) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'inactive')
    return NextResponse.redirect(url)
  }

  const role = profile.role as AppRole
  const allowedRoles = getAllowedRoles(pathname)

  if (allowedRoles && !allowedRoles.includes(role)) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    url.searchParams.set('error', 'forbidden')
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo-group-mi.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
