export type FormFieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "checkbox"
  | "select"
  | "radio"; // Added radio type

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
  options?: { label: string; value: string | number }[]; // For select and radio fields
  description?: string;
}