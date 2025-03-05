import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogger } from '@/hooks/useLogger';
import api from '@/utils/api';

export function LoggingExample() {
  const logger = useLogger('LoggingExample');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleLogInfo = () => {
    logger.info('User clicked the Info button', 'UserAction', { message });
    setError(null);
  };
  
  const handleLogWarning = () => {
    logger.warn('This is a warning message', 'UserAction', { message });
    setError(null);
  };
  
  const handleLogError = () => {
    logger.error('This is an error message', 'UserAction', new Error('Example error'), { message });
    setError(null);
  };
  
  const handleSimulateApiCall = async () => {
    try {
      logger.info('Simulating API call', 'API');
      
      // Simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      logger.info('API call successful', 'API');
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('API call failed', 'API', error);
      setError(error.message);
    }
  };
  
  const handleSimulateApiError = async () => {
    try {
      logger.info('Simulating API error', 'API');
      
      // Simulate a failed API call
      await new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API Error Example')), 500)
      );
      
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('API call failed', 'API', error);
      setError(error.message);
    }
  };
  
  const handleThrowError = () => {
    try {
      // This will be caught by the global error handler
      throw new Error('Uncaught error example');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Caught error', 'ErrorExample', error);
      setError(error.message);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Logging Example</CardTitle>
        <CardDescription>
          Test different logging levels and see the output in the console
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message to include in logs"
          />
        </div>
        
        {error && (
          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={handleLogInfo} variant="outline">
          Log Info
        </Button>
        <Button onClick={handleLogWarning} variant="outline">
          Log Warning
        </Button>
        <Button onClick={handleLogError} variant="outline">
          Log Error
        </Button>
        <Button onClick={handleSimulateApiCall} variant="outline">
          Simulate API Call
        </Button>
        <Button onClick={handleSimulateApiError} variant="outline">
          Simulate API Error
        </Button>
        <Button onClick={handleThrowError} variant="outline">
          Throw Error
        </Button>
      </CardFooter>
    </Card>
  );
} 