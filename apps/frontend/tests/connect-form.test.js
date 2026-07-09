import ConnectForm from "@/components/connect-form";
import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from "react-router";


const setup = () => {
    render(<MemoryRouter> <ConnectForm/> </MemoryRouter>);
    const user = userEvent.setup()
    const form = { "tenant id": "default Tenant", database: "default Database", "ip address": "http://localhost:1234", "invalid ip address": "localhost:1234", "api key": "apikey"}
    const changeTenantInput = (value) =>
        user.type(screen.getByLabelText(/tenant id/i), value)
    const changeDatabaseInput = (value) =>
        user.type(screen.getByLabelText(/database/i), value)
    const changeIpInput = (value) =>
        user.type(screen.getByLabelText(/ip address/i), value)
    const changeApiInput = (value) =>
        user.type(screen.getByLabelText(/api key/i), value)
    const clickConnect = () => user.click(screen.getByRole('button', { name: "Connect" }))
    const clickCloud = () => user.click(screen.getByRole('checkbox', { name: /chromacloud/i }))

    return {
        user,
        form,
        changeTenantInput,
        changeDatabaseInput,
        changeIpInput,
        changeApiInput,
        clickConnect,
        clickCloud,
    }
}

async function setupWithNoAddress() {
    const utils = setup()
    await utils.changeTenantInput(utils.form["tenant id"])
    await utils.changeDatabaseInput(utils.form.database)
    await utils.clickConnect()
    const errorMessage = screen.getByRole('alert')
    return { ...utils, errorMessage }
}

async function setupWithInvalidAddress() {
    const utils = setup()
    await utils.changeTenantInput(utils.form["tenant id"])
    await utils.changeDatabaseInput(utils.form.database)
    await utils.changeIpInput(utils.form["invalid ip address"])
    await utils.clickConnect()
    const errorMessage = screen.getByRole('alert')
    return { ...utils, errorMessage }
}

async function setupWithNoApiKey() {
    const utils = setup()
    await utils.changeTenantInput(utils.form["tenant id"])
    await utils.changeDatabaseInput(utils.form.database)
    await utils.clickCloud()
    await utils.clickConnect()
    const errorMessage = screen.getByRole('alert')
    return { ...utils, errorMessage }
}

describe(ConnectForm, () => {
	
    it("renders the connection fields with correct defaults", () => {
        setup()
        expect(screen.getByLabelText(/tenant id/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/database/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ip address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ip address/i)).toBeEnabled();
        expect(screen.getByLabelText(/api key/i)).toBeDisabled();
    });



    it("requires a url", async() => {
        const {errorMessage} = await setupWithNoAddress()
        expect(errorMessage.textContent.trim()).toEqual("IP Address is required")
    })
    
    it("requires an apiKey", async() => {
        const {errorMessage} = await setupWithNoApiKey()
        expect(errorMessage.textContent.trim()).toEqual("API key is required")
    })

    it("requires a valid url", async() => {
        const {errorMessage} = await setupWithInvalidAddress()
        expect(errorMessage.textContent.trim()).toEqual("URL must start with http:// or https://")
    })
});
