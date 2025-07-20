import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Trash2, ShoppingCart } from 'lucide-react'
import { CartItem } from '@/types'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onRemoveItem: (index: number) => void
  onUpdateQuantity: (index: number, quantity: number) => void
  onProceedToOrder: () => void
}

export function CartSidebar({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onUpdateQuantity, 
  onProceedToOrder 
}: CartSidebarProps) {
  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cartItems.length})
          </SheetTitle>
          <SheetDescription>
            Review your selected items before proceeding to order
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Your cart is empty</p>
              <p className="text-sm text-slate-400 mt-1">Add products from the catalog to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.productName}</h4>
                      <p className="text-sm text-slate-600">Style: {item.styleCode}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.color}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Size {item.size}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Qty:</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                          className="h-8 w-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                      <p className="font-bold text-slate-900">
                        ${item.lineTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Total Items:</span>
                <span className="font-medium">{getTotalQuantity()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Button 
              onClick={onProceedToOrder}
              className="w-full bg-slate-900 hover:bg-slate-800"
              size="lg"
            >
              Proceed to Order Form
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}