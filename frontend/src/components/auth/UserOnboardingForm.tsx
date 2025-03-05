"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Define the form schema with validation
const userFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().refine(val => val === '' || val.length >= 10, {
    message: "If provided, phone number must be at least 10 digits.",
  }).optional(),
  role: z.string({
    required_error: "Please select a role.",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

// Default values for the form
const defaultValues: Partial<UserFormValues> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
};

interface UserOnboardingFormProps {
  onSubmit: (values: UserFormValues) => void;
  initialData?: Partial<UserFormValues>;
  isGoogleLogin?: boolean;
}

// Enhanced logging function for onboarding events
const logOnboardingEvent = async (action: string, details?: any) => {
  const logData = {
    timestamp: new Date().toISOString(),
    action,
    ...details,
  };
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    await fetch(`${apiUrl}/client-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: action,
        meta: logData,
      }),
    });
  } catch (e) {
    // Silent fail for logging
  }
};

export function UserOnboardingForm({ onSubmit, initialData = {}, isGoogleLogin = false }: UserOnboardingFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { ...defaultValues, ...initialData },
  });

  // This effect will update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      // Log the data being loaded from Google profile
      logOnboardingEvent('Loading user data from profile', { 
        hasFirstName: !!initialData.firstName,
        hasLastName: !!initialData.lastName,
        hasEmail: !!initialData.email,
        hasPhone: !!initialData.phone,
        isGoogleLogin 
      });
      
      // Reset form with new values
      form.reset({ ...defaultValues, ...initialData });
    }
  }, [initialData, form, isGoogleLogin]);

  function handleSubmit(data: UserFormValues) {
    logOnboardingEvent('User form submitted', { 
      hasPhone: !!data.phone,
      role: data.role,
      isGoogleLogin 
    });
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="john.doe@example.com" 
                  type="email" 
                  {...field} 
                  readOnly={isGoogleLogin}
                  className={isGoogleLogin ? "bg-gray-100 cursor-not-allowed" : ""}
                />
              </FormControl>
              <FormDescription>
                {isGoogleLogin 
                  ? "This email is provided by your Google account and cannot be changed."
                  : "This email will be used for account notifications."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role in the company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="owner">Owner / CEO</SelectItem>
                  <SelectItem value="finance_manager">Finance Manager</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This helps us customize your experience.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="hidden" id="user-form-submit">
          Submit
        </Button>
      </form>
    </Form>
  );
} 