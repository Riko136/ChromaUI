import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useCreateCollection, useUpdateCollection } from "@/lib/queries"
import { Textarea } from "@/components/ui/textarea"

function CollectionDialog({ open, onOpenChange, mode, initial }) {
  const createCollection = useCreateCollection()
  const updateCollection = useUpdateCollection()
  const mutation = mode === "edit" ? updateCollection : createCollection

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
     defaultValues: {
        name: "",
        metadata: "" 
      }
    })

  useEffect(() => {
    if (!open) {
      reset()
      mutation.reset()
      return
    }
    reset({
      name: mode === "edit" ? initial?.name ?? "" : "",
      metadata: mode === "edit" ? JSON.stringify(initial?.metadata) ?? "" : "",
    })
  }, [open])



  const createCollectionHandler = async ({ name, metadata}) => {
    
    await createCollection.mutateAsync({ 
      name: name.trim(), 
      metadata: metadata ? JSON.parse(metadata.trim()) : undefined
    })
    onOpenChange(false)


  }

  const editCollectionHandler = async({name, metadata}) => {

    await updateCollection.mutateAsync({
      originalName: initial.name,
      name: name.trim(), 
      metadata: metadata ? JSON.parse(metadata.trim()) : undefined
    })
    
  }

  const callBackDecider = (name, metadata) => {
    if(mode === "edit") editCollectionHandler(name, metadata)
    else createCollectionHandler(name, metadata)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> {mode === "edit" ? "Edit collection" : "New collection"}</DialogTitle>
        </DialogHeader>
        <form id="create-collection" noValidate onSubmit={handleSubmit(callBackDecider)}>
          <FieldGroup>
            <Field data-invalid={errors.name}>
              <FieldLabel htmlFor="name">
                Name<span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="name"
                type="text"
                autoFocus
                {...register("name", {
                  required: "Name is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+$/,
                    message: "Letters, digits, dot, underscore, hyphen only",
                  },
                  minLength: { value: 3, message: "At least 3 characters" },
                })}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field data-invalid={errors.metadata}>
              <FieldLabel htmlFor="metadata">Metadata</FieldLabel>
              <Textarea 
                id="metadata"
                placeholder="Collection metadata"
                {...register("metadata", {
                  validate: (v) => {
                    if(!v.trim()) return true
                    try {JSON.parse(v); return true}
                    catch {return "Must be valid JSON"}
                  }})}/>
              <FieldError>{errors.metadata?.message}</FieldError>
            </Field>
            {mutation.isError && (
              <FieldError>{mutation.error.message}</FieldError>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-collection"
            disabled={mutation.isPending}
          >
            {mode === "edit" ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CollectionDialog
