import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"

export const IMPLEMENTED_LOCALE = ["en", "fr"]

export default getRequestConfig(async () => {
    try {
        let locale = (await cookies()).get("NEXT_LOCALE")?.value ?? "en"

        if (!IMPLEMENTED_LOCALE.includes(locale)) {
            const h = (await headers()).get("accept-language")
            const prefix = h?.toLowerCase().startsWith("fr") ? "fr" : "en"
            locale = IMPLEMENTED_LOCALE.includes(prefix) ? prefix : "en"
        }

        return {
            locale,
            messages: (await import(`./messages/${locale}.json`)).default,
        }
    } catch (error) {
        return {
            locale: "en",
            messages: (await import(`./messages/en.json`)).default,
        }
    }
})
