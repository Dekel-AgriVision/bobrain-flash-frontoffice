import { api, crud } from '@/lib/api'
import type {
  AuditFlashDetails,
  AuditFlashStats,
  Branch,
  ErpConnection,
  Flash,
  Paginated,
  Role,
  Setting,
  Station,
  StationActivity,
  User
} from '@/lib/types'
import type { SearchOptions } from '@/lib/query'

/** Endpoints de BOBRAINFLASHAPI, regroupés par ressource */
export const services = {
  branches: { ...crud<Branch>('branch'), select: () => api<Paginated<Branch>>('branch/list/select', { query: { per_page: 500 } }) },
  stations: crud<Station>('station'),
  activities: crud<StationActivity>('stationActivity'),
  flashs: {
    list: (q?: SearchOptions) => api<Paginated<Flash>>('flash', { query: q }),
    get: (id: string) => api<Flash>(`flash/${id}`)
  },
  audit: {
    list: (q?: SearchOptions) => api<Paginated<Flash>>('audit-flash', { query: q }),
    get: (id: string) => api<Flash>(`audit-flash/${id}`),
    details: (id: string, around = 10, hours = 24) => api<AuditFlashDetails>(`audit-flash/${id}/details`, { query: `around=${around}&hours=${hours}` }),
    stationStats: (branch: string, station: string, hours = 24) =>
    api<AuditFlashStats>(`audit-flash/station/${encodeURIComponent(branch)}/${encodeURIComponent(station)}/stats`, { query: `hours=${hours}` })
  },
  users: crud<User>('user'),
  roles: crud<Role>('role'),
  erp: crud<ErpConnection>('erpconnection'),
  settings: crud<Setting>('setting'),
  auth: {
    me: () => api('auth/user'),
    switchBranch: (branchId: string) => api(`auth/switch/${branchId}`, { method: 'POST' }),
    changePassword: (body: { currentPassword: string; password: string; confirmPassword: string }) => api('auth/change-password', { method: 'POST', body }),
    logout: () => api('auth/logout', { method: 'POST' }).catch(() => null)
  }
}
