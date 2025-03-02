"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { UserOnboardingForm } from "../../../components/auth/UserOnboardingForm";
import { CompanyOnboardingForm } from "../../../components/auth/CompanyOnboardingForm";
import { useToast } from "../../../hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("user");
  const [userCompleted, setUserCompleted] = useState(false);
  const [companyCompleted, setCompanyCompleted] = useState(false);
  
  const handleUserFormSubmit = (data: any) => {
    console.log("User data submitted:", data);
    setUserCompleted(true);
    setActiveTab("company");
    toast({
      title: "User information saved",
      description: "Your personal information has been saved successfully.",
    });
  };

  const handleCompanyFormSubmit = (data: any) => {
    console.log("Company data submitted:", data);
    setCompanyCompleted(true);
    toast({
      title: "Company information saved",
      description: "Your company information has been saved successfully.",
    });
    
    // Simulate API call delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
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
              <TabsTrigger value="user" disabled={userCompleted}>
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
              <UserOnboardingForm onSubmit={handleUserFormSubmit} />
            </TabsContent>
            <TabsContent value="company" className="mt-6">
              <CompanyOnboardingForm onSubmit={handleCompanyFormSubmit} />
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
              <Button 
                variant="outline" 
                onClick={() => router.push("/login")}
                disabled={companyCompleted}
              >
                Cancel
              </Button>
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
                  (activeTab === "company" && companyCompleted)
                }
              >
                {activeTab === "user" ? "Next" : "Complete Setup"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 