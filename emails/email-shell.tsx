import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Hr,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components"
import type { ReactNode } from "react"

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Waiting List"

export type EmailShellProps = {
  /** Texte affiché dans l’aperçu de la boîte de réception. */
  preview: string
  /** Titre document (balise title dans le head). */
  title: string
  /** Titre principal visible dans le corps du message. */
  heading: string
  children: ReactNode
}

/**
 * Enveloppe commune des e-mails transactionnels (React Email + Tailwind).
 */
export function EmailShell({ preview, title, heading, children }: EmailShellProps) {
  return (
    <Html lang="fr">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: {
                  DEFAULT: "#2563eb",
                  foreground: "#ffffff",
                },
                ink: "#0f172a",
                muted: "#64748b",
                line: "#e2e8f0",
                canvas: "#f1f5f9",
              },
            },
          },
        }}
      >
        <Head>
          <title>{title}</title>
          <meta charSet="utf-8" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
        </Head>
        <Preview>{preview}</Preview>
        <Body className="m-0 bg-canvas px-4 py-10 font-sans text-base leading-6 text-ink antialiased">
          <Container className="mx-auto max-w-[560px]">
            <Section className="rounded-2xl border border-solid border-line bg-white px-8 py-9">
              <Heading
                as="h1"
                className="m-0 mb-5 text-[22px] font-semibold leading-7 tracking-tight text-ink"
              >
                {heading}
              </Heading>
              {children}
            </Section>
            <Hr className="mx-0 my-8 border-line" />
            <Text className="m-0 text-center text-[12px] leading-5 text-muted">{appName}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
