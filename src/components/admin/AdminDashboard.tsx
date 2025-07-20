import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import blink from '@/blink/client'
import { Product, Stock, Order, Customer } from '@/types'

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      const [productsData, stockData, ordersData, customersData] = await Promise.all([
        blink.db.products.list(),
        blink.db.stock.list(),
        blink.db.orders.list({ orderBy: { createdAt: 'desc' } }),
        blink.db.customers.list({ orderBy: { createdAt: 'desc' } })
      ])

      setProducts(productsData)
      setStock(stockData)
      setOrders(ordersData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const updateStockFromFile = async () => {
    // Simulate updating stock levels
    const stockUpdates = [
      { productId: 'dia-001', size: 'S', quantity: 25 },
      { productId: 'dia-001', size: 'M', quantity: 30 },
      { productId: 'dia-001', size: 'L', quantity: 20 },
      { productId: 'dia-002', size: '8', quantity: 15 },
      { productId: 'dia-002', size: '9', quantity: 18 },
      { productId: 'dia-002', size: '10', quantity: 22 }
    ]

    for (const update of stockUpdates) {
      const existingStock = stock.find(s => 
        s.productId === update.productId && s.size === update.size
      )

      if (existingStock) {
        await blink.db.stock.update(existingStock.id, {
          quantity: update.quantity
        })
      }
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) return

    try {
      // Upload file to storage
      const { publicUrl } = await blink.storage.upload(
        uploadFile,
        `stock-uploads/${uploadFile.name}`,
        { upsert: true }
      )

      // In a real implementation, you would parse the Excel file
      // For now, we'll simulate updating stock levels
      console.log('File uploaded:', publicUrl)
      
      // Simulate stock update
      await updateStockFromFile()
      await loadDashboardData()
      
      setUploadFile(null)
      alert('Stock data updated successfully!')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file. Please try again.')
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'destructive' }
    if (quantity < 10) return { label: 'Low Stock', color: 'warning' }
    return { label: 'In Stock', color: 'success' }
  }

  const calculateStats = () => {
    const totalProducts = products.length
    const totalCustomers = customers.length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    return { totalProducts, totalCustomers, totalOrders, totalRevenue }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Stock Management</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          {/* Excel Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Stock Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stock-file">Excel File (.xlsx, .xls)</Label>
                <Input
                  id="stock-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button 
                onClick={handleFileUpload} 
                disabled={!uploadFile}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload & Update Stock
              </Button>
            </CardContent>
          </Card>

          {/* Stock Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Current Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Product</th>
                      <th className="border border-gray-300 p-2 text-left">Size</th>
                      <th className="border border-gray-300 p-2 text-right">Quantity</th>
                      <th className="border border-gray-300 p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((item) => {
                      const product = products.find(p => p.id === item.productId)
                      const status = getStockStatus(item.quantity)
                      return (
                        <tr key={item.id}>
                          <td className="border border-gray-300 p-2">
                            {product?.name || 'Unknown Product'}
                          </td>
                          <td className="border border-gray-300 p-2">{item.size}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Badge variant={status.color as any}>{status.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Order #</th>
                      <th className="border border-gray-300 p-2 text-left">Customer</th>
                      <th className="border border-gray-300 p-2 text-left">Date</th>
                      <th className="border border-gray-300 p-2 text-right">Amount</th>
                      <th className="border border-gray-300 p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const customer = customers.find(c => c.id === order.customerId)
                      return (
                        <tr key={order.id}>
                          <td className="border border-gray-300 p-2">{order.orderNumber}</td>
                          <td className="border border-gray-300 p-2">
                            {customer?.companyName || 'Unknown Customer'}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            ${order.totalAmount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            <Badge variant="outline">{order.status}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Company</th>
                      <th className="border border-gray-300 p-2 text-left">Contact</th>
                      <th className="border border-gray-300 p-2 text-left">Email</th>
                      <th className="border border-gray-300 p-2 text-left">Phone</th>
                      <th className="border border-gray-300 p-2 text-left">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="border border-gray-300 p-2">{customer.companyName}</td>
                        <td className="border border-gray-300 p-2">{customer.contactPerson}</td>
                        <td className="border border-gray-300 p-2">{customer.email}</td>
                        <td className="border border-gray-300 p-2">{customer.phone}</td>
                        <td className="border border-gray-300 p-2">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.styleCode}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <div className="mt-2">
                        <p className="text-sm">
                          <strong>List:</strong> ${product.listPrice.toFixed(2)}
                        </p>
                        <p className="text-sm">
                          <strong>RSP:</strong> ${product.rspPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Colors: {product.colors.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Sizes: {product.sizes.join(', ')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}