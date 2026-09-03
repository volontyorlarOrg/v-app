import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render";
import { Field, Input } from "./field";

describe("Field", () => {
  it("associates the label with the control", () => {
    renderWithIntl(<Field label="Full name">{(props) => <Input {...props} />}</Field>);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });

  it("does not mark a healthy field invalid", () => {
    renderWithIntl(<Field label="Full name">{(props) => <Input {...props} />}</Field>);

    expect(screen.getByLabelText("Full name")).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-invalid and links the error message when there is one", () => {
    renderWithIntl(
      <Field label="Full name" error="This is required.">
        {(props) => <Input {...props} />}
      </Field>,
    );

    const input = screen.getByLabelText("Full name");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/This is required\./);
  });

  it("announces the error, so a failed submit is perceivable without sight", () => {
    renderWithIntl(
      <Field label="Full name" error="This is required.">
        {(props) => <Input {...props} />}
      </Field>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("This is required.");
  });

  it("links help text as a description", () => {
    renderWithIntl(
      <Field label="Phone" help="Shared only after you apply.">
        {(props) => <Input {...props} />}
      </Field>,
    );

    expect(screen.getByLabelText("Phone")).toHaveAccessibleDescription(
      /Shared only after you apply\./,
    );
  });

  it("describes the field by both the error and the help text", () => {
    renderWithIntl(
      <Field label="Phone" help="Include the country code." error="Invalid.">
        {(props) => <Input {...props} />}
      </Field>,
    );

    const description =
      screen.getByLabelText("Phone").getAttribute("aria-describedby") ?? "";

    expect(description.split(" ")).toHaveLength(2);
    expect(screen.getByLabelText("Phone")).toHaveAccessibleDescription(
      /Invalid\..*country code/s,
    );
  });

  it("marks an optional field so required is not the assumed default", () => {
    renderWithIntl(
      <Field label="Bio" optionalLabel="Optional">
        {(props) => <Input {...props} />}
      </Field>,
    );

    expect(screen.getByText("(Optional)")).toBeInTheDocument();
  });

  it("does not add the optional marker to a required field", () => {
    renderWithIntl(
      <Field label="Full name" required optionalLabel="Optional">
        {(props) => <Input {...props} />}
      </Field>,
    );

    expect(screen.queryByText("(Optional)")).not.toBeInTheDocument();
  });

  it("gives each instance a unique id so two fields cannot collide", () => {
    renderWithIntl(
      <>
        <Field label="First">{(props) => <Input {...props} />}</Field>
        <Field label="Second">{(props) => <Input {...props} />}</Field>
      </>,
    );

    expect(screen.getByLabelText("First").id).not.toBe(
      screen.getByLabelText("Second").id,
    );
  });
});
