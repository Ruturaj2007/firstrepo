"use client";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface SavedFormData {
  data: Record<string, any>;
  timestamp: string;
  formTitle: string;
}

const SavedFormsPage: React.FC = () => {
  const [savedForms, setSavedForms] = useState<SavedFormData[]>([]);

  useEffect(() => {
    try {
      const storedForms = localStorage.getItem("dynamicFormsData");
      if (storedForms) {
        setSavedForms(JSON.parse(storedForms));
      }
    } catch (error) {
      console.error("Failed to load saved forms from localStorage:", error);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Saved Forms</h1>
      
      {savedForms.length === 0 ? (
        <div className="text-center text-muted-foreground">
          <p className="mb-4">No forms have been saved yet.</p>
          <Link to="/form-builder">
            <Button>Go to Form Builder</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedForms.map((formEntry, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader>
                <CardTitle>{formEntry.formTitle}</CardTitle>
                <CardDescription>Submitted on: {new Date(formEntry.timestamp).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(formEntry.data).map(([key, value]) => (
                    <li key={key} className="flex justify-between items-start text-sm">
                      <span className="font-medium text-foreground">{key}:</span>
                      <span className="text-muted-foreground text-right break-all ml-4">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8 text-center">
        <Link to="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SavedFormsPage;