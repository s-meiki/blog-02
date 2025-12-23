import type { Metadata } from "next";
import {
  Twitter,
  Mail,
  MapPin,
  Briefcase,
  Sparkles,
  Trophy,
  Users,
  TrendingUp,
  Instagram,
  Facebook,
  Linkedin
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/blog/breadcrumbs";

export const metadata: Metadata = {
  title: "プロフィール | めいき | 強み起業プロデューサー",
  description: "強み起業プロデューサー・めいきのプロフィール。資格と強みを活かした独立・起業を支援しています。",
};

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen overflow-hidden py-16 sm:py-24">
      {/* Decorative Mesh Gradient Background */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[1000px] w-full bg-neutral-50">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-accent-100/40 blur-[120px]" />
        <div className="absolute top-1/4 -left-20 h-[400px] w-[400px] rounded-full bg-primary-100/30 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent-100/20 blur-[150px]" />
      </div>

      <Container className="relative z-10 space-y-12">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "プロフィール" },
          ]}
        />

        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Hero Card */}
          <section className="col-span-12 flex flex-col items-center gap-10 rounded-[3rem] border border-primary-900/5 bg-white/70 p-10 backdrop-blur-2xl md:col-span-8 md:flex-row md:items-start">
            <div className="relative shrink-0">
              <div className="h-44 w-44 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-200 to-primary-200 p-1 shadow-2xl ring-4 ring-white/50">
                <div className="relative h-full w-full overflow-hidden rounded-[2.3rem] bg-neutral-100 shadow-inner">
                  <img
                    src="/profile-me.jpg"
                    alt="めいき | 須賀明輝"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 rounded-full bg-white p-3 shadow-lg ring-1 ring-primary-900/5">
                <Sparkles className="h-6 w-6 text-accent-500 animate-pulse" />
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-accent-100/50 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-700">
                  Strengths Producer
                </div>
                <h1 className="text-4xl font-display font-bold tracking-tight text-primary-900 sm:text-5xl">
                  めいき <span className="text-2xl font-normal text-primary-400">| 須賀明輝</span>
                </h1>
                <p className="text-xl font-medium text-primary-600/90">
                  強み起業プロデューサー / デジタルコンテンツクリエイター
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-5 text-sm font-medium text-neutral-500 md:justify-start">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-400" />
                  <span>Tokyo / Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary-400" />
                  <span>資格者の独立支援</span>
                </div>
              </div>

              <div className="prose prose-neutral max-w-2xl text-base leading-relaxed text-neutral-600">
                <p>
                  元・借金600万円超の薬剤師から脱却し、個人で年収2300万円を突破。
                  現在は、薬剤師・士業などの「資格を持つプロフェッショナル」が、個人の強みを活かして自立した人生を歩むための独立・起業を完全プロデュースしています。
                </p>
                <p className="font-semibold text-primary-800 italic">
                  「強み × スキルで、資格を眠らせない生き方を。」
                </p>
              </div>
            </div>
          </section>

          {/* Stats Cards Section */}
          <div className="col-span-12 grid grid-cols-1 gap-6 md:col-span-4">
            <div className="group flex items-center gap-5 rounded-3xl border border-primary-900/5 bg-white/60 p-6 backdrop-blur-xl transition-all hover:bg-white/90">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100 text-accent-600 transition-transform group-hover:scale-110">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">独立成功実績</p>
                <p className="text-2xl font-bold text-primary-900">31名 <span className="text-sm font-normal text-primary-500">(成功率97%)</span></p>
              </div>
            </div>

            <div className="group flex items-center gap-5 rounded-3xl border border-primary-900/5 bg-white/60 p-6 backdrop-blur-xl transition-all hover:bg-white/90">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 transition-transform group-hover:scale-110">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">平均年収アップ</p>
                <p className="text-2xl font-bold text-primary-900">+550万円</p>
              </div>
            </div>

            <div className="group flex items-center gap-5 rounded-3xl border border-primary-900/5 bg-primary-900 p-6 text-white shadow-soft transition-all hover:translate-x-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-200">累計支援総額</p>
                <p className="text-2xl font-bold">1.5億円超</p>
              </div>
            </div>
          </div>

          {/* Core Values / Focus */}
          <section className="col-span-12 rounded-[2.5rem] border border-primary-900/5 bg-white/60 p-10 backdrop-blur-xl md:col-span-7">
            <h2 className="flex items-center gap-3 text-2xl font-display font-bold text-primary-900">
              <Sparkles className="h-6 w-6 text-accent-500" />
              My Purpose
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-bold text-primary-800 underline decoration-accent-300 decoration-4 underline-offset-4">強み × 起業</h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  単なる手法の提供ではなく、個人の資質を徹底的に分析。唯一無二のポジションで戦えるビジネスモデルを構築します。
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-primary-800 underline decoration-primary-300 decoration-4 underline-offset-4">専門職の自立</h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  薬剤師や士業など、高いスキルを持ちながら組織に縛られているプロフェッショナルを、真の意味で自立できるようプロデュースします。
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-primary-900/5">
              <p className="text-sm font-bold uppercase tracking-widest text-primary-400">Featured Skills</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["独立支援", "ビジネスプロデュース", "強み分析", "WEBマーケティング", "コンテンツ制作", "コミュニティ運営"].map((tag) => (
                  <span key={tag} className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Social Media Links Bento Grid */}
          <section className="col-span-12 grid grid-cols-2 gap-4 rounded-[2.5rem] border border-primary-900/5 bg-white/60 p-8 backdrop-blur-xl md:col-span-5">
            <h2 className="col-span-2 mb-2 text-xl font-display font-bold text-primary-900">Connect with Me</h2>

            <a
              href="https://twitter.com/Meikisuga"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#000000] p-6 text-white transition-all hover:scale-[1.03] hover:shadow-xl"
            >
              <Twitter className="h-8 w-8" />
              <span className="text-xs font-bold uppercase tracking-tighter">𝕏 / Twitter</span>
            </a>

            <a
              href="https://www.facebook.com/xmeikix/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#1877F2] p-6 text-white transition-all hover:scale-[1.03] hover:shadow-xl"
            >
              <Facebook className="h-8 w-8" />
              <span className="text-xs font-bold uppercase tracking-tighter">Facebook</span>
            </a>

            <a
              href="https://www.instagram.com/meiki.suga/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-6 text-white transition-all hover:scale-[1.03] hover:shadow-xl"
            >
              <Instagram className="h-8 w-8" />
              <span className="text-xs font-bold uppercase tracking-tighter">Instagram</span>
            </a>

            <a
              href="https://www.linkedin.com/in/meiki-suga-6407031b1/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#0A66C2] p-6 text-white transition-all hover:scale-[1.03] hover:shadow-xl"
            >
              <Linkedin className="h-8 w-8" />
              <span className="text-xs font-bold uppercase tracking-tighter">LinkedIn</span>
            </a>

            <div className="col-span-2 mt-2">
              <a
                href="mailto:contact@example.com"
                className="flex items-center justify-center gap-2 rounded-2xl border border-primary-900/10 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-50"
              >
                <Mail className="h-4 w-4" />
                お問い合わせはこちら
              </a>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
