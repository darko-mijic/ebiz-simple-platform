"use client";

import { Card } from "../ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertsProps } from "../../data/types";
import { Button } from "../ui/button";

export function Alerts({ alerts }: AlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 border-amber-300 dark:border-amber-700">
      <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
        <h3 className="text-lg font-medium">System Alerts</h3>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-medium">
                {alert.message}
              </p>
              {alert.account && (
                <p className="text-xs text-muted-foreground mt-1">
                  Account: {alert.account}
                </p>
              )}
            </div>
            <Button size="sm" variant="outline">
              Resolve
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
} 