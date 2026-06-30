# 📈 Rate My Stock

> AI matches your personality, vibe, and financial habits to the perfect stock. Not financial advice — just vibes.

**Live demo:** [ratemystock.vercel.app](https://vercel.com) ← deploy 후 업데이트

---

## 🎯 4가지 모드

| 모드 | 설명 |
|------|------|
| 🤳 **Face Read** | 사진 업로드 → AI가 관상으로 주식 추천 |
| 🧠 **Personality Quiz** | 5가지 질문 → 투자 성격 분석 |
| ✨ **Today's Vibe** | 오늘 기분 선택 → 오늘의 주식 운세 |
| 💰 **Money Profile** | 연봉/소비 패턴 → 포트폴리오 추천 |

---

## 🚀 로컬 실행 (5분)

### 1. 코드 받기
```bash
git clone https://github.com/YOUR_USERNAME/rate-my-stock.git
cd rate-my-stock
npm install
```

### 2. 환경변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local` 파일 열어서 API key 넣기:
```
ANTHROPIC_API_KEY=sk-ant-...
```
→ API key는 https://console.anthropic.com 에서 발급

### 3. 실행
```bash
npm run dev
```
→ http://localhost:3000 열기

---

## ☁️ Vercel 배포 (무료, 3분)

### 방법 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### 방법 2: GitHub 연동 (추천)
1. GitHub에 push
2. [vercel.com](https://vercel.com) → "New Project" → GitHub 레포 선택
3. Environment Variables에 `ANTHROPIC_API_KEY` 추가
4. Deploy 클릭 → 끝!

**장점:**
- GitHub push할 때마다 자동 배포
- 무료 (Hobby plan)
- 별도 백엔드 서버 불필요 (Next.js API Routes가 서버 역할)
- Render 같은 cold start 없음 ✅

---

## 🏗️ 구조

```
rate-my-stock/
├── app/
│   ├── page.tsx          # 메인 페이지
│   ├── layout.tsx        # HTML 레이아웃 + SEO
│   ├── globals.css       # 디자인 시스템
│   └── api/
│       └── analyze/
│           └── route.ts  # Claude AI 분석 API
├── components/
│   ├── HeroSection.tsx   # 상단 히어로
│   ├── ModeSelector.tsx  # 4가지 모드 선택
│   ├── ResultCard.tsx    # 결과 카드
│   └── modes/
│       ├── FaceMode.tsx    # 사진 업로드
│       ├── MbtiMode.tsx    # 퀴즈
│       ├── VibeMode.tsx    # 기분 선택
│       └── SalaryMode.tsx  # 재정 프로필
├── .env.local.example    # 환경변수 템플릿
└── package.json
```

---

## 💡 스택 (Rate My Fit 대비 개선점)

| | Rate My Fit | Rate My Stock |
|---|---|---|
| 프론트 | Next.js + Vercel | Next.js + Vercel ✅ |
| 백엔드 | Express + Render (cold start) | Next.js API Routes (cold start 없음) ✅ |
| AI | Groq/llama-4 | Claude Sonnet (더 정확) ✅ |
| 이미지 저장 | Cloudinary | 불필요 (서버에서 처리) ✅ |
| DB | 없음 | 없음 (Phase 2에서 Supabase 추가 예정) |
| 비용 | Render 무료 한도 | 완전 무료 (Vercel Hobby) ✅ |

---

## 🔮 Phase 2 (다음 단계)

- [ ] Supabase로 결과 저장 + 고유 URL (`/result/abc123`)
- [ ] OG 이미지 자동 생성 (`@vercel/og`) → 카카오/인스타 공유 시 미리보기
- [ ] 리더보드: "오늘 제일 많이 나온 주식은?"
- [ ] 친구와 비교: 두 사람 결과 나란히 보기

---

## ⚠️ 면책조항

이 앱은 **엔터테인먼트 목적**으로만 제작되었습니다. 실제 투자 결정에 사용하지 마세요. 투자 전 반드시 전문가와 상담하고 직접 조사하세요.
