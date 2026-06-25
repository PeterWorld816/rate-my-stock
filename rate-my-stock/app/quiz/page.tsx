"use client";
import { useState } from "react";
import Link from "next/link";

// ── Question bank ────────────────────────────────────────────────────────────
type Q = { q: string; answer: boolean; explain: string; tag: string };

const POOL: Q[] = [
  // ── 기업 상식 (35)
  { tag: "🏢 기업", q: "테슬라는 전기차만 만든다", answer: false, explain: "에너지 저장(Powerwall), 태양광 패널, 자율주행 FSD 소프트웨어도 판매해요 🔋" },
  { tag: "🏢 기업", q: "애플의 시가총액은 세계 1위다 (2024년 기준)", answer: true, explain: "약 3조 달러로 세계 최고! 영국 GDP와 맞먹는 규모예요 🍎" },
  { tag: "🏢 기업", q: "NVIDIA 칩이 ChatGPT 학습에 사용된다", answer: true, explain: "OpenAI는 수만 개의 NVIDIA H100 GPU로 GPT 모델을 학습시켜요 🤖" },
  { tag: "🏢 기업", q: "유튜브는 알파벳(구글)이 소유하고 있다", answer: true, explain: "2006년 구글이 유튜브를 16.5억 달러에 인수했어요 🎥" },
  { tag: "🏢 기업", q: "인스타그램은 메타(Meta)가 소유하고 있다", answer: true, explain: "2012년 Facebook(현 메타)이 10억 달러에 인수했어요 📸" },
  { tag: "🏢 기업", q: "아마존의 영업이익 대부분은 온라인 쇼핑에서 나온다", answer: false, explain: "아마존 영업이익의 70%+가 AWS 클라우드에서 나와요! 쇼핑 마진은 낮아요 📦" },
  { tag: "🏢 기업", q: "코스트코 핫도그+음료 세트는 1985년부터 $1.50이다", answer: true, explain: "39년째 가격 불변! 인플레이션에도 '핫도그 가격은 절대 못 올려'라는 전설의 정책 🌭" },
  { tag: "🏢 기업", q: "마이크로소프트는 오픈AI(ChatGPT 회사)에 투자했다", answer: true, explain: "MS는 OpenAI에 130억 달러+ 투자, Azure에 ChatGPT 기술을 통합했어요 🤝" },
  { tag: "🏢 기업", q: "페이팔(PayPal)은 원래 일론 머스크가 공동 창업했다", answer: true, explain: "머스크의 X.com이 Confinity(PayPal 전신)와 합병했어요. 이후 이베이에 매각 💳" },
  { tag: "🏢 기업", q: "넷플릭스는 원래 DVD 우편배달 서비스였다", answer: true, explain: "1997년 DVD 구독 서비스로 시작해 2007년 스트리밍으로 피벗했어요 📀" },
  { tag: "🏢 기업", q: "나이키 스우시 로고는 $35에 디자인되었다", answer: true, explain: "1971년 오리건대 학생 캐롤린 데이비슨이 $35에 디자인! 지금 브랜드 가치는 수십조 원 👟" },
  { tag: "🏢 기업", q: "워런 버핏의 버크셔 해서웨이 A주 가격은 $500,000 이상이다", answer: true, explain: "BRK-A는 한 번도 주식 분할을 안 해서 주당 60만 달러+! 세계에서 가장 비싼 주식 중 하나 🐘" },
  { tag: "🏢 기업", q: "스포티파이는 미국에서 창업했다", answer: false, explain: "2006년 스웨덴 스톡홀름에서 다니엘 에크가 창업했어요 🇸🇪" },
  { tag: "🏢 기업", q: "GitHub는 마이크로소프트가 인수했다", answer: true, explain: "2018년 MS가 GitHub를 75억 달러에 인수했어요 💻" },
  { tag: "🏢 기업", q: "메타(Meta)는 VR 헤드셋 퀘스트(Quest)를 만든다", answer: true, explain: "Meta는 하드웨어도 만들어요! Quest는 VR 시장 점유율 1위 🥽" },
  { tag: "🏢 기업", q: "알리바바는 미국 뉴욕증시(NYSE)에 상장되어 있다", answer: true, explain: "NYSE에 ADR 형태로 상장, 홍콩 거래소에도 이중 상장되어 있어요 🐼" },
  { tag: "🏢 기업", q: "NVIDIA는 원래 게임 그래픽카드 회사였다", answer: true, explain: "1993년 게이밍 GPU로 시작해 AI 시대에 데이터센터 칩 1위로 변신했어요 🎮" },
  { tag: "🏢 기업", q: "코카콜라 원래 레시피는 비공개다", answer: true, explain: "'멤버스 오브 코카콜라' 비밀금고에 보관. 전 세계 극소수만 알고 있다고 해요 🥤" },
  { tag: "🏢 기업", q: "팔란티어(Palantir) CEO는 알렉스 카프다", answer: true, explain: "알렉스 카프(Alex Karp)가 공동창업자이자 CEO예요 🔮" },
  { tag: "🏢 기업", q: "애플은 중국에서 아이폰을 직접 제조한다", answer: false, explain: "애플은 설계만! 실제 제조는 주로 폭스콘(대만 기업)이 중국 공장에서 해요 🏭" },
  { tag: "🏢 기업", q: "테슬라는 미국에서만 전기차를 생산한다", answer: false, explain: "미국 텍사스·캘리포니아 외에 독일 베를린, 중국 상하이에도 공장이 있어요 ⚡" },
  { tag: "🏢 기업", q: "스타벅스 앱에 충전된 선불 금액 합계는 약 10억 달러 이상이다", answer: true, explain: "고객들의 충전 잔액 합계가 약 $15억! 이자도 없이 스타벅스에 돈을 빌려주는 셈이에요 ☕" },
  { tag: "🏢 기업", q: "쇼피파이(Shopify) CEO는 토비 루트케다", answer: true, explain: "캐나다 출신 토비아스 루트케가 2006년 창업했어요 🛍️" },
  { tag: "🏢 기업", q: "넷플릭스 오징어 게임은 넷플릭스 역대 최고 시청 콘텐츠였다", answer: true, explain: "2021년 출시 후 28일간 1.11억 가구 시청으로 역대 1위를 기록했어요 🦑" },
  { tag: "🏢 기업", q: "우버(Uber)는 자사 소유 차량으로 승객을 운반한다", answer: false, explain: "우버는 차량 없는 플랫폼! 개인 드라이버와 승객을 연결만 해요 🚗" },
  { tag: "🏢 기업", q: "Netflix는 오리지널 콘텐츠를 직접 제작하지 않는다", answer: false, explain: "연간 $170억+ 투자해서 오리지널 콘텐츠 제작해요. 오징어 게임도 직접 제작! 🎬" },
  { tag: "🏢 기업", q: "로블록스(Roblox)의 가상화폐는 'Robux'다", answer: true, explain: "Robux로 게임 내 아이템 구매 가능. 개발자는 Robux를 현금으로 환전도 돼요 🎮" },
  { tag: "🏢 기업", q: "팔란티어(Palantir)는 피터 틸이 공동 창업했다", answer: true, explain: "페이팔 마피아 출신 피터 틸이 2003년 공동 창업. CIA 초기 자금도 받았어요 🔮" },
  { tag: "🏢 기업", q: "마이크로소프트는 Xbox 게임기도 만든다", answer: true, explain: "Xbox 브랜드로 콘솔 게임기와 Game Pass 구독 서비스를 운영 중이에요 🎮" },
  { tag: "🏢 기업", q: "페이스북 창업자는 마크 저커버그다", answer: true, explain: "2004년 하버드 기숙사에서 창업. 지금은 메타(Meta)의 CEO로 활동 중이에요 👍" },
  { tag: "🏢 기업", q: "월마트는 전 세계에서 가장 많은 직원을 고용하고 있다", answer: true, explain: "약 230만 명의 임직원으로 세계 최대 민간 고용주예요 🛒" },
  { tag: "🏢 기업", q: "구글은 검색 광고로만 돈을 번다", answer: false, explain: "유튜브 광고, 구글 클라우드(GCP), Play Store 등 다양한 수익원이 있어요 🔍" },
  { tag: "🏢 기업", q: "리프트(Lyft)는 전 세계 50개국 이상에서 서비스한다", answer: false, explain: "Lyft는 주로 미국과 캐나다에 집중. Uber와 달리 글로벌 확장을 하지 않았어요 🚕" },
  { tag: "🏢 기업", q: "스노우플레이크(Snowflake)는 워런 버핏이 투자한 기술주다", answer: true, explain: "버핏은 보통 기술주를 피하지만 Snowflake IPO 때 예외적으로 투자했어요 ❄️" },
  { tag: "🏢 기업", q: "아마존 AWS가 Netflix, Airbnb 등 유명 서비스의 인프라를 담당한다", answer: true, explain: "수백만 기업이 AWS 위에서 서비스를 운영해요. 인터넷의 숨겨진 뼈대 ☁️" },

  // ── 주식 기초 (30)
  { tag: "📊 주식 기초", q: "주식을 사면 그 회사의 주인이 된다", answer: true, explain: "1주라도 사면 공식 주주! 주주총회 참여권과 배당받을 권리가 생겨요 📜" },
  { tag: "📊 주식 기초", q: "ETF는 하루에 한 번만 거래할 수 있다", answer: false, explain: "ETF는 주식처럼 장중 아무 때나 실시간 매매 가능해요 📊" },
  { tag: "📊 주식 기초", q: "주식 배당은 연 1회만 지급된다", answer: false, explain: "기업마다 다르며 미국 기업 대부분은 분기(3개월)마다 배당을 줘요 🗓️" },
  { tag: "📊 주식 기초", q: "주가가 내려가면 배당수익률도 내려간다", answer: false, explain: "배당수익률 = 배당금 ÷ 주가. 주가가 내리면 오히려 배당수익률이 올라가요 📈" },
  { tag: "📊 주식 기초", q: "시가총액이 가장 큰 회사가 가장 주가가 높다", answer: false, explain: "주가(1주 가격)와 시가총액은 달라요. BRK-A는 주당 $600K+이지만 시총은 Apple보다 낮아요 📊" },
  { tag: "📊 주식 기초", q: "주식 배당금을 받으려면 최소 100주 이상 보유해야 한다", answer: false, explain: "1주라도 배당 기준일에 보유하면 배당금을 받을 수 있어요 💵" },
  { tag: "📊 주식 기초", q: "주식은 원금이 보장된다", answer: false, explain: "주식은 원금 보장 상품이 아니에요. 회사 부도 시 투자금을 잃을 수 있어요 ⚠️" },
  { tag: "📊 주식 기초", q: "나스닥(NASDAQ)은 기술주 중심의 미국 주식 거래소다", answer: true, explain: "Apple·구글·아마존 등 기술주 중심의 거래소예요 💻" },
  { tag: "📊 주식 기초", q: "미국 주식 시장은 24시간 365일 열려있다", answer: false, explain: "뉴욕증시는 월~금 오전 9:30~오후 4:00(미 동부시간)만 운영해요 🕒" },
  { tag: "📊 주식 기초", q: "주식 분할(Stock Split)을 하면 기업의 총 가치가 올라간다", answer: false, explain: "주식 분할은 파이를 더 많은 조각으로 나누는 것. 전체 가치는 동일해요 📊" },
  { tag: "📊 주식 기초", q: "주식 공매도(Short)는 주가가 오를 때 수익을 낸다", answer: false, explain: "공매도는 주가가 내려갈 때 수익을 내는 전략이에요 📉" },
  { tag: "📊 주식 기초", q: "S&P500은 미국 상위 500개 기업 주가지수다", answer: true, explain: "1957년부터 시작. 미국 주식시장 전체의 80%+ 시가총액을 반영해요 📊" },
  { tag: "📊 주식 기초", q: "ETF는 여러 주식을 하나로 묶은 상품이다", answer: true, explain: "S&P500 ETF 하나 사면 미국 대형주 500개에 동시 투자 효과! 📦" },
  { tag: "📊 주식 기초", q: "ETF는 수수료가 일반 액티브 펀드보다 높다", answer: false, explain: "ETF는 수동 운용이 많아 액티브 펀드보다 수수료(운용보수)가 훨씬 낮아요 📦" },
  { tag: "📊 주식 기초", q: "배당귀족은 25년 이상 배당을 증가시킨 기업이다", answer: true, explain: "S&P 배당 귀족 기준이 25년 이상 연속 배당 인상이에요 👑" },
  { tag: "📊 주식 기초", q: "코스피(KOSPI)는 미국 주식 시장 지수다", answer: false, explain: "코스피는 한국 종합주가지수예요. 미국은 S&P500, 나스닥, 다우존스 등이에요 🇰🇷" },
  { tag: "📊 주식 기초", q: "금리가 올라가면 일반적으로 주가는 내려간다", answer: true, explain: "금리↑ → 채권 매력↑ → 주식 매력↓. 기업 대출 비용도 늘어나요 📊" },
  { tag: "📊 주식 기초", q: "배당금은 주가가 오를 때만 받을 수 있다", answer: false, explain: "배당금은 주가와 관계없이 기업 이익에서 정기적으로 지급돼요 💰" },
  { tag: "📊 주식 기초", q: "달러 약세는 일반적으로 미국 수출 기업에 유리하다", answer: true, explain: "달러 약세 = 해외에서 미국 상품이 상대적으로 저렴 = 수출 경쟁력 상승 💱" },
  { tag: "📊 주식 기초", q: "미국 주식 시장에서 공매도(Short Selling)는 불법이다", answer: false, explain: "공매도는 합법적 투자 전략이에요. 다만 다양한 규제가 있어요 📉" },
  { tag: "📊 주식 기초", q: "소비자물가지수(CPI)가 오르면 인플레이션이 높아지는 것이다", answer: true, explain: "CPI = 물가 상승 측정 지표. CPI↑ = 인플레이션↑ = 구매력↓ 📊" },
  { tag: "📊 주식 기초", q: "배당금을 주식으로 받을 수도 있다", answer: true, explain: "주식 배당(Stock Dividend)으로 현금 대신 주식으로 받는 것도 가능해요 📜" },
  { tag: "📊 주식 기초", q: "배당금에는 세금이 부과된다", answer: true, explain: "대부분 국가에서 배당소득에 세금이 부과돼요. 한국은 배당소득세 15.4% 💸" },
  { tag: "📊 주식 기초", q: "주식 ETF와 펀드의 가장 큰 차이는 거래 방식이다", answer: true, explain: "ETF는 주식처럼 실시간 거래. 펀드는 하루 한 번 종가로 거래(환매)해요 📊" },
  { tag: "📊 주식 기초", q: "배당수익률이 높을수록 항상 좋은 주식이다", answer: false, explain: "배당수익률이 너무 높으면 기업 위기 신호일 수 있어요. 10%+ 배당은 주의! ⚠️" },
  { tag: "📊 주식 기초", q: "삼성전자는 미국 나스닥에 상장되어 있다", answer: false, explain: "삼성전자는 한국 코스피(KRX)에 상장되어 있어요 🇰🇷" },
  { tag: "📊 주식 기초", q: "FAANG은 Facebook, Amazon, Apple, Netflix, Google의 약자다", answer: true, explain: "2010년대 미국 기술주 대장주 그룹! 지금은 Meta로 바뀌어 MAANG이라고도 해요 😄" },
  { tag: "📊 주식 기초", q: "주가는 회사의 실제 가치를 항상 정확히 반영한다", answer: false, explain: "주가는 투자자들의 기대·감정·수급에 의해 실제 가치보다 높거나 낮을 수 있어요 📉" },
  { tag: "📊 주식 기초", q: "S&P500 지수의 역사적 연평균 수익률은 약 10%다", answer: true, explain: "1926년부터 장기 평균 ~10% 수익률. 복리로 쌓이면 엄청난 효과! 📈" },
  { tag: "📊 주식 기초", q: "주식 배당은 기업 이익에서 지급된다", answer: true, explain: "기업이 벌어들인 이익의 일부를 주주에게 나눠주는 것이 배당이에요 💰" },
  { tag: "📊 주식 기초", q: "달러(USD)는 전 세계 외환 거래의 약 88%에 사용된다", answer: true, explain: "달러는 기축통화로 원자재·무역·외환 거래의 압도적 1위 통화예요 💵" },

  // ── 투자 개념 (20)
  { tag: "💡 투자 개념", q: "P/E 비율이 낮을수록 항상 좋은 주식이다", answer: false, explain: "P/E가 낮아도 성장 없거나 위기 상황이면 나쁜 투자일 수 있어요 📉" },
  { tag: "💡 투자 개념", q: "워런 버핏은 단기 투자를 선호한다", answer: false, explain: "'10년 보유할 생각 없으면 10분도 보유하지 마라'는 장기투자 대가예요 🐘" },
  { tag: "💡 투자 개념", q: "코카콜라는 배당을 60년 이상 연속 인상했다", answer: true, explain: "배당 귀족 중에서도 배당왕! 60년+ 연속 배당 인상 기록 보유해요 🥤" },
  { tag: "💡 투자 개념", q: "FOMO는 주식 용어로 '고점 매수 심리'를 의미한다", answer: true, explain: "Fear Of Missing Out. 오를까봐 불안해서 고점에 따라 사는 심리 현상이에요 😰" },
  { tag: "💡 투자 개념", q: "워런 버핏은 비트코인에 긍정적 입장이다", answer: false, explain: "버핏은 '쥐약'이라며 비트코인을 극도로 부정적으로 평가해요 🐘" },
  { tag: "💡 투자 개념", q: "P/B 비율은 주가를 영업이익으로 나눈 값이다", answer: false, explain: "P/B = 주가 ÷ 주당순자산가치(장부가)예요. 주가 ÷ 주당순이익은 P/E랍니다 📊" },
  { tag: "💡 투자 개념", q: "비자(Visa)와 마스터카드(MA)는 직접 카드 대출을 실행한다", answer: false, explain: "Visa·Mastercard는 결제 네트워크만 운영해요. 카드 발급·대출은 은행이 해요 💳" },
  { tag: "💡 투자 개념", q: "금은 주식처럼 배당금을 준다", answer: false, explain: "금은 실물 자산으로 배당이나 이자가 없어요. 오직 가격 상승으로만 수익 창출해요 🥇" },
  { tag: "💡 투자 개념", q: "분산 투자는 리스크를 줄이는 효과가 있다", answer: true, explain: "여러 자산에 나눠 투자하면 하나가 떨어져도 전체 손실이 줄어들어요 📊" },
  { tag: "💡 투자 개념", q: "주식 투자는 인플레이션 헤지(보호) 수단이 될 수 있다", answer: true, explain: "기업은 물가 상승분을 가격에 전가해 수익을 유지하므로 장기 주식 = 물가 방어 수단 📈" },
  { tag: "💡 투자 개념", q: "적립식 투자(DCA)는 시장 타이밍을 맞추는 전략이다", answer: false, explain: "DCA(Dollar-Cost Averaging)는 시장 상관없이 일정 금액을 정기적으로 투자하는 방식이에요 📅" },
  { tag: "💡 투자 개념", q: "주식 시장은 단기적으로는 예측하기 어렵다", answer: true, explain: "'단기는 투표기, 장기는 체중계'라는 버핏의 명언! 단기 예측은 거의 불가능해요 📊" },
  { tag: "💡 투자 개념", q: "ETF 하나로 완전한 분산 투자가 가능하다", answer: true, explain: "S&P500 ETF 하나만 사도 미국 대형주 500개에 분산 투자돼요 📦" },
  { tag: "💡 투자 개념", q: "복리 효과는 투자 기간이 길수록 더 강하게 나타난다", answer: true, explain: "연 10% 수익, 30년 복리 = 원금의 17배! 시간이 최고의 투자 도구예요 ⏰" },
  { tag: "💡 투자 개념", q: "주식 투자 시 분산 투자는 한 종목에 집중 투자보다 항상 수익이 높다", answer: false, explain: "분산은 리스크를 줄이지만 최고 수익을 보장하진 않아요. 집중 투자가 더 높을 수 있어요 📊" },
  { tag: "💡 투자 개념", q: "인덱스 펀드는 시장 전체를 따라가는 수동 투자 방식이다", answer: true, explain: "버핏도 일반인에게는 S&P500 인덱스 펀드를 추천해요 📈" },
  { tag: "💡 투자 개념", q: "주식 매수 시 수수료가 전혀 없다", answer: false, explain: "대부분 증권사에서 거래 수수료를 받아요. 요즘은 많이 저렴해졌지만 여전히 존재해요 💸" },
  { tag: "💡 투자 개념", q: "공포에 살고 탐욕에 팔아야 한다", answer: true, explain: "버핏의 명언! 남들이 무서워할 때 사고(저점), 탐욕에 빠질 때 팔아라(고점) 📊" },
  { tag: "💡 투자 개념", q: "기업 실적이 좋으면 주가는 항상 오른다", answer: false, explain: "실적이 좋아도 '기대치보다 낮으면' 주가가 떨어질 수 있어요. 기대 관리가 핵심! 📉" },
  { tag: "💡 투자 개념", q: "채권 가격과 채권 금리는 반대로 움직인다", answer: true, explain: "금리↑ → 기존 채권 매력↓ → 채권 가격↓. 역의 관계예요 📊" },

  // ── 테크 & 트렌드 (15)
  { tag: "🤖 테크 & AI", q: "ARM 칩은 대부분의 스마트폰에 사용된다", answer: true, explain: "Apple, Samsung, Qualcomm 등이 ARM 설계 기반 칩을 만들어 사용해요 📱" },
  { tag: "🤖 테크 & AI", q: "TSMC는 대만의 반도체 파운드리 회사다", answer: true, explain: "TSMC는 세계 파운드리 시장 점유율 약 55%의 압도적 1위예요 🇹🇼" },
  { tag: "🤖 테크 & AI", q: "도지코인(DOGE)은 원래 밈으로 만든 암호화폐다", answer: true, explain: "2013년 시바 이누 밈을 소재로 장난처럼 만든 코인. 머스크 언급으로 가격 폭등! 🐕" },
  { tag: "🤖 테크 & AI", q: "비트코인의 총 발행량은 무제한이다", answer: false, explain: "비트코인은 2100만 개로 총 발행량이 고정되어 있어요 ₿" },
  { tag: "🤖 테크 & AI", q: "암호화폐는 미국 정부가 발행한다", answer: false, explain: "암호화폐는 탈중앙화 기술로 어느 정부와도 무관하게 발행돼요 ₿" },
  { tag: "🤖 테크 & AI", q: "코인베이스는 비트코인을 직접 발행한다", answer: false, explain: "코인베이스는 거래소예요. 비트코인은 채굴자(Miner)들이 생성해요 🪙" },
  { tag: "🤖 테크 & AI", q: "OpenAI를 만든 회사는 마이크로소프트다", answer: false, explain: "OpenAI는 샘 알트만·일론 머스크 등이 2015년 공동 설립했어요. MS는 나중에 투자했어요 🤖" },
  { tag: "🤖 테크 & AI", q: "마이크로소프트 윈도우는 전 세계 PC OS 시장점유율 1위다", answer: true, explain: "Windows는 전 세계 PC의 약 72%에서 사용돼요 💻" },
  { tag: "🤖 테크 & AI", q: "레딧(Reddit)은 메타(Meta)가 소유하고 있다", answer: false, explain: "Reddit은 독립 기업으로 2024년 NYSE에 IPO를 했어요 🤖" },
  { tag: "🤖 테크 & AI", q: "AI 학습에는 CPU보다 GPU가 훨씬 효과적이다", answer: true, explain: "CPU는 순차 처리에 강하고, GPU는 수천 개 코어의 병렬 처리로 AI 연산에 최적화돼요 🤖" },
  { tag: "🤖 테크 & AI", q: "스냅챗 메시지는 보낸 후 자동으로 사라지는 것이 특징이다", answer: true, explain: "일정 시간 후 사진·영상이 자동 삭제되는 것이 스냅챗의 핵심 기능이에요 👻" },
  { tag: "🤖 테크 & AI", q: "메타버스는 현실 세계와 가상 세계가 합쳐진 개념이다", answer: true, explain: "현실과 가상이 융합된 3D 인터넷 공간. 로블록스·포트나이트가 초기 형태예요 🌐" },
  { tag: "🤖 테크 & AI", q: "GPT(Generative Pre-trained Transformer)는 OpenAI가 개발했다", answer: true, explain: "ChatGPT의 핵심 기술 GPT 시리즈는 OpenAI가 개발했어요 🤖" },
  { tag: "🤖 테크 & AI", q: "전기차 배터리는 주로 리튬이온 방식이다", answer: true, explain: "Tesla, BYD 등 대부분 전기차가 리튬이온 배터리를 사용해요. 전고체 배터리가 다음 세대 🔋" },
  { tag: "🤖 테크 & AI", q: "AI 챗봇은 항상 정확한 정보를 제공한다", answer: false, explain: "'할루시네이션(환각)'이라는 AI가 사실처럼 보이는 오류를 만드는 현상이 있어요 🤖" },
];

const TOTAL = 5;
const XP_PER_Q = 20;

function pickRandom(pool: Q[]): Q[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, TOTAL);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [questions, setQuestions] = useState<Q[]>(() => pickRandom(POOL));
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);

  const q = questions[current];
  const isCorrect = selected !== null ? selected === q.answer : null;
  const revealed = selected !== null;

  const pick = (choice: boolean) => {
    if (revealed) return;
    setSelected(choice);
    const correct = choice === q.answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, correct]);
  };

  const next = () => {
    if (current < TOTAL - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setPhase("result");
    }
  };

  const restart = () => {
    setQuestions(pickRandom(POOL));
    setPhase("quiz");
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
  };

  const handleShare = async () => {
    const emojis = answers.map((a) => (a ? "⭕" : "❌")).join("");
    const text = `주식 퀴즈 ${score}/${TOTAL} 맞췄어요!\n${emojis}\n나도 도전해봐요 📈`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await (navigator as Navigator & { share: (d: object) => Promise<void> }).share({ title: "주식 퀴즈 결과", text }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const progress = ((current + (revealed ? 1 : 0)) / TOTAL) * 100;

  // ── Result ──────────────────────────────────────────────────────────────────
  if (phase === "result") {
    const pct = score / TOTAL;
    const grade =
      pct >= 0.8
        ? { emoji: "🏆", msg: "완벽해요!", sub: "주식 천재 등극!", color: "#00D084" }
        : pct >= 0.6
        ? { emoji: "⭐", msg: "잘했어요!", sub: "조금만 더 공부하면 만점!", color: "#F59E0B" }
        : { emoji: "📚", msg: "다시 도전해봐요!", sub: "포기하면 안 돼요, 같이 해봐요!", color: "#7C3AED" };

    return (
      <main className="min-h-screen bg-[#F5F5F0] font-sans flex items-center justify-center">
        <div className="px-4 w-full max-w-sm py-8">
          <div className="rounded-3xl bg-white shadow-md p-8 text-center fade-up">
            <div className="text-7xl mb-4">{grade.emoji}</div>
            <h2 className="font-display font-bold text-2xl mb-1 text-[#0D0D0D]">{grade.msg}</h2>
            <p className="text-sm text-[#6B7280] mb-6">{grade.sub}</p>

            {/* Score */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: `${grade.color}12` }}>
              <p className="text-4xl font-display font-bold mb-1" style={{ color: grade.color }}>
                {score} <span className="text-xl text-[#9CA3AF]">/ {TOTAL}</span>
              </p>
              <p className="text-xs font-semibold" style={{ color: grade.color }}>정답</p>
            </div>

            {/* Answer dots */}
            <div className="flex justify-center gap-2 mb-5">
              {answers.map((a, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: a ? "#00D08418" : "#FEE2E2", color: a ? "#00D084" : "#EF4444" }}
                >
                  {a ? "⭕" : "❌"}
                </div>
              ))}
            </div>

            {/* XP */}
            <div className="rounded-2xl p-3 mb-6" style={{ background: "#00D08412" }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#00D084" }}>획득한 경험치</p>
              <p className="text-2xl font-display font-bold text-[#0D0D0D]">+{score * XP_PER_Q} XP ⚡</p>
            </div>

            <button
              onClick={handleShare}
              className="w-full rounded-2xl touch-target text-sm font-bold text-white mb-3 flex items-center justify-center gap-2"
              style={{ background: "#0D0D0D" }}
            >
              {copied ? "✅ 복사됐어요!" : "📤 결과 공유하기"}
            </button>
            <button
              onClick={restart}
              className="w-full rounded-2xl touch-target text-sm font-bold text-white mb-3"
              style={{ background: "#7C3AED" }}
            >
              🔄 다시 풀기 (새 문제)
            </button>
            <Link
              href="/"
              className="block w-full rounded-2xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center text-sm font-medium text-[#6B7280]"
            >
              홈으로 →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.08); }
          70% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .anim-shake { animation: shake 0.45s ease; }
        .anim-pop { animation: pop 0.4s ease; }
        .anim-slide-up { animation: slideUp 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
      `}</style>

      <main className="min-h-screen bg-[#F5F5F0] font-sans flex flex-col">
        {/* ── Top bar ── */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 max-w-sm mx-auto w-full">
          <Link
            href="/"
            className="text-[#9CA3AF] font-bold text-lg leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E5E5E0] transition-colors"
          >
            ✕
          </Link>
          <div className="flex-1 h-3 rounded-full bg-[#E5E5E0] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "#7C3AED" }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: "#7C3AED" }}>
            {current + 1}/{TOTAL}
          </span>
        </div>

        {/* ── Question area ── */}
        <div className="flex-1 flex flex-col px-4 pb-4 max-w-sm mx-auto w-full" key={current}>
          {/* Tag */}
          <div className="mb-6">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ background: "#7C3AED18", color: "#7C3AED" }}
            >
              {q.tag}
            </span>
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">
              ⭕ 맞으면 O, 틀리면 X
            </p>
            <h2
              className="font-display font-bold leading-snug text-[#0D0D0D] mb-8"
              style={{ fontSize: "clamp(1.35rem, 5vw, 1.75rem)" }}
            >
              &ldquo;{q.q}&rdquo;
            </h2>

            {/* O/X buttons */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: true, symbol: "⭕", label: "맞아요" },
                { val: false, symbol: "❌", label: "틀려요" },
              ].map((opt) => {
                const isChosen = selected === opt.val;
                const isCorrectAnswer = q.answer === opt.val;

                let bg = "#FFFFFF";
                let border = "#E5E5E0";
                let textColor = "#374151";
                let anim = "";

                if (revealed) {
                  if (isCorrectAnswer) {
                    bg = "#00D08412"; border = "#00D084"; textColor = "#00D084";
                    if (isChosen) anim = "anim-pop";
                  } else if (isChosen) {
                    bg = "#FEE2E2"; border = "#EF4444"; textColor = "#EF4444";
                    anim = "anim-shake";
                  } else {
                    bg = "#F9FAFB"; border = "#E5E5E0"; textColor = "#9CA3AF";
                  }
                }

                return (
                  <button
                    key={String(opt.val)}
                    onClick={() => pick(opt.val)}
                    disabled={revealed}
                    className={`rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-colors ${anim}`}
                    style={{
                      background: bg,
                      borderColor: border,
                      color: textColor,
                      height: "120px",
                    }}
                  >
                    <span className="text-4xl">{opt.symbol}</span>
                    <span className="text-sm font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Feedback panel ── */}
        {revealed && (
          <div
            className="fixed inset-x-0 bottom-0 anim-slide-up z-40"
            style={{
              background: isCorrect ? "#00D084" : "#EF4444",
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
            }}
          >
            <div className="px-4 pt-5 pb-4 max-w-sm mx-auto">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 bg-white/20"
                >
                  {isCorrect ? "🎉" : "😅"}
                </div>
                <div>
                  <p className="font-display font-bold text-white text-base leading-tight">
                    {isCorrect ? "정답이에요!" : "틀렸어요!"}
                  </p>
                  <p className="text-white/90 text-sm leading-relaxed mt-1">{q.explain}</p>
                </div>
              </div>
              <button
                onClick={next}
                className="w-full rounded-2xl py-3.5 text-sm font-bold transition-transform active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.25)",
                  color: "#ffffff",
                  border: "2px solid rgba(255,255,255,0.4)",
                }}
              >
                {current < TOTAL - 1 ? "다음 문제 →" : "결과 보기 🎯"}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
