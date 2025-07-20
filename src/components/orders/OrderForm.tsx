import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Download, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import blink from '@/blink/client'
import { CartItem, Customer, Order } from '@/types'

interface OrderFormProps {
  cartItems: CartItem[]
  customer: Customer | null
  onOrderComplete: (orderId: string) => void
}

export function OrderForm({ cartItems, customer, onOrderComplete }: OrderFormProps) {
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signature, setSignature] = useState('')

  useEffect(() => {
    // Generate order number
    const generateOrderNumber = () => {
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `DIA${year}${month}${day}${random}`
    }
    setOrderNumber(generateOrderNumber())
  }, [])

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmitOrder = async () => {
    if (!customer || !deliveryDate) return

    setIsSubmitting(true)
    try {
      const user = await blink.auth.me()
      
      // Create order in database
      const order = await blink.db.orders.create({
        id: orderNumber,
        customerId: customer.id,
        userId: user.id,
        orderNumber,
        orderDate: new Date().toISOString().split('T')[0], // Date only
        deliveryMonth: format(deliveryDate, 'MMMM yyyy'),
        totalAmount: calculateTotal(),
        status: 'pending'
      })

      // Create order items
      for (const item of cartItems) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await blink.db.orderItems.create({
          id: itemId,
          orderId: orderNumber,
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.price,
          lineTotal: item.price * item.quantity,
          userId: user.id
        })
      }

      onOrderComplete(orderNumber)
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePDF = async () => {
    // This would integrate with a PDF generation service
    // For now, we'll create a simple download
    const orderData = {
      orderNumber,
      customer,
      items: cartItems,
      deliveryDate,
      specialInstructions,
      total: calculateTotal()
    }
    
    const dataStr = JSON.stringify(orderData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order-${orderNumber}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!customer) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please complete customer information first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order Form - {orderNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Order Date</Label>
              <Input value={format(new Date(), 'dd/MM/yyyy')} disabled />
            </div>
            <div>
              <Label>Order Number</Label>
              <Input value={orderNumber} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Company:</strong> {customer.companyName}</p>
              <p><strong>Contact:</strong> {customer.contactPerson}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Email:</strong> {customer.email}</p>
            </div>
            <div>
              <p><strong>Delivery Address:</strong></p>
              <p className="text-gray-600">{customer.deliveryAddress}</p>
              <p><strong>Billing Address:</strong></p>
              <p className="text-gray-600">{customer.billingAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Style Code</th>
                  <th className="border border-gray-300 p-2 text-left">Product Name</th>
                  <th className="border border-gray-300 p-2 text-left">Color</th>
                  <th className="border border-gray-300 p-2 text-left">Size</th>
                  <th className="border border-gray-300 p-2 text-right">Qty</th>
                  <th className="border border-gray-300 p-2 text-right">Unit Price</th>
                  <th className="border border-gray-300 p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{item.styleCode}</td>
                    <td className="border border-gray-300 p-2">{item.name}</td>
                    <td className="border border-gray-300 p-2">{item.color}</td>
                    <td className="border border-gray-300 p-2">{item.size}</td>
                    <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-right">${item.price.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={6} className="border border-gray-300 p-2 text-right">Total Amount:</td>
                  <td className="border border-gray-300 p-2 text-right">${calculateTotal().toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery and Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery & Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deliveryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "PPP") : "Select delivery date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Enter any special delivery or handling instructions..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="signature">Digital Signature (Buyer Name)</Label>
            <Input
              id="signature"
              placeholder="Enter buyer's full name as digital signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={generatePDF}
          variant="outline"
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Order (JSON)
        </Button>
        <Button
          onClick={handleSubmitOrder}
          disabled={!deliveryDate || !signature || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Order'}
        </Button>
      </div>
    </div>
  )
}