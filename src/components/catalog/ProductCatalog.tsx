import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { Product, StockLevel, CartItem } from '@/types'

interface ProductCatalogProps {
  products: Product[]
  stockLevels: StockLevel[]
  onAddToCart: (item: CartItem) => void
}

export function ProductCatalog({ products, stockLevels, onAddToCart }: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'T1' | 'T2'>('all')

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.styleCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const t1Products = filteredProducts.filter(p => p.category === 'T1')
  const t2Products = filteredProducts.filter(p => p.category === 'T2')

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Product Catalog</h1>
        <p className="text-slate-600">Browse our complete Diadora collection</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products or style codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Products ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="T1">T1 - Footwear ({t1Products.length})</TabsTrigger>
          <TabsTrigger value="T2">T2 - Apparel ({t2Products.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {/* T1 Section */}
          {t1Products.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">T1 - Footwear Collection</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {t1Products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    stockLevels={stockLevels}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            </div>
          )}

          {/* T2 Section */}
          {t2Products.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">T2 - Apparel Collection</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {t2Products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    stockLevels={stockLevels}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="T1">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {t1Products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                stockLevels={stockLevels}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="T2">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {t2Products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                stockLevels={stockLevels}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}