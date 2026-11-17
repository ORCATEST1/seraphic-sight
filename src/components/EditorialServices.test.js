import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { PropertyEditorial, ConstructionEditorial } from "./EditorialServices";

beforeAll(() => {
  window.matchMedia = () => ({
    matches:true,addListener:()=>{},removeListener:()=>{},addEventListener:()=>{},removeEventListener:()=>{}
  });
});

test("property page retains actual published pricing and routes quote CTA", () => {
  render(<MemoryRouter><PropertyEditorial/></MemoryRouter>);
  expect(screen.getByRole("heading",{name:/Show the place/i})).toBeInTheDocument();
  expect(screen.getByText("$249")).toBeInTheDocument();
  expect(screen.getByText("$399")).toBeInTheDocument();
  expect(screen.getByText("$599")).toBeInTheDocument();
  expect(screen.getAllByRole("link",{name:/ENQUIRE/}).length).toBe(3);
});

test("construction page qualifies maps as scope-dependent", () => {
  render(<MemoryRouter><ConstructionEditorial/></MemoryRouter>);
  expect(screen.getByRole("heading",{name:/Make progress visible/i})).toBeInTheDocument();
  expect(screen.getByText(/Aerial mapping is not a replacement for a licensed boundary/)).toBeInTheDocument();
});
