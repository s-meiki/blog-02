import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
    title: "ニュースレター登録",
    description: "最新情報をお届けするニュースレターの登録ページです。",
};

export default function NewsletterPage() {
    return (
        <div className="py-16 sm:py-20">
            <Container className="space-y-12">
                <Breadcrumbs
                    items={[
                        { label: "ホーム", href: "/" },
                        { label: "ニュースレター" },
                    ]}
                />
                <section className="flex flex-col gap-6 rounded-3xl border border-primary-900/10 bg-white/90 p-8 shadow-soft">
                    <div className="space-y-3">
                        <h1 className="text-3xl font-display font-semibold text-primary-900">ニュースレター登録</h1>
                        <p className="text-neutral-600">
                            ブログの更新情報や、Web開発に関する最新情報をお届けします。
                        </p>
                        {/* Placeholder for form */}
                        <div className="mt-8 rounded-2xl bg-neutral-50 p-8 text-center text-neutral-500 border border-dashed border-neutral-300">
                            <p>登録フォーム準備中...</p>
                        </div>
                    </div>
                </section>
            </Container>
        </div>
    );
}
