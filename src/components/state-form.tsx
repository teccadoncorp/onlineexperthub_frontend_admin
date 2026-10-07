"use client";

import { Alert, Flex } from "antd";
import { useActionState } from "react";
type FormState = { error?: string };

export function StateForm({
  action,
  children,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction}>
      {state.error ? <Alert type="error" showIcon title={state.error} style={{ marginBottom: 12 }} /> : null}
      <fieldset disabled={pending} style={{ border: 0, margin: 0, padding: 0 }}>
        <Flex vertical gap={12}>
          {children}
        </Flex>
      </fieldset>
    </form>
  );
}
