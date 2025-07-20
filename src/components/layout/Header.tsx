import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, User, Upload } from 'lucide-react'

interface HeaderProps {
  cartItemCount: number
  onCartClick: () => void
  onUploadClick: () => void
}

export function Header({ cartItemCount, onCartClick, onUploadClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Info */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900">DIADORA</h1>
              <p className="text-xs text-slate-600">ZARSH HOLDINGS PTY LTD T/A SPORTIV</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadClick}
              className="hidden sm:flex"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Stock
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Account
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}