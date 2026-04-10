import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AdminAuditLogs from '../AdminAuditLogs.vue'
import { api } from '../../../services/api'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('../../../services/api', () => ({
  api: {
    adminGetAuditLogs: vi.fn()
  }
}))

const mockAdminGetAuditLogs = vi.mocked(api.adminGetAuditLogs)

function mountPage() {
  return mount(AdminAuditLogs, {
    global: {
      stubs: {
        AppHeader: {
          template: '<header><slot name="title" /><slot name="subtitle" /><slot name="action" /></header>'
        }
      }
    }
  })
}

describe('AdminAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while logs are being fetched', async () => {
    mockAdminGetAuditLogs.mockReturnValue(new Promise(() => {}) as never)

    const wrapper = mountPage()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Loading audit logs...')
  })

  it('shows empty state when API returns no records', async () => {
    mockAdminGetAuditLogs.mockResolvedValue({
      items: [],
      page: 1,
      limit: 15,
      total: 0,
      totalPages: 1
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('No logs found')
  })

  it('shows error state when API request fails', async () => {
    mockAdminGetAuditLogs.mockRejectedValue(new Error('audit fetch failed'))

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Audit log request failed')
    expect(wrapper.text()).toContain('audit fetch failed')
  })
})
