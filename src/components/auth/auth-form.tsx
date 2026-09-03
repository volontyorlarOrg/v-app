"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

import { buttonClass } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Link, useRouter } from "@/i18n/navigation";

export type AuthFieldName = "fullName" | "email" | "password";

export type AuthField = {
  name: AuthFieldName;
  label: string;
  help?: string;
  trailing?: { href: string; label: string };
};

export type PasswordLabels = { show: string; hide: string };

const INPUT_ATTRIBUTES: Record<
  Exclude<AuthFieldName, "password">,
  { type: string; autoComplete: string; inputMode?: "email" }
> = {
  fullName: { type: "text", autoComplete: "name" },
  email: { type: "email", autoComplete: "email", inputMode: "email" },
};

export function AuthForm({
  fields,
  submitLabel,
  destination,
  passwordLabels,
  newPassword = false,
}: {
  fields: readonly AuthField[];
  submitLabel: string;
  destination: string;
  passwordLabels: PasswordLabels;
  newPassword?: boolean;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    router.push(destination);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {fields.map((field) => (
        <Field
          key={field.name}
          label={field.label}
          help={field.help}
          trailing={
            field.trailing ? (
              <Link
                href={field.trailing.href}
                className="text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
              >
                {field.trailing.label}
              </Link>
            ) : undefined
          }
        >
          {(control) =>
            field.name === "password" ? (
              <div className="relative">
                <Input
                  {...control}
                  name={field.name}
                  type={revealed ? "text" : "password"}
                  autoComplete={newPassword ? "new-password" : "current-password"}
                  className="pr-12"
                />
                <button
                  type="button"
                  aria-pressed={revealed}
                  aria-label={revealed ? passwordLabels.hide : passwordLabels.show}
                  onClick={() => setRevealed((value) => !value)}
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-lg text-ink-muted transition-colors hover:text-primary-ink"
                >
                  {revealed ? (
                    <EyeOff aria-hidden="true" className="size-5" />
                  ) : (
                    <Eye aria-hidden="true" className="size-5" />
                  )}
                </button>
              </div>
            ) : (
              <Input {...control} name={field.name} {...INPUT_ATTRIBUTES[field.name]} />
            )
          }
        </Field>
      ))}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass({ className: "mt-1 w-full" })}
      >
        {submitLabel}
      </button>
    </form>
  );
}
