import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test/renderWithProviders.jsx";
import Navbar from "./Navbar.jsx";

const menuButton = () => screen.getByRole("button", { name: "Account menu" });

// bug: profile menu sirf profile button dobara dabane se band hota tha
describe("Navbar profile menu", () => {
    it("closes when you tap anywhere outside it", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <>
                <Navbar />
                <p>page content</p>
            </>,
        );

        await user.click(menuButton());
        expect(screen.getByText("Account & credits")).toBeInTheDocument();

        await user.click(screen.getByText("Account & credits").closest("div")); // menu ke andar — khula rahe
        expect(screen.getByText("Account & credits")).toBeInTheDocument();

        await user.click(screen.getByText("page content"));
        expect(screen.queryByText("Account & credits")).not.toBeInTheDocument();
    });

    it("closes with Escape, and the button still toggles", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Navbar />);

        await user.click(menuButton());
        await user.keyboard("{Escape}");
        expect(screen.queryByText("Account & credits")).not.toBeInTheDocument();

        await user.click(menuButton());
        await user.click(menuButton());
        expect(screen.queryByText("Account & credits")).not.toBeInTheDocument();
    });
});
