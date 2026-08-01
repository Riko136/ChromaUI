import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "@/components/search-bar";

const setup = (overrides = {}) => {
    const setInput = jest.fn();
    const setMode = jest.fn();
    
    const defaultProps = {
        input: "",
        setInput: setInput,
        mode: ["text"],
        setMode: setMode,
        disabled: false,
    };

    const props = { ...defaultProps, ...overrides };
    const user = userEvent.setup();

    render(<SearchBar {...props} />);

    return { ...props, user };
};

describe("SearchBar", () => {

    it("renders with all three mode toggle options", () => {
        setup();
        expect(screen.getByPlaceholderText("Search documents...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Text" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Semantic" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Regex" })).toBeInTheDocument();
    })

    it("renders the search input with the current value", () => {
        setup({ input: "hello" });
        expect(screen.getByPlaceholderText("Search documents...")).toHaveValue("hello");
    });

    it("calls setInput when the user types", async () => {
        const { user, setInput } = setup();

        await user.type(screen.getByPlaceholderText("Search documents..."), "a");

        expect(setInput).toHaveBeenCalledWith("a");
    });

    it("does not render the clear button when input is empty", () => {
        setup({ input: "" });
        expect(screen.queryByRole("button", { name: /clear search/i })).not.toBeInTheDocument();
        expect(screen.queryAllByRole("button")).toHaveLength(3); 
    });

    it("renders the clear button when input has a value", () => {
        setup({ input: "search term" });
        expect(screen.getByRole("button", { name: /clear search/i })).toBeInTheDocument();
    });

    it("clears the input when the clear button is clicked", async () => {
        const { user, setInput } = setup({ input: "search term" });
        const clearButton = screen.getByRole("button", { name: /clear search/i })
        await user.click(clearButton);
        expect(setInput).toHaveBeenCalledWith("");
    });

    it("calls setMode with the selected mode when a toggle option is clicked", async () => {
        const { user, setMode } = setup();

        await user.click(screen.getByRole("button", { name: "Semantic" }));

        expect(setMode).toHaveBeenCalledWith(["semantic"]);
    });

    it("disables the input when disabled is true", () => {
        setup({ disabled: true });
        expect(screen.getByPlaceholderText("Search documents...")).toBeDisabled();
    });

    it("disables the mode toggle group when disabled is true", () => {
        setup({ disabled: true });
        expect(screen.getByRole("button", { name: "Text" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Semantic" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Regex" })).toBeDisabled();
    });
});