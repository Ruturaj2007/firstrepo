"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "@/components/DynamicForm";
import { FormField } from "@/types/form";
import { MadeWithDyad } from "@/components/made-with-dyad";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface SavedFormDefinition {
  [key: string]: FormField[];
}

const FormBuilderPage: React.FC = () => {
  const [availableDefinitions, setAvailableDefinitions] = useState<SavedFormDefinition>({});
  const [selectedDefinitionName, setSelectedDefinitionName] = useState<string | null>(null);
  const [currentFormFields, setCurrentFormFields] = useState<FormField[]>([]);

  useEffect(() => {
    try {
      const storedDefinitions = localStorage.getItem("formDefinitions");
      if (storedDefinitions) {
        const parsedDefinitions: SavedFormDefinition = JSON.parse(storedDefinitions);
        setAvailableDefinitions(parsedDefinitions);
        // Optionally load the first definition if available
        const firstDefinitionName = Object.keys(parsedDefinitions)[0];
        if (firstDefinitionName) {
          setSelectedDefinitionName(firstDefinitionName);
          setCurrentFormFields(parsedDefinitions[firstDefinitionName]);
        }
      }
    } catch (error) {
      console.error("Failed to load form definitions from localStorage:", error);
      toast({
        title: "Error loading definitions",
        description: "Could not load form definitions from local storage.",
        variant: "destructive",
      });
    }
  }, []);

  const handleDefinitionChange = (name: string) => {
    setSelectedDefinitionName(name);
    setCurrentFormFields(availableDefinitions[name] || []);
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log("Form data submitted:", data);
    // The DynamicForm component already handles saving to localStorage and showing a toast.
    // This function can be used for additional actions if needed.
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6">Dynamic Form Builder</h1>

      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>Select a Form Definition</CardTitle>
          <CardDescription>Choose a form structure you've previously defined.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="form-definition-select">Form Definition</Label>
            <Select onValueChange={handleDefinitionChange} value={selectedDefinitionName || ""}>
              <SelectTrigger id="form-definition-select">
                <SelectValue placeholder="Select a form definition" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(availableDefinitions).length === 0 ? (
                  <SelectItem value="no-definitions" disabled>
                    No definitions available. Create one in "Define New Form".
                  </SelectItem>
                ) : (
                  Object.keys(availableDefinitions).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedDefinitionName && currentFormFields.length > 0 ? (
        <DynamicForm
          fields={currentFormFields}
          onSubmit={handleFormSubmit}
          formTitle={selectedDefinitionName}
          formDescription={`This form is generated from the "${selectedDefinitionName}" definition.`}
        />
      ) : (
        <div className="text-center text-muted-foreground p-8 border rounded-lg shadow-sm bg-card">
          <p className="mb-4">Please select a form definition above to start building a form.</p>
          <p>If you haven't created any, go to "Define New Form" to get started!</p>
        </div>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default FormBuilderPage;