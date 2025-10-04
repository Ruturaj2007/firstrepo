"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { FormField } from "@/types/form";

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  formTitle?: string;
  formDescription?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  formTitle,
  formDescription,
}) => {
  const schema = z.object(
    fields.reduce((acc, field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case "email":
          fieldSchema = z.string().email("Invalid email address");
          if (field.required) {
            fieldSchema = fieldSchema.min(1, `${field.label} is required`);
          }
          if (field.minLength) {
            fieldSchema = fieldSchema.min(
              field.minLength,
              `${field.label} must be at least ${field.minLength} characters`,
            );
          }
          if (field.maxLength) {
            fieldSchema = fieldSchema.max(
              field.maxLength,
              `${field.label} must be at most ${field.maxLength} characters`,
            );
          }
          break;
        case "number":
          fieldSchema = z.coerce.number();
          if (field.required) {
            // For numbers, required means a value must be present.
            // If 0 is a valid input, this might need adjustment.
            // For now, assuming a non-empty number is required.
            fieldSchema = fieldSchema.refine((val) => val !== null && val !== undefined, {
              message: `${field.label} is required`,
            });
          }
          if (field.minLength) {
            fieldSchema = fieldSchema.min(
              field.minLength,
              `${field.label} must be at least ${field.minLength}`,
            );
          }
          if (field.maxLength) {
            fieldSchema = fieldSchema.max(
              field.maxLength,
              `${field.label} must be at most ${field.maxLength}`,
            );
          }
          break;
        case "checkbox":
          fieldSchema = z.boolean();
          if (field.required) {
            fieldSchema = fieldSchema.refine((val) => val === true, {
              message: `${field.label} must be checked`,
            });
          }
          // minLength and maxLength are not applicable for checkboxes
          break;
        case "select":
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, `${field.label} is required`);
          }
          break;
        case "text":
        case "textarea":
        default:
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, `${field.label} is required`);
          }
          if (field.minLength) {
            fieldSchema = fieldSchema.min(
              field.minLength,
              `${field.label} must be at least ${field.minLength} characters`,
            );
          }
          if (field.maxLength) {
            fieldSchema = fieldSchema.max(
              field.maxLength,
              `${field.label} must be at most ${field.maxLength} characters`,
            );
          }
          break;
      }

      if (field.pattern) {
        fieldSchema = fieldSchema.regex(
          field.pattern,
          `${field.label} format is invalid`,
        );
      }

      acc[field.name] = fieldSchema;
      return acc;
    }, {} as Record<string, z.ZodTypeAny>),
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? "";
      if (field.type === "checkbox") {
        acc[field.name] = field.defaultValue ?? false;
      }
      return acc;
    }, {} as Record<string, any>),
  });

  const handleSubmit = (data: z.infer<typeof schema>) => {
    onSubmit(data);
    toast({
      title: "Form Submitted!",
      description: "Check the console for submitted data.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {formTitle && <h2 className="text-2xl font-bold">{formTitle}</h2>}
        {formDescription && <p className="text-muted-foreground">{formDescription}</p>}
        {fields.map((field) => (
          <ShadcnFormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === "textarea" ? (
                    <Textarea
                      placeholder={field.placeholder}
                      {...formField}
                      value={formField.value || ""}
                    />
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formField.value}
                        onCheckedChange={formField.onChange}
                      />
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.label}
                      </label>
                    </div>
                  ) : field.type === "select" && field.options ? (
                    <Select
                      onValueChange={formField.onChange}
                      defaultValue={formField.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      {...formField}
                      value={formField.value || ""}
                    />
                  )}
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default DynamicForm;