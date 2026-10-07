import { Activity, Building2, History, LayoutDashboard, Plug, Scale, Settings, ShieldCheck, Users, Zap, type LucideIcon } from 'lucide-react'
import { Subject, SubjectAction } from '@/lib/constants'

export type NavItem = { title: string; href: string; icon: LucideIcon; subject: string; action?: string }
export type NavGroup = { title: string; items: NavItem[] }

export const NAVIGATION: NavGroup[] = [
  {
    title: 'Exploitation',
    items: [
      { title: 'Supervision', href: '/supervision', icon: LayoutDashboard, subject: Subject.Flash, action: SubjectAction.stream },
      { title: 'Flashs temps réel', href: '/flashs', icon: Zap, subject: Subject.Flash, action: SubjectAction.stream },
      { title: 'Audit des flashs', href: '/audit', icon: History, subject: Subject.Flash, action: SubjectAction.stream }
    ]
  },
  {
    title: 'Stations',
    items: [
      { title: 'Ponts bascules', href: '/stations', icon: Scale, subject: Subject.Station, action: SubjectAction.stream },
      { title: 'Activités', href: '/activites', icon: Activity, subject: Subject.StationActivity, action: SubjectAction.stream }
    ]
  },
  {
    title: 'Administration',
    items: [
      { title: 'Utilisateurs', href: '/utilisateurs', icon: Users, subject: Subject.User, action: SubjectAction.stream },
      { title: 'Rôles', href: '/roles', icon: ShieldCheck, subject: Subject.Role, action: SubjectAction.stream },
      { title: 'Surccusales', href: '/surccusales', icon: Building2, subject: Subject.Branch, action: SubjectAction.stream }
    ]
  },
  {
    title: 'Paramètres',
    items: [
      { title: 'Connexions ERP', href: '/erp', icon: Plug, subject: Subject.Setting, action: SubjectAction.stream },
      { title: 'Paramètres système', href: '/parametres', icon: Settings, subject: Subject.Setting, action: SubjectAction.stream }
    ]
  }
]

export const findNavItem = (pathname: string) => NAVIGATION.flatMap(g => g.items).find(i => pathname === i.href || pathname.startsWith(`${i.href}/`))
