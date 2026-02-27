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
    <div className="py-16 sm:py-20">
      <Container className="space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "お問い合わせ" },
          ]}
        />
        <section className="space-y-8 rounded-3xl border border-primary-900/10 bg-white/90 p-8 shadow-soft">
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-semibold text-primary-900">お問い合わせ</h1>
            <p className="text-neutral-600">
              お仕事のご相談や取材依頼などはこちらからご連絡ください。
            </p>
          </div>
          <ContactForm />
        </section>
      </Container>
    </div>
  );
}
