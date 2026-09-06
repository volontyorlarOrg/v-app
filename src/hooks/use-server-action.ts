"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { useEffect } from "react";

import { failedResult, type ActionResult } from "@/lib/api/action-result";

export type ActionFailure = Extract<ActionResult, { status: "error" }>;

export class ServerActionError extends Error {
  readonly result: ActionFailure;

  constructor(result: ActionFailure) {
    super(result.code);
    this.name = "ServerActionError";
    this.result = result;
  }
}

type ServerAction<TInput> = (input: TInput) => Promise<ActionResult>;

type ServerActionOptions<TInput> = Omit<
  UseMutationOptions<ActionResult, ServerActionError, TInput>,
  "mutationFn"
>;

export function useServerAction<TInput = void>(
  action: ServerAction<TInput>,
  options: ServerActionOptions<TInput> = {},
) {
  return useMutation<ActionResult, ServerActionError, TInput>({
    ...options,
    mutationFn: async (input) => {
      let result: ActionResult;
      try {
        result = await action(input);
      } catch {
        throw new ServerActionError(failedResult("server") as ActionFailure);
      }
      if (result.status === "error") throw new ServerActionError(result);
      return result;
    },
  });
}

export function useOptimisticServerAction<TValue>(
  value: TValue,
  action: ServerAction<TValue>,
  options: ServerActionOptions<TValue> = {},
) {
  const mutation = useServerAction(action, options);
  const { reset } = mutation;

  useEffect(() => {
    reset();
  }, [value, reset]);

  const optimistic =
    mutation.isPending || mutation.isSuccess ? (mutation.variables as TValue) : value;

  return { ...mutation, optimistic };
}
