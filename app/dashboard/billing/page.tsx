"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import PlansPage from "./plans/page"
import SubscriptionHistoryPage from "./plans/history/page"
import PaymentMethodsPage from "./payment-methods/page"

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("plans")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription, plans, and payment methods</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <PlansPage />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <SubscriptionHistoryPage />
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <PaymentMethodsPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
