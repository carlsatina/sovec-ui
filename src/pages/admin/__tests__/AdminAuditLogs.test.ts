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
    mockAdminGetAuditLogs.mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    })
  })

  it('shows loading state while logs are being fetched', async () => {
    mockAdminGetAuditLogs.mockReturnValue(new Promise(() => {}) as never)

    const wrapper = mountPage()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Loading audit logs...')
  })

  it('shows empty state when API returns no records', async () => {
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

  it('applies action preset filter and requests first page', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const preset = wrapper.findAll('button').find((btn) => btn.text() === 'PAYMENT_VERIFY')
    expect(preset).toBeDefined()
    await preset!.trigger('click')
    await flushPromises()

    const latestCall = mockAdminGetAuditLogs.mock.calls.at(-1)?.[0]
    expect(latestCall).toMatchObject({ action: 'PAYMENT_VERIFY', page: 1 })
  })

  it('sends from/to date filters when applying', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const dateInputs = wrapper.findAll('input[type="date"]')
    expect(dateInputs.length).toBe(2)
    await dateInputs[0].setValue('2026-04-01')
    await dateInputs[1].setValue('2026-04-10')

    const applyBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Apply Filters')
    expect(applyBtn).toBeDefined()
    await applyBtn!.trigger('click')
    await flushPromises()

    const latestCall = mockAdminGetAuditLogs.mock.calls.at(-1)?.[0]
    expect(latestCall).toMatchObject({ from: '2026-04-01', to: '2026-04-10', page: 1 })
  })

  it('exports current page as csv', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const createObjectURL = vi.fn(() => 'blob://csv-test')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true
    })

    mockAdminGetAuditLogs.mockResolvedValueOnce({
      items: [
        {
          id: 'log-1',
          adminId: 'admin-1',
          action: 'PAYMENT_VERIFY',
          targetType: 'PAYMENT',
          targetId: 'pay-1',
          summary: 'Verified payment',
          before: null,
          after: { status: 'VERIFIED' },
          metadata: null,
          createdAt: new Date().toISOString(),
          admin: {
            id: 'admin-1',
            name: 'Admin One',
            phone: '+639170000001',
            email: 'admin1@example.com',
            role: 'ADMIN'
          }
        }
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1
    })

    const wrapper = mountPage()
    await flushPromises()

    const exportBtn = wrapper.findAll('button').find((btn) => btn.text() === 'Export CSV')
    expect(exportBtn).toBeDefined()
    await exportBtn!.trigger('click')

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })
})
