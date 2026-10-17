import { api } from './api'

export async function fetchAllPages(endpoint, params = {}) {
  const records = []
  let page = 1
  let lastPage = 1

  do {
    const { data } = await api.get(endpoint, { params: { ...params, page } })
    records.push(...(data.data || []))
    lastPage = Number(data.meta?.last_page || 1)
    page += 1
  } while (page <= lastPage)

  return records
}
