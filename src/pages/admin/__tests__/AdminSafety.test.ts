import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AdminSafety from '../AdminSafety.vue'
import { api } from '../../../services/api'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('../../../services/api', () => ({
  api: {
    adminGetSafetyIncidents: vi.fn(),
    adminGetSafetyMetrics: vi.fn(),
    adminGetSafetyTemplates: vi.fn(),
    adminGetSafetyDeliveryLogs: vi.fn()
  }
}))

const mockAdminGetSafetyIncidents = vi.mocked(api.adminGetSafetyIncidents)
const mockAdminGetSafetyMetrics = vi.mocked(api.adminGetSafetyMetrics)
const mockAdminGetSafetyTemplates = vi.mocked(api.adminGetSafetyTemplates)
const mockAdminGetSafetyDeliveryLogs = vi.mocked(api.adminGetSafetyDeliveryLogs)

function mountPage() {
  return mount(AdminSafety, {
    global: {
      stubs: {
        AppHeader: {
          template: '<header><slot name="title" /><slot name="subtitle" /><slot name="action" /></header>'
        }
      }
    }
  })
}

describe('AdminSafety', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminGetSafetyTemplates.mockResolvedValue({ items: [] })
    mockAdminGetSafetyMetrics.mockResolvedValue({
      days: 7,
      windowStart: new Date().toISOString(),
      windowEnd: new Date().toISOString(),
      totalIncidents: 0,
      openIncidents: 0,
      criticalOpenIncidents: 0,
      overdueOpenIncidents: 0,
      avgAckSeconds: null,
      avgResolveSeconds: null,
      byPriority: [
        { priority: 'LOW', total: 0, open: 0, overdue: 0, avgAckSeconds: null, avgResolveSeconds: null },
        { priority: 'MEDIUM', total: 0, open: 0, overdue: 0, avgAckSeconds: null, avgResolveSeconds: null },
        { priority: 'HIGH', total: 0, open: 0, overdue: 0, avgAckSeconds: null, avgResolveSeconds: null },
        { priority: 'CRITICAL', total: 0, open: 0, overdue: 0, avgAckSeconds: null, avgResolveSeconds: null }
      ]
    })
    mockAdminGetSafetyDeliveryLogs.mockResolvedValue({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    })
  })

  it('shows loading state while incidents are being fetched', async () => {
    mockAdminGetSafetyIncidents.mockReturnValue(new Promise(() => {}) as never)

    const wrapper = mountPage()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Loading incidents...')
  })

  it('shows empty state when no incidents are returned', async () => {
    mockAdminGetSafetyIncidents.mockResolvedValue({
      items: [],
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('No incidents found')
  })

  it('shows error state when incident request fails', async () => {
    mockAdminGetSafetyIncidents.mockRejectedValue(new Error('safety fetch failed'))

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Safety request failed')
    expect(wrapper.text()).toContain('safety fetch failed')
  })

  it('renders safety metrics cards', async () => {
    mockAdminGetSafetyIncidents.mockResolvedValue({
      items: [],
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1
    })
    mockAdminGetSafetyMetrics.mockResolvedValue({
      days: 7,
      windowStart: new Date().toISOString(),
      windowEnd: new Date().toISOString(),
      totalIncidents: 12,
      openIncidents: 4,
      criticalOpenIncidents: 2,
      overdueOpenIncidents: 1,
      avgAckSeconds: 180,
      avgResolveSeconds: 1200,
      byPriority: [
        { priority: 'LOW', total: 1, open: 0, overdue: 0, avgAckSeconds: 90, avgResolveSeconds: 800 },
        { priority: 'MEDIUM', total: 3, open: 1, overdue: 0, avgAckSeconds: 120, avgResolveSeconds: 900 },
        { priority: 'HIGH', total: 6, open: 2, overdue: 1, avgAckSeconds: 180, avgResolveSeconds: 1200 },
        { priority: 'CRITICAL', total: 2, open: 1, overdue: 0, avgAckSeconds: 60, avgResolveSeconds: 500 }
      ]
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Safety SLA Metrics')
    expect(wrapper.text()).toContain('Overdue Open')
    expect(wrapper.text()).toContain('Critical Open')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('2')
  })
})
