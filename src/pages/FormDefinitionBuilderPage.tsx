"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormFieldType } from "@/types/form";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, Trash2, Edit, Save, ArrowLeft } from "lucide-react";

// Zod schema for a single form field in the builder
const fieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "email", "number", "textarea", "checkbox", "select"]),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  required: z.boolean().default(false),
  minLength: z.coerce.number().int().min(0).optional(),
  maxLength: z.coerce.number().int().min(0).optional(),
  options: z.string().optional(), // Comma-separated string for select options
  description: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

const FormDefinitionBuilderPage: React.FC = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formDefinitionName, setFormDefinitionName] = useState<string>("");
  const [savedDefinitions, setSavedDefinitions] = useState<Record<string, FormField[]>>({});

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      label: "",
      type: "text",
      placeholder: "",
      defaultValue: "",
      required: false,
      minLength: undefined,
      maxLength: undefined,
      options: "",
      description: "",
    },
  });

  useEffect(() => {
    try {
      const storedDefinitions = localStorage.getItem("formDefinitions");
      if (storedDefinitions) {
        setSavedDefinitions(JSON.parse(storedDefinitions));
      }
    } catch (error) {
      console.error("Failed to load form definitions from localStorage:", error);
    }
  }, []);

  const addOrUpdateField = (values: FieldFormValues) => {
    const newField: FormField = {
      name: values.name,
      label: values.label,
      type: values.type,
      placeholder: values.placeholder || undefined,
      defaultValue: values.defaultValue || undefined,
      required: values.required,
      minLength: values.minLength !== undefined ? Number(values.minLength) : undefined,
      maxLength: values.maxLength !== undefined ? Number(values.maxLength) : undefined,
      description: values.description || undefined,
    };

    if (values.type === "select" && values.options) {
      newField.options = values.options.split(",").map((opt) => ({
        label: opt.trim(),
        value: opt.trim(),
      }));
    }

    if (editingIndex !== null) {
      const updatedFields = [...formFields];
      updatedFields[editingIndex] = newField;
      setFormFields(updatedFields);
      setEditingIndex(null);
      toast({ title: "Field updated successfully!" });
    } else {
      setFormFields((prev) => [...prev, newField]);
      toast({ title: "Field added successfully!" });
    }
    form.reset();
  };

  const editField = (index: number) => {
    const fieldToEdit = formFields[index];
    form.reset({
      name: fieldToEdit.name,
      label: fieldToEdit.label,
      type: fieldToEdit.type,
      placeholder: fieldToEdit.placeholder || "",
      defaultValue: String(fieldToEdit.defaultValue || ""),
      required: fieldToEdit.required,
      minLength: fieldToEdit.minLength,
      maxLength: fieldToEdit.maxLength,
      options:
        fieldToEdit.type === "select" && fieldToEdit.options
          ? fieldToEdit.options.map((opt) => opt.value).join(", ")
          : "",
      description: fieldToEdit.description || "",
    });
    setEditingIndex(index);
  };

  const removeField = (index: number) => {
    setFormFields((prev) => prev.filter((_, i) => i !== index));
    toast({ title: "Field removed." });
  };

  const saveFormDefinition = () => {
    if (!formDefinitionName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your form definition.",
        variant: "destructive",
      });
      return;
    }
    if (formFields.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one field to save the form definition.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedDefinitions = {
        ...savedDefinitions,
        [formDefinitionName.trim()]: formFields,
      };
      localStorage.setItem("formDefinitions", JSON.stringify(updatedDefinitions));
      setSavedDefinitions(updatedDefinitions);
      toast({ title: `Form definition "${formDefinitionName}" saved!` });
      setFormFields([]); // Clear current fields after saving
      setFormDefinitionName(""); // Clear name
    } catch (error) {
      console.error("Failed to save form definition to localStorage:", error);
      toast({
        title: "Error saving form definition",
        description: "Could not save definition to local storage.",
        variant: "destructive",
      });
    }
  };

  const loadFormDefinition = (name: string) => {
    const definition = savedDefinitions[name];
    if (definition) {
      setFormFields(definition);
      setFormDefinitionName(name);
      toast({ title: `Form definition "${name}" loaded!` });
    }
  };

  const deleteFormDefinition = (name: string) => {
    const updatedDefinitions = { ...savedDefinitions };
    delete updatedDefinitions[name];
    localStorage.setItem("formDefinitions", JSON.stringify(updatedDefinitions));
    setSavedDefinitions(updatedDefinitions);
    toast({ title: `Form definition "${name}" deleted.` });
    if (formDefinitionName === name) {
      setFormFields([]);
      setFormDefinitionName("");
    }
  };

  const selectedType = form.watch("type");

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-center">Form Definition Builder</h1>
        <div></div> {/* Placeholder for alignment */}
      </div>

      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>Define New Field</CardTitle>
          <CardDescription>Add or edit properties for a form field.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(addOrUpdateField)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Field Name (unique identifier)</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Field Label (display name)</Label>
              <Input id="label" {...form.register("label")} />
              {form.formState.errors.label && (
                <p className="text-red-500 text-sm">{form.formState.errors.label.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Field Type</Label>
              <Select
                onValueChange={(value: FormFieldType) => form.setValue("type", value)}
                value={selectedType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-red-500 text-sm">{form.formState.errors.type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input id="placeholder" {...form.register("placeholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultValue">Default Value</Label>
              <Input id="defaultValue" {...form.register("defaultValue")} />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox id="required" checked={form.watch("required")} onCheckedChange={(checked) => form.setValue("required", checked as boolean)} />
              <Label htmlFor="required">Required</Label>
            </div>
            {selectedType !== "checkbox" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="minLength">Min Length (for text/number)</Label>
                  <Input id="minLength" type="number" {...form.register("minLength")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLength">Max Length (for text/number)</Label>
                  <Input id="maxLength" type="number" {...form.register("maxLength")} />
                </div>
              </>
            )}
            {selectedType === "select" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="options">Options (comma-separated, e.g., Option A, Option B)</Label>
                <Input id="options" {...form.register("options")} />
                {form.formState.errors.options && (
                  <p className="text-red-500 text-sm">{form.formState.errors.options.message}</p>
                )}
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...form.register("description")} />
            </div>
            <Button type="submit" className="md:col-span-2">
              {editingIndex !== null ? (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Update Field
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Field
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>Current Form Fields</CardTitle>
          <CardDescription>Fields defined for the current form definition.</CardDescription>
        </CardHeader>
        <CardContent>
          {formFields.length === 0 ? (
            <p className="text-muted-foreground text-center">No fields added yet. Use the section above to add fields.</p>
          ) : (
            <div className="space-y-4">
              {formFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-background">
                  <div>
                    <p className="font-medium">{field.label} (<span className="text-muted-foreground">{field.type}</span>)</p>
                    <p className="text-sm text-muted-foreground">Name: {field.name} {field.required && "(Required)"}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => editField(index)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => removeField(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>Save Form Definition</CardTitle>
          <CardDescription>Give your form definition a name and save it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formDefinitionName">Form Definition Name</Label>
            <Input
              id="formDefinitionName"
              value={formDefinitionName}
              onChange={(e) => setFormDefinitionName(e.target.value)}
              placeholder="e.g., Club Member Form"
            />
          </div>
          <Button onClick={saveFormDefinition} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Form Definition
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Saved Form Definitions</CardTitle>
          <CardDescription>Load or delete previously saved form definitions.</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(savedDefinitions).length === 0 ? (
            <p className="text-muted-foreground text-center">No form definitions saved yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.keys(savedDefinitions).map((name) => (
                <div key={name} className="flex items-center justify-between p-3 border rounded-md bg-background">
                  <p className="font-medium">{name}</p>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => loadFormDefinition(name)}>
                      Load
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteFormDefinition(name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MadeWithDyad />
    </div>
  );
};

export default FormDefinitionBuilderPage;