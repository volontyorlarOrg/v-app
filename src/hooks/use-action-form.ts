"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
  type RefObject,
} from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import type { z } from "zod";

import { idleResult, type ActionResult } from "@/lib/api/action-result";

export type FormAction = (
  previous: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

type ValidatingForm = {
  handleSubmit: (onValid: () => void) => (event: FormEvent<HTMLFormElement>) => unknown;
};

export function useActionOutcome(
  pending: boolean,
  result: ActionResult,
  onSettled: (result: ActionResult) => void,
) {
  const wasPending = useRef(false);
  const callback = useRef(onSettled);

  useEffect(() => {
    callback.current = onSettled;
  });

  useEffect(() => {
    if (wasPending.current && !pending) callback.current(result);
    wasPending.current = pending;
  }, [pending, result]);
}

export function useValidatedSubmit(
  form: ValidatingForm,
  formRef: RefObject<HTMLFormElement | null>,
) {
  return (dispatch: (formData: FormData) => void) =>
    (event: FormEvent<HTMLFormElement>) =>
      form.handleSubmit(() => {
        const element = formRef.current;
        if (!element) return;
        const data = new FormData(element);
        startTransition(() => dispatch(data));
      })(event);
}

export function useActionForm<TValues extends FieldValues>({
  schema,
  defaultValues,
  action,
  onSuccess,
}: {
  schema: z.ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
  action: FormAction;
  onSuccess?: () => void;
}) {
  const form = useForm<TValues>({ resolver: zodResolver(schema), defaultValues });
  const [result, dispatch, pending] = useActionState(action, idleResult);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useValidatedSubmit(form, formRef);

  useActionOutcome(pending, result, (settled) => {
    if (settled.status === "ok") onSuccess?.();
  });

  return {
    form,
    formRef,
    result,
    pending,
    formProps: {
      ref: formRef,
      action: dispatch,
      noValidate: true,
      onSubmit: submit(dispatch),
    },
  };
}
