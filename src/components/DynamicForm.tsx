"use client";

import React, { useState } from "react"; // Import useState
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { FormField } from "@/types/form";
import { Loader2 } from "lucide-react"; // Import Loader2 icon

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
  const [sentimentResults, setSentimentResults] = useState<Record<string, string | null>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});

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
          let currentNumberSchema: z.ZodNumber = z.coerce.number();

          if (field.minLength !== undefined) {
            currentNumberSchema = currentNumberSchema.min(
              field.minLength,
              `${field.label} must be at least ${field.minLength}`,
            );
          }
          if (field.maxLength !== undefined) {
            currentNumberSchema = currentNumberSchema.max(
              field.maxLength,
              `${field.label} must be at most ${field.maxLength}`,
            );
          }

          if (field.required) {
            fieldSchema = currentNumberSchema.pipe(z.number({
                invalid_type_error: `${field.label} must be a number`,
                required_error: `${field.label} is required`,
            }));
          } else {
            fieldSchema = currentNumberSchema
              .optional()
              .transform((val) => (val === null || isNaN(val as number) ? undefined : val));
          }
          break;
        case "checkbox":
          fieldSchema = z.boolean();
          if (field.required) {
            fieldSchema = fieldSchema.refine((val) => val === true, {
              message: `${field.label} must be checked`,
            });
          }
          break;
        case "select":
        case "radio":
        case "sentiment-text": // Sentiment text also uses string validation
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

  const saveFormDataToLocalStorage = (data: Record<string, any>) => {
    try {
      const timestamp = new Date().toISOString();
      const savedForms = JSON.parse(localStorage.getItem("dynamicFormsData") || "[]");
      // Include sentiment results if available
      const dataToSave = { ...data };
      for (const fieldName in sentimentResults) {
        if (sentimentResults[fieldName]) {
          dataToSave[`${fieldName}_sentiment`] = sentimentResults[fieldName];
        }
      }
      savedForms.push({ data: dataToSave, timestamp, formTitle: formTitle || "Untitled Form" });
      localStorage.setItem("dynamicFormsData", JSON.stringify(savedForms));
      console.log("Form data saved to localStorage:", { data: dataToSave, timestamp });
    } catch (error) {
      console.error("Failed to save form data to localStorage:", error);
      toast({
        title: "Error saving form data",
        description: "Could not save data to local storage.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (data: z.infer<typeof schema>) => {
    onSubmit(data);
    saveFormDataToLocalStorage(data);
    toast({
      title: "Form Submitted & Saved!",
      description: "Your form data has been saved locally. Check the console for details.",
    });
    form.reset(); // Optionally reset the form after successful submission
    setSentimentResults({}); // Clear sentiment results on form reset
  };

  const analyzeSentiment = async (fieldName: string, text: string) => {
    if (!text.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to analyze sentiment.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing((prev) => ({ ...prev, [fieldName]: true }));
    setSentimentResults((prev) => ({ ...prev, [fieldName]: null })); // Clear previous result

    try {
      // Hardcoded URL for the Supabase Edge Function
      const SUPABASE_EDGE_FUNCTION_URL = "https://rixirvhezeiwsnromykx.supabase.co/functions/v1/analyze-sentiment";

      const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze sentiment");
      }

      const data = await response.json();
      setSentimentResults((prev) => ({ ...prev, [fieldName]: data.sentiment }));
      toast({
        title: "Sentiment Analysis Complete",
        description: `Sentiment for '${fieldName}': ${data.sentiment}`,
      });
    } catch (error: any) {
      console.error("Error analyzing sentiment:", error);
      toast({
        title: "Sentiment Analysis Failed",
        description: error.message || "Could not analyze sentiment. Check console for details.",
        variant: "destructive",
      });
      setSentimentResults((prev) => ({ ...prev, [fieldName]: "Error" }));
    } finally {
      setIsAnalyzing((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4 border rounded-lg shadow-sm bg-card">
        {formTitle && <h2 className="text-2xl font-bold text-center mb-2">{formTitle}</h2>}
        {formDescription && <p className="text-muted-foreground text-center mb-6">{formDescription}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <ShadcnFormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.type === "textarea" || field.type === "sentiment-text" ? ( // Handle sentiment-text here
                      <div className="space-y-2">
                        <Textarea
                          placeholder={field.placeholder}
                          {...formField}
                          value={formField.value || ""}
                        />
                        {field.type === "sentiment-text" && (
                          <div className="flex flex-col space-y-2">
                            <Button
                              type="button"
                              onClick={() => analyzeSentiment(field.name, formField.value)}
                              disabled={isAnalyzing[field.name]}
                              className="w-full"
                            >
                              {isAnalyzing[field.name] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                "Analyze Sentiment"
                              )}
                            </Button>
                            {sentimentResults[field.name] && (
                              <p className="text-sm font-medium">
                                Sentiment:{" "}
                                <span
                                  className={`font-bold ${
                                    sentimentResults[field.name] === "positive"
                                      ? "text-green-600"
                                      : sentimentResults[field.name] === "negative"
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {sentimentResults[field.name]}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                          id={field.name}
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
                    ) : field.type === "radio" && field.options ? (
                      <RadioGroup
                        onValueChange={formField.onChange}
                        defaultValue={formField.value}
                        className="flex flex-col space-y-1"
                      >
                        {field.options.map((option) => (
                          <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={String(option.value)} id={`${field.name}-${option.value}`} />
                            </FormControl>
                            <FormLabel htmlFor={`${field.name}-${option.value}`} className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
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
        </div>
        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
  );
};

export default DynamicForm;