import { useState } from "react"
import { useNavigate } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    FieldError,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"

function ConnectForm({onSubmit}) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            tenant: "",
            database: "",
            isCloud: false,
            apikey: "",
            address: "",
        },
    })

    const isCloud = watch("isCloud")
    const [connectError, setConnectError] = useState(null)
    const navigate = useNavigate()

    const onValid = async (data) => {
        setConnectError(null)
        const path = data.isCloud ? "/api/connect/cloud" : "/api/connect"
        const body = data.isCloud
            ? { apikey: data.apikey, tenant: data.tenant, database: data.database }
            : { url: data.address, tenant: data.tenant, database: data.database }

        const res = await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (!res.ok) {
            const { error } = await res.json().catch(() => ({}))
            setConnectError(error ?? res.statusText)
            return
        }
        onSubmit(body)
        navigate("/dashboard")
    }

    return (
        <div className="flex h-screen">
            <Card className="w-full max-w-xs m-auto">
                <CardHeader>
                    <CardTitle>Connect to your ChromaDB instance</CardTitle>
                </CardHeader>
                <CardContent>
                    <form id="form" noValidate onSubmit={handleSubmit(onValid)}>
                        <FieldGroup>
                            <Field data-invalid={errors.tenant}>
                                <FieldLabel htmlFor="tenant">Tenant ID</FieldLabel>
                                <Input
                                    id="tenant"
                                    type="text"
                                    placeholder="default_tenant"
                                    {...register("tenant")}
                                />
                                <FieldError>{errors.tenant?.message}</FieldError>
                            </Field>

                            <Field data-invalid={errors.database}>
                                <FieldLabel htmlFor="database">Database</FieldLabel>
                                <Input
                                    id="database"
                                    type="text"
                                    placeholder="default_database"
                                    {...register("database")}
                                />
                                <FieldError>{errors.database?.message}</FieldError>
                            </Field>

                            <Field orientation="horizontal">
                                <Controller
                                    name="isCloud"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="isCloud"
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked)
                                                if (checked) setValue("address", "")
                                                else setValue("apikey", "")
                                            }}
                                        />
                                    )}
                                />
                                <FieldLabel htmlFor="isCloud">ChromaCloud?</FieldLabel>
                            </Field>

                            <Field
                                data-disabled={!isCloud}
                                data-invalid={errors.apikey}
                            >
                                <FieldLabel htmlFor="apikey">
                                    API key<span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    id="apikey"
                                    type="text"
                                    placeholder="ww-BdCcfi7aNpW9eQ4vqiOlQOIjr7TSQqgvUBRaVeqNuOU3"
                                    disabled={!isCloud}
                                    {...register("apikey", {
                                        required: isCloud ? "API key is required" : false,
                                    })}
                                />
                                <FieldError>{errors.apikey?.message}</FieldError>
                            </Field>

                            <Field
                                data-disabled={isCloud}
                                data-invalid={errors.address}
                            >
                                <FieldLabel htmlFor="address">
                                    IP Address<span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    id="address"
                                    type="text"
                                    placeholder="http://localhost:8000"
                                    disabled={isCloud}
                                    {...register("address", {
                                        required: !isCloud ? "IP Address is required" : false,
                                        pattern: !isCloud
                                            ? {
                                                value: /^https?:\/\//i,
                                                message: "URL must start with http:// or https://",
                                            }
                                            : undefined,
                                    })}
                                />
                                <FieldError>{errors.address?.message}</FieldError>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2">
                    <Field orientation="horizontal">
                        <Button type="submit" form="form">
                            Connect
                        </Button>
                    </Field>
                    {connectError && <FieldError>{connectError}</FieldError>}
                </CardFooter>
            </Card>
        </div>
    )
}

export default ConnectForm
