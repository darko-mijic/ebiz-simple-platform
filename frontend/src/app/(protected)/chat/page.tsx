"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Send, Bot, User, ArrowRight } from "lucide-react";

// Define types for our chat messages
interface Transaction {
  date: string;
  description: string;
  amount: number;
  currency: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  data?: {
    type: string;
    transactions?: Transaction[];
  };
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  
  // Mock chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your financial assistant. How can I help you today?",
      timestamp: new Date(Date.now() - 60000).toISOString()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory([...chatHistory, userMessage]);
    setMessage("");
    
    // Simulate assistant response after a short delay
    setTimeout(() => {
      let assistantResponse: ChatMessage;
      
      if (message.toLowerCase().includes("last 10 transactions")) {
        assistantResponse = {
          role: "assistant",
          content: "Here are your last 10 transactions:",
          timestamp: new Date().toISOString(),
          data: {
            type: "transactions",
            transactions: [
              { date: "2024-02-20", description: "Client payment for services", amount: 750000, currency: "EUR" },
              { date: "2024-02-18", description: "Software subscription", amount: -29900, currency: "EUR" },
              { date: "2024-02-16", description: "Monthly utility payment", amount: -50000, currency: "EUR" },
              { date: "2024-02-15", description: "Invoice payment INVOICE/2024/001", amount: 1500000, currency: "EUR" }
            ]
          }
        };
      } else if (message.toLowerCase().includes("balance")) {
        assistantResponse = {
          role: "assistant",
          content: "Your current balance across all accounts is €15,500.00",
          timestamp: new Date().toISOString()
        };
      } else {
        assistantResponse = {
          role: "assistant",
          content: "I understand you're asking about " + message + ". How can I help you with that specifically?",
          timestamp: new Date().toISOString()
        };
      }
      
      setChatHistory(prev => [...prev, assistantResponse]);
    }, 1000);
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount / 100); // Convert cents to currency units
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Chat Assistant</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Suggested Queries
          </Button>
        </div>
      </div>
      
      <Card className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {chatHistory.map((chat, index) => (
            <div 
              key={index} 
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  chat.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center mb-1">
                  {chat.role === 'assistant' ? (
                    <Bot className="h-4 w-4 mr-2" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-xs opacity-70">{formatTime(chat.timestamp)}</span>
                </div>
                <p>{chat.content}</p>
                
                {/* Render transaction data if available */}
                {chat.data?.type === 'transactions' && chat.data.transactions && (
                  <div className="mt-3 bg-background rounded p-2 text-sm">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-1">Date</th>
                          <th className="text-left pb-1">Description</th>
                          <th className="text-right pb-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chat.data.transactions.map((tx: Transaction, i: number) => (
                          <tr key={i} className="border-b border-border/40 last:border-0">
                            <td className="py-1">{tx.date}</td>
                            <td className="py-1">{tx.description}</td>
                            <td className={`py-1 text-right ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatAmount(tx.amount, tx.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about your finances..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}