"use client";

import { Checkbox, Radio, Select } from "antd";
import { useState } from "react";

export function NamedSelect({
  name,
  defaultValue = "",
  options,
  placeholder,
  onValue,
}: {
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onValue?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        style={{ width: "100%" }}
        value={value || undefined}
        placeholder={placeholder}
        options={options}
        onChange={(next) => {
          setValue(next);
          onValue?.(next);
        }}
      />
    </>
  );
}

export function NamedCheck({
  name,
  value = "on",
  defaultChecked,
  children,
}: {
  name: string;
  value?: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  const [checked, setChecked] = useState(Boolean(defaultChecked));
  return (
    <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)}>
      {checked ? <input type="hidden" name={name} value={value} /> : null}
      {children}
    </Checkbox>
  );
}

export function NamedRadios({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Radio.Group
        value={value}
        options={options}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  );
}
