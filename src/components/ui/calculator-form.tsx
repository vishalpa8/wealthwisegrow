import { ReactNode } from "react";
import { FormField } from "./form-field";

export interface CalculatorFormField {
  label: string;
  name: string;
  type?: "text" | "number";
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helpText?: string;
}

interface CalculatorFormProps {
  fields: CalculatorFormField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  errors?: Record<string, string | undefined>;
  children?: ReactNode;
}

export function CalculatorForm({ fields, values, onChange, onBlur, errors = {}, children }: CalculatorFormProps) {
  return (
    <form className="grid grid-cols-1 gap-6 mb-8" autoComplete="off">
      {fields.map((field) => (
        <FormField
          key={field.name}
          label={field.label}
          name={field.name}
          type={field.type ?? "text"}
          placeholder={field.placeholder ?? ""}
          required={field.required ?? false}
          {...(field.min !== undefined ? { min: field.min } : {})}
          {...(field.max !== undefined ? { max: field.max } : {})}
          {...(field.step !== undefined ? { step: field.step } : {})}
          prefix={field.prefix ?? ""}
          suffix={field.suffix ?? ""}
          helpText={field.helpText ?? ""}
          value={values[field.name] ?? ""}
          onChange={(value) => onChange(field.name, value)}
          {...(onBlur ? { onBlur: () => onBlur(field.name) } : {})}
          error={errors[field.name]}
        />
      ))}
      {children}
    </form>
  );
} 