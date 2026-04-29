import { Button } from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"


function ConnectForm(){

  const [checked, setChecked] = useState(false)
  const [tenant, setTenant] = useState("")
  const [database, setDatabase] = useState("")
  const [apikey, setApikey] = useState("")
  const [address, setAddress] = useState("")

  const handleCloudToggle = (checked) => {
    setChecked(checked)
    if (checked) setAddress("")
    else setApikey("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("handle submit", { checked, tenant, database, apikey, address })
  }
  return (
    <div className="flex h-screen">
        <Card className="w-full max-w-xs m-auto">
          <CardHeader>
            <CardTitle>Connect to your ChromaDB instance</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="form" onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                    <FieldLabel>
                    Tenant ID
                    </FieldLabel>
                    <Input
                    type="text"
                    placeholder="1xpggw8E-rUte-0LYHc-KtZ9-e2L6Y4h6xUo"
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
                    required
                    />
                </Field>
                <Field>
                    <FieldLabel>
                    Database
                    </FieldLabel>
                    <Input
                    type="text"
                    placeholder="default"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    required
                    />
                </Field>
                <Field orientation="horizontal">
                  <Checkbox checked={checked} onCheckedChange={handleCloudToggle}/>
                  <FieldLabel >ChromaCloud?</FieldLabel>
                </Field>
                <Field data-disabled={!checked}>
                    <FieldLabel>
                    API key
                    </FieldLabel>
                    <Input
                    type="text"
                    placeholder="ww-BdCcfi7aNpW9eQ4vqiOlQOIjr7TSQqgvUBRaVeqNuOU3"
                    value={apikey}
                    onChange={(e) => setApikey(e.target.value)}
                    disabled={!checked}
                    required
                    />
                </Field>
                <Field data-disabled={checked}>
                    <FieldLabel>
                    IP Address
                    </FieldLabel>
                    <Input
                    type="text"
                    placeholder="localhost:3000"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={checked}
                    required
                    />
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal">
              <Button type="submit" form="form">
                Connect
              </Button>
            </Field>
          </CardFooter>
        </Card>
    </div>

  )
}
export default ConnectForm;