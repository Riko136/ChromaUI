import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"

export const keys = {
  collections: ["collections"],
  items: (name, params) =>
    params ? ["items", name, params] : ["items", name],
}

async function request(path, init) {
  const res = await fetch(path, init)
  if (res.status === 204) return null
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message = body?.error ?? res.statusText
    throw new Error(message)
  }
  return body
}

function jsonInit(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }
}

export function useCollections() {
  return useQuery({
    queryKey: keys.collections,
    queryFn: () => request("/api/collections"),
  })
}

export function useItems(name) {
  return useQuery({
    queryKey: keys.items(name),
    queryFn: () =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items?`,
      ),
    enabled: !!name,
    placeholderData: keepPreviousData,
  })
}



export function useSearch(name, text, mode, where, ids) {
  const m = mode[0]
  const path = m === "semantic" ? "semantic" : m === "regex" ? "regex" : "text"
  const body = m === "semantic" ? { where, queryText: text, ids }
             : m === "regex"    ? { where, regex: text, ids }
             :                    { where, text, ids }
             
  return useQuery({
    queryKey: ["search", name, m, text, where, ids],
    queryFn: () => request(`/api/collections/${encodeURIComponent(name)}/${path}`, jsonInit("POST", body)),
    enabled: !!name && !!text && !!m,
    placeholderData: keepPreviousData
  })

}

export function useCreateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, metadata }) =>
      request("/api/collections", jsonInit("POST", { name, metadata })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.collections }),
  })
}

export function useUpdateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ originalName, name, metadata }) =>
      request(
        `/api/collections/${encodeURIComponent(originalName)}`,
        jsonInit("PATCH", { name, metadata }),
      ),
    onSuccess: (_data, { originalName }) => {
      qc.invalidateQueries({ queryKey: keys.collections })
      qc.invalidateQueries({ queryKey: keys.items(originalName) })
    },
  })
}

export function useDeleteCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name) =>
      request(`/api/collections/${encodeURIComponent(name)}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.collections }),
  })
}

export function useAddItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, ids, documents, metadatas}) =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items`,
        jsonInit("POST", { ids, documents, metadatas }),
      ),
    onSuccess: (_data, { name }) =>
      qc.invalidateQueries({ queryKey: keys.items(name) }),
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, id, document, metadata }) =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items/${encodeURIComponent(id)}`,
        jsonInit("PATCH", { document, metadata }),
      ),
    onSuccess: (_data, {name}) =>
      qc.invalidateQueries({ queryKey: keys.items(name) }),
  })
}

export function useDeleteItem(name) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: keys.items(name) }),
  })
}

export function useDeleteItems(name) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids) =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items`,
        jsonInit("DELETE", { ids }),
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: keys.items(name) }),
  })
}
