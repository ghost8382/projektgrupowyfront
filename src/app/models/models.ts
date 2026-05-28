export interface ProductDTO {
  id?: number;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  categoryName?: string | null;
}

export interface StockMovementDTO {
  quantity: number;
  type: 'IN' | 'OUT';
  date: string;
}

export interface CategoryDTO {
  id?: number;
  name: string;
  parentId?: number | null;
  parentName?: string | null;
}

export interface UserDTO {
  id?: number;
  username: string;
  role: string;
}

export interface SaleItemDTO {
  productId: number;
  productName: string;
  quantity: number;
  priceAtSale: number;
  subtotal: number;
}

export interface SaleDTO {
  id?: number;
  date: string;
  userId: number;
  username: string;
  contractorId?: number | null;
  contractorName?: string | null;
  totalAmount: number;
  items: SaleItemDTO[];
}

export interface CreateSaleRequest {
  userId: number;
  contractorId?: number | null;
  items: { productId: number; quantity: number }[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ContractorDTO {
  id?: number;
  name: string;
  nip?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface CompanyConfigDTO {
  name?: string | null;
  nip?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  bankAccount?: string | null;
}
