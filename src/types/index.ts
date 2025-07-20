export interface Customer {
  id: string
  companyName: string
  contactPerson: string
  phone: string
  email: string
  deliveryAddress: string
  billingAddress: string
  specialInstructions?: string
  userId: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  styleCode: string
  category: 'T1' | 'T2'
  material?: string
  listPrice: number
  rspPrice: number
  colors: string[]
  sizes: string[]
  userId: string
  createdAt: string
}

export interface Stock {
  id: string
  productId: string
  color: string
  size: string
  quantity: number
  userId: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  orderDate: string
  deliveryDate?: string
  deliveryMonth?: string
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  signature?: string
  specialInstructions?: string
  userId: string
  createdAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  lineTotal: number
  userId: string
}

export interface CartItem {
  productId: string
  name: string
  styleCode: string
  color: string
  size: string
  quantity: number
  price: number
}

export interface StockLevel {
  productId: string
  color: string
  size: string
  quantity: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}