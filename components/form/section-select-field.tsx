"use client";

import { Field } from "@/components/form/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SectionOption = {
  id: string;
  name: string;
  code: string;
};

export function SectionSelectField({
  sections,
  defaultValue,
  required = true,
  disabled = false,
}: {
  sections: SectionOption[];
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <Field
      label="Sezione"
      hint={
        disabled
          ? "La sezione non puo essere modificata dopo l'emissione della tessera."
          : "Il numero tessera verra generato automaticamente in base alla sezione."
      }
    >
      <Select name="section_id" defaultValue={defaultValue} required={required} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Seleziona sezione" />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem key={section.id} value={section.id}>
              {section.name} ({section.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
