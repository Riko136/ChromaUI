import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { useCreateCollection } from "@/lib/queries"
import { Textarea } from "@/components/ui/textarea"

function CollectionDialog({ open, onOpenChange, mode, initial }) {
  const createCollection = useCreateCollection()
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
      createCollection.reset()
      return
    }
    reset({
      name: mode === "edit" ? initial?.name ?? "" : "",
      metadata: mode === "edit" ? initial?.metadata ?? "" : "",
    })
  }, [open])



  const createCollectionHandler = async ({ name, metadata}) => {
    
    await createCollection.mutateAsync({ name: name.trim(), metadata: metadata })
    onOpenChange(false)


  }

  const editCollectionHandler = async({name, metadata}) => {

    await editCollection.mutateAsync({name: name.trim(), metadata: metadata})
    
  }

  const callBackDecider = () => {
    if(mode === "edit") editCollectionHandler()
    else createCollectionHandler()
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
            <Field>
              <FieldLabel htmlFor="metadata">Metadata</FieldLabel>
              <Textarea 
                id="metadata"
                placeholder="Collection metadata"
                {...register("metadata")}
              />
              <FieldDescription>Make sure to enter a valid JSON</FieldDescription>
            </Field>
            {createCollection.isError && (
              <FieldError>{createCollection.error.message}</FieldError>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createCollection.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-collection"
            disabled={createCollection.isPending}
          >
            {mode === "edit" ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CollectionDialog
