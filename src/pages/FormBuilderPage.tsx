"use client";

import React from "react";
import DynamicForm from "@/components/DynamicForm";
import { FormField } from "@/types/form";
import { MadeWithDyad } from "@/components/made-with-dyad";

const clubMemberFormFields: FormField[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
    required: true,
    minLength: 2,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "favoriteAnime",
    label: "Favorite Anime",
    type: "text",
    placeholder: "e.g., Attack on Titan",
    required: false,
  },
  {
    name: "age",
    label: "Age",
    type: "number",
    placeholder: "Your age",
    required: true,
    minLength: 1, // Zod number min will handle this
  },
  {
    name: "membershipType",
    label: "Membership Type",
    type: "select",
    placeholder: "Select a membership type",
    required: true,
    options: [
      { label: "Standard", value: "standard" },
      { label: "Premium", value: "premium" },
      { label: "Student", value: "student" },
    ],
  },
  {
    name: "agreeToTerms",
    label: "I agree to the terms and conditions",
    type: "checkbox",
    required: true,
    defaultValue: false,
    description: "You must agree to the terms to become a member.",
  },
];

const FormBuilderPage: React.FC = () => {
  const handleFormSubmit = (data: Record<string, any>) => {
    console.log("Form data submitted:", data);
    // Here you would typically send the data to a backend
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6">Club Member Registration</h1>
      <DynamicForm
        fields={clubMemberFormFields}
        onSubmit={handleFormSubmit}
        formTitle="New Club Member Form"
        formDescription="Please fill out the form below to register as a new club member."
      />
      <MadeWithDyad />
    </div>
  );
};

export default FormBuilderPage;