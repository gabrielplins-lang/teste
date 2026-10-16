import type { DeliveryZoneDTO } from "@feijuca/shared";
import { formatBRL } from "@feijuca/shared";
import { Field, TextInput } from "./Field";

export interface AddressValue {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  reference: string;
}

export const emptyAddress: AddressValue = { street: "", number: "", complement: "", neighborhood: "", reference: "" };

export function AddressFields({ value, onChange, zones, idPrefix, showFee = true }: {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  zones: DeliveryZoneDTO[];
  idPrefix: string;
  showFee?: boolean;
}) {
  const set = (k: keyof AddressValue) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="form-grid">
      <Field label="Bairro">
        <select id={`${idPrefix}-bairro`} className="input" value={value.neighborhood} onChange={set("neighborhood")} required>
          <option value="">Selecione o bairro</option>
          {zones.map((z) => (
            <option key={z.neighborhood} value={z.neighborhood}>
              {z.neighborhood}{showFee ? ` · entrega ${formatBRL(z.feeCents)}` : ""}
            </option>
          ))}
        </select>
      </Field>
      <div className="form-row">
        <Field label="Rua">
          <TextInput id={`${idPrefix}-rua`} value={value.street} onChange={set("street")} placeholder="Ex.: Estrada do Gabinal" autoComplete="address-line1" required />
        </Field>
        <Field label="Número">
          <TextInput id={`${idPrefix}-num`} value={value.number} onChange={set("number")} inputMode="numeric" className="input input--short" required />
        </Field>
      </div>
      <Field label="Complemento">
        <TextInput id={`${idPrefix}-comp`} value={value.complement} onChange={set("complement")} placeholder="Apto, bloco, casa" />
      </Field>
      <Field label="Ponto de referência">
        <TextInput id={`${idPrefix}-ref`} value={value.reference} onChange={set("reference")} placeholder="Ex.: em frente à padaria" />
      </Field>
    </div>
  );
}
