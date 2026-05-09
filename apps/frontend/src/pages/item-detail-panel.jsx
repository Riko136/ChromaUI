import { useEffect, useState } from "react"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Pencil, Copy, Check, Loader2, X } from "lucide-react"
import { useUpdateItem } from "@/lib/queries"
import { cn } from "@/lib/utils"


export default function ItemDetailPanel({ item, onClose, collectionName }) {
  const updateItem = useUpdateItem()

  const saveDocument = (document) =>
    updateItem.mutateAsync({ name: collectionName, id: item.id, document })

  const saveMetadata = (metadata) =>
    updateItem.mutateAsync({ name: collectionName, id: item.id, metadata })

  return (

    <aside className="flex h-full w-full flex-col bg-background">
      <header className="flex h-10 items-center justify-between border-b px-4">
        <h2 className="text-sm font-medium">Record details</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <FieldGroup>
          <EditableField
            label="ID"
            value={item?.id ?? ""}
            readOnly
          />
          <EditableField
            label="Document"
            value={item?.document ?? ""}
            multiline
            onSave={saveDocument}
            isPending={updateItem.isPending}
          />
          <EditableField
            label="Metadata"
            value={item?.metadata ?? null}
            multiline
            onSave={saveMetadata}
            isPending={updateItem.isPending}
            serialize={(v) => (v == null ? "" : JSON.stringify(v, null, 2))}
            parse={(s) => {
              const t = s.trim()
              if (!t) return undefined
              try {
                return JSON.parse(t)
              } catch {
                throw new Error("Must be valid JSON")
              }
            }}
          />
          <EditableField
            label="Embedding"
            value={item?.embedding ?? null}
            readOnly
            serialize={(v) => (Array.isArray(v) && v.length ? JSON.stringify(v) : "")}
          />
        </FieldGroup>
        {updateItem.isError && (
          <p className="mt-3 text-sm text-destructive">
            {updateItem.error.message}
          </p>
        )}
      </div>
    </aside>

  )
}

function EditableField({
  label,
  value,
  onSave,
  multiline = false,
  readOnly = false,
  isPending = false,
  serialize = (v) => (v == null ? "" : String(v)),
  parse = (s) => s,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const display = serialize(value)


  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 800)
    return () => clearTimeout(id)
  }, [copied])

  const startEdit = () => {
    setDraft(display)
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setError(null)
    setDraft(display)
  }

  const save = async () => {
    setError(null)
    let parsed
    try {
      parsed = parse(draft)
      await onSave(parsed)
      setEditing(false)
    } catch (e) {
      setError(e.message)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(display)
      setCopied(true)
    } catch (e) {
      setError(e.message)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault()
      cancel()
    } else if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      save()
    }
  }

  return (
    <Field className="group">
      <div className="flex items-center justify-between min-h-7">
        <FieldLabel>{label}</FieldLabel>
        {!editing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={copy}
              aria-label={`Copy ${label}`}
              title="Copy"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
            {!readOnly && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={startEdit}
                aria-label={`Edit ${label}`}
                title="Edit"
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          {multiline ? (
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
              rows={8}
              className="font-mono text-xs field-sizing-fixed overflow-y-auto"
            />
          ) : (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
            />
          )}
          {error && <FieldError>{error}</FieldError>}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={isPending}
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : multiline ? (
        <pre
          className={cn(
            "whitespace-pre-wrap break-words text-sm font-mono rounded-md border bg-muted/30 px-3 py-2 overflow-auto resize-y h-[20lh]",
            !display && "text-muted-foreground"
          )}
        >
          {display || "—"}
        </pre>
      ) : (
        <Label
          className={cn(
            "block w-full text-sm rounded-md truncate",
            !display && "text-muted-foreground"
          )}
        >
          {display || "—"}
        </Label>
      )}
    </Field>
  )
}
