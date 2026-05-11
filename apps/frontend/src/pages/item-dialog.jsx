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
import { useAddItems } from "@/lib/queries"
import { Textarea } from "@/components/ui/textarea"

function ItemDialog({ open, onOpenChange, collection }) {
  const addItem = useAddItems()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
       defaultValues: {
          id: "",
          document: "",
          metadata: "" 
        }
      })

  useEffect(() => {
    if (!open) {
      reset()
      addItem.reset()
      return
    }
  }, [open])


  const onValid = async ({id, document, metadata}) =>{
    await addItem.mutateAsync({
      name: collection.name, 
      ids: [id.trim()],
      documents: [document.trim()], 
      metadatas: metadata ? [JSON.parse(metadata.trim())] : undefined
    })
    onOpenChange(false)
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Record</DialogTitle>
        </DialogHeader>
        <form id="add-item" noValidate onSubmit={handleSubmit(onValid)}>
          <FieldGroup>
            <Field data-invalid={errors.id}>
              <FieldLabel htmlFor="id">
                ID<span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="id"
                type="text"
                autoFocus
                {...register("id", {
                  required: "id is required"
                })}
              />
              <FieldError>{errors.id?.message}</FieldError>
            </Field>
            <Field data-invalid={errors.document}>
              <FieldLabel htmlFor="document">
                Document<span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea 
                id="document"
                placeholder="Lorem ipsum dolor sit amet consectetur adipiscing elit..."
                className={"field-sizing-fixed"}
                {...register("document", {
                  required: "document is required"
                  })}/>
              <FieldError>{errors.document?.message}</FieldError>
            </Field>
            <Field data-invalid={errors.metadata}>
              <FieldLabel htmlFor="metadata">Metadata</FieldLabel>
              <Textarea 
                id="metadata"
                placeholder="Record metadata"
                className={"field-sizing-fixed"}
                {...register("metadata", {
                  validate: (v) => {
                    if(!v.trim()) return true
                    try {JSON.parse(v); return true}
                    catch {return "Must be valid JSON"}
                  }})}/>
              <FieldError>{errors.metadata?.message}</FieldError>
            </Field>
            {addItem.isError && (
              <FieldError>{addItem.error.message}</FieldError>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={addItem.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-item"
            disabled={addItem.isPending}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ItemDialog
