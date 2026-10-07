export interface Paginated<T> {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
  data: T[]
}

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface Branch extends BaseEntity {
  code: string
  displayName: string
  isActive: boolean
  description?: string
  phoneNumber?: string
  email?: string
  address?: string
  city?: string
  isParentCompany?: boolean
}

export interface Station extends BaseEntity {
  code: string
  displayName: string
  branchId?: string
  branch?: Branch
  isActive: boolean
}

export interface Flash extends BaseEntity {
  reference?: string
  ticket?: string
  inputFromBc?: number
  outputFromBc?: number
  sentWeight?: number
  computerUser?: string
  frame?: string
  station?: string
  branch?: string
  status?: string
  statusMsg?: string
  userName?: string
  computerName?: string
  latency?: string
  isMonitored?: boolean
  userProfile?: string
  timestamp?: number | string
}

export interface StationActivity extends BaseEntity {
  stationId?: string
  station?: Station
  branchId?: string
  branch?: Branch
  type: 'START' | 'STOP' | 'PAUSE'
  isActive: boolean
  startAt?: string
  endAt?: string
  reasoncode?: string
  reason?: string
}

export interface Role extends BaseEntity {
  name: 'admin' | 'manager' | 'guest' | string
  displayName: string
  description?: string
  isActive: boolean
  adminPermission?: boolean
  permissions?: Record<string, boolean | Record<string, boolean>>
}

export interface User extends BaseEntity {
  username: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  branchId?: string
  branch?: Branch
  roleId?: string
  role?: Role
  type?: 'OPERATOR' | 'OTHER'
  isActive: boolean
}

export interface ErpConnection extends BaseEntity {
  code: string
  port?: number
  apiUri?: string
  baseUrl?: string
  authUri?: string
  wsUri?: string
  login?: string
  password?: string
  isActive: boolean
  isDefault: boolean
  branchId?: string
  branch?: Branch
}

export interface Setting extends BaseEntity {
  name: string
  displayName: string
  value: string
}

export interface AuditFlashStats {
  periodHours: number
  total: number
  validWeights: number
  minWeight: number | null
  maxWeight: number | null
  avgWeight: number | null
  byStatus: { status: string; count: number }[]
}

export interface AuditFlashDetails {
  audit: Flash
  previous: Flash | null
  next: Flash | null
  timeline: Flash[]
  currentFlash: Flash | null
  stats: AuditFlashStats
}

export interface AbilityRule {
  action: string | string[]
  subject: string | string[]
  conditions?: any
  inverted?: boolean
}

export interface AuthSession {
  id?: string
  user?: { id: string; username: string; firstName?: string; lastName?: string; email?: string }
  userData?: any
  role?: { id?: string; name?: string; displayName?: string; adminPermission?: boolean }
  targetBranchId?: string
  targetBranch?: { id: string; code: string; displayName: string }
  branchId?: string
  branch?: { id: string; code: string; displayName: string; isParentCompany?: boolean }
}
