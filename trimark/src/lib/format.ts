// Helpers de formatação BR.

export function formatCurrencyBRL(value: number | string | null | undefined): string {
  if (value == null || value === '') return '—'
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('pt-BR')
  } catch {
    return '—'
  }
}

export function maskDoc(raw: string, type: 'cpf' | 'cnpj' | null | undefined): string {
  const d = (raw ?? '').replace(/\D/g, '')
  if (!d) return '—'
  if (type === 'cnpj' || d.length === 14) {
    // 00.000.000/0000-00
    return d.padEnd(14, ' ').slice(0, 14)
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
  }
  // CPF 000.000.000-00
  return d.padEnd(11, ' ').slice(0, 11)
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4')
}

// SHA-256 hex do documento numérico — usado para `clients.doc_number_hash`.
// Encryption real (pgp_sym_encrypt) entra quando ENCRYPTION_KEY for ativada.
export async function hashDoc(raw: string): Promise<string | null> {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) return null
  const data = new TextEncoder().encode(digits)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
