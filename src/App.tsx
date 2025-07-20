import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { CustomerInfoForm } from '@/components/forms/CustomerInfoForm'
import { ProductCatalog } from '@/components/catalog/ProductCatalog'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { OrderForm } from '@/components/orders/OrderForm'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import blink from '@/blink/client'
import { Customer, Product, StockLevel, CartItem } from '@/types'

type AppStep = 'customer-info' | 'catalog' | 'order-form' | 'admin'

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('customer-info')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadProductsAndStock = useCallback(async () => {
    if (!user) return
    
    try {
      const [productsData, stockData] = await Promise.all([
        blink.db.products.list({ where: { userId: user.id } }),
        blink.db.stock.list({ where: { userId: user.id } })
      ])

      const formattedProducts: Product[] = productsData.map(p => ({
        ...p,
        colors: JSON.parse(p.colors),
        sizes: JSON.parse(p.sizes)
      }))

      const formattedStock: StockLevel[] = stockData.map(s => ({
        ...s,
        status: s.quantity === 0 ? 'out-of-stock' : s.quantity < 10 ? 'low-stock' : 'in-stock'
      }))

      setProducts(formattedProducts)
      setStockLevels(formattedStock)
    } catch (error) {
      console.error('Error loading products and stock:', error)
    }
  }, [user])

  const loadSampleData = useCallback(async () => {
    if (!user) return

    try {
      // Check if products already exist
      const existingProducts = await blink.db.products.list({ where: { userId: user.id } })
      if (existingProducts.length > 0) {
        await loadProductsAndStock()
        return
      }

      // Sample products based on Diadora catalog
      const sampleProducts: Omit<Product, 'id' | 'userId' | 'createdAt'>[] = [
        {
          name: 'N9000 Premium',
          styleCode: 'N9000-001',
          category: 'T1',
          material: 'Leather/Mesh',
          listPrice: 120.00,
          rspPrice: 180.00,
          colors: ['White', 'Black', 'Navy', 'Grey'],
          sizes: ['7', '8', '9', '10', '11', '12']
        },
        {
          name: 'B.Elite Premium',
          styleCode: 'BE-002',
          category: 'T1',
          material: 'Leather',
          listPrice: 95.00,
          rspPrice: 140.00,
          colors: ['White', 'Black', 'Brown'],
          sizes: ['7', '8', '9', '10', '11', '12']
        },
        {
          name: 'Training Jacket',
          styleCode: 'TJ-003',
          category: 'T2',
          material: '100% Polyester',
          listPrice: 65.00,
          rspPrice: 95.00,
          colors: ['Navy', 'Black', 'Red'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL']
        },
        {
          name: 'Performance T-Shirt',
          styleCode: 'PT-004',
          category: 'T2',
          material: '95% Cotton, 5% Elastane',
          listPrice: 25.00,
          rspPrice: 40.00,
          colors: ['White', 'Black', 'Navy', 'Red'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        },
        {
          name: 'Heritage Sneaker',
          styleCode: 'HS-005',
          category: 'T1',
          material: 'Suede/Canvas',
          listPrice: 85.00,
          rspPrice: 125.00,
          colors: ['Grey', 'Navy', 'Green'],
          sizes: ['7', '8', '9', '10', '11', '12']
        },
        {
          name: 'Track Pants',
          styleCode: 'TP-006',
          category: 'T2',
          material: '100% Polyester',
          listPrice: 45.00,
          rspPrice: 70.00,
          colors: ['Black', 'Navy', 'Grey'],
          sizes: ['S', 'M', 'L', 'XL', 'XXL']
        }
      ]

      // Create products in database
      for (const productData of sampleProducts) {
        const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await blink.db.products.create({
          id: productId,
          name: productData.name,
          styleCode: productData.styleCode,
          category: productData.category,
          material: productData.material,
          listPrice: productData.listPrice,
          rspPrice: productData.rspPrice,
          colors: JSON.stringify(productData.colors),
          sizes: JSON.stringify(productData.sizes),
          userId: user.id
        })

        // Create stock levels for each color/size combination
        for (const color of productData.colors) {
          for (const size of productData.sizes) {
            const stockQuantity = Math.floor(Math.random() * 50) + 5 // Random stock 5-54
            await blink.db.stock.create({
              id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId,
              color,
              size,
              quantity: stockQuantity,
              userId: user.id
            })
          }
        }
      }

      // Load products and stock from database
      await loadProductsAndStock()
      
      toast({
        title: "Sample data loaded",
        description: "Diadora catalog is ready for browsing"
      })
    } catch (error) {
      console.error('Error loading sample data:', error)
      toast({
        title: "Error",
        description: "Failed to load catalog data",
        variant: "destructive"
      })
    }
  }, [user, loadProductsAndStock, toast])

  // Load sample products and stock data
  useEffect(() => {
    if (user) {
      loadSampleData()
    }
  }, [user, loadSampleData])

  const handleCustomerSubmit = async (customerData: Omit<Customer, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return

    try {
      const customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newCustomer = await blink.db.customers.create({
        id: customerId,
        companyName: customerData.companyName,
        contactPerson: customerData.contactPerson,
        phone: customerData.phone,
        email: customerData.email,
        deliveryAddress: customerData.deliveryAddress,
        billingAddress: customerData.billingAddress,
        specialInstructions: customerData.specialInstructions,
        userId: user.id
      })

      setCustomer(newCustomer)
      setCurrentStep('catalog')
      
      toast({
        title: "Customer information saved",
        description: "You can now browse the catalog"
      })
    } catch (error) {
      console.error('Error saving customer:', error)
      toast({
        title: "Error",
        description: "Failed to save customer information",
        variant: "destructive"
      })
    }
  }

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        existing => 
          existing.productId === item.productId &&
          existing.color === item.color &&
          existing.size === item.size
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        }
        return updated
      } else {
        return [...prev, item]
      }
    })

    toast({
      title: "Added to cart",
      description: `${item.quantity}x ${item.name} (${item.color}, Size ${item.size})`
    })
  }

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
    toast({
      title: "Removed from cart",
      description: "Item has been removed"
    })
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setCartItems(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        quantity
      }
      return updated
    })
  }

  const handleProceedToOrder = () => {
    setIsCartOpen(false)
    setCurrentStep('order-form')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Diadora Catalog...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Please sign in to continue</h1>
          <p className="text-slate-600">You need to be authenticated to access the Diadora catalog</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)}
        onUploadClick={() => setCurrentStep('admin')}
        onAdminClick={() => setCurrentStep('admin')}
      />

      <main className="pb-8">
        {currentStep === 'customer-info' && (
          <div className="py-12">
            <CustomerInfoForm onSubmit={handleCustomerSubmit} />
          </div>
        )}

        {currentStep === 'catalog' && (
          <ProductCatalog
            products={products}
            stockLevels={stockLevels}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentStep === 'order-form' && (
          <div className="py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <OrderForm
                cartItems={cartItems}
                customer={customer}
                onOrderComplete={(orderId) => {
                  toast({
                    title: "Order submitted successfully!",
                    description: `Order ${orderId} has been created`
                  })
                  setCartItems([])
                  setCurrentStep('catalog')
                }}
              />
            </div>
          </div>
        )}

        {currentStep === 'admin' && (
          <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>
              <AdminDashboard />
            </div>
          </div>
        )}
      </main>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToOrder={handleProceedToOrder}
      />

      <Toaster />
    </div>
  )
}

export default App