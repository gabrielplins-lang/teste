import { Icon } from "./Icon";

export function Stepper({ value, onChange, min = 0, max = 50, size = "md" }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  return (
    <div className={`stepper stepper--${size}`}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Diminuir">
        <Icon name="minus" size={18} />
      </button>
      <output>{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Aumentar">
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
