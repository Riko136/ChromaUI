import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

import { SearchIcon } from "lucide-react"
import { Field } from "@/components/ui/field"

import { X  } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function SearchBar({input, setInput, mode, setMode}){



    return (
     
        <Field className={"max-w-sm"}>
            <InputGroup>
            <InputGroupInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search documents..." />
            <InputGroupAddon align="inline-start">
                <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
            
            <InputGroupAddon align="inline-end right-0" >
                {input && <InputGroupButton variant="ghost" onClick={() => setInput("")}><X /></InputGroupButton>}
                <ToggleGroup variant="outline" defaultValue={["text"]} value={mode} onValueChange={(value) => setMode(value)}>
                    <ToggleGroupItem value={"text"} >Text</ToggleGroupItem>
                    <ToggleGroupItem value={"semantic"}>Semantic</ToggleGroupItem>
                    <ToggleGroupItem value={"regex"}>Regex</ToggleGroupItem>
                </ToggleGroup>
            </InputGroupAddon>
            </InputGroup> 
        </Field>

        
    )
}



