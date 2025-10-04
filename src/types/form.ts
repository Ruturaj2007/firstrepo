export type FormFieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "checkbox"
  | "select";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp; // For custom regex validation
  options?: { label: string; value: string | number }[]; // For select fields
  description?: string;
}