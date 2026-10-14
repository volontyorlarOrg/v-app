import { LANGUAGE_BOOT_SCRIPT } from "@/lib/language-guard";

export function LanguageScript() {
  return <script dangerouslySetInnerHTML={{ __html: LANGUAGE_BOOT_SCRIPT }} />;
}
