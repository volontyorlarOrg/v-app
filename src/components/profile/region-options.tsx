import { NativeSelectOption } from "@/components/ui/native-select";

export type RegionOption = { value: string; label: string };

export function RegionOptions({
  placeholder,
  regions,
}: {
  placeholder: string;
  regions: readonly RegionOption[];
}) {
  return (
    <>
      <NativeSelectOption value="">{placeholder}</NativeSelectOption>
      {regions.map((region) => (
        <NativeSelectOption key={region.value} value={region.value}>
          {region.label}
        </NativeSelectOption>
      ))}
    </>
  );
}
