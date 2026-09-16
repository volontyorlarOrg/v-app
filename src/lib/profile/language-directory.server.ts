import "server-only";

import en from "@/i18n/messages/en.json";
import ru from "@/i18n/messages/ru.json";
import uz from "@/i18n/messages/uz.json";
import { createLanguageDirectory } from "@/lib/profile/languages";

export const languageDirectory = createLanguageDirectory({
  en: en.languages,
  ru: ru.languages,
  uz: uz.languages,
});
