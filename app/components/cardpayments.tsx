import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Wallet, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PaymentModalProps {
  onSubmit: (data: any) => Promise<void>;
}

export function PaymentModal({ onSubmit }: PaymentModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    isDefault: false
  });

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length >= 2) {
      return value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: "Payment details updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment details",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Update Card</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-gray-600" />
          </div>
          <DialogHeader>
            <DialogTitle>Update your card</DialogTitle>
            <DialogDescription>
              Your new card will replace your current card.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nameOnCard">Name on card</Label>
              <Input
                id="nameOnCard"
                value={formData.nameOnCard}
                onChange={(e) => setFormData({ ...formData, nameOnCard: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    cardNumber: formatCardNumber(e.target.value)
                  })}
                  required
                  maxLength={19}
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="expiryDate">Expiry date</Label>
                <Input
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    expiryDate: formatExpiry(e.target.value)
                  })}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>

              <div className="flex-1">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  value={formData.cvc}
                  onChange={(e) => setFormData({
                    ...formData,
                    cvc: e.target.value.replace(/\D/g, '').slice(0, 4)
                  })}
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="defaultPayment"
                checked={formData.isDefault}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isDefault: checked as boolean })
                }
              />
              <Label htmlFor="defaultPayment">Set as default payment method</Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Update card'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}