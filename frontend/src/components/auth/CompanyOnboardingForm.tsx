"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { logOnboardingEvent } from './onboarding-utils';
import { handleApiError } from '../../lib/api-error';

// Helper function to generate random VAT IDs for testing
const generateRandomVat = (country: string = ""): string => {
  // Generate a basic 9-11 digit number
  const length = Math.floor(Math.random() * 3) + 9; // 9-11 digits
  let randomDigits = "";
  for (let i = 0; i < length; i++) {
    randomDigits += Math.floor(Math.random() * 10).toString();
  }
  
  if (!country) return randomDigits;
  
  // For EU VATs, find the country prefix
  const euCountry = EU_COUNTRIES.find(c => c.code === country);
  return euCountry ? `${euCountry.vatPrefix}${randomDigits}` : randomDigits;
};

// Update the EU_COUNTRIES type to include vatPrefix
type EuCountry = {
  code: string;
  name: string;
  vatPrefix: string;
};

// Update the EU_COUNTRIES array with the correct type
const EU_COUNTRIES: EuCountry[] = [
  { code: 'AT', name: 'Austria', vatPrefix: 'AT' },
  { code: 'BE', name: 'Belgium', vatPrefix: 'BE' },
  { code: 'BG', name: 'Bulgaria', vatPrefix: 'BG' },
  { code: 'HR', name: 'Croatia', vatPrefix: 'HR' },
  { code: 'CY', name: 'Cyprus', vatPrefix: 'CY' },
  { code: 'CZ', name: 'Czech Republic', vatPrefix: 'CZ' },
  { code: 'DK', name: 'Denmark', vatPrefix: 'DK' },
  { code: 'EE', name: 'Estonia', vatPrefix: 'EE' },
  { code: 'FI', name: 'Finland', vatPrefix: 'FI' },
  { code: 'FR', name: 'France', vatPrefix: 'FR' },
  { code: 'DE', name: 'Germany', vatPrefix: 'DE' },
  { code: 'GR', name: 'Greece', vatPrefix: 'EL' },
  { code: 'HU', name: 'Hungary', vatPrefix: 'HU' },
  { code: 'IE', name: 'Ireland', vatPrefix: 'IE' },
  { code: 'IT', name: 'Italy', vatPrefix: 'IT' },
  { code: 'LV', name: 'Latvia', vatPrefix: 'LV' },
  { code: 'LT', name: 'Lithuania', vatPrefix: 'LT' },
  { code: 'LU', name: 'Luxembourg', vatPrefix: 'LU' },
  { code: 'MT', name: 'Malta', vatPrefix: 'MT' },
  { code: 'NL', name: 'Netherlands', vatPrefix: 'NL' },
  { code: 'PL', name: 'Poland', vatPrefix: 'PL' },
  { code: 'PT', name: 'Portugal', vatPrefix: 'PT' },
  { code: 'RO', name: 'Romania', vatPrefix: 'RO' },
  { code: 'SK', name: 'Slovakia', vatPrefix: 'SK' },
  { code: 'SI', name: 'Slovenia', vatPrefix: 'SI' },
  { code: 'ES', name: 'Spain', vatPrefix: 'ES' },
  { code: 'SE', name: 'Sweden', vatPrefix: 'SE' },
];

// Define the form schema with validation
const companyFormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  vatId: z.string().min(5, {
    message: "VAT ID must be at least 5 characters.",
  }),
  euVatId: z.string().optional(),
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
  euVatId: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  industry: "",
  termsAccepted: false,
};

interface CompanyOnboardingFormProps {
  onSubmit: (values: CompanyFormValues) => void;
  onBack?: () => void;
  initialData?: Partial<CompanyFormValues>;
}

export function CompanyOnboardingForm({ onSubmit, onBack, initialData }: CompanyOnboardingFormProps) {
  const [localVatState, setLocalVatState] = useState<{ isValidating: boolean; isValid: boolean | null; message: string | null }>({ 
    isValidating: false, 
    isValid: null,
    message: null
  });
  const [euVatState, setEuVatState] = useState<{ isValidating: boolean; isValid: boolean | null; message: string | null }>({ 
    isValidating: false, 
    isValid: null,
    message: null
  });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [debouncedValidation, setDebouncedValidation] = useState<NodeJS.Timeout | null>(null);
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: initialData || defaultValues,
  });

  // Get the selected country's VAT prefix
  const getCountryPrefix = (countryCode: string): string => {
    const country = EU_COUNTRIES.find(c => c.code === countryCode);
    return country ? country.vatPrefix : '';
  };

  // When country changes, update the EU VAT prefix and trigger validation if VAT ID exists
  useEffect(() => {
    const countryValue = form.watch('country');
    if (countryValue && countryValue !== selectedCountry) {
      setSelectedCountry(countryValue);
      
      // Don't automatically prefill if the user has already entered something
      const currentEuVat = form.getValues('euVatId') || '';
      if (!currentEuVat || currentEuVat.length === 0) {
        const prefix = getCountryPrefix(countryValue);
        form.setValue('euVatId', prefix);
      } else if (currentEuVat.length >= 5) {
        // If country changed and EU VAT exists, validate it
        validateEuVat(currentEuVat);
      }
      
      // If local VAT exists, validate it with the new country
      const localVat = form.getValues('vatId');
      if (localVat && localVat.length >= 5) {
        validateVat(localVat, countryValue);
      }
    }
    
    // Cleanup function for debounce timer on unmount
    return () => {
      if (debouncedValidation) {
        clearTimeout(debouncedValidation);
      }
    };
  }, [form.watch('country'), selectedCountry, form]);

  // When form is initialized with initialData and has a country and VAT, validate it
  useEffect(() => {
    if (initialData?.country && initialData?.vatId && initialData.vatId.length >= 5) {
      // Set a small delay to ensure the form is fully loaded
      setTimeout(() => {
        validateVat(initialData.vatId as string, initialData.country as string);
      }, 500);
    }
    
    if (initialData?.euVatId && initialData.euVatId.length >= 5) {
      // Set a small delay to ensure the form is fully loaded
      setTimeout(() => {
        validateEuVat(initialData.euVatId as string);
      }, 500);
    }
  }, []);

  function handleSubmit(data: CompanyFormValues) {
    logOnboardingEvent('Company form submitted', { 
      companyName: data.companyName,
      country: data.country,
      vatProvided: !!data.vatId,
      euVatProvided: !!data.euVatId,
      industry: data.industry
    });
    onSubmit(data);
  }

  // Update the validateVat function to use inline validation messages
  const validateVat = async (vatId: string, countryCode: string = '', isEuVat: boolean = false): Promise<boolean> => {
    try {
      if (!vatId || vatId.length < 5) {
        if (isEuVat) {
          setEuVatState({ isValidating: false, isValid: false, message: 'VAT ID must be at least 5 characters' });
        } else {
          setLocalVatState({ isValidating: false, isValid: false, message: 'VAT ID must be at least 5 characters' });
        }
        return false;
      }

      // Return without validating if country code is missing
      if (!countryCode) {
        if (isEuVat) {
          setEuVatState({ isValidating: false, isValid: null, message: 'Select country to validate' });
        } else {
          setLocalVatState({ isValidating: false, isValid: null, message: 'Select country to validate' });
        }
        return false;
      }

      // Set validating state
      if (isEuVat) {
        setEuVatState({ isValidating: true, isValid: null, message: 'Validating...' });
      } else {
        setLocalVatState({ isValidating: true, isValid: null, message: 'Validating...' });
      }
      
      // Log the validation attempt with structured logging
      logOnboardingEvent('VAT validation initiated', { 
        vatId,
        countryCode,
        isEuVat
      });
      
      // Call the backend API for validation
      const response = await fetch(`/api/vat/validate?vatId=${vatId}&countryCode=${countryCode}&isEuVat=${isEuVat}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        logOnboardingEvent('VAT validation successful', { 
          vatId,
          countryCode,
          isEuVat,
          companyName: data.vatDetails?.name
        });
        
        if (isEuVat) {
          setEuVatState({ isValidating: false, isValid: true, message: 'VAT ID is valid' });
        } else {
          setLocalVatState({ isValidating: false, isValid: true, message: 'VAT ID is valid' });
        }
        return true;
      } else {
        logOnboardingEvent('VAT validation failed', { 
          vatId,
          countryCode,
          isEuVat,
          error: data.message
        });
        
        if (isEuVat) {
          setEuVatState({ isValidating: false, isValid: false, message: data.message || 'Invalid VAT ID' });
        } else {
          setLocalVatState({ isValidating: false, isValid: false, message: data.message || 'Invalid VAT ID' });
        }
        return false;
      }
    } catch (error) {
      logOnboardingEvent('VAT validation error', { 
        vatId,
        countryCode,
        isEuVat,
        error: handleApiError(error)
      });
      
      console.error('VAT validation error:', error);
      
      if (isEuVat) {
        setEuVatState({ isValidating: false, isValid: false, message: 'Error validating VAT ID' });
      } else {
        setLocalVatState({ isValidating: false, isValid: false, message: 'Error validating VAT ID' });
      }
      return false;
    }
  };

  // Fix the validateEuVat function to handle string | undefined
  const validateEuVat = async (euVatId: string | undefined): Promise<boolean> => {
    if (!euVatId || euVatId.length < 2) {
      setEuVatState({ isValidating: false, isValid: false, message: 'EU VAT ID must start with a valid country code' });
      return false;
    }
    
    // Extract the first two characters as the potential country code
    const countryCode = euVatId.substring(0, 2).toUpperCase();
    
    // Check if it's a valid EU country prefix
    const isValidPrefix = EU_COUNTRIES.some(country => country.vatPrefix === countryCode);
    
    if (!isValidPrefix) {
      setEuVatState({ 
        isValidating: false, 
        isValid: false, 
        message: `Invalid country prefix: ${countryCode}. EU VAT must start with a valid country code.` 
      });
      return false;
    }
    
    return validateVat(euVatId, countryCode, true);
  };

  // Add debounced validation for both VAT fields
  const debouncedValidateVat = (vatId: string, country: string, isEu: boolean = false) => {
    if (debouncedValidation) {
      clearTimeout(debouncedValidation);
    }

    // Only set up debounce if we have valid data to check
    if (vatId && vatId.length >= 5 && country) {
      const timer = setTimeout(() => {
        if (isEu) {
          validateEuVat(vatId);
        } else {
          validateVat(vatId, country);
        }
      }, 800); // 800ms debounce
      
      setDebouncedValidation(timer);
    }
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
              <FormLabel>Local VAT ID</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Local ID e.g. 23732108701" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      const country = form.getValues('country') || '';
                      
                      if (e.target.value.length < 5) {
                        setLocalVatState({ 
                          isValidating: false, 
                          isValid: null, 
                          message: e.target.value.length > 0 ? "VAT ID must be at least 5 characters" : null 
                        });
                      } else if (country) {
                        // If input is valid length and country is selected, set up debounced validation
                        debouncedValidateVat(e.target.value, country);
                        
                        // Show "validating" state immediately for better UX
                        if (!localVatState.isValidating) {
                          setLocalVatState({ isValidating: true, isValid: null, message: 'Validating...' });
                        }
                      } else {
                        setLocalVatState({ isValidating: false, isValid: null, message: 'Select country to validate' });
                      }
                    }}
                  />
                  {localVatState.isValidating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </FormControl>
              {localVatState.message && (
                <div className={`text-sm mt-1 ${
                  localVatState.isValid === true ? 'text-green-500' : 
                  localVatState.isValid === false ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {localVatState.message}
                </div>
              )}
              <FormDescription>
                Enter your company's local VAT ID without country prefix.
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    type="button" 
                    variant="link" 
                    className="p-0 h-auto text-xs text-muted-foreground ml-2"
                    onClick={() => {
                      const country = form.getValues('country');
                      if (!country) {
                        toast({
                          title: "Country Required",
                          description: "Select a country first to generate a valid VAT ID",
                          type: "error",
                        });
                        return;
                      }
                      const randomVat = generateRandomVat();
                      form.setValue('vatId', randomVat);
                      // Trigger validation after a short delay
                      setTimeout(() => {
                        validateVat(randomVat, country);
                      }, 100);
                    }}
                  >
                    [Generate Test VAT]
                  </Button>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="euVatId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EU VAT ID</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="EU VAT ID e.g. HR23732108701" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      
                      if (e.target.value.length < 5) {
                        setEuVatState({ 
                          isValidating: false, 
                          isValid: null, 
                          message: e.target.value.length > 0 ? "EU VAT ID must be at least 5 characters" : null 
                        });
                      } else {
                        // For EU VAT, we can validate anytime it's long enough
                        debouncedValidateVat(e.target.value, "EU", true);
                        
                        // Show "validating" state immediately for better UX
                        if (!euVatState.isValidating) {
                          setEuVatState({ isValidating: true, isValid: null, message: 'Validating...' });
                        }
                      }
                    }}
                  />
                  {euVatState.isValidating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </FormControl>
              {euVatState.message && (
                <div className={`text-sm mt-1 ${
                  euVatState.isValid === true ? 'text-green-500' : 
                  euVatState.isValid === false ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {euVatState.message}
                </div>
              )}
              <FormDescription>
                Enter your EU VAT ID with country prefix (mandatory). For example: HR23732108701
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    type="button" 
                    variant="link" 
                    className="p-0 h-auto text-xs text-muted-foreground ml-2"
                    onClick={() => {
                      const country = form.getValues('country');
                      if (!country) {
                        toast({
                          title: "Country Required",
                          description: "Select a country first to generate a valid EU VAT ID",
                          type: "error",
                        });
                        return;
                      }
                      const randomEuVat = generateRandomVat(country);
                      form.setValue('euVatId', randomEuVat);
                      // Trigger validation after a short delay
                      setTimeout(() => {
                        validateEuVat(randomEuVat);
                      }, 100);
                    }}
                  >
                    [Generate Test EU VAT]
                  </Button>
                )}
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
                  <Input placeholder="Zagreb" {...field} />
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
                  <Input placeholder="10000" {...field} />
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
                <SelectContent className="max-h-80">
                  {EU_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
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

        {onBack && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack} 
            className="w-full mt-4"
          >
            Back to Personal Information
          </Button>
        )}

        <Button type="submit" className="hidden" id="company-form-submit">
          Submit
        </Button>
      </form>
    </Form>
  );
} 