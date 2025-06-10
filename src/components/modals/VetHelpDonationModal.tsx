import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

type DonationModalProps = {
  fundraiserId: number;
  title: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

export default function VetHelpDonationModal({ 
  fundraiserId, 
  title, 
  trigger,
  onSuccess 
}: DonationModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Predefined quick donation values
  const predefinedAmounts = [10, 20, 50, 100];

  // Function to process the donation with a specific value
  const handleDonate = (amount: number) => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please select or enter an amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    toast({
      title: "Processing donation",
      description: `Preparing payment of $${amount.toFixed(2)}...`,
    });
    
    // Redirect to the checkout page
    navigate(`/checkout?amount=${amountInCents}&fundraiser=${fundraiserId}&title=${encodeURIComponent(title)}`);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  // "Contribute" button component that expands the payment area
  const ContributeButton = () => {
    const [expanded, setExpanded] = React.useState(false);
    const [customAmount, setCustomAmount] = React.useState("");

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Allow only numbers and decimals
      if (/^(\d+\.?\d*)?$/.test(value)) {
        setCustomAmount(value);
      }
    };

    if (!expanded) {
      // If a custom trigger is provided, use it directly
      if (trigger) {
        return (
          <div onClick={() => setExpanded(true)}>
            {trigger}
          </div>
        );
      }
      // Otherwise, use the default button
      return (
        <Button 
          onClick={() => setExpanded(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          Contribute
        </Button>
      );
    }

    return (
      <Card className="p-3 space-y-3 border border-primary/20 bg-primary/5">
        <div className="text-sm font-medium">{title}</div>
        
        <div className="grid grid-cols-2 gap-2">
          {predefinedAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="py-2"
              onClick={() => handleDonate(amount)}
            >
              ${amount.toFixed(2)}
            </Button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
            <Input
              type="number"
              min="1"
              step="any"
              className="pl-10"
              placeholder="Other amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
            />
          </div>
          <Button 
            onClick={() => {
              const amount = parseFloat(customAmount);
              if (amount > 0) {
                handleDonate(amount);
              } else {
                toast({
                  title: "Invalid amount",
                  description: "Please enter an amount greater than zero.",
                  variant: "destructive",
                });
              }
            }}
            disabled={!customAmount || parseFloat(customAmount) <= 0}
          >
            Donate
          </Button>
        </div>
        
        <Button 
          variant="link" 
          className="text-xs text-neutral-500 p-0 h-auto"
          onClick={() => setExpanded(false)}
        >
          Cancel
        </Button>
      </Card>
    );
  };

  return <ContributeButton />;
}