import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Product, StockLevel, CartItem } from '@/types'

interface ProductCardProps {
  product: Product
  stockLevels: StockLevel[]
  onAddToCart: (item: CartItem) => void
}

export function ProductCard({ product, stockLevels, onAddToCart }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [deliveryDate, setDeliveryDate] = useState<Date>()

  const getStockStatus = (color: string, size: string) => {
    const stock = stockLevels.find(s => 
      s.productId === product.id && s.color === color && s.size === size
    )
    if (!stock || stock.quantity === 0) return 'out-of-stock'
    if (stock.quantity < 10) return 'low-stock'
    return 'in-stock'
  }

  const getStockQuantity = (color: string, size: string) => {
    const stock = stockLevels.find(s => 
      s.productId === product.id && s.color === color && s.size === size
    )
    return stock?.quantity || 0
  }

  const getStockIndicator = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <div className="w-3 h-3 bg-green-500 rounded-full" title="In Stock" />
      case 'low-stock':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Low Stock" />
      case 'out-of-stock':
        return <div className="w-3 h-3 bg-red-500 rounded-full" title="Out of Stock" />
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full" title="Unknown" />
    }
  }

  const handleQuantityChange = (size: string, value: string) => {
    const quantity = parseInt(value) || 0
    setQuantities(prev => ({ ...prev, [size]: quantity }))
  }

  const handleAddToCart = () => {
    Object.entries(quantities).forEach(([size, quantity]) => {
      if (quantity > 0) {
        const item: CartItem = {
          productId: product.id,
          productName: product.name,
          styleCode: product.styleCode,
          color: selectedColor,
          size,
          quantity,
          unitPrice: product.listPrice,
          lineTotal: quantity * product.listPrice
        }
        onAddToCart(item)
      }
    })
    setQuantities({})
  }

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  }

  const getTotalPrice = () => {
    return getTotalQuantity() * product.listPrice
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              {product.name}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Style Code: {product.styleCode}
            </p>
            {product.material && (
              <p className="text-sm text-slate-600">
                Material: {product.material}
              </p>
            )}
          </div>
          <Badge variant={product.category === 'T1' ? 'default' : 'secondary'}>
            {product.category === 'T1' ? 'Footwear' : 'Apparel'}
          </Badge>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-lg font-bold text-slate-900">
              LIST: ${product.listPrice.toFixed(2)}
            </p>
            <p className="text-sm text-slate-600">
              RSP: ${product.rspPrice.toFixed(2)}
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {deliveryDate ? format(deliveryDate, 'MMM dd') : 'Delivery Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={deliveryDate}
                onSelect={setDeliveryDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Color Selection */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Color:</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <Button
                key={color}
                variant={selectedColor === color ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedColor(color)}
                className="text-xs"
              >
                {color}
              </Button>
            ))}
          </div>
        </div>

        {/* Size Matrix */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Sizes & Quantities:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-1">Size</th>
                  {product.sizes.map((size) => (
                    <th key={size} className="text-center py-2 px-1 min-w-[60px]">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-1 font-medium">Stock</td>
                  {product.sizes.map((size) => {
                    const status = getStockStatus(selectedColor, size)
                    const quantity = getStockQuantity(selectedColor, size)
                    return (
                      <td key={size} className="text-center py-2 px-1">
                        <div className="flex items-center justify-center space-x-1">
                          {getStockIndicator(status)}
                          <span className="text-xs">{quantity}</span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
                <tr>
                  <td className="py-2 px-1 font-medium">Qty</td>
                  {product.sizes.map((size) => {
                    const status = getStockStatus(selectedColor, size)
                    const maxQty = getStockQuantity(selectedColor, size)
                    return (
                      <td key={size} className="text-center py-2 px-1">
                        <Input
                          type="number"
                          min="0"
                          max={maxQty}
                          value={quantities[size] || ''}
                          onChange={(e) => handleQuantityChange(size, e.target.value)}
                          disabled={status === 'out-of-stock'}
                          className="w-full h-8 text-xs text-center"
                          placeholder="0"
                        />
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary and Add to Cart */}
        {getTotalQuantity() > 0 && (
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Quantity:</span>
              <span className="text-sm font-bold">{getTotalQuantity()}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Total Price:</span>
              <span className="text-lg font-bold text-slate-900">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={!deliveryDate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            {!deliveryDate && (
              <p className="text-xs text-red-500 mt-1 text-center">
                Please select a delivery date
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}