/** Statuts flash — alignés sur STATUS_MAP de l'API (src/core/definitions/enums.ts) */
export type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'

export const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  SERIAL_CONNECTED: { label: 'Port série connecté', tone: 'success' },
  SERIAL_DISCONNECTED: { label: 'Port série déconnecté', tone: 'error' },
  DISPLAY_ON: { label: 'Affichage ON', tone: 'info' },
  DISPLAY_OFF: { label: 'Afficheur éteint', tone: 'error' },
  SERVICE_SHUTDOWN: { label: 'Service arrêté', tone: 'error' },
  WEIGHT_OK: { label: 'Poids valide', tone: 'success' },
  WEIGHT_NOT_OK: { label: 'Poids non valide', tone: 'warning' },
  DISCONNECTED: { label: 'Déconnecté', tone: 'error' },
  STALE: { label: 'Connexion perdue (réseau)', tone: 'warning' },
  DESABLE_STATION: { label: 'Station désactivée', tone: 'error' },
  BRIDGE_EMPTY: { label: 'Pont bascule vide', tone: 'info' }
}

export const statusLabel = (s?: string) => (s ? STATUS_MAP[s]?.label ?? s : '—')
export const statusTone = (s?: string): Tone => (s ? STATUS_MAP[s]?.tone ?? 'neutral' : 'neutral')

export const ACTIVITY_TYPES: Record<string, { label: string; tone: Tone }> = {
  START: { label: 'Démarrage', tone: 'success' },
  STOP: { label: 'Arrêt', tone: 'error' },
  PAUSE: { label: 'Pause', tone: 'warning' }
}

export const USER_TYPES: Record<string, string> = { OPERATOR: 'Opérateur', OTHER: 'Autre' }

export const ROLE_NAMES: Record<string, string> = { admin: 'Administrateur', manager: 'Gestionnaire', guest: 'Invité' }

/** Actions CASL (AbilityActionEnum de l'API, hors manage) */
export const SubjectAction = {
  read: 'read',
  create: 'create',
  edit: 'edit',
  delete: 'delete',
  stream: 'stream',
} as const

/** Sujets CASL (AbilitySubjectEnum de l'API) */
export const Subject = {
  all: 'all',
  User: 'User',
  Branch: 'Branch',
  Station: 'Station',
  StationActivity: 'StationActivity',
  SentWeight: 'SentWeight',
  AuthUser: 'AuthUser',
  Role: 'Role',
  Flash: 'Flash',
  Setting: 'Setting'
} as const


export const SUBJECT_LABELS: Record<string, string> = {
  Flash: 'Flashs / pesées',
  Station: 'Stations',
  StationActivity: 'Activités des stations',
  SentWeight: 'Envoi des pesées',
  Branch: 'Surccusales',
  User: 'Utilisateurs',
  Role: 'Rôles',
  AuthUser: 'Sessions',
  Setting: 'Paramètres'
}


export const ACTIONS = ['read', 'create', 'edit', 'delete', 'stream'] as const
export const ACTION_LABELS: Record<string, string> = { read: 'Lire', create: 'Créer', edit: 'Modifier', delete: 'Supprimer', stream: 'Temps réel' }

/** Événements Socket.IO émis par l'API vers le backoffice */
export const SocketEvent = {
  SENT_WEIGHT_DATA: 'sentWeightData',
  SENT_NEW_FLASH: 'sent_new_flash',
  START_FLASH_BACKEND: 'start_flash_backend',
  CREATE_ACTION: 'create_action'
} as const
