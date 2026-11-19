import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import ServiceAreaMap from "./ServiceAreaMap";

test("coverage map lists the regions and changes details when selected", () => {
  render(<MemoryRouter><ServiceAreaMap/></MemoryRouter>);
  expect(screen.getByRole("heading",{name:/On site. Across the region./i})).toBeInTheDocument();
  const orange=screen.getByRole("button",{name:/Orange County/});
  fireEvent.click(orange);
  expect(orange).toHaveAttribute("aria-pressed","true");
  expect(screen.getByRole("heading",{name:"Orange County"})).toBeInTheDocument();
  expect(screen.getByText(/Anaheim · Santa Ana · Irvine/)).toBeInTheDocument();
});

test("service map explains coverage markers are not fixed boundaries", () => {
  render(<MemoryRouter><ServiceAreaMap/></MemoryRouter>);
  expect(screen.getByText(/The shaded outline approximates where we typically travel/)).toBeInTheDocument();
  expect(screen.getByText(/weather, and project scope/)).toBeInTheDocument();
});

test("map explains the contiguous shaded footprint is approximate, not a flight boundary", () => {
  render(<MemoryRouter><ServiceAreaMap/></MemoryRouter>);
  expect(screen.getByText(/It is not a strict service limit or guaranteed flight zone/)).toBeInTheDocument();
  expect(screen.getByRole("button",{name:/VIEW FULL AREA/i})).toBeInTheDocument();
});
