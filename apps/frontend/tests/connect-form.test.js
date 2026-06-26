import ConnectForm from "@/components/connect-form";
import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from "react-router";
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';


const server = setupServer(
    http.post("/api/connect", () => new HttpResponse(null, { status: 200 })),
    http.post("/api/connect/cloud", () => new HttpResponse(null, { status: 200 })),
);

const setup = () => {
    const onSubmit = jest.fn()
    render(<MemoryRouter> <ConnectForm onSubmit={onSubmit}/> </MemoryRouter>);
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
    const clickConnect = () => user.click(screen.getByRole('button', { name: /connect/i }))
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
		onSubmit
    }
}

async function setupSuccessCase() {
    const utils = setup()
    await utils.changeTenantInput(utils.form["tenant id"])
    await utils.changeDatabaseInput(utils.form.database)
    await utils.changeIpInput(utils.form["ip address"])
    await utils.clickConnect()
    return utils
}

async function setupSuccessCloud() {
    const utils = setup()
	await utils.clickCloud()
    await utils.changeTenantInput(utils.form["tenant id"])
    await utils.changeDatabaseInput(utils.form.database)
    await utils.changeApiInput(utils.form["api key"])
    await utils.clickConnect()
    return utils
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
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
	
    it("renders the connection fields with correct defaults", () => {
        setup()
        expect(screen.getByLabelText(/tenant id/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/database/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ip address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ip address/i)).toBeEnabled();
        expect(screen.getByLabelText(/api key/i)).toBeDisabled();
    });

    it("connects successfully", async () => {
    	const {onSubmit, form} = await setupSuccessCase()
        const successFrom = {
            tenant: form["tenant id"],
            database: form.database,
            url: form["ip address"]
        }
		expect(onSubmit).toHaveBeenCalledTimes(1);
		expect(onSubmit).toHaveBeenCalledWith(successFrom);
    })

    it("connects to a cloud instance successfully", async() => {
    	const {onSubmit, form} = await setupSuccessCloud()
        const successFrom = {
            tenant: form["tenant id"],
            database: form.database,
            apikey: form["api key"]
        }
		expect(onSubmit).toHaveBeenCalledTimes(1);
		expect(onSubmit).toHaveBeenCalledWith(successFrom);

    })

    it("requires a url", async() => {
        const {onSubmit, errorMessage} = await setupWithNoAddress()
        expect(onSubmit).not.toHaveBeenCalledTimes(1)
        expect(errorMessage.textContent.trim()).toEqual("IP Address is required")
    })
    
    it("requires an apiKey", async() => {
        const {onSubmit, errorMessage} = await setupWithNoApiKey()
        expect(onSubmit).not.toHaveBeenCalledTimes(1)
        expect(errorMessage.textContent.trim()).toEqual("API key is required")
    })

    it("requires a valid url", async() => {
        const {onSubmit, errorMessage} = await setupWithInvalidAddress()
        expect(onSubmit).not.toHaveBeenCalledTimes(1)
        expect(errorMessage.textContent.trim()).toEqual("URL must start with http:// or https://")
    })
});
