import { createLoader, createSerializer, parseAsStringLiteral } from "nuqs/server";

import { APPLICATION_GROUPS } from "./status";

export const applicationGroupParser =
  parseAsStringLiteral(APPLICATION_GROUPS).withDefault("all");

const applicationSearchParsers = { group: applicationGroupParser };

export const loadApplicationsSearch = createLoader(applicationSearchParsers);

export const serializeApplicationsSearch = createSerializer(applicationSearchParsers);
