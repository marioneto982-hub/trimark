// Helpers Asaas compartilhados (PRD §11.2).

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') ?? ''
const ASAAS_ENV     = Deno.env.get('ASAAS_ENV') ?? 'sandbox'

const BASE = ASAAS_ENV === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3'

export interface AsaasCustomer {
  id?: string
  name: string
  cpfCnpj?: string | null
  email?: string | null
  mobilePhone?: string | null
  externalReference?: string
}

export interface AsaasPaymentRequest {
  customer: string                // id Asaas do cliente
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'UNDEFINED'
  value: number
  dueDate: string                 // YYYY-MM-DD
  description?: string
  externalReference?: string
}

export interface AsaasPaymentResponse {
  id: string
  invoiceUrl?: string
  bankSlipUrl?: string
  identificationField?: string    // linha digitável boleto
  status?: string
}

export interface AsaasPixQrCode {
  encodedImage?: string
  payload?: string                // copia-e-cola
  expirationDate?: string
}

async function asaasFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!ASAAS_API_KEY) throw new Error('asaas_api_key_missing')
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      ...(init.headers ?? {}),
    },
  })
  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`asaas_http_${r.status}: ${txt.slice(0, 300)}`)
  }
  return r.json() as Promise<T>
}

export function searchCustomerByExternalRef(externalRef: string) {
  return asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?externalReference=${encodeURIComponent(externalRef)}`,
  )
}

export function createCustomer(c: AsaasCustomer) {
  return asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(c),
  })
}

export function createPayment(p: AsaasPaymentRequest) {
  return asaasFetch<AsaasPaymentResponse>('/payments', {
    method: 'POST',
    body: JSON.stringify(p),
  })
}

export function getPixQrCode(paymentId: string) {
  return asaasFetch<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`)
}

/** Garante que o cliente Trimark tem um customer Asaas associado (idempotente). */
export async function ensureAsaasCustomer(input: {
  trimarkClientId: string
  name: string
  email?: string | null
  cpfCnpj?: string | null
  phone?: string | null
}): Promise<string> {
  const externalRef = `trimark:${input.trimarkClientId}`
  const found = await searchCustomerByExternalRef(externalRef)
  if (found.data && found.data[0]?.id) return found.data[0].id!
  const created = await createCustomer({
    name: input.name,
    email: input.email ?? undefined,
    cpfCnpj: input.cpfCnpj ?? undefined,
    mobilePhone: input.phone ?? undefined,
    externalReference: externalRef,
  })
  if (!created.id) throw new Error('asaas_customer_id_missing')
  return created.id
}
