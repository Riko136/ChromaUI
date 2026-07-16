import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from "react-router";
import ConnectForm from '@/components/connect-form';

const ip = "http://localhost:1234"

const ipBad= "http://localhost:1111"

const server = setupServer(
    http.post("/api/connect", async ({request}) => {
        const body = await request.json();
        if(body.url === ip) return new HttpResponse(null, { status: 200 })
        return HttpResponse.json({error: "failed to connect"}, {status: 401})
    }),
);

const setup = () => {
    render(
        <MemoryRouter initialEntries={["/connect"]}>
            <Routes>
                <Route path="/connect" element={<ConnectForm />} />
                <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            </Routes>
        </MemoryRouter>
    );
    const user = userEvent.setup()
    const changeIpInput = (value) =>
        user.type(screen.getByLabelText(/ip address/i), value)
    const clickConnect = () => user.click(screen.getByRole('button', { name: "Connect" }))

    return {
        user,
        changeIpInput,
        clickConnect,
    }
}

async function setupSuccessCase() {
    const utils = setup()
    await utils.changeIpInput(ip)
    await utils.clickConnect()
}

async function setupFailCase() {
    const utils = setup()
    await utils.changeIpInput(ipBad)
    await utils.clickConnect()
}

describe("Connection E2E", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it("connects successfully", async () => {
    	await setupSuccessCase()
        expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
    })  

    it("fails to connect successfully", async () => {
        await setupFailCase()
        expect((screen.getByRole('alert')).textContent.trim()).toEqual("failed to connect")
    })

})