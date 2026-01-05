"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Wallet } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { AppDispatch, RootState } from "@/store/store"
import { 
  fetchPaymentMethods, 
  addPaymentMethod, 
  deletePaymentMethod,
  selectPaymentMethods,
  selectSubscriptionLoading
} from "@/store/slices/subscriptionSlice"
import { useState } from "react"

export default function PaymentMethodsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const paymentMethods = useSelector(selectPaymentMethods)
  const isLoading = useSelector(selectSubscriptionLoading)
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>("stripe")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [autoRenew, setAutoRenew] = useState(false)

  const providers = [
    { value: "stripe", label: "Stripe", icon: CreditCard },
    { value: "paypal", label: "PayPal", icon: Wallet },
    { value: "razorpay", label: "Razorpay", icon: CreditCard },
    { value: "googlepay", label: "Google Pay", icon: Wallet },
  ]

  useEffect(() => {
    dispatch(fetchPaymentMethods())
  }, [])

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned
    return formatted.substring(0, 19)
  }

  const handleAddPaymentMethod = async () => {
    let payload: any = {
      provider: selectedProvider,
      isDefault,
      autoRenewEnabled: autoRenew
    }

    if (selectedProvider === "paypal") {
      if (!paypalEmail) {
        toast.error("Please enter PayPal email")
        return
      }
      payload.methodType = "digital_wallet"
      payload.paypalEmail = paypalEmail
    } else if (selectedProvider === "googlepay") {
      toast.info("Redirecting to Google Pay...")
      return
    } else {
      if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
        toast.error("Please fill in all fields")
        return
      }
      payload.methodType = "credit_card"
      payload.cardNumber = cardNumber.replace(/\s/g, "")
      payload.cardHolderName = cardName
      payload.cardExpMonth = parseInt(expiryMonth)
      payload.cardExpYear = parseInt(expiryYear)
      payload.cardCvv = cvv
    }

    setIsSubmitting(true)
    try {
      await dispatch(addPaymentMethod(payload)).unwrap()
      toast.success("Payment method added successfully")
      setIsAddDialogOpen(false)
      resetForm()
      dispatch(fetchPaymentMethods())
    } catch (error: any) {
      toast.error(error || "Failed to add payment method")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePaymentMethod = async (id: number) => {
    setIsDeleting(id)
    try {
      await dispatch(deletePaymentMethod(id)).unwrap()
      toast.success("Payment method deleted")
    } catch (error: any) {
      toast.error(error || "Failed to delete payment method")
    } finally {
      setIsDeleting(null)
    }
  }

  const resetForm = () => {
    setCardNumber("")
    setCardName("")
    setExpiryMonth("")
    setExpiryYear("")
    setCvv("")
    setPaypalEmail("")
    setIsDefault(false)
    setAutoRenew(false)
    setSelectedProvider("stripe")
  }

  if (isLoading && paymentMethods.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-muted-foreground mt-1">Manage your payment methods for subscriptions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Choose a payment provider and add your payment details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Payment Provider</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {providers.map((provider) => {
                    const Icon = provider.icon
                    return (
                      <Button
                        key={provider.value}
                        type="button"
                        variant={selectedProvider === provider.value ? "primary" : "secondary"}
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
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You will be redirected to Google Pay to complete the setup
                  </AlertDescription>
                </Alert>
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
                        onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").substring(0, 2))}
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">Year</Label>
                      <Input
                        id="expiryYear"
                        placeholder="YY"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").substring(0, 2))}
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

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="isDefault" checked={isDefault} onCheckedChange={(checked) => setIsDefault(checked as boolean)} />
                  <Label htmlFor="isDefault" className="cursor-pointer">Set as default payment method</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoRenew" checked={autoRenew} onCheckedChange={(checked) => setAutoRenew(checked as boolean)} />
                  <Label htmlFor="autoRenew" className="cursor-pointer">Enable auto-renewal</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddPaymentMethod} disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedProvider === "googlepay" ? "Connect" : "Add"} {providers.find(p => p.value === selectedProvider)?.label}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
            <p className="text-muted-foreground mb-4">Add a payment method to enable auto-renewal</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.map((method: any) => (
            <Card key={method.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {method.provider === "paypal" || method.provider === "googlepay" ? (
                        <Wallet className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base capitalize">
                        {method.provider === "paypal" ? (
                          method.paypal_email
                        ) : method.provider === "googlepay" ? (
                          "Google Pay"
                        ) : (
                          `${method.card_brand} •••• ${method.card_last_four}`
                        )}
                      </CardTitle>
                      <CardDescription>
                        {method.provider === "paypal" || method.provider === "googlepay" ? (
                          method.provider.charAt(0).toUpperCase() + method.provider.slice(1)
                        ) : (
                          `Expires ${method.card_exp_month}/${method.card_exp_year}`
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    disabled={isDeleting === method.id}
                  >
                    {isDeleting === method.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {method.is_default && <Badge variant="primary">Default</Badge>}
                  {method.auto_renew_enabled && <Badge variant="secondary">Auto-renewal</Badge>}
                  {method.is_verified && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
