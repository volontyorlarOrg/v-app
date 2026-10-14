import { locales } from "@/i18n/routing";
import {
  LOCALE_COOKIE_ATTRIBUTES,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
} from "@/lib/preferences";

export const LANGUAGE_RELOAD_KEY = "volontyorlar_language_reload";

export const LANGUAGE_BOOT_SCRIPT = `(function(){var k="${LANGUAGE_RELOAD_KEY}",v=/^(?:${locales.join("|")})$/;function c(){try{var m=document.cookie.match(/(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]*)/),w=m&&v.test(m[1])?m[1]:null,t=null;try{t=localStorage.getItem("${LOCALE_STORAGE_KEY}")}catch(e){}if(t&&v.test(t)&&t!==w){document.cookie="${LOCALE_COOKIE_NAME}="+t+"; ${LOCALE_COOKIE_ATTRIBUTES}";w=t}if(!w||w===document.documentElement.lang){sessionStorage.removeItem(k);return}var p=location.pathname+location.search+"|"+w;if(sessionStorage.getItem(k)===p)return;sessionStorage.setItem(k,p);location.reload()}catch(e){}}c();addEventListener("pageshow",function(e){if(e.persisted)c()})})()`;
