"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { UserOnboardingForm } from "../../../components/auth/UserOnboardingForm";
import { CompanyOnboardingForm } from "../../../components/auth/CompanyOnboardingForm";
import { useToast } from "../../../hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import { useUser } from "../../../components/providers/user-provider";
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute";
import { logEvents } from "../../../lib/analytics";
import { handleApiError } from "../../../lib/api-error";
import { logOnboardingEvent } from "../../../components/auth/onboarding-utils";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState("user");
  const [userCompleted, setUserCompleted] = useState(false);
  const [companyCompleted, setCompanyCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [initialUserData, setInitialUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: ""
  });
  // Add state to preserve company form data
  const [companyFormData, setCompanyFormData] = useState({
    companyName: "",
    vatId: "",
    euVatId: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    industry: "",
    termsAccepted: false
  });
  
  // Log onboarding page loaded
  useEffect(() => {
    logOnboardingEvent('Onboarding page loaded', { isLoggedIn: !!user });
  }, []);
  
  // Load user data from the user context
  useEffect(() => {
    if (user) {
      logOnboardingEvent('User data loaded from context', { 
        hasGoogleId: !!user.googleId,
        hasProfilePicture: !!user.profilePictureUrl
      });
      
      setInitialUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: ""
      });
    }
  }, [user]);
  
  const handleUserFormSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      logOnboardingEvent('User form submitted', data);
      
      // Save user data to backend
      // Directly use the correct backend URL instead of relying on rewrite
      const response = await axios.post('http://localhost:3000/onboarding/user', data, {
        withCredentials: true
      });
      
      setUserData(response.data);
      setUserCompleted(true);
      setActiveTab("company");
      
      logOnboardingEvent('User information saved', { 
        userId: response.data.id,
        success: true 
      });
      
      toast({
        title: "User information saved",
        description: "Your personal information has been saved successfully.",
      });
    } catch (error) {
      // Use our new error handling utility
      const errorMessage = handleApiError(error);
      
      logOnboardingEvent('Error saving user data', { 
        error: errorMessage,
        success: false
      });
      
      toast({
        title: "Error saving personal information",
        description: `There was a problem saving your information. ${errorMessage}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyFormSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      logOnboardingEvent('Company form submitted', data);
      
      // Transform the data to match the backend DTO format
      const transformedData = {
        name: data.companyName, // Backend expects 'name' instead of 'companyName'
        vatId: data.vatId,
        euVatId: data.euVatId,
        localVatId: data.localVatId || data.vatId, // Ensure local VAT ID is included
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        industry: data.industry,
      };
      
      // Save company data to backend
      // Directly use the correct backend URL instead of relying on rewrite
      const response = await axios.post('http://localhost:3000/onboarding/company', transformedData, {
        withCredentials: true
      });
      
      setCompanyCompleted(true);
      
      logOnboardingEvent('Company information saved', { 
        companyId: response.data.id,
        success: true 
      });
      
      // Make final call to mark onboarding complete
      try {
        const completeResponse = await axios.post('http://localhost:3000/onboarding/complete', {}, {
          withCredentials: true
        });
        
        logOnboardingEvent('Onboarding completed', { 
          success: true,
          response: completeResponse.data 
        });
        
        // Show success toast
        toast({
          title: "Onboarding Complete",
          description: "Your account setup is complete! Redirecting to dashboard...",
          type: "success",
        });
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (completeError) {
        // Handle specific error for the completion step
        let completeErrorMessage = 'Failed to mark onboarding as complete';
        
        if (axios.isAxiosError(completeError) && completeError.response) {
          completeErrorMessage = completeError.response.data?.message || 
                             completeError.response.data?.error || 
                             `Server error: ${completeError.response.status}`;
          
          console.error('Backend completion error details:', completeError.response.data);
        }
        
        logOnboardingEvent('Error completing onboarding', { 
          error: completeErrorMessage,
          success: false
        });
        
        toast({
          title: "Almost there!",
          description: `Your company information was saved, but we couldn't complete the final step: ${completeErrorMessage}`,
          type: "warning",
        });
        
        // Still redirect to dashboard since company info was saved
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (error) {
      // Use our new error handling utility
      const errorMessage = handleApiError(error);
      
      logOnboardingEvent('Error saving company data', { 
        error: errorMessage,
        success: false
      });
      
      toast({
        title: "Error saving company information",
        description: `There was a problem saving your company information. ${errorMessage}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPersonal = () => {
    logOnboardingEvent('Navigated back to personal information from company step');
    // Save current form data from the form before switching tabs
    const formValues = {
      companyName: document.querySelector<HTMLInputElement>('input[name="companyName"]')?.value || "",
      vatId: document.querySelector<HTMLInputElement>('input[name="vatId"]')?.value || "",
      euVatId: document.querySelector<HTMLInputElement>('input[name="euVatId"]')?.value || "",
      address: document.querySelector<HTMLInputElement>('input[name="address"]')?.value || "",
      city: document.querySelector<HTMLInputElement>('input[name="city"]')?.value || "",
      postalCode: document.querySelector<HTMLInputElement>('input[name="postalCode"]')?.value || "",
      country: document.querySelector<HTMLSelectElement>('select[name="country"]')?.value || "",
      industry: document.querySelector<HTMLSelectElement>('select[name="industry"]')?.value || "",
      termsAccepted: document.querySelector<HTMLInputElement>('input[name="termsAccepted"]')?.checked || false
    };
    setCompanyFormData(formValues);
    setActiveTab("user");
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      logOnboardingEvent('User requested logout during onboarding');
      
      // Call the logout endpoint
      await axios.post('http://localhost:3000/auth/logout', {}, {
        withCredentials: true
      });
      
      // Redirect to the main auth page (not auth/login which doesn't exist)
      router.push("/auth");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Account Setup</CardTitle>
            <CardDescription>
              Please provide the following information to get started with EbizSimple
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="user" 
                  disabled={false}
                >
                  {userCompleted ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Personal Information
                    </span>
                  ) : (
                    "Personal Information"
                  )}
                </TabsTrigger>
                <TabsTrigger value="company" disabled={!userCompleted || companyCompleted}>
                  {companyCompleted ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Company Information
                    </span>
                  ) : (
                    "Company Information"
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="user" className="mt-6">
                <UserOnboardingForm 
                  onSubmit={handleUserFormSubmit} 
                  initialData={initialUserData}
                  isGoogleLogin={!!user?.googleId} 
                />
              </TabsContent>
              <TabsContent value="company" className="mt-6">
                <CompanyOnboardingForm 
                  onSubmit={handleCompanyFormSubmit} 
                  onBack={handleBackToPersonal}
                  initialData={companyFormData}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            {companyCompleted ? (
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  All information has been saved. Redirecting to dashboard...
                </p>
                <Button disabled className="w-full">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Setup Complete
                </Button>
              </div>
            ) : (
              <div className="w-full flex justify-between">
                {activeTab === "company" ? (
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    Logout
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    if (activeTab === "user" && !userCompleted) {
                      document.getElementById("user-form-submit")?.click();
                    } else if (activeTab === "company" && !companyCompleted) {
                      document.getElementById("company-form-submit")?.click();
                    }
                  }}
                  disabled={
                    (activeTab === "user" && userCompleted) || 
                    (activeTab === "company" && companyCompleted) ||
                    isLoading
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {activeTab === "user" ? "Saving..." : "Completing..."}
                    </>
                  ) : (
                    activeTab === "user" ? "Next" : "Complete Onboarding"
                  )}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
} 