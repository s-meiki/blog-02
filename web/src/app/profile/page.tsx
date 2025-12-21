import Image from "next/image";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/blog/breadcrumbs";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "プロフィール",
  description: "私のプロフィールページです。",
};

export default function ProfilePage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "プロフィール" },
          ]}
        />
        <section className="flex flex-col gap-6 rounded-3xl border border-primary-900/10 bg-white/90 p-8 shadow-soft lg:flex-row lg:items-center">
             {/* Placeholder for Avatar - user can replace src */}
            <div className="h-24 w-24 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">
              👤
            </div>
          {/* 
           If you have an image, uncomment and use this:
           <Image
              src="/path/to/image.jpg" 
              alt="My Name"
              width={120}
              height={120}
              className="h-24 w-24 rounded-full object-cover"
            />
           */}
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-semibold text-primary-900">私のプロフィール</h1>
            <p className="text-neutral-600">Web Developer / Designer</p>
            <div className="prose prose-neutral max-w-none text-sm text-neutral-600">
              <p>
                こんにちは。このブログの管理人です。
                Web開発やデザインについて発信しています。
              </p>
              <p>
                 趣味は写真撮影とカフェ巡りです。
              </p>
            </div>
            
            <ul className="flex flex-wrap gap-3 text-sm text-primary-600">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:underline">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:underline">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </section>
      </Container>
    </div>
  );
}
