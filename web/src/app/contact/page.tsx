import type { Metadata } from "next";
import { Clock3, MessageCircleHeart, ShieldCheck } from "lucide-react";

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
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-neutral-50">
        <div className="absolute -top-24 right-[-6rem] h-[360px] w-[360px] rounded-full bg-accent-100/60 blur-[90px]" />
        <div className="absolute left-[-8rem] top-20 h-[300px] w-[300px] rounded-full bg-primary-100/50 blur-[100px]" />
        <div className="absolute bottom-4 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-accent-100/40 blur-[110px]" />
      </div>

      <Container className="relative z-10 space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "お問い合わせ" },
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8 rounded-[2rem] border border-primary-900/10 bg-white/80 p-7 shadow-soft backdrop-blur-xl sm:p-9">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-accent-300 bg-accent-100/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-600">
                Contact
              </span>
              <h1 className="text-3xl font-display font-semibold text-primary-900 sm:text-4xl">
                お問い合わせ
              </h1>
              <p className="max-w-2xl text-neutral-600">
                お仕事のご相談、取材依頼、コラボレーションのご連絡はこちらからお送りください。必要最小限の入力で送信できます。
              </p>
            </div>

            <ContactForm />
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-primary-900/10 bg-primary-900 px-6 py-7 text-white shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary-200">Response</p>
              <p className="mt-3 text-xl font-display font-semibold">48時間以内に返信します</p>
              <p className="mt-2 text-sm text-primary-100">
                具体的な背景やご希望があると、初回返信までがスムーズです。
              </p>
            </div>

            <div className="space-y-3 rounded-[1.75rem] border border-primary-900/10 bg-white/75 p-6 backdrop-blur">
              <div className="flex gap-3 rounded-2xl border border-primary-900/10 bg-neutral-50/80 p-4">
                <MessageCircleHeart className="mt-0.5 h-5 w-5 text-accent-500" />
                <div>
                  <p className="text-sm font-semibold text-primary-900">ご相談歓迎</p>
                  <p className="mt-1 text-xs leading-6 text-neutral-600">企画段階でも気軽にお問い合わせください。</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-primary-900/10 bg-neutral-50/80 p-4">
                <Clock3 className="mt-0.5 h-5 w-5 text-accent-500" />
                <div>
                  <p className="text-sm font-semibold text-primary-900">短時間で入力</p>
                  <p className="mt-1 text-xs leading-6 text-neutral-600">項目は「お名前・メール・内容」のみです。</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-primary-900/10 bg-neutral-50/80 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-accent-500" />
                <div>
                  <p className="text-sm font-semibold text-primary-900">不正送信対策</p>
                  <p className="mt-1 text-xs leading-6 text-neutral-600">Cloudflare Turnstile で bot 送信を抑止します。</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
