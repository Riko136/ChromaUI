import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { renderHook, act } from "@testing-library/react";

describe(useDebouncedValue, () =>{

    it("returns the initial value on first render", () => {
        const { result } = renderHook(() => useDebouncedValue("initial", 300));
        expect(result.current).toBe("initial");
    });

    it("does not update immediately when value changes", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: "a" } }
        );

        rerender({ value: "ab" });
        expect(result.current).toBe("a"); 
    });


    it("updates to the latest value after the delay", async () => {
        jest.useFakeTimers();
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: "a" } }
        );

        rerender({ value: "ab" });
        act(() => jest.advanceTimersByTime(300));

        expect(result.current).toBe("ab");
        jest.useRealTimers();
    });

    it("only reflects the latest value when changes happen faster than the delay", () => {
        jest.useFakeTimers();
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: "a" } }
        );

        rerender({ value: "ab" });
        act(() => jest.advanceTimersByTime(100)); 

        expect(result.current).toBe("a");

        rerender({ value: "abc" });
        act(() => jest.advanceTimersByTime(100)); 

        expect(result.current).toBe("a"); 

        act(() => jest.advanceTimersByTime(300)); 
        expect(result.current).toBe("abc"); 
    });
})