import { REGIONS, type Region } from "@/lib/opportunities/types";

export type ProfileInput = {
  fullName: string;
  bio: string;
  school: string;
  gradeYear: string;
  region: Region | null;
  city: string;
  languages: string[];
  skills: string[];
  phone: string;
  telegram: string;
  links: string[];
};

const LIST_LIMITS = { languages: 10, skills: 20, links: 3 } as const;

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function list(formData: FormData, name: keyof typeof LIST_LIMITS): string[] {
  return text(formData, name)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, LIST_LIMITS[name]);
}

function region(formData: FormData): Region | null {
  const value = text(formData, "region");
  return (REGIONS as readonly string[]).includes(value) ? (value as Region) : null;
}

export function profileInputFromFormData(formData: FormData): ProfileInput {
  return {
    fullName: text(formData, "fullName"),
    bio: text(formData, "bio"),
    school: text(formData, "school"),
    gradeYear: text(formData, "gradeYear"),
    region: region(formData),
    city: text(formData, "city"),
    languages: list(formData, "languages"),
    skills: list(formData, "skills"),
    phone: text(formData, "phone"),
    telegram: text(formData, "telegram").replace(/^@+/, ""),
    links: list(formData, "links"),
  };
}

