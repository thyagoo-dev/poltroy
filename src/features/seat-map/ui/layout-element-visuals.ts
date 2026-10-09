import {
  Bath,
  DoorOpen,
  Footprints,
  MoveVertical,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import type { StructuralLayoutElementKind } from '@/features/seat-map/domain/layout-element'

interface StructuralElementVisual {
  label: string
  icon: LucideIcon
}

export const structuralElementVisuals:
  Record<
    StructuralLayoutElementKind,
    StructuralElementVisual
  > = {
    driver: {
      label: 'Motorista',
      icon: UserRound,
    },

    door: {
      label: 'Entrada',
      icon: DoorOpen,
    },

    toilet: {
      label: 'Banheiro',
      icon: Bath,
    },

    stairs: {
      label: 'Escada',
      icon: Footprints,
    },

    aisle: {
      label: 'Corredor',
      icon: MoveVertical,
    },

    technical: {
      label: 'Área técnica',
      icon: Wrench,
    },
  }
