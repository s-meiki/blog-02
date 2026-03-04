import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "お問い合わせフォームからご相談内容を送信できます。",
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#f2ecff_0%,#f6f4f0_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-white/40 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-40 w-[32rem] -translate-x-1/2 rounded-full bg-[#9254ff]/10 blur-[90px]" />

      <Container className="relative z-10 space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "お問い合わせ" },
          ]}
        />

        <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-primary-900/10 bg-white/85 px-6 py-10 shadow-soft backdrop-blur sm:px-10 sm:py-12">
          <div className="space-y-4 text-center">
            <h1 className="bg-gradient-to-r from-[#7b3df0] via-[#5b4df6] to-[#2d6cf0] bg-clip-text text-4xl font-display font-semibold text-transparent sm:text-5xl">
              お問い合わせ
            </h1>
            <p className="mx-auto max-w-2xl text-base text-neutral-600 sm:text-lg">
              ご質問やご意見がありましたら、お気軽にお送りください
            </p>
          </div>

          <div className="mt-10">
            <ContactForm />
          </div>
        </section>
      </Container>
    </div>
  );
}
