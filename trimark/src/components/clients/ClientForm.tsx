import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useSpecialties } from '@/hooks/useSpecialties'
import { usePlans } from '@/hooks/usePlans'
import { hashDoc } from '@/lib/format'
import type { ClientWritePayload, ClientRow } from '@/hooks/useClients'
import type { ClientStatus } from '@/types'

interface Props {
  agencyId: string
  initial?: ClientRow
  submitting?: boolean
  onCancel: () => void
  onSubmit: (payload: ClientWritePayload) => Promise<void> | void
}

const STATUS: ClientStatus[] = ['prospect', 'onboarding', 'active', 'suspended', 'canceled']

export function ClientForm({ agencyId, initial, submitting, onCancel, onSubmit }: Props) {
  const specialties = useSpecialties()
  const plans = usePlans()

  const [fullName, setFullName] = useState(initial?.full_name ?? '')
  const [tradeName, setTradeName] = useState(initial?.trade_name ?? '')
  const [docType, setDocType] = useState<'cpf' | 'cnpj' | ''>(initial?.doc_type ?? '')
  const [docNumber, setDocNumber] = useState('')   // não populamos a partir de initial (criptografado)
  const [specialtyId, setSpecialtyId] = useState(initial?.specialty_id ?? '')
  const [councilType, setCouncilType] = useState(initial?.council_type ?? '')
  const [councilNumber, setCouncilNumber] = useState(initial?.council_number ?? '')
  const [councilState, setCouncilState] = useState((initial as unknown as { council_state?: string })?.council_state ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone_primary ?? '')
  const [instagram, setInstagram] = useState((initial as unknown as { instagram_handle?: string })?.instagram_handle ?? '')
  const [website, setWebsite] = useState((initial as unknown as { website_url?: string })?.website_url ?? '')
  const [planId, setPlanId] = useState(initial?.plan_id ?? '')
  const [billingDay, setBillingDay] = useState<string>(initial?.billing_day?.toString() ?? '')
  const [contractValue, setContractValue] = useState(initial?.contract_value ?? '')
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? 'prospect')
  const [notes, setNotes] = useState((initial as unknown as { notes?: string })?.notes ?? '')

  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !specialtyId) {
      setError('Nome e especialidade são obrigatórios.')
      return
    }
    const billing = billingDay ? Number(billingDay) : null
    if (billing !== null && (!Number.isInteger(billing) || billing < 1 || billing > 28)) {
      setError('Dia de vencimento deve estar entre 1 e 28.')
      return
    }

    let docHash: string | null = null
    if (docType && docNumber) {
      docHash = await hashDoc(docNumber)
    }

    try {
      await onSubmit({
        agency_id: agencyId,
        full_name: fullName.trim(),
        trade_name: tradeName.trim() || null,
        doc_type: docType || null,
        doc_number_hash: docHash,
        specialty_id: specialtyId,
        council_type: councilType.trim() || null,
        council_number: councilNumber.trim() || null,
        council_state: councilState.trim() || null,
        email: email.trim() || null,
        phone_primary: phone.trim() || null,
        instagram_handle: instagram.trim() || null,
        website_url: website.trim() || null,
        plan_id: planId || null,
        billing_day: billing,
        contract_value: contractValue ? String(contractValue) : null,
        status,
        notes: notes.trim() || null,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Section title="Identificação">
        <Field label="Nome completo *">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Field>
        <Field label="Nome fantasia / clínica">
          <Input value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
        </Field>
        <Field label="Tipo de documento">
          <Select value={docType} onChange={(e) => setDocType(e.target.value as 'cpf' | 'cnpj' | '')}>
            <option value="">—</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
          </Select>
        </Field>
        <Field label="CPF/CNPJ (somente números)">
          <Input
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder={initial ? '(armazenado, não exibido)' : ''}
            inputMode="numeric"
          />
        </Field>
      </Section>

      <Section title="Especialidade e conselho">
        <Field label="Especialidade *">
          <Select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} required>
            <option value="">— escolher —</option>
            {specialties.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.category}: {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Conselho (CRM/CRO/CRP/...)">
          <Input value={councilType} onChange={(e) => setCouncilType(e.target.value)} />
        </Field>
        <Field label="Número do conselho">
          <Input value={councilNumber} onChange={(e) => setCouncilNumber(e.target.value)} />
        </Field>
        <Field label="UF">
          <Input value={councilState} onChange={(e) => setCouncilState(e.target.value.toUpperCase())} maxLength={2} />
        </Field>
      </Section>

      <Section title="Contato e redes">
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Telefone (com DDD)">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Instagram (@handle)">
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </Field>
        <Field label="Site">
          <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </Field>
      </Section>

      <Section title="Contrato e cobrança">
        <Field label="Plano">
          <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">— sem plano —</option>
            {plans.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — R$ {Number(p.monthly_price).toFixed(2)}
              </option>
            ))}
          </Select>
          {plans.data && plans.data.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Nenhum plano cadastrado ainda. Cadastre em /admin/settings (TODO Phase 1).
            </p>
          )}
        </Field>
        <Field label="Dia de vencimento (1–28)">
          <Input
            type="number"
            min={1}
            max={28}
            value={billingDay}
            onChange={(e) => setBillingDay(e.target.value)}
          />
        </Field>
        <Field label="Valor mensal (R$)">
          <Input
            type="number"
            step="0.01"
            min={0}
            value={contractValue ?? ''}
            onChange={(e) => setContractValue(e.target.value)}
          />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section title="Observações" twoCols={false}>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
      </Section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando…' : initial ? 'Salvar alterações' : 'Cadastrar cliente'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function Section({
  title,
  twoCols = true,
  children,
}: {
  title: string
  twoCols?: boolean
  children: React.ReactNode
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-foreground">{title}</legend>
      <div className={twoCols ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''}>{children}</div>
    </fieldset>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
