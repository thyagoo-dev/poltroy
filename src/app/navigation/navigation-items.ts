import {
  BusFront,
  Menu,
  Route,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
  end?: boolean
}

export const navigationItems: readonly NavigationItem[] = [
  {
    label: 'Mapa',
    path: '/',
    icon: BusFront,
    end: true,
  },
  {
    label: 'Viagens',
    path: '/trips',
    icon: Route,
  },
  {
    label: 'Passageiros',
    path: '/passengers',
    icon: UsersRound,
  },
  {
    label: 'Mais',
    path: '/more',
    icon: Menu,
  },
]
