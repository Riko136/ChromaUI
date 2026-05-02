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
  textQuery: (name, text, opts) => ["textQuery", name, text, opts],
  metadataQuery: (name, where, opts) => ["metadataQuery", name, where, opts],
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

export function useItems(name, { limit = 50, offset = 0 } = {}) {
  return useQuery({
    queryKey: keys.items(name, { limit, offset }),
    queryFn: () =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items?limit=${limit}&offset=${offset}`,
      ),
    enabled: !!name,
    placeholderData: keepPreviousData,
  })
}

export function useTextQuery(name, queryText, { nResults = 10, where } = {}) {
  return useQuery({
    queryKey: keys.textQuery(name, queryText, { nResults, where }),
    queryFn: () =>
      request(
        `/api/collections/${encodeURIComponent(name)}/query`,
        jsonInit("POST", { queryText, nResults, where }),
      ),
    enabled: !!name && !!queryText,
  })
}

export function useMetadataQuery(name, where, { limit = 50, offset = 0 } = {}) {
  return useQuery({
    queryKey: keys.metadataQuery(name, where, { limit, offset }),
    queryFn: () =>
      request(
        `/api/collections/${encodeURIComponent(name)}/where`,
        jsonInit("POST", { where, limit, offset }),
      ),
    enabled: !!name && !!where,
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

export function useAddItems(name) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, documents, metadatas, embeddings }) =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items`,
        jsonInit("POST", { ids, documents, metadatas, embeddings }),
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: keys.items(name) }),
  })
}

export function useUpdateItem(name) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, document, metadata }) =>
      request(
        `/api/collections/${encodeURIComponent(name)}/items/${encodeURIComponent(id)}`,
        jsonInit("PATCH", { document, metadata }),
      ),
    onSuccess: () =>
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
