"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Lock, CheckCircle2, Loader2, Wallet, Plus } from "lucide-react"
import { changeSubscription, fetchMySubscription, fetchPaymentMethods, selectPaymentMethods } from "@/store/slices/subscriptionSlice"
import type { AppDispatch } from "@/store/store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Plan {
  id: number
  plan_name: string
  plan_slug: string
  plan_tier: string
  price_monthly?: number
  price_yearly?: number
  currency?: string
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan
  billingCycle:  "monthly" | "annual" | "quarterly"
}

/**
 * Render a checkout modal that lets the user review an order, choose or enter a payment method, and complete a subscription change.
 *
 * @param isOpen - Controls whether the modal is visible
 * @param onClose - Callback invoked to close the modal; also used to reset internal form state when not processing
 * @param plan - The subscription plan being purchased or changed to
 * @param billingCycle - The billing cadence to display and submit ("monthly", "annual", or "quarterly")
 * @returns A React element containing the checkout dialog UI
 */
export function CheckoutModal({ isOpen, onClose, plan, billingCycle }: CheckoutModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const paymentMethods = useSelector(selectPaymentMethods)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "success">("details")
  const [paymentMethod, setPaymentMethod] = useState<"saved" | "new">("new")
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<number | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>("stripe")

  // Form state for new payment method
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [savePaymentMethod, setSavePaymentMethod] = useState(true)

  const providers = [
    { value: "stripe", label: "Stripe", icon: CreditCard },
    { value: "paypal", label: "PayPal", icon: Wallet },
    { value: "razorpay", label: "Razorpay", icon: CreditCard },
    { value: "googlepay", label: "Google Pay", icon: Wallet },
  ]

  // Don't fetch here - let parent component handle it

  const price =
    billingCycle === "annual" ? plan.price_yearly || 0 : plan.price_monthly || 0
  const savings = billingCycle === "annual" && plan.price_monthly 
    ? (plan.price_monthly * 12 - (plan.price_yearly || 0)).toFixed(2)
    : null

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned
    return formatted.substring(0, 19) // 16 digits + 3 spaces
  }

  const formatExpiryMonth = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 2)
  }

  const formatExpiryYear = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 2)
  }

  const handleSubmit = async () => {
    let paymentData: any = null

    // Validate payment method
    if (paymentMethod === "saved") {
      if (!selectedSavedMethod) {
        toast.error("Please select a payment method")
        return
      }
    } else {
      // Validate new payment method
      if (selectedProvider === "paypal") {
        if (!paypalEmail) {
          toast.error("Please enter PayPal email")
          return
        }
        paymentData = {
          provider: "paypal",
          methodType: "digital_wallet",
          paypalEmail,
          isDefault: savePaymentMethod,
          autoRenewEnabled: true
        }
      } else if (selectedProvider === "googlepay") {
        toast.info("Redirecting to Google Pay...")
        return
      } else {
        if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
          toast.error("Please fill in all card details")
          return
        }

        if (cardNumber.replace(/\s/g, "").length !== 16) {
          toast.error("Invalid card number")
          return
        }

        if (expiryMonth.length !== 2 || parseInt(expiryMonth) > 12 || parseInt(expiryMonth) < 1) {
          toast.error("Invalid expiry month")
          return
        }

        if (expiryYear.length !== 2) {
          toast.error("Invalid expiry year")
          return
        }

        if (cvv.length !== 3) {
          toast.error("Invalid CVV")
          return
        }

        paymentData = {
          provider: selectedProvider,
          methodType: "credit_card",
          cardNumber: cardNumber.replace(/\s/g, ""),
          cardHolderName: cardName,
          cardExpMonth: parseInt(expiryMonth),
          cardExpYear: parseInt(expiryYear),
          cardCvv: cvv,
          isDefault: savePaymentMethod,
          autoRenewEnabled: true
        }
      }
    }

    setIsProcessing(true)
    setPaymentStep("processing")

    try {
      // Call backend to update subscription with payment data
      await dispatch(
        changeSubscription({
          planId: plan.id,
          billingCycle: billingCycle === "annual" ? "yearly" : "monthly",
          changeReason: "Plan upgrade via checkout",
          paymentData: paymentMethod === "new" ? paymentData : undefined
        })
      ).unwrap()

      // Refresh subscription data
      await dispatch(fetchMySubscription())

      setPaymentStep("success")
      
      // Auto close and redirect after 2 seconds
      setTimeout(() => {
        onClose()
        router.push("/dashboard")
        toast.success("Subscription updated successfully!")
      }, 2000)
    } catch (error: any) {
      console.error("Payment failed:", error)
      toast.error(error?.message || "Payment failed. Please try again.")
      setPaymentStep("details")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
      setPaymentStep("details")
      setCardNumber("")
      setCardName("")
      setExpiryMonth("")
      setExpiryYear("")
      setCvv("")
      setPaypalEmail("")
      setSavePaymentMethod(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        {paymentStep === "details" && (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
              <DialogDescription>
                Secure checkout for {plan.plan_name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 pr-2">
              {/* Order Summary */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <span className="font-medium">{plan.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Billing</span>
                    <span className="font-medium capitalize">{billingCycle}</span>
                  </div>
                  {savings && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Annual Savings</span>
                      <span className="font-medium">-${savings}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-3">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as "saved" | "new")}>
                  {paymentMethods.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {paymentMethods.map((pm: any) => (
                        <div
                          key={pm.id}
                          className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setPaymentMethod("saved")
                            setSelectedSavedMethod(pm.id)
                          }}
                        >
                          <RadioGroupItem value="saved" id={`saved-${pm.id}`} checked={paymentMethod === "saved" && selectedSavedMethod === pm.id} />
                          <Label htmlFor={`saved-${pm.id}`} className="flex-1 cursor-pointer flex items-center gap-2">
                            {pm.provider === "paypal" || pm.provider === "googlepay" ? (
                              <Wallet className="h-4 w-4" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                            <span className="capitalize">
                              {pm.provider === "paypal" ? pm.paypal_email : pm.provider === "googlepay" ? "Google Pay" : `${pm.card_brand} ••••${pm.card_last_four}`}
                            </span>
                            {pm.is_default && <Badge variant="secondary" className="ml-auto">Default</Badge>}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Add New Payment Method</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* New Payment Method Form */}
              {paymentMethod === "new" && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div>
                    <Label className="mb-2">Select Provider</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {providers.map((provider) => {
                        const Icon = provider.icon
                        return (
                          <Button
                            key={provider.value}
                            type="button"
                            variant={selectedProvider === provider.value ? "primary" : "outline"}
                            className="justify-start"
                            onClick={() => setSelectedProvider(provider.value)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {provider.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {selectedProvider === "paypal" ? (
                    <div>
                      <Label htmlFor="paypalEmail">PayPal Email</Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                      />
                    </div>
                  ) : selectedProvider === "googlepay" ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      You will be redirected to Google Pay to complete the payment
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="expiryMonth">Month</Label>
                          <Input
                            id="expiryMonth"
                            placeholder="MM"
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(formatExpiryMonth(e.target.value))}
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryYear">Year</Label>
                          <Input
                            id="expiryYear"
                            placeholder="YY"
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(formatExpiryYear(e.target.value))}
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="savePaymentMethod"
                      checked={savePaymentMethod}
                      onChange={(e) => setSavePaymentMethod(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="savePaymentMethod" className="text-sm cursor-pointer">
                      Save this payment method for future use
                    </Label>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Secure 256-bit SSL encrypted payment</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} disabled={isProcessing} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isProcessing} className="flex-1">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay ${price}</>
                  )}
                </Button>
              </div>
            </div>
            </div>
          </>
        )}

        {paymentStep === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-sm text-muted-foreground">Please wait while we process your payment...</p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your subscription has been updated to {plan.plan_name}
            </p>
            <Badge variant="secondary">Redirecting to dashboard...</Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}