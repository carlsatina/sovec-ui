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
    adminGetSafetyTemplates: vi.fn(),
    adminGetSafetyDeliveryLogs: vi.fn()
  }
}))

const mockAdminGetSafetyIncidents = vi.mocked(api.adminGetSafetyIncidents)
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
})
