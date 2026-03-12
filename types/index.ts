export type LeadStatus = 'pending' | 'completed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  created_at: string;
  completed_at: string | null;
}

export interface LeadPhysicalCase {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string | null;
  active: boolean;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationCode {
  id: string;
  code: string;
  product_id: string;
  used: boolean;
  used_at: string | null;
  used_by_lead_id: string | null;
  created_at: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface CreateLeadResponse {
  leadId: string;
}

export interface ValidateCodeRequest {
  leadId: string;
  code: string;
}

export interface ValidateCodeSuccessResponse {
  success: true;
  productId?: string;
  productName?: string;
}

export interface ValidateCodeErrorResponse {
  error: string;
}
