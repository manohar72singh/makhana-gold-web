"use client";

import { useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

type Option = { value: string; label: string };

/**
 * MUI's Select-as-TextField warns ("changing the default value state of an
 * uncontrolled Select") the moment a user actually picks a different option
 * while only `defaultValue` is passed — it expects controlled `value` for
 * any select the user interacts with. This wraps that pattern once so every
 * admin status/type dropdown stays warning-free without duplicating state.
 */
export function ControlledSelectField({
  name,
  defaultValue,
  options,
  ...rest
}: {
  name: string;
  defaultValue: string;
  options: Option[];
} & Omit<TextFieldProps, "select" | "value" | "onChange" | "defaultValue">) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TextField
      {...rest}
      select
      name={name}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
