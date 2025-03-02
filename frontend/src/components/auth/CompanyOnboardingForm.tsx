"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

// Define the form schema with validation
const companyFormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  vatId: z.string().min(5, {
    message: "VAT ID must be at least 5 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  postalCode: z.string().min(4, {
    message: "Postal code must be at least 4 characters.",
  }),
  country: z.string({
    required_error: "Please select a country.",
  }),
  industry: z.string({
    required_error: "Please select an industry.",
  }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

// Default values for the form
const defaultValues: Partial<CompanyFormValues> = {
  companyName: "",
  vatId: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  industry: "",
  termsAccepted: false,
};

interface CompanyOnboardingFormProps {
  onSubmit: (values: CompanyFormValues) => void;
}

export function CompanyOnboardingForm({ onSubmit }: CompanyOnboardingFormProps) {
  const [isValidatingVat, setIsValidatingVat] = useState(false);
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues,
  });

  function handleSubmit(data: CompanyFormValues) {
    onSubmit(data);
  }

  // Simulate VAT validation
  const validateVat = (vatId: string) => {
    setIsValidatingVat(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsValidatingVat(false);
      // For demo purposes, we'll consider all VAT IDs valid except those starting with "INVALID"
      if (vatId.startsWith("INVALID")) {
        form.setError("vatId", { 
          type: "manual", 
          message: "This VAT ID is invalid or does not exist." 
        });
      } else {
        form.clearErrors("vatId");
      }
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vatId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VAT ID</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input 
                    placeholder="DE123456789" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value.length >= 5) {
                        validateVat(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => validateVat(field.value)}
                  disabled={isValidatingVat || field.value.length < 5}
                >
                  {isValidatingVat ? "Checking..." : "Validate"}
                </Button>
              </div>
              <FormDescription>
                Enter your company's VAT ID for tax purposes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Business Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Berlin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="10115" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="it">Italy</SelectItem>
                  <SelectItem value="es">Spain</SelectItem>
                  <SelectItem value="nl">Netherlands</SelectItem>
                  <SelectItem value="be">Belgium</SelectItem>
                  <SelectItem value="at">Austria</SelectItem>
                  <SelectItem value="ch">Switzerland</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="finance">Finance & Banking</SelectItem>
                  <SelectItem value="retail">Retail & E-commerce</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="services">Professional Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I accept the terms and conditions
                </FormLabel>
                <FormDescription>
                  By checking this box, you agree to our Terms of Service and Privacy Policy.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="hidden" id="company-form-submit">
          Submit
        </Button>
      </form>
    </Form>
  );
} 