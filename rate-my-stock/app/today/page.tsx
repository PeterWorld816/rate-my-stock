"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage, type LangCode, LOCALE_MAP } from "@/lib/i18n";

type Lang = LangCode;

// ── Stock data ────────────────────────────────────────────────────────────────
type StockDef = {
  ticker: string; name: string; emoji: string; sector: string;
  pros: [string, string, string];
  cons: [string, string, string];
  concept: { term: string; def: string; tip: string };
  desc: Record<Lang, string>;
};

const STOCKS: StockDef[] = [
  {
    ticker: "NVDA", name: "NVIDIA", emoji: "🤖", sector: "AI / 반도체",
    pros: ["AI 인프라 투자 1등 수혜주", "독점 CUDA 소프트웨어 생태계", "영업이익률 ~75% 초고수익"],
    cons: ["P/E 65배 이상 고평가 논란", "AMD·Intel 추격 심화", "AI 투자 버블 우려"],
    concept: { term: "GPU(그래픽처리장치)", def: "수천 개의 코어로 AI·그래픽 연산을 병렬 처리하는 칩. NVIDIA가 독점에 가까운 시장점유율.", tip: "CPU는 몇 개 강한 코어 vs GPU는 수천 개 작은 코어 = AI에 GPU가 압도적!" },
    desc: { ko:"AI 반도체 왕좌 👑 ChatGPT부터 자율주행까지 전부 이 칩!", en:"The AI chip king 👑 Every AI on Earth runs on NVIDIA!", ja:"AIチップ王者 👑 ChatGPTも全部コレ！", zh:"AI芯片之王 👑 全球AI都跑在这家芯片上！", es:"¡El rey de chips IA 👑 Todo el AI del mundo usa NVIDIA!", fr:"Le roi des puces IA 👑 Tout l'AI mondial tourne sur NVIDIA!", de:"KI-Chip-König 👑 Jede KI der Welt läuft auf NVIDIA!", pt:"Rei dos chips de IA 👑 Todo AI do mundo usa NVIDIA!", ar:"ملك شرائح الذكاء الاصطناعي 👑 كل AI في العالم يعمل على NVIDIA!", hi:"AI चिप का राजा 👑 दुनिया की हर AI NVIDIA पर चलती है!" },
  },
  {
    ticker: "AAPL", name: "Apple", emoji: "🍎", sector: "빅테크 / 소비자기기",
    pros: ["세계 1위 시가총액 기업", "iOS 생태계 강력한 자물쇠 효과", "서비스 매출 고성장(앱스토어·iCloud)"],
    cons: ["스마트폰 시장 성장 둔화", "중국 매출 비중 높아 지정학 리스크", "AI 경쟁에서 구글·MS 대비 늦음"],
    concept: { term: "시가총액", def: "주가 × 발행주식수 = 기업 전체 가격. AAPL은 약 3조 달러로 세계 1위!", tip: "나라 GDP와 비교하면 Apple ≈ 영국 GDP. 엄청난 규모!" },
    desc: { ko:"아이폰 만드는 그 회사 🍎 전 세계에서 제일 비싼 기업!", en:"They make the iPhone 🍎 The most valuable company on Earth!", ja:"iPhoneを作る会社 🍎 世界一の時価総額！", zh:"做iPhone的公司 🍎 全球市值最高！", es:"¡Hacen el iPhone 🍎 La empresa más valiosa del mundo!", fr:"Ils font l'iPhone 🍎 L'entreprise la plus chère au monde!", de:"Die machen das iPhone 🍎 Wertvollstes Unternehmen der Welt!", pt:"Eles fazem o iPhone 🍎 A empresa mais valiosa do mundo!", ar:"يصنعون iPhone 🍎 أغلى شركة في العالم!", hi:"iPhone बनाने वाली कंपनी 🍎 दुनिया की सबसे महंगी कंपनी!" },
  },
  {
    ticker: "MSFT", name: "Microsoft", emoji: "💻", sector: "빅테크 / 클라우드",
    pros: ["Azure 클라우드 2위 급성장", "OpenAI 투자로 AI 선두", "Office·Teams 기업 필수 소프트웨어"],
    cons: ["성숙한 비즈니스 성장 둔화 우려", "클라우드 AWS 격차 여전히 존재", "높은 밸류에이션"],
    concept: { term: "클라우드 컴퓨팅", def: "내 컴퓨터 대신 인터넷 어딘가의 서버로 저장·연산하는 것. Azure·AWS·GCP 3강 체제.", tip: "Netflix가 영상을 AWS에 저장하듯, 기업들은 모두 클라우드에 올라타는 중!" },
    desc: { ko:"윈도우 엑셀 만든 회사 💻 이제 AI도 1등이야!", en:"Made Windows & Excel 💻 Now winning at AI too!", ja:"WindowsとExcelの会社 💻 今はAIでも1位！", zh:"做Windows和Excel的公司 💻 现在AI也第一！", es:"Crearon Windows y Excel 💻 ¡Ahora lideran en IA!", fr:"Ils ont créé Windows et Excel 💻 Maintenant ils dominent l'IA!", de:"Die machten Windows & Excel 💻 Jetzt führen sie auch die KI!", pt:"Criaram Windows e Excel 💻 Agora lideram em IA!", ar:"صنعوا Windows وExcel 💻 الآن يتصدرون الذكاء الاصطناعي!", hi:"Windows और Excel बनाने वाले 💻 अब AI में भी नंबर 1!" },
  },
  {
    ticker: "AMZN", name: "Amazon", emoji: "📦", sector: "이커머스 / 클라우드",
    pros: ["AWS 클라우드 세계 1위(~33% 점유)", "프라임 멤버십 고객 록인 효과", "광고 사업 급성장"],
    cons: ["소매 마진 낮고 물류비 압박", "노조·반독점 규제 리스크", "고금리 환경에서 투자 비용 부담"],
    concept: { term: "AWS(아마존 웹서비스)", def: "전 세계 서버·데이터센터를 임대해주는 서비스. Netflix·Airbnb 등 대부분의 앱이 AWS 위에서 돌아간다.", tip: "Amazon의 영업이익 대부분이 사실 쇼핑이 아닌 AWS에서 나온다!" },
    desc: { ko:"세계 최대 온라인 쇼핑몰 📦 + 클라우드도 1등!", en:"World's biggest online store 📦 + Cloud #1!", ja:"世界最大ネットショッピング 📦 クラウドも1位！", zh:"全球最大网购平台 📦 云计算也是第一！", es:"La mayor tienda online 📦 ¡Y el #1 en cloud!", fr:"La plus grande boutique en ligne 📦 Et #1 du cloud!", de:"Größter Online-Shop 📦 Und Nr.1 beim Cloud!", pt:"Maior loja online 📦 E líder em cloud!", ar:"أكبر متجر إلكتروني 📦 والأول في الحوسبة السحابية!", hi:"दुनिया का सबसे बड़ा ऑनलाइन स्टोर 📦 Cloud में भी नंबर 1!" },
  },
  {
    ticker: "GOOG", name: "Alphabet (Google)", emoji: "🔍", sector: "빅테크 / 광고",
    pros: ["검색광고 전 세계 점유율 ~92%", "YouTube 세계 최대 동영상 플랫폼", "Gemini AI로 반격 시작"],
    cons: ["광고 경기 침체 시 매출 직격", "반독점 소송 리스크 (미 법무부)", "AI에서 OpenAI·MS에 밀리는 이미지"],
    concept: { term: "검색 광고(CPC)", def: "구글 검색 결과 상단 광고. 클릭할 때마다 광고주가 Google에 돈을 낸다 = CPC(Cost Per Click).", tip: "'치킨 배달' 검색하면 나오는 상단 파란 링크 = 매 클릭당 수천원 수익!" },
    desc: { ko:"구글 유튜브 만든 회사 🔍 광고로 돈 버는 기계!", en:"Google + YouTube = Ad money machine 🔍", ja:"GoogleとYouTubeの親会社 🔍 広告で稼ぐ！", zh:"Google和YouTube的母公司 🔍 广告赚钱机器！", es:"Google + YouTube 🔍 ¡Máquina de dinero publicitario!", fr:"Google + YouTube 🔍 Machine à argent publicitaire!", de:"Google + YouTube 🔍 Werbegeld-Maschine!", pt:"Google + YouTube 🔍 Máquina de dinheiro publicitário!", ar:"Google وYouTube 🔍 آلة كسب المال الإعلاني!", hi:"Google और YouTube 🔍 Ads का पैसा बनाने की machine!" },
  },
  {
    ticker: "META", name: "Meta Platforms", emoji: "👍", sector: "소셜미디어 / AI",
    pros: ["Facebook·Instagram·WhatsApp 30억+ DAU", "Reels·광고 매출 빠른 회복", "LLaMA AI 오픈소스 전략 주목"],
    cons: ["개인정보·규제 리스크 상시 존재", "틱톡에 10대 이용자 빼앗기는 중", "메타버스(VR) 대규모 투자 불확실"],
    concept: { term: "DAU(일 활성 사용자)", def: "하루에 앱을 실제로 사용한 사람 수. 광고 수익은 DAU × 1인당 광고 노출량으로 계산된다.", tip: "Meta DAU 30억 명이면 지구 인구 절반이 매일 접속하는 것!" },
    desc: { ko:"페이스북 인스타 왓츠앱 다 얘네 거 👍 30억 명의 SNS!", en:"Facebook, Instagram & WhatsApp all theirs 👍", ja:"Facebook・Instagram・WhatsApp全部彼ら 👍", zh:"Facebook、Instagram和WhatsApp都是他们的 👍", es:"Facebook, Instagram y WhatsApp — ¡todos suyos! 👍", fr:"Facebook, Instagram et WhatsApp — tout à eux 👍", de:"Facebook, Instagram und WhatsApp — alles ihres 👍", pt:"Facebook, Instagram e WhatsApp — todos deles 👍", ar:"Facebook وInstagram وWhatsApp - كلها ملكهم 👍", hi:"Facebook, Instagram और WhatsApp सब इन्हीं के 👍" },
  },
  {
    ticker: "TSLA", name: "Tesla", emoji: "⚡", sector: "전기차 / 에너지",
    pros: ["전기차 소프트웨어 업데이트(OTA) 선도", "자율주행 FSD 가입 수익화 진행 중", "에너지 저장 사업(Powerwall) 성장"],
    cons: ["전통 완성차 + 중국 BYD 경쟁 심화", "일론 머스크 리스크 (집중 우려)", "수익성 악화 우려 (가격인하 경쟁)"],
    concept: { term: "OTA(Over-The-Air) 업데이트", def: "인터넷으로 자동차 소프트웨어를 자동 업데이트. Tesla는 자면서도 차가 업그레이드된다.", tip: "일반 차는 딜러에 가야 업데이트. Tesla는 자는 동안 스스로 업그레이드!" },
    desc: { ko:"일론 머스크 전기차 회사 ⚡ 사이버트럭 주인공!", en:"Elon Musk's electric car company ⚡ Cybertruck!", ja:"イーロン・マスクの電気自動車 ⚡ サイバートラック！", zh:"马斯克的电动车公司 ⚡ 赛博卡车！", es:"El auto eléctrico de Elon Musk ⚡ ¡Cybertruck!", fr:"La voiture électrique d'Elon Musk ⚡ Cybertruck!", de:"Elon Musks Elektroauto ⚡ Cybertruck!", pt:"O carro elétrico do Elon Musk ⚡ Cybertruck!", ar:"سيارة إيلون ماسك الكهربائية ⚡ Cybertruck!", hi:"Elon Musk की Electric Car ⚡ Cybertruck!" },
  },
  {
    ticker: "NFLX", name: "Netflix", emoji: "🎬", sector: "스트리밍 / 엔터테인먼트",
    pros: ["오리지널 콘텐츠 전략으로 차별화", "광고 요금제 도입으로 수익 다각화", "글로벌 2억+ 구독자 강력한 해자"],
    cons: ["디즈니+·Apple TV+·아마존 경쟁 심화", "콘텐츠 제작비 지속 증가 부담", "한국 등 일부 시장 성장 한계"],
    concept: { term: "구독 경제(Subscription Economy)", def: "매월 일정 금액을 내고 서비스를 사용하는 비즈니스 모델. 안정적인 예측 가능 수익이 강점.", tip: "Netflix 구독자 2억 명 × 월 $15 = 매월 30억 달러 고정 수입!" },
    desc: { ko:"오징어 게임 만든 넷플릭스 🎬 2억 명이 보는 스트리밍!", en:"Squid Game → Netflix! 🎬 200M+ subscribers!", ja:"イカゲームのNetflix 🎬 2億人が見てる！", zh:"《鱿鱼游戏》的Netflix 🎬 2亿用户！", es:"¡Los de El Juego del Calamar 🎬 200M+ suscriptores!", fr:"Squid Game c'est Netflix 🎬 200M+ abonnés!", de:"Die von Squid Game 🎬 200M+ Abonnenten!", pt:"Os do Round 6 🎬 200M+ assinantes!", ar:"Netflix صانع Squid Game 🎬 200M+ مشترك!", hi:"Squid Game वाला Netflix 🎬 20 करोड़+ subscribers!" },
  },
  {
    ticker: "AMD", name: "AMD", emoji: "🔴", sector: "반도체 / AI칩",
    pros: ["MI300X GPU로 NVIDIA 추격 가속", "데이터센터 CPU 점유율 확대", "PC 게이밍 CPU Ryzen 인기"],
    cons: ["NVIDIA 생태계(CUDA) 따라잡기 어려움", "인텔·NVIDIA 양쪽 경쟁 동시 존재", "AI 칩 수요 변동 리스크"],
    concept: { term: "반도체 사이클(Cycle)", def: "반도체는 공급 부족 → 가격 폭등 → 과잉 투자 → 공급 과잉 → 가격 폭락을 반복. 사이클 예측이 투자 핵심.", tip: "지금 AI 붐 = 공급 부족 시기. 사이클 정점에서 고점 매수 주의!" },
    desc: { ko:"NVIDIA 라이벌 빨간팀 🔴 AI 칩 2등 도전 중!", en:"NVIDIA's biggest rival 🔴 Fighting for the AI throne!", ja:"NVIDIAのライバル赤チーム 🔴 AIチップ2位争い中！", zh:"NVIDIA的最大对手 🔴 争夺AI芯片第二！", es:"¡El rival de NVIDIA 🔴 Luchando por el trono IA!", fr:"Le rival de NVIDIA 🔴 Combat pour le trône IA!", de:"NVIDIAs größter Rivale 🔴 Kampf um den KI-Thron!", pt:"O rival da NVIDIA 🔴 Lutando pelo trono de IA!", ar:"أكبر منافس لـNVIDIA 🔴 يتنافس على عرش الذكاء الاصطناعي!", hi:"NVIDIA का सबसे बड़ा rival 🔴 AI throne के लिए लड़ रहा है!" },
  },
  {
    ticker: "INTC", name: "Intel", emoji: "💙", sector: "반도체 / CPU",
    pros: ["파운드리(제조) 사업 재건 전략 추진", "미국 정부 CHIPS Act 보조금 수혜", "낮은 밸류에이션 턴어라운드 기대"],
    cons: ["NVIDIA·AMD에 AI 칩 시장 선점 당함", "TSMC 대비 제조 기술 2~3세대 뒤처짐", "턴어라운드 시기 불확실성"],
    concept: { term: "파운드리(Foundry)", def: "다른 회사가 설계한 반도체를 대신 제조하는 공장. TSMC가 세계 1위, 인텔이 재진입 시도 중.", tip: "NVIDIA는 설계만! 제조는 TSMC에 맡긴다. 인텔은 설계+제조 모두 하려는 중." },
    desc: { ko:"컴퓨터 CPU 원조 💙 지금은 NVIDIA한테 밀리는 중", en:"The OG CPU maker 💙 Struggling vs NVIDIA now", ja:"パソコンCPUの元祖 💙 今はNVIDIAに押されてる", zh:"电脑CPU的鼻祖 💙 现在被NVIDIA压制", es:"El pionero del CPU 💙 Luchando contra NVIDIA", fr:"Le pionnier du CPU 💙 En difficulté face à NVIDIA", de:"Der Ur-CPU-Hersteller 💙 Im Kampf gegen NVIDIA", pt:"O pioneiro do CPU 💙 Lutando contra NVIDIA", ar:"رائد شرائح CPU 💙 يكافح في مواجهة NVIDIA", hi:"CPU के पायनियर 💙 अब NVIDIA से पिछड़ रहे हैं" },
  },
  {
    ticker: "ORCL", name: "Oracle", emoji: "🛢️", sector: "클라우드 / 데이터베이스",
    pros: ["AI 클라우드(OCI) 급성장 중", "기업 DB 시장 오랜 독점적 지위", "MS·GOOG과 AI 인프라 파트너십"],
    cons: ["레거시 DB 시장 AWS 잠식 위협", "높아진 밸류에이션 (기대 선반영)", "경영진 관련 거버넌스 우려"],
    concept: { term: "데이터베이스(DB)", def: "데이터를 체계적으로 저장하고 검색하는 시스템. Oracle은 40년 넘게 기업 DB 1위.", tip: "은행·병원·정부 시스템 대부분이 Oracle DB 위에서 돌아간다!" },
    desc: { ko:"기업 데이터베이스 터줏대감 🛢️ AI 클라우드로 반등!", en:"Enterprise DB veteran 🛢️ Comeback with AI cloud!", ja:"企業DBの老舗 🛢️ AIクラウドで復活中！", zh:"企业数据库老大 🛢️ AI云服务强势复苏！", es:"Veterano de DB 🛢️ ¡Volviendo con IA cloud!", fr:"Vétéran des DB 🛢️ Retour avec l'IA cloud!", de:"Datenbank-Veteran 🛢️ Comeback mit KI-Cloud!", pt:"Veterano em DB 🛢️ Retorno com IA cloud!", ar:"عملاق قواعد البيانات 🛢️ يعود مع الذكاء الاصطناعي!", hi:"Enterprise DB का पुराना खिलाड़ी 🛢️ AI Cloud के साथ वापसी!" },
  },
  {
    ticker: "SHOP", name: "Shopify", emoji: "🛍️", sector: "이커머스 플랫폼",
    pros: ["중소상공인 온라인몰 1등 플랫폼", "아마존 대항마로 독립 커머스 생태계 구축", "결제·물류·금융 원스톱 서비스"],
    cons: ["Amazon과 직접 경쟁 구도 강화", "성장 둔화 후 수익성 증명 과제", "높은 밸류에이션"],
    concept: { term: "GMV(총 거래액)", def: "플랫폼에서 발생한 전체 거래 금액. Shopify의 진짜 규모를 보여주는 핵심 지표.", tip: "Shopify의 GMV ≈ $200B+. 이 중 수수료 ~1.5%가 Shopify 수익!" },
    desc: { ko:"누구나 온라인 쇼핑몰 만드는 플랫폼 🛍️ 아마존 대항마!", en:"Build your own online store 🛍️ Amazon's challenger!", ja:"誰でもネットショップを作れる 🛍️ Amazonのライバル！", zh:"让所有人都能开网店 🛍️ 亚马逊的挑战者！", es:"Crea tu propia tienda online 🛍️ ¡El rival de Amazon!", fr:"Crée ta boutique en ligne 🛍️ Le rival d'Amazon!", de:"Bau deinen Online-Shop 🛍️ Amazons Herausforderer!", pt:"Crie sua loja online 🛍️ O rival da Amazon!", ar:"أنشئ متجرك الإلكتروني 🛍️ منافس Amazon!", hi:"खुद का Online Store बनाओ 🛍️ Amazon का challenger!" },
  },
  {
    ticker: "UBER", name: "Uber", emoji: "🚗", sector: "공유경제 / 모빌리티",
    pros: ["차량·음식배달 글로벌 1위", "흑자 전환 성공 후 수익성 개선 중", "자율주행 파트너십(Waymo 등) 선점"],
    cons: ["기사 처우·규제 리스크 상존", "지역별 경쟁사(Grab·Lyft 등) 분산", "에너지 비용 상승 시 수익 압박"],
    concept: { term: "플랫폼 비즈니스", def: "직접 서비스를 제공하지 않고 공급자(기사)와 수요자(승객)를 연결해 중간에서 수수료를 받는 모델.", tip: "Uber는 차 한 대도 없이 세계 최대 택시 회사가 됐다!" },
    desc: { ko:"앱으로 택시 부르는 그 앱 🚗 배달도 해줌!", en:"Tap the app, get a ride 🚗 Food delivery too!", ja:"アプリでタクシーを呼ぶ 🚗 フードデリバリーも！", zh:"打开APP叫出租车 🚗 还能送外卖！", es:"Llama un taxi con la app 🚗 ¡También reparten comida!", fr:"Appelle un taxi avec l'app 🚗 Livraison food aussi!", de:"Taxi per App 🚗 Essen liefern auch!", pt:"Táxi pelo app 🚗 Entrega de comida também!", ar:"اطلب تاكسي بالتطبيق 🚗 ويوصلون الطعام أيضاً!", hi:"App से Taxi 🚗 खाना भी deliver!" },
  },
  {
    ticker: "ABNB", name: "Airbnb", emoji: "🏠", sector: "공유경제 / 여행",
    pros: ["숙박 공유 플랫폼 압도적 1위", "자산 없이 마진 높은 플랫폼 모델", "코로나 이후 여행 수요 회복 수혜"],
    cons: ["주요 도시 단기임대 규제 강화", "호텔 업계와 경쟁 심화", "여행 경기 민감도 높은 사이클 비즈니스"],
    concept: { term: "에셋라이트(Asset-Light) 모델", def: "건물·차 등 자산을 직접 소유하지 않고 연결만 하는 비즈니스. 자본 효율이 매우 높음.", tip: "Airbnb는 집 한 채 안 갖고 세계 최대 숙박업체! Marriott보다 더 많은 객실 수!" },
    desc: { ko:"남의 집 빌려주는 숙박 앱 🏠 전 세계 여행자 필수템!", en:"Rent someone's home 🏠 Every traveler's must-have!", ja:"他人の家を貸し借りするアプリ 🏠 旅行者必須！", zh:"租用别人家的住宿APP 🏠 旅行者必备！", es:"Alquila casas de otros 🏠 ¡App esencial para viajeros!", fr:"Loue la maison de quelqu'un 🏠 Indispensable pour voyager!", de:"Miet ein fremdes Haus 🏠 Reisende lieben es!", pt:"Alugue a casa de alguém 🏠 App essencial para viajantes!", ar:"استأجر منزل شخص آخر 🏠 ضروري لكل مسافر!", hi:"किसी का घर किराए पर लो 🏠 हर traveler का जरूरी app!" },
  },
  {
    ticker: "COIN", name: "Coinbase", emoji: "🪙", sector: "암호화폐 / 핀테크",
    pros: ["미국 최대 합법 암호화폐 거래소", "기관 투자자 암호화폐 수탁 서비스 성장", "규제 명확화 수혜 기대"],
    cons: ["암호화폐 시장 변동성에 수익 직결", "SEC 등 규제 불확실성 지속", "FTX 사태 이후 업계 신뢰 회복 과제"],
    concept: { term: "암호화폐(Cryptocurrency)", def: "블록체인 기술 기반의 디지털 화폐. 비트코인·이더리움이 대표적. 중앙은행 없이 작동.", tip: "비트코인 총 개수는 2100만 개로 고정. 인플레이션이 없는 유일한 화폐!" },
    desc: { ko:"비트코인 이더리움 사고파는 미국 1등 거래소 🪙", en:"America's #1 crypto exchange 🪙 Buy Bitcoin here!", ja:"米国No.1仮想通貨取引所 🪙 Bitcoin売買！", zh:"美国第一大加密货币交易所 🪙 买卖比特币！", es:"Exchange cripto #1 de EE.UU. 🪙 ¡Compra Bitcoin!", fr:"Exchange crypto n°1 US 🪙 Achetez du Bitcoin!", de:"Amerikas Nr.1 Krypto-Börse 🪙 Bitcoin kaufen!", pt:"Exchange cripto #1 dos EUA 🪙 Compre Bitcoin!", ar:"منصة العملات المشفرة الأولى في أمريكا 🪙 اشترِ Bitcoin!", hi:"America की #1 Crypto Exchange 🪙 Bitcoin खरीदो!" },
  },
  {
    ticker: "RBLX", name: "Roblox", emoji: "🎮", sector: "메타버스 / 게임플랫폼",
    pros: ["10대 유저 3000만+ 일일 접속", "유저가 직접 게임 만드는 생태계", "Robux 가상화폐 시스템 수익화"],
    cons: ["10대 의존도 너무 높음 (고령화 과제)", "개발자 수익 배분 이슈", "성인 유저 확보 실패 시 성장 한계"],
    concept: { term: "메타버스(Metaverse)", def: "현실과 가상이 융합된 3D 인터넷 공간. 게임·소셜·경제활동이 모두 일어나는 미래 인터넷.", tip: "Roblox는 이미 메타버스 현실판! 10대들이 이 안에서 친구 사귀고 돈도 번다." },
    desc: { ko:"어린이들이 직접 게임 만드는 플랫폼 🎮 3000만 명 매일 접속!", en:"Kids build & play games 🎮 30M+ daily players!", ja:"子供がゲームを作るプラットフォーム 🎮 毎日3000万人！", zh:"孩子们创建游戏的平台 🎮 每天3000万玩家！", es:"Niños crean y juegan 🎮 ¡30M+ jugadores diarios!", fr:"Les enfants créent des jeux 🎮 30M+ joueurs quotidiens!", de:"Kinder bauen Spiele 🎮 30M+ tägliche Spieler!", pt:"Crianças criam jogos 🎮 30M+ jogadores diários!", ar:"الأطفال يبنون ويلعبون الألعاب 🎮 30M+ لاعب يومياً!", hi:"बच्चे खुद games बनाते हैं 🎮 रोज 3 करोड़+ players!" },
  },
  {
    ticker: "SNAP", name: "Snap Inc.", emoji: "👻", sector: "소셜미디어",
    pros: ["10대 AR(증강현실) 카메라 선두", "스냅챗+ 구독 서비스 성장 중", "광고 효율화 기술 개선"],
    cons: ["MAU 성장 정체 메타·틱톡에 잠식", "지속적 영업 적자 수익성 과제", "사용자층이 10대에 편중"],
    concept: { term: "AR(증강현실)", def: "현실 위에 디지털 요소를 겹쳐 보여주는 기술. 스냅챗 강아지 필터·포켓몬GO가 대표 사례.", tip: "Snap의 AR 필터 = 매일 2억 5000만 명이 사용하는 세계 최대 AR 플랫폼!" },
    desc: { ko:"사진 보내면 사라지는 스냅챗 회사 👻 10대들의 앱!", en:"Disappearing photos app 👻 Teen's can't live without!", ja:"写真が消えるSnapchatの会社 👻 十代必須！", zh:"照片会消失的Snapchat 👻 青少年必备！", es:"La app de fotos que desaparecen 👻 ¡Los teen la aman!", fr:"Photos qui disparaissent 👻 Les ados l'adorent!", de:"Verschwindende Fotos App 👻 Teens lieben es!", pt:"App de fotos que somem 👻 Adolescentes adoram!", ar:"تطبيق الصور المختفية 👻 المراهقون يعشقونه!", hi:"Photo disappear app Snapchat 👻 Teens का प्यारा app!" },
  },
  {
    ticker: "PYPL", name: "PayPal", emoji: "💳", sector: "핀테크 / 결제",
    pros: ["온라인 결제 선구자, 브랜드 신뢰도 높음", "Venmo·Honey 등 보완 서비스 포트폴리오", "저평가 매력 있는 밸류에이션"],
    cons: ["Apple Pay·Google Pay에 점유율 잠식", "높은 사기 거래 비용 부담", "성장 모멘텀 둔화"],
    concept: { term: "결제 처리 수수료(Payment Processing Fee)", def: "온라인 결제 1건 처리 시 받는 수수료. 보통 거래액의 2~3%. PayPal·Stripe·Square가 경쟁.", tip: "아마존에서 $100 결제 시 PayPal은 ~$2.50 받는다. 거래량 × 수수료 = 엄청난 규모!" },
    desc: { ko:"온라인 결제의 원조 💳 벤모도 얘네 거!", en:"The OG online payment 💳 Venmo is theirs too!", ja:"オンライン決済の元祖 💳 Venmoも所有！", zh:"网络支付的鼻祖 💳 Venmo也是他们的！", es:"El pionero del pago online 💳 ¡Venmo también!", fr:"Le pionnier du paiement en ligne 💳 Venmo aussi!", de:"Der OG Online-Payment 💳 Venmo gehört auch ihnen!", pt:"O pioneiro do pagamento online 💳 Venmo também!", ar:"رائد الدفع الإلكتروني 💳 Venmo أيضاً ملكهم!", hi:"Online Payment का पायनियर 💳 Venmo भी इन्हीं का!" },
  },
  {
    ticker: "SQ", name: "Block (Square)", emoji: "◼️", sector: "핀테크 / 암호화폐",
    pros: ["Cash App 소비자 금융 생태계 성장", "비트코인 거래 수익 다각화", "소상공인 결제 하드웨어 1위"],
    cons: ["신용위험 증가 (BNPL 연체율)", "잭 도시 CEO의 트위터(X) 병행 우려", "PayPal·Stripe와 치열한 경쟁"],
    concept: { term: "BNPL(선구매 후결제)", def: "Buy Now Pay Later. 지금 사고 나중에 분할 납부. Klarna·Afterpay(Block 자회사)가 대표.", tip: "한국의 할부 개념! 다만 금리가 높아 과소비 조장 우려도 있다." },
    desc: { ko:"스퀘어+캐시앱+비트코인 다 하는 핀테크 회사 ◼️", en:"Square + CashApp + Bitcoin all in one ◼️", ja:"Square・CashApp・Bitcoin全部やってる ◼️", zh:"Square、CashApp和比特币一家公司 ◼️", es:"Square + CashApp + Bitcoin en uno ◼️", fr:"Square + CashApp + Bitcoin tout en un ◼️", de:"Square + CashApp + Bitcoin in einem ◼️", pt:"Square + CashApp + Bitcoin numa empresa ◼️", ar:"Square وCashApp والبيتكوين في شركة واحدة ◼️", hi:"Square + CashApp + Bitcoin सब एक में ◼️" },
  },
  {
    ticker: "ROKU", name: "Roku", emoji: "📺", sector: "스트리밍 플랫폼 / 광고",
    pros: ["미국 스트리밍 TV 플랫폼 점유율 1위", "콘텐츠 파트너십·광고 수익 성장", "하드웨어에서 플랫폼으로 전환 성공"],
    cons: ["OEM TV 내장 등 경쟁 심화", "수익성 개선 속도 느림", "아마존 Fire TV·애플TV와 경쟁"],
    concept: { term: "CTV(커넥티드TV) 광고", def: "인터넷에 연결된 TV에 보여주는 타겟 광고. 유튜브·넷플릭스 광고와 동일 카테고리. 고성장 중.", tip: "TV 광고 = 예전엔 대기업 전유물. CTV 광고 = 중소기업도 타겟팅 가능!" },
    desc: { ko:"TV 스트리밍 연결 1등 장치 📺 넷플릭스 다 연결!", en:"#1 TV streaming device 📺 Connects all apps!", ja:"TVストリーミング機器No.1 📺 全部つながる！", zh:"电视流媒体设备第一名 📺 连接所有APP！", es:"Dispositivo streaming #1 📺 ¡Conecta todo!", fr:"Appareil streaming #1 📺 Connecte tout!", de:"TV-Streaming-Gerät Nr.1 📺 Verbindet alles!", pt:"Dispositivo de streaming #1 📺 Conecta tudo!", ar:"جهاز البث الأول 📺 يربط كل شيء!", hi:"TV Streaming का #1 device 📺 सब connect!" },
  },
  {
    ticker: "SPOT", name: "Spotify", emoji: "🎵", sector: "음악 스트리밍",
    pros: ["음악 스트리밍 시장 점유율 31% 1위", "팟캐스트 진출로 오디오 플랫폼 확장", "AI 추천 알고리즘 기술 우위"],
    cons: ["음반사 로열티 비용으로 마진 낮음", "Apple Music·YouTube Music 경쟁", "팟캐스트 투자 성과 검증 중"],
    concept: { term: "로열티(Royalty)", def: "음악 1회 재생 시 Spotify가 작곡가·가수에게 지급하는 비용. 약 $0.003~$0.005/재생.", tip: "BTS 노래 10억 번 재생 = BTS에게 약 $3M~$5M. 스포티파이가 다 지급!" },
    desc: { ko:"음악 스트리밍 1등 🎵 6억 명이 듣는 앱!", en:"Music streaming king 🎵 600M+ listeners!", ja:"音楽ストリーミングNo.1 🎵 6億人が使う！", zh:"音乐流媒体第一 🎵 6亿用户！", es:"Rey del streaming musical 🎵 ¡600M+ oyentes!", fr:"Roi du streaming musical 🎵 600M+ auditeurs!", de:"Musik-Streaming-König 🎵 600M+ Hörer!", pt:"Rei do streaming musical 🎵 600M+ ouvintes!", ar:"ملك بث الموسيقى 🎵 600M+ مستمع!", hi:"Music Streaming का राजा 🎵 60 करोड़+ listeners!" },
  },
  {
    ticker: "PLTR", name: "Palantir", emoji: "🔮", sector: "AI / 방위·정보",
    pros: ["미 국방부·CIA 장기 계약 안정적 매출", "AIP(AI 플랫폼) 기업 고객 빠른 성장", "소프트웨어 흑자 전환 달성"],
    cons: ["주가 변동성 극도로 높음", "방위 계약 의존 → 정치 리스크", "일반 기업 대상 영업 속도 느림"],
    concept: { term: "AIP(인공지능 플랫폼)", def: "기업이 자체 데이터에 AI를 적용하는 소프트웨어. Palantir는 군사·기업 데이터 분석 AI 선두.", tip: "CIA가 테러범 위치를 찾을 때 사용하는 소프트웨어가 Palantir. 빅브라더 실사판!" },
    desc: { ko:"CIA·NSA가 쓰는 AI 데이터 분석 회사 🔮 빅브라더!", en:"CIA & NSA use this AI company 🔮 Big Brother vibes!", ja:"CIA・NSAが使うAIデータ会社 🔮 ビッグブラザー！", zh:"CIA和NSA使用的AI数据公司 🔮 大哥在看着你！", es:"La IA que usa la CIA 🔮 ¡Vibes Gran Hermano!", fr:"L'IA utilisée par la CIA 🔮 Big Brother!", de:"KI für CIA & NSA 🔮 Big-Brother-Vibes!", pt:"A IA usada pela CIA 🔮 Grande Irmão!", ar:"شركة الذكاء الاصطناعي التي تستخدمها CIA 🔮 الأخ الأكبر!", hi:"CIA और NSA का AI company 🔮 Big Brother!" },
  },
  {
    ticker: "SNOW", name: "Snowflake", emoji: "❄️", sector: "클라우드 데이터",
    pros: ["클라우드 데이터 웨어하우스 성장 1위", "AI·머신러닝 데이터 허브로 포지셔닝", "워런 버핏 투자로 유명"],
    cons: ["엄청난 고평가 (P/S 20배 이상)", "경쟁 빅테크(AWS Redshift·GCP BigQuery)와 경쟁", "흑자 달성 시기 불확실"],
    concept: { term: "데이터 웨어하우스(Data Warehouse)", def: "여러 소스의 데이터를 한곳에 모아 분석하는 대형 데이터 창고. 기업 BI·AI의 핵심 인프라.", tip: "Snowflake = 기업의 '데이터 냉동 창고'. 각 부서 데이터가 모여 AI 학습에 사용!" },
    desc: { ko:"클라우드 데이터 창고 1등 ❄️ 워런 버핏이 투자한 회사!", en:"Top cloud data warehouse ❄️ Warren Buffett invested!", ja:"クラウドデータウェアハウスNo.1 ❄️ バフェットも投資！", zh:"顶级云数据仓库 ❄️ 巴菲特也投资了！", es:"Almacén de datos cloud #1 ❄️ ¡Buffett invirtió!", fr:"Entrepôt de données cloud #1 ❄️ Buffett a investi!", de:"Cloud-Datenlager Nr.1 ❄️ Buffett investierte!", pt:"Armazém de dados cloud #1 ❄️ Buffett investiu!", ar:"مستودع البيانات السحابي الأول ❄️ بافيت استثمر!", hi:"Cloud Data Warehouse #1 ❄️ Warren Buffett ने invest किया!" },
  },
  {
    ticker: "CRM", name: "Salesforce", emoji: "☁️", sector: "기업 SaaS / CRM",
    pros: ["기업 고객관리(CRM) 소프트웨어 압도적 1위", "Einstein AI 통합으로 AI 전환 주도", "강력한 파트너 생태계"],
    cons: ["기업 IT 예산 축소 시 성장 둔화", "높은 밸류에이션", "M&A 과잉으로 조직 통합 복잡"],
    concept: { term: "CRM(고객 관계 관리)", def: "고객 정보를 한 곳에 모아 영업·마케팅·서비스를 관리하는 소프트웨어. 영업팀 필수 도구.", tip: "삼성 영업팀이 500명 고객 관리할 때 쓰는 도구! Salesforce 없으면 엑셀 지옥." },
    desc: { ko:"기업 고객관리 소프트웨어 1등 ☁️ 영업팀 필수 도구!", en:"#1 CRM software ☁️ Every sales team's best friend!", ja:"企業CRMソフトNo.1 ☁️ 営業チームの必需品！", zh:"企业CRM软件第一名 ☁️ 销售团队必备！", es:"CRM #1 ☁️ ¡Herramienta esencial de ventas!", fr:"CRM n°1 ☁️ Outil essentiel des ventes!", de:"CRM Nr.1 ☁️ Unverzichtbar für Vertrieb!", pt:"CRM #1 ☁️ Ferramenta essencial de vendas!", ar:"برنامج CRM الأول ☁️ أداة المبيعات الأساسية!", hi:"#1 CRM Software ☁️ Sales team का best friend!" },
  },
  {
    ticker: "NOW", name: "ServiceNow", emoji: "🔧", sector: "기업 SaaS / IT 자동화",
    pros: ["IT 워크플로우 자동화 독보적 1위", "AI 통합으로 가치 급상승", "고객 유지율 97%+ 안정적 수익"],
    cons: ["엔터프라이즈 전용 소기업 접근 어려움", "높은 가격 경쟁 위험", "경기 침체 시 IT 예산 삭감"],
    concept: { term: "워크플로우 자동화", def: "반복 업무(IT 지원 요청·결재 프로세스 등)를 자동으로 처리하는 소프트웨어. 직원 시간 절약.", tip: "회사 컴퓨터 고장 신청 → 자동으로 IT팀에 배정 → 자동 처리 추적. 그게 ServiceNow!" },
    desc: { ko:"IT 업무 자동화 소프트웨어 🔧 직장인 시간 절약 영웅!", en:"IT workflow automation 🔧 Saving millions of work hours!", ja:"IT業務自動化ソフト 🔧 時間節約ヒーロー！", zh:"IT工作流自动化软件 🔧 节省数百万工时！", es:"Automatización IT 🔧 ¡Ahorrando millones de horas!", fr:"Automatisation IT 🔧 Des millions d'heures économisées!", de:"IT-Automatisierung 🔧 Millionen Stunden gespart!", pt:"Automação IT 🔧 Economizando milhões de horas!", ar:"أتمتة سير العمل IT 🔧 يوفر الملايين من ساعات العمل!", hi:"IT Workflow Automation 🔧 लाखों घंटे बचाता है!" },
  },
  {
    ticker: "V", name: "Visa", emoji: "💳", sector: "금융 / 결제 네트워크",
    pros: ["전 세계 카드 결제 네트워크 점유율 ~50%", "자산 없이 수수료만 받는 초고마진 모델", "경기와 무관하게 거래 발생"],
    cons: ["중앙은행 디지털화폐(CBDC) 장기 위협", "핀테크 직불 결제 경쟁 증가", "반독점 규제 리스크"],
    concept: { term: "결제 네트워크 효과", def: "가맹점이 많을수록 카드 사용자가 늘고, 사용자가 많을수록 가맹점이 늘어나는 선순환. Visa의 핵심 해자.", tip: "전 세계 1억 개 가맹점 + 34억 장 카드 = 누구도 넘을 수 없는 Visa의 성벽!" },
    desc: { ko:"카드 긁을 때마다 돈 버는 결제 네트워크 1등 💳", en:"Every card swipe = Visa earns 💳 #1 payment network!", ja:"カードを使うたびに手数料 💳 世界1位決済ネットワーク！", zh:"每次刷卡都赚钱 💳 全球第一支付网络！", es:"Cada pago con tarjeta = Visa gana 💳 ¡#1 red de pagos!", fr:"Chaque paiement = Visa gagne 💳 Réseau de paiement n°1!", de:"Jede Kartenzahlung = Visa verdient 💳 Nr.1 Zahlungsnetz!", pt:"Cada pagamento = Visa ganha 💳 Rede #1 de pagamentos!", ar:"كل بطاقة = Visa تكسب 💳 شبكة الدفع الأولى عالمياً!", hi:"हर card swipe = Visa की कमाई 💳 #1 Payment Network!" },
  },
  {
    ticker: "MA", name: "Mastercard", emoji: "🔴🔵", sector: "금융 / 결제 네트워크",
    pros: ["비자와 함께 세계 결제 2강 체제", "신흥국 카드 보급 확산 수혜", "사이버보안·데이터 분석 부가 서비스"],
    cons: ["비자와 실질적 복점 → 규제 위험", "현금 결제 많은 신흥국 침투 속도 한계", "CBDC 도입 장기 리스크"],
    concept: { term: "복점(Duopoly)", def: "두 회사가 시장을 나눠 독점하는 구조. 비자·마스터카드가 전 세계 카드 결제의 ~80% 장악.", tip: "경쟁하는 척하지만 둘 다 엄청 잘 됨. 비자+마스터카드 = 결제계의 맥도날드+버거킹!" },
    desc: { ko:"비자 라이벌이지만 둘 다 잘 나감 🔴🔵 결제 2강!", en:"Visa's rival — both are winning 🔴🔵 Duopoly!", ja:"Visaのライバルだけど両方儲かってる 🔴🔵", zh:"Visa的竞争对手但两家都赢了 🔴🔵", es:"El rival de Visa pero los dos ganan 🔴🔵 ¡Duopolio!", fr:"Le rival de Visa mais tous deux gagnent 🔴🔵", de:"Visas Rivale — beide gewinnen 🔴🔵", pt:"O rival da Visa mas ambos ganham 🔴🔵", ar:"منافس Visa لكن كلاهما يفوز 🔴🔵", hi:"Visa का rival लेकिन दोनों जीत रहे हैं 🔴🔵" },
  },
  {
    ticker: "JPM", name: "JPMorgan Chase", emoji: "🏦", sector: "금융 / 투자은행",
    pros: ["미국 최대 은행, 수익 안정성 최고", "제이미 다이먼 최고 경영자 신뢰도 높음", "AI 투자 적극적, 디지털 전환 선도"],
    cons: ["고금리 환경 변화 시 순이자마진 압박", "대형 규제·자본 요건 강화", "경기 침체 시 대출 부실 위험"],
    concept: { term: "순이자마진(NIM)", def: "대출 이자율 - 예금 이자율 = 은행의 핵심 수익. 금리가 오르면 NIM도 오른다.", tip: "기준금리 5% → 은행은 대출 7%, 예금 4% → NIM 3%! 금리 올리면 은행 주가 오르는 이유!" },
    desc: { ko:"미국 최대 은행 🏦 돈 많은 곳엔 다 손 대고 있음!", en:"America's biggest bank 🏦 Fingers in every pie!", ja:"アメリカ最大の銀行 🏦 金融業界のどこにもいる！", zh:"美国最大银行 🏦 金融领域无处不在！", es:"El banco más grande de EE.UU. 🏦 ¡Metido en todo!", fr:"La plus grande banque US 🏦 Partout en finance!", de:"Amerikas größte Bank 🏦 Überall in der Finanzwelt!", pt:"O maior banco dos EUA 🏦 Presente em tudo!", ar:"أكبر بنك أمريكي 🏦 متواجد في كل مكان مالي!", hi:"America का सबसे बड़ा Bank 🏦 Financial दुनिया में हर जगह!" },
  },
  {
    ticker: "BAC", name: "Bank of America", emoji: "🏛️", sector: "금융 / 소매은행",
    pros: ["미국 소매 은행 고객 최다 보유", "워런 버핏이 대주주로 신뢰 보증", "고금리 환경 수혜"],
    cons: ["장기채 투자 손실 리스크 (2023 위기)", "기술 투자 JPM 대비 뒤처지는 이미지", "소비자 대출 연체율 상승 우려"],
    concept: { term: "예대마진", def: "예금 금리보다 대출 금리를 높게 받아서 남기는 차익. 은행의 기본 수익 모델.", tip: "내가 은행에 연 4% 예금 → 은행은 연 7% 대출 → 3% 마진 = 은행 수익!" },
    desc: { ko:"미국 2등 은행 🏛️ 일반인들이 제일 많이 쓰는 은행!", en:"America's 2nd bank 🏛️ The everyday person's bank!", ja:"アメリカ2位の銀行 🏛️ 一般人が一番使う！", zh:"美国第二大银行 🏛️ 普通人最常用的银行！", es:"2do banco de EE.UU. 🏛️ ¡El banco de la gente!", fr:"2e banque américaine 🏛️ La banque du commun!", de:"Amerikas 2.-Größte Bank 🏛️ Die Volksbank!", pt:"2° maior banco dos EUA 🏛️ O banco do povo!", ar:"ثاني أكبر بنك أمريكي 🏛️ بنك الناس العاديين!", hi:"America का 2nd बड़ा Bank 🏛️ आम आदमी का bank!" },
  },
  {
    ticker: "GS", name: "Goldman Sachs", emoji: "💰", sector: "금융 / 투자은행",
    pros: ["M&A·IPO 자문 세계 최상위", "AI·퀀트 투자에 가장 공격적 전환", "자산관리(AWM) 사업 성장"],
    cons: ["소비자 금융(Marcus) 철수로 전략 혼선", "투자은행 딜 사이클 경기 민감", "규제 및 소송 비용"],
    concept: { term: "IPO(기업공개)", def: "비상장 기업이 처음으로 주식을 일반에 파는 것. Goldman Sachs 같은 투자은행이 이 과정을 주관.", tip: "카카오뱅크 IPO 주관사 = Goldman Sachs급. 수수료만 수백억 원 받는다!" },
    desc: { ko:"월가 최고 엘리트 투자 은행 💰 부자들만 쓰는 곳!", en:"Wall Street's most elite bank 💰 For the ultra-rich!", ja:"ウォール街のエリート銀行 💰 超富裕層専用！", zh:"华尔街最顶级投行 💰 专为超级富豪服务！", es:"Banco de élite de Wall Street 💰 ¡Solo para mega-ricos!", fr:"Banque d'élite de Wall Street 💰 Pour les ultra-riches!", de:"Wall Streets Elitebank 💰 Nur für Superreiche!", pt:"Banco de elite de Wall Street 💰 Para os ultra-ricos!", ar:"البنك النخبوي في وول ستريت 💰 للأثرياء فقط!", hi:"Wall Street का सबसे elite Bank 💰 सिर्फ अमीरों के लिए!" },
  },
  {
    ticker: "BRK-B", name: "Berkshire Hathaway B", emoji: "🐘", sector: "투자 지주회사",
    pros: ["워런 버핏의 60년 검증된 가치투자", "보험·철도·에너지 다각화 포트폴리오", "AAPL 대규모 보유로 기술주 수혜"],
    cons: ["버핏·멍거 이후 승계 불확실성", "규모가 커서 초과 수익률 점점 어려움", "보험 사업 자연재해 리스크"],
    concept: { term: "가치투자(Value Investing)", def: "내재가치보다 싼 주식을 사서 오래 보유하는 전략. 워런 버핏이 60년간 증명한 방식.", tip: "버핏 명언: '멋진 기업을 적정 가격에 사라. 형편없는 기업을 헐값에 사지 말고.'" },
    desc: { ko:"워런 버핏 할아버지의 투자 회사 🐘 수십 개 기업 보유!", en:"Warren Buffett's investment empire 🐘 Owns dozens of companies!", ja:"ウォーレン・バフェットの投資会社 🐘 数十社所有！", zh:"巴菲特的投资公司 🐘 旗下几十家公司！", es:"El imperio de Warren Buffett 🐘 ¡Docenas de empresas!", fr:"L'empire de Warren Buffett 🐘 Des dizaines d'entreprises!", de:"Warren Buffetts Imperium 🐘 Dutzende Unternehmen!", pt:"O império de Buffett 🐘 Dezenas de empresas!", ar:"إمبراطورية بافيت 🐘 يمتلك عشرات الشركات!", hi:"Warren Buffett का Investment Empire 🐘 दर्जनों companies!" },
  },
  {
    ticker: "JNJ", name: "Johnson & Johnson", emoji: "💊", sector: "헬스케어 / 제약",
    pros: ["배당왕(60년+ 연속 배당 인상)", "의약품·의료기기 균형 잡힌 포트폴리오", "방어적 경기 비민감 사업"],
    cons: ["탈크 소송 배상 부담 지속", "의약품 특허 만료 제네릭 경쟁", "성장 속도 느린 성숙 기업"],
    concept: { term: "배당 귀족(Dividend Aristocrat)", def: "25년 이상 연속 배당을 늘려온 S&P500 기업. 안정적 현금 흐름의 상징.", tip: "J&J는 60년+! 1960년대에 주식 사고 배당만 받아도 원금 몇 배 회수!" },
    desc: { ko:"반창고 베이비로션 항암제 다 만드는 헬스케어 거인 💊", en:"Band-aids to cancer drugs — healthcare giant 💊", ja:"バンドエイドから抗がん剤まで 💊 ヘルスケアの巨人！", zh:"从创可贴到抗癌药 💊 医疗保健巨头！", es:"De tiritas a medicamentos oncológicos 💊 ¡Gigante sanitario!", fr:"Des pansements aux médicaments anti-cancer 💊 Géant de la santé!", de:"Von Pflastern bis Krebsmedizin 💊 Gesundheitsriese!", pt:"De curativos a remédios oncológicos 💊 Gigante da saúde!", ar:"من الضمادات إلى أدوية السرطان 💊 عملاق الرعاية الصحية!", hi:"Band-aid से Cancer drugs 💊 Healthcare का giant!" },
  },
  {
    ticker: "PFE", name: "Pfizer", emoji: "💉", sector: "제약 / 바이오",
    pros: ["mRNA 기술력 코로나 백신으로 검증", "암·항바이러스 R&D 파이프라인", "낮아진 밸류에이션 저평가 매력"],
    cons: ["코로나 이후 백신 매출 급감", "대규모 M&A 부채 부담", "R&D 파이프라인 성과 불확실"],
    concept: { term: "R&D 파이프라인", def: "개발 중인 신약 후보군. 임상 1·2·3상 통과 후 승인 = 블록버스터 매출. 신약 1개 개발비 ~$2.6B.", tip: "제약주 투자 = 파이프라인 베팅. 성공하면 대박, 실패하면 주가 폭락!" },
    desc: { ko:"코로나 백신 만든 회사 💉 세계 최대 제약사 중 하나!", en:"Made the COVID vaccine 💉 World's biggest pharma!", ja:"コロナワクチンを作った会社 💉 世界最大級製薬企業！", zh:"制造新冠疫苗的公司 💉 全球最大制药商之一！", es:"Hicieron la vacuna COVID 💉 ¡Una de las mayores farmacéuticas!", fr:"Ont fait le vaccin COVID 💉 Géant pharmaceutique mondial!", de:"COVID-Impfstoff-Macher 💉 Weltgrößte Pharmafirma!", pt:"Fizeram a vacina COVID 💉 Gigante farmacêutico global!", ar:"صنعوا لقاح COVID 💉 من أكبر شركات الأدوية!", hi:"COVID vaccine बनाने वाले 💉 दुनिया की सबसे बड़ी pharma!" },
  },
  {
    ticker: "MRNA", name: "Moderna", emoji: "🧬", sector: "바이오테크 / mRNA",
    pros: ["mRNA 플랫폼 기술 코로나로 증명", "독감·암·HIV 등 mRNA 백신 파이프라인", "코로나 후 기술 다각화 진행 중"],
    cons: ["코로나 이후 매출 급감으로 적자 전환", "mRNA 특허 경쟁 BioNTech과 경합", "파이프라인 성공 여부 불확실"],
    concept: { term: "mRNA 백신", def: "바이러스 DNA 대신 mRNA(메신저RNA)를 주입해 면역 반응을 유도. 기존 방식보다 빠른 개발 가능.", tip: "코로나 mRNA 백신 = 인류 최초 mRNA 백신. 개발 기간 11개월 = 기존의 1/10!" },
    desc: { ko:"mRNA 백신으로 세상을 바꾼 혁신 바이오 🧬", en:"mRNA pioneers changing medicine forever 🧬", ja:"mRNAワクチンで医療を変えたパイオニア 🧬", zh:"mRNA疫苗改变世界的生物科技 🧬", es:"Pioneros del mRNA que cambian la medicina 🧬", fr:"Pionniers mRNA révolutionnant la médecine 🧬", de:"mRNA-Pioniere verändern die Medizin 🧬", pt:"Pioneiros mRNA mudando a medicina 🧬", ar:"رواد mRNA يغيرون الطب 🧬", hi:"mRNA से दुनिया बदलने वाले pioneers 🧬" },
  },
  {
    ticker: "DIS", name: "Walt Disney", emoji: "🏰", sector: "엔터테인먼트 / 미디어",
    pros: ["마블·스타워즈·픽사·디즈니 IP 최강 포트폴리오", "테마파크 수익 회복 강세", "스트리밍 Disney+ 흑자 전환 목표"],
    cons: ["Disney+ 구독자 증가 둔화", "부채 부담·콘텐츠 비용 높음", "박스오피스 기복 심함"],
    concept: { term: "IP(지적재산권)", def: "영화·캐릭터·브랜드 등 창작물에 대한 독점 권리. 마블·스타워즈 IP = 무한 수익 공장.", tip: "마블 IP 하나로 영화+OTT+굿즈+테마파크 수익 = 수십조 원. IP = 돈 찍는 기계!" },
    desc: { ko:"마블 스타워즈 디즈니+ 테마파크 다 갖고 있는 꿈의 기업 🏰", en:"Marvel + Star Wars + Disney+ + Parks = Disney 🏰", ja:"マーベル・スターウォーズ・テーマパーク全部持ってる 🏰", zh:"漫威+星战+Disney++主题公园都是他们的 🏰", es:"Marvel + Star Wars + Disney+ + Parques = Disney 🏰", fr:"Marvel + Star Wars + Disney+ + Parcs = Disney 🏰", de:"Marvel + Star Wars + Disney+ + Parks = Disney 🏰", pt:"Marvel + Star Wars + Disney+ + Parques = Disney 🏰", ar:"مارفل + حرب النجوم + Disney+ + مدن ترفيهية = Disney 🏰", hi:"Marvel + Star Wars + Disney+ + Parks सब Disney का 🏰" },
  },
  {
    ticker: "NKE", name: "Nike", emoji: "👟", sector: "스포츠 / 소비재",
    pros: ["스우시 브랜드 파워 50년 글로벌 1위", "DTC(직판) 전략으로 마진 개선", "운동·웰빙 트렌드 수혜"],
    cons: ["중국 시장 불매운동 리스크", "DTC 전환 과정 도매 채널 약화", "Hoka·On Running 등 신흥 브랜드 도전"],
    concept: { term: "DTC(Direct-to-Consumer)", def: "중간 유통 없이 브랜드가 직접 소비자에게 판매. 마진이 높고 고객 데이터 수집 가능.", tip: "나이키 앱 가입 → Nike.com 구매 = DTC. 백화점 판매 대비 마진 2배!" },
    desc: { ko:"Just Do It! 👟 세계 최대 스포츠 브랜드!", en:"Just Do It! 👟 World's biggest sports brand!", ja:"Just Do It! 👟 世界最大スポーツブランド！", zh:"Just Do It! 👟 全球最大运动品牌！", es:"¡Just Do It! 👟 ¡La mayor marca deportiva!", fr:"Just Do It! 👟 Plus grande marque sport au monde!", de:"Just Do It! 👟 Weltgrößte Sportmarke!", pt:"Just Do It! 👟 Maior marca esportiva do mundo!", ar:"Just Do It! 👟 أكبر علامة رياضية في العالم!", hi:"Just Do It! 👟 दुनिया का सबसे बड़ा Sports Brand!" },
  },
  {
    ticker: "MCD", name: "McDonald's", emoji: "🍔", sector: "식음료 / 프랜차이즈",
    pros: ["4만 개+ 전 세계 프랜차이즈 안정 수익", "부동산 소유 전략으로 자산 가치 높음", "인플레이션 환경 메뉴 가격 인상 가능"],
    cons: ["건강 트렌드 역행하는 이미지", "최저임금 인상 비용 부담", "GLP-1 비만약 확산 시 패스트푸드 수요 감소 우려"],
    concept: { term: "프랜차이즈 모델", def: "직접 운영 대신 가맹점에게 브랜드·시스템을 빌려주고 로열티를 받는 모델. 자본 효율 극대화.", tip: "맥도날드 본사 = 햄버거 파는 부동산 회사! 수만 개 점포 토지 소유자가 맥도날드." },
    desc: { ko:"빅맥 감자튀김 맥카페 😄 전 세계 어디에나 있는 M!", en:"Big Mac + fries + McCafé 😄 Yellow arches everywhere!", ja:"ビッグマック・フライドポテト 😄 世界中に黄色いM！", zh:"巨无霸+薯条+麦咖啡 😄 全球到处是黄色M！", es:"Big Mac + papas + McCafé 😄 ¡La M amarilla en todo!", fr:"Big Mac + frites + McCafé 😄 La M jaune partout!", de:"Big Mac + Pommes + McCafé 😄 Die gelbe M überall!", pt:"Big Mac + fritas + McCafé 😄 O M amarelo em todo lado!", ar:"بيغ ماك + بطاطس + ماكافيه 😄 الحرف M الأصفر في كل مكان!", hi:"Big Mac + Fries + McCafe 😄 पूरी दुनिया में M!" },
  },
  {
    ticker: "SBUX", name: "Starbucks", emoji: "☕", sector: "식음료 / 카페",
    pros: ["전 세계 3만 5000개+ 매장 스케일", "리워드 앱 고객 충성도 최상위", "중국 성장 잠재력"],
    cons: ["중국 매장 실적 부진 리스크", "소비자 지출 감소 시 고급 커피 수요 타격", "브라이언 니콜 신임 CEO 전략 검증 과제"],
    concept: { term: "로열티 프로그램", def: "구매할수록 포인트 적립 → 할인·무료 음료 제공. 고객을 단골로 만드는 마케팅 전략.", tip: "스타벅스 앱 선불 충전금 = 약 $2B! 이자도 없이 스타벅스에 돈 빌려주는 셈." },
    desc: { ko:"라테 프라푸치노 달달한 커피 ☕ 소비의 상징!", en:"Lattes, Frappuccinos & vibes ☕ The pulse of spending!", ja:"ラテ・フラペチーノ ☕ 消費者心理のシンボル！", zh:"拿铁和星冰乐 ☕ 消费的象征！", es:"Lattes y Frappuccinos ☕ ¡El termómetro del gasto!", fr:"Lattes et Frappuccinos ☕ Pouls de la consommation!", de:"Lattes und Frappuccinos ☕ Puls der Ausgaben!", pt:"Lattes e Frappuccinos ☕ Pulso do consumo!", ar:"لاتيه وفرابتشينو ☕ مقياس الإنفاق!", hi:"Latte और Frappuccino ☕ Consumer spending का barometer!" },
  },
  {
    ticker: "KO", name: "Coca-Cola", emoji: "🥤", sector: "음료 / 소비재",
    pros: ["200개국 판매 최강 글로벌 브랜드", "61년 연속 배당 인상 배당 귀족", "워런 버핏 오랜 보유 주식"],
    cons: ["설탕·탄산음료 건강 트렌드 역행", "물가 상승 원자재 비용 증가", "성장 속도 느린 성숙 기업"],
    concept: { term: "경제적 해자(Economic Moat)", def: "경쟁자가 넘기 어려운 진입장벽. 코카콜라 = 140년 브랜드 + 전 세계 유통망. 워런 버핏이 만든 개념.", tip: "콜라 맛 자체보다 로고·습관·유통망이 해자. 새 콜라 브랜드 만들어도 코카콜라 못 이김!" },
    desc: { ko:"콜라를 발명한 그 회사 🥤 200개국에서 팜!", en:"The OG cola company 🥤 Sold in 200+ countries!", ja:"コーラを発明した会社 🥤 200カ国以上で販売！", zh:"发明可乐的公司 🥤 在200多个国家销售！", es:"Los inventores de la Coca-Cola 🥤 ¡Vendida en 200+ países!", fr:"Les inventeurs du Coca 🥤 Vendue dans 200+ pays!", de:"Die Cola-Erfinder 🥤 In 200+ Ländern!", pt:"Os inventores da Coca-Cola 🥤 Vendida em 200+ países!", ar:"مخترعو الكوكا كولا 🥤 تُباع في 200+ دولة!", hi:"Cola बनाने वाले 🥤 200+ देशों में बिकती है!" },
  },
  {
    ticker: "PEP", name: "PepsiCo", emoji: "🫧", sector: "음료·스낵 / 소비재",
    pros: ["음료+스낵(Lay's·Quaker) 다각화 포트폴리오", "코카콜라 대비 스낵 사업으로 방어력 높음", "51년 연속 배당 인상"],
    cons: ["Ozempic 등 GLP-1 비만약 스낵 수요 리스크", "원자재 비용 상승 마진 압박", "탄산음료 시장 성장 한계"],
    concept: { term: "포트폴리오 다각화", def: "한 분야에 집중하지 않고 여러 사업에 분산해 리스크를 줄이는 전략. 펩시코는 음료+식품 양쪽.", tip: "펩시가 콜라 경쟁에서 지더라도 감자칩으로 벌충! 코카콜라 대비 안정적인 이유." },
    desc: { ko:"펩시+레이즈+게토레이 다 얘네 거! 🫧 음료스낵 제국!", en:"Pepsi + Lay's + Gatorade — all theirs! 🫧", ja:"ペプシ・リーバイス・ゲータレード全部！ 🫧", zh:"百事可乐+乐事+佳得乐全是他们的！ 🫧", es:"Pepsi + Lay's + Gatorade — ¡todo suyo! 🫧", fr:"Pepsi + Lay's + Gatorade — tout à eux! 🫧", de:"Pepsi + Lay's + Gatorade — alles ihres! 🫧", pt:"Pepsi + Lay's + Gatorade — tudo deles! 🫧", ar:"بيبسي + ليز + جاتوريد - كلها ملكهم! 🫧", hi:"Pepsi + Lay's + Gatorade सब इन्हीं का! 🫧" },
  },
  {
    ticker: "WMT", name: "Walmart", emoji: "🛒", sector: "유통 / 소매",
    pros: ["미국 최대 민간 고용주, 스케일 압도적", "Walmart+ 구독·광고 사업 성장 중", "인플레이션 환경 저가 쇼핑 수혜"],
    cons: ["아마존 이커머스에 점유율 잠식", "낮은 마진 구조 개선 한계", "노동 비용 증가 부담"],
    concept: { term: "EDLP(매일 최저가)", def: "Every Day Low Price. 할인 행사 없이 항상 가장 낮은 가격 제공. 월마트의 핵심 전략.", tip: "월마트가 납품업체에 가격 인하 압박 → 소비자에게 최저가 제공. 규모의 경제 극대화!" },
    desc: { ko:"미국 최대 마트 🛒 전 세계 가장 많은 직원 고용!", en:"America's biggest store 🛒 World's largest employer!", ja:"アメリカ最大スーパー 🛒 世界最大の民間雇用主！", zh:"美国最大超市 🛒 全球最大私营雇主！", es:"Mayor supermercado de EE.UU. 🛒 ¡El mayor empleador del mundo!", fr:"Plus grand supermarché US 🛒 Plus grand employeur privé!", de:"Amerikas größter Supermarkt 🛒 Weltgrößter Arbeitgeber!", pt:"Maior supermercado dos EUA 🛒 O maior empregador do mundo!", ar:"أكبر سوبر ماركت في أمريكا 🛒 أكبر صاحب عمل في العالم!", hi:"America का सबसे बड़ा Store 🛒 दुनिया का सबसे बड़ा Employer!" },
  },
  {
    ticker: "COST", name: "Costco", emoji: "📦", sector: "창고형 유통",
    pros: ["멤버십 수익 모델로 초안정 수익 구조", "고객 충성도 멤버십 갱신율 ~93%", "자체 브랜드 Kirkland 마진 높음"],
    cons: ["멤버십 가격 인상 한계", "이커머스 전환 속도 느림", "단가 낮은 모델로 매출 성장 한계"],
    concept: { term: "멤버십 비즈니스 모델", def: "연회비를 내야 이용 가능한 비즈니스. Costco는 상품 마진을 포기하고 멤버십 수수료로 수익.", tip: "Costco 핫도그 1.5달러 = 원가 이하 판매! 매장 들어오게 해서 멤버십 유지가 목표." },
    desc: { ko:"창고형 코스트코 📦 핫도그 1.5달러는 영원한 전설!", en:"Warehouse Costco 📦 The $1.50 hot dog is LEGENDARY!", ja:"倉庫型コストコ 📦 1.5ドルのホットドッグは伝説！", zh:"仓储式Costco 📦 1.5美元热狗是永远的传说！", es:"Costco almacén 📦 ¡El perrito de $1.50 es LEGENDARIO!", fr:"Entrepôt Costco 📦 Le hot-dog à $1,50 est LÉGENDAIRE!", de:"Lagerhaus Costco 📦 Der $1,50-Hot Dog ist LEGENDÄR!", pt:"Armazém Costco 📦 O cachorro-quente de $1,50 é LENDÁRIO!", ar:"كوستكو بالجملة 📦 الهوت دوغ بـ1.50 أسطوري!", hi:"Warehouse Costco 📦 $1.50 का Hot Dog LEGENDARY है!" },
  },
  {
    ticker: "HD", name: "Home Depot", emoji: "🔨", sector: "홈 인테리어 유통",
    pros: ["미국 주택 개보수 시장 압도적 1위", "Pro(전문 시공업자) 고객 증가 전략", "부동산 회복 수혜 기대"],
    cons: ["금리 상승 → 주택 거래 감소 → 수요 타격", "Lowe's와 치열한 2강 경쟁", "건축자재 가격 변동 리스크"],
    concept: { term: "주택 개보수 시장(Home Improvement)", def: "집을 직접 고치거나 꾸미는 데 드는 지출. 경기 침체에도 '어차피 살아야 하니 고치자' 심리로 견고.", tip: "코로나 재택근무 → 집에 투자 급증 → Home Depot 실적 폭발. 집순이·집돌이 경제!" },
    desc: { ko:"미국 DIY 공구 자재 1등 가게 🔨 집 고치는 미국인 필수템!", en:"America's #1 home improvement 🔨 Every DIY hero's paradise!", ja:"アメリカDIYホームセンターNo.1 🔨 DIYの天国！", zh:"美国家居改善第一大店 🔨 DIY爱好者的天堂！", es:"Tienda #1 de mejoras del hogar 🔨 ¡Paraíso del bricolaje!", fr:"Magasin de bricolage #1 🔨 Paradis du DIY!", de:"Amerikas Nr.1 Baumarkt 🔨 Heimwerker-Paradies!", pt:"Loja de reforma #1 dos EUA 🔨 Paraíso do DIY!", ar:"متجر تحسين المنازل الأول 🔨 جنة DIY!", hi:"America का #1 Home Improvement Store 🔨 DIY paradise!" },
  },
  {
    ticker: "LOW", name: "Lowe's", emoji: "🔧", sector: "홈 인테리어 유통",
    pros: ["Home Depot 라이벌 2위 안정적 위치", "Pro 고객 서비스 강화 전략", "배당 귀족(60년+ 연속 배당 인상)"],
    cons: ["Home Depot 대비 규모 열위", "주택 시장 침체 동반 리스크", "이커머스 경쟁 심화"],
    concept: { term: "배당 성장 투자", def: "주가 상승보다 매년 늘어나는 배당에 집중하는 전략. Lowe's는 60년 연속 배당 인상으로 복리 효과.", tip: "1965년 Lowe's 배당 투자 → 지금까지 재투자하면 원금의 수백 배! 시간이 핵심." },
    desc: { ko:"홈디포 라이벌 🔧 미국 집수리 용품 2등 매장!", en:"Home Depot's rival 🔧 America's #2 home improvement!", ja:"ホームデポのライバル 🔧 アメリカNo.2ホームセンター！", zh:"Home Depot的对手 🔧 美国第二家居改善连锁！", es:"El rival de Home Depot 🔧 ¡#2 en mejoras del hogar!", fr:"Le rival de Home Depot 🔧 2e chaîne de bricolage US!", de:"Home Depots Rivale 🔧 Amerikas Nr.2 Baumarktkette!", pt:"O rival da Home Depot 🔧 2ª rede de reforma dos EUA!", ar:"منافس Home Depot 🔧 ثاني سلسلة تحسين منازل!", hi:"Home Depot का rival 🔧 America की #2 Home Improvement Chain!" },
  },
  {
    ticker: "TWLO", name: "Twilio", emoji: "📱", sector: "SaaS / 커뮤니케이션 API",
    pros: ["개발자 커뮤니케이션 API 1위", "이메일·SMS·음성 통합 플랫폼", "수익성 개선 노력 진행 중"],
    cons: ["경쟁 심화로 성장 둔화", "기업 IT 예산 삭감 영향", "수익성 증명까지 시간 필요"],
    concept: { term: "API 이코노미", def: "소프트웨어 기능을 조각으로 제공해 다른 앱이 갖다 쓰게 하는 생태계. Twilio SMS API = 앱에서 문자 발송 기능.", tip: "Uber가 '드라이버 도착' 문자 보낼 때 = Twilio API 사용! API 호출당 돈 받는 구조." },
    desc: { ko:"문자 전화 이메일 API 제공 📱 개발자들의 슈퍼히어로!", en:"Communications APIs for devs 📱 The power behind your apps!", ja:"SMS・電話・メールAPIを提供 📱 開発者のヒーロー！", zh:"提供短信电话邮件API 📱 开发者的超级英雄！", es:"APIs de comunicación para devs 📱 ¡El poder detrás de tus apps!", fr:"APIs de communication 📱 Le superpouvoir de tes apps!", de:"Kommunikations-APIs 📱 Superpower für Entwickler!", pt:"APIs de comunicação 📱 O superpoder dos devs!", ar:"واجهات برمجة الاتصالات 📱 قوة تطبيقاتك الخارقة!", hi:"Communication APIs 📱 Developers का superhero!" },
  },
  {
    ticker: "ZM", name: "Zoom", emoji: "🎥", sector: "화상회의 / SaaS",
    pros: ["코로나로 전 세계 화상회의 표준 자리잡음", "대기업 고객 기반 안정 수익", "AI 화상회의 기능 통합 진행"],
    cons: ["코로나 이후 성장 급격히 둔화", "MS Teams·Google Meet 기업 시장 잠식", "경쟁 심화로 가격 압박"],
    concept: { term: "재택근무(WFH) 경제", def: "COVID 이후 재택·하이브리드 근무 확산으로 화상회의·협업 도구 수요 폭발. Zoom이 대표 수혜주.", tip: "2020년 Zoom 주가 600% 상승 → 이후 -80%. 트렌드 수혜주 매도 타이밍이 핵심!" },
    desc: { ko:"코로나 재택근무의 상징 🎥 다 줌으로 회의했잖아!", en:"The COVID WFH champion 🎥 We all Zoomed!", ja:"コロナ時代の代名詞 🎥 みんなZoomで会議した！", zh:"疫情远程办公的代名词 🎥 大家都用Zoom开会！", es:"El símbolo del teletrabajo COVID 🎥 ¡Todos usamos Zoom!", fr:"Le symbole du télétravail COVID 🎥 On a tous Zoomé!", de:"Das Symbol des COVID-Homeoffice 🎥 Wir haben alle gezoomed!", pt:"O símbolo do home office COVID 🎥 Todos nos zoomamos!", ar:"رمز العمل من المنزل في COVID 🎥 جميعنا استخدمنا Zoom!", hi:"COVID WFH का symbol 🎥 सबने Zoom पर meeting की!" },
  },
  {
    ticker: "DOCU", name: "DocuSign", emoji: "📝", sector: "전자서명 / SaaS",
    pros: ["전자서명 시장 점유율 ~80% 압도적 1위", "기업 계약 프로세스 필수 도구", "IAM(계약 지능화) 플랫폼 확장"],
    cons: ["코로나 이후 성장 급격히 둔화", "Adobe Sign·HelloSign 경쟁 심화", "사이클 정점 이후 수요 재확인 필요"],
    concept: { term: "전자서명(eSignature)", def: "종이 계약서에 도장 대신 디지털로 서명. 법적 효력은 동일. 계약 시간 수일 → 수분 단축.", tip: "전자서명 1건 = DocuSign 약 $0.10~$1 수익. 하루 수백만 건 처리!" },
    desc: { ko:"도장 대신 전자서명으로 계약 끝 📝 1억 건+ 처리!", en:"Sign contracts digitally 📝 Processing 100M+ documents!", ja:"電子署名で契約完了 📝 世界中で1億件以上！", zh:"用电子签名代替盖章 📝 处理1亿多份文件！", es:"Firma contratos digitalmente 📝 ¡100M+ documentos!", fr:"Signez numériquement 📝 100M+ documents traités!", de:"Digital unterschreiben 📝 100M+ Dokumente!", pt:"Assine contratos digitalmente 📝 100M+ documentos!", ar:"وقِّع العقود رقمياً 📝 100M+ وثيقة معالجة!", hi:"Digital Contract Sign करो 📝 10 करोड़+ documents!" },
  },
  {
    ticker: "LYFT", name: "Lyft", emoji: "🚕", sector: "공유경제 / 차량호출",
    pros: ["미국 시장에 집중 전략 (Uber와 차별화)", "흑자 전환 달성으로 수익성 개선", "자율주행 파트너십 구축 중"],
    cons: ["Uber 대비 규모 5배 열위", "미국 외 글로벌 확장 부재", "자율주행 전환 시 비즈니스 모델 위험"],
    concept: { term: "그로스 마진(Gross Margin)", def: "매출 - 직접 원가. 서비스 기업의 수익성 핵심 지표. Lyft는 기사 비용이 높아 마진 낮음.", tip: "Lyft Gross Margin ~50% vs SaaS 기업 ~80%. 물리적 서비스 = 마진 낮다!" },
    desc: { ko:"우버 라이벌 미국 차량호출 서비스 🚕 핑크 수염이 트레이드마크!", en:"Uber's rival ride-share 🚕 The pink mustache brand!", ja:"Uberのライバル配車サービス 🚕 ピンクのひげ！", zh:"Uber的竞争对手网约车 🚕 粉色胡须是商标！", es:"El rival de Uber 🚕 ¡La marca del bigote rosado!", fr:"Le rival d'Uber 🚕 La marque à la moustache rose!", de:"Ubers Rivale 🚕 Die Pink-Schnurrbart-Marke!", pt:"O rival da Uber 🚕 A marca do bigode rosa!", ar:"منافس Uber 🚕 علامة الشارب الوردي!", hi:"Uber का rival 🚕 Pink Mustache brand!" },
  },
  {
    ticker: "PINS", name: "Pinterest", emoji: "📌", sector: "소셜미디어 / 인스피레이션",
    pros: ["구매 의향 높은 사용자층 (쇼핑 연동 강점)", "AI 추천으로 광고 효율 개선 중", "여성 유저 중심 틈새 시장 확보"],
    cons: ["MAU 성장 정체 Instagram 경쟁", "AI 콘텐츠 범람으로 차별화 어려움", "수익 단가 타 플랫폼 대비 낮음"],
    concept: { term: "소셜 커머스(Social Commerce)", def: "SNS 내에서 직접 쇼핑하는 것. Pinterest는 인스피레이션 → 바로 구매 연결로 커머스 강화.", tip: "소파 사진 저장 → 바로 '이 소파 구매하기' 버튼! Pinterest = 쇼핑 욕구 자극기." },
    desc: { ko:"요리법·인테리어·패션 사진 모아두는 SNS 📌 쇼핑 욕구 자극기!", en:"Save recipes, fashion & decor 📌 The internet's mood board!", ja:"レシピ・インテリア・ファッション保存SNS 📌 ムードボード！", zh:"收藏食谱装修时尚图片的社交媒体 📌 灵感天堂！", es:"Guarda recetas, moda y deco 📌 ¡El tablero de ideas!", fr:"Sauvegardez recettes, mode et déco 📌 Tableau d'idées!", de:"Rezepte, Mode & Deko speichern 📌 Ideensammlung!", pt:"Salve receitas, moda e decoração 📌 O painel de ideias!", ar:"احفظ الوصفات والأزياء والديكور 📌 لوحة الإلهام!", hi:"Recipes, Fashion & Decor save करो 📌 Mood board!" },
  },
  {
    ticker: "BABA", name: "Alibaba", emoji: "🐼", sector: "이커머스 / 클라우드 (중국)",
    pros: ["중국 이커머스 1위 타오바오·티몰", "알리클라우드 AI 투자 확대", "낮은 밸류에이션 매력 (규제 우려 반영)"],
    cons: ["중국 정부 규제 리스크 상존", "JD.com·핀둬둬 경쟁 심화", "미·중 갈등 상장 폐지 우려"],
    concept: { term: "ADR(미국예탁증권)", def: "미국 증시에 상장된 외국 기업 주식. 알리바바는 ADR 형태로 NYSE 상장. 원래 홍콩 상장.", tip: "알리바바 주식 사는 것 = 중국 기업에 미국 거래소에서 투자. 환율+중국 리스크 고려!" },
    desc: { ko:"중국판 아마존 🐼 전 세계 최대 이커머스 중 하나!", en:"China's Amazon 🐼 One of world's biggest e-commerce!", ja:"中国版Amazon 🐼 世界最大のECの一つ！", zh:"中国的亚马逊 🐼 全球最大的电商之一！", es:"El Amazon de China 🐼 ¡Uno de los mayores e-commerce!", fr:"L'Amazon de la Chine 🐼 Un des plus grands e-commerce!", de:"Chinas Amazon 🐼 Einer der weltgrößten E-Commerce!", pt:"O Amazon da China 🐼 Um dos maiores e-commerce!", ar:"أمازون الصين 🐼 واحد من أكبر مواقع التجارة الإلكترونية!", hi:"China का Amazon 🐼 दुनिया के सबसे बड़े e-commerce में!" },
  },
];

// ── Live price data ─────────────────────────────────────────────────────────
type LiveData = {
  price: number; prevClose: number;
  high52: number; low52: number;
  currency: string; longName: string;
};

export default function TodayPage() {
  const dayIndex = useMemo(() => Math.floor(Date.now() / 86400000) % STOCKS.length, []);
  const stock = STOCKS[dayIndex];

  const { lang, t } = useLanguage();
  const [live, setLive] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/stock?ticker=${encodeURIComponent(stock.ticker)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error || !d.price) return;
        setLive({
          price: d.price,
          prevClose: d.prevClose,
          high52: d.high52,
          low52: d.low52,
          currency: d.currency,
          longName: d.longName ?? stock.name,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [stock.ticker, stock.name]);

  const changePercent = live && live.prevClose ? ((live.price - live.prevClose) / live.prevClose) * 100 : null;
  const up = changePercent !== null ? changePercent >= 0 : null;

  const dateStr = new Date().toLocaleDateString(LOCALE_MAP[lang], {
    year: "numeric", month: "long", day: "numeric",
  });

  const fmt = (n: number) =>
    n >= 1000 ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${n.toFixed(2)}`;

  return (
    <main className="min-h-screen bg-[#F5F5F0] font-sans">
      <div className="max-w-xl mx-auto px-4 pt-12 pb-8">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest mb-0.5">
              📅 {t.todayStock} · {stock.sector}
            </p>
            <h1 className="font-display font-bold text-2xl text-[#0D0D0D]">{dateStr}</h1>
          </div>
          <button
            onClick={() => setSaved((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-xl"
          >
            {saved ? "❤️" : "🤍"}
          </button>
        </div>

        {/* ── Main card ── */}
        <div className="rounded-3xl bg-[#0D0D0D] text-white p-6 mb-4 shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#00D08430", color: "#00D084" }}>
                  📅 Day {(dayIndex % STOCKS.length) + 1} / {STOCKS.length}
                </span>
              </div>
              <p className="text-4xl font-display font-bold tracking-tight">${stock.ticker}</p>
              <p className="text-sm text-gray-400">{loading ? stock.name : (live?.longName ?? stock.name)}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">{stock.emoji}</div>
            </div>
          </div>

          {/* Price row */}
          {loading ? (
            <div className="flex items-center gap-3 mb-5">
              <div className="h-7 w-28 rounded-lg bg-white/10 animate-pulse" />
              <div className="h-4 w-16 rounded-lg bg-white/10 animate-pulse" />
            </div>
          ) : live ? (
            <div className="flex items-end gap-3 mb-5">
              <p className="text-2xl font-bold">{fmt(live.price)}</p>
              {changePercent !== null && (
                <p className={`text-sm font-semibold ${up ? "text-green-400" : "text-red-400"}`}>
                  {up ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}% {t.todayChange}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-5">
              <p className="text-sm text-gray-400">{t.loadError} — {t.loadErrorSub}</p>
            </div>
          )}

          {/* 52-week bar */}
          {live && live.high52 > 0 && (
            <div className="mb-5">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>{t.low52w} {fmt(live.low52)}</span>
                <span>{t.currentPrice} {fmt(live.price)}</span>
                <span>{t.high52w} {fmt(live.high52)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "#00D084",
                    width: `${Math.min(100, Math.max(0, ((live.price - live.low52) / (live.high52 - live.low52)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-white/90 leading-relaxed border-t border-white/10 pt-4">
            {stock.desc[lang]}
          </p>
        </div>

        {/* ── Stats row ── */}
        {live && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: t.currentPrice, value: fmt(live.price), color: "#0D0D0D" },
              { label: t.high52w,      value: fmt(live.high52), color: "#00D084" },
              { label: t.low52w,       value: fmt(live.low52), color: "#EF4444" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-3 text-center shadow-sm">
                <p className="text-[9px] text-[#9CA3AF] uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Pros & Cons ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#00D084" }}>
              👍 {t.buyReason}
            </p>
            <ul className="space-y-2">
              {stock.pros.map((p) => (
                <li key={p} className="text-xs text-[#374151] flex items-start gap-1.5">
                  <span style={{ color: "#00D084" }} className="shrink-0 font-bold">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-red-500">
              👎 {t.risk}
            </p>
            <ul className="space-y-2">
              {stock.cons.map((c) => (
                <li key={c} className="text-xs text-[#374151] flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0 font-bold">×</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Today's concept ── */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: "#7C3AED0D" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7C3AED" }}>
            📚 {t.todayConcept}
          </p>
          <p className="font-bold text-[#0D0D0D] mb-1">{stock.concept.term}</p>
          <p className="text-sm text-[#6B7280] mb-2 leading-relaxed">{stock.concept.def}</p>
          <div className="rounded-xl p-2.5" style={{ background: "#7C3AED12" }}>
            <p className="text-xs text-[#7C3AED] leading-relaxed">💡 {stock.concept.tip}</p>
          </div>
        </div>

        {/* ── CTA ── */}
        <Link
          href="/simulator"
          className="block w-full rounded-2xl touch-target flex items-center justify-center gap-2 text-sm font-bold text-white mb-3"
          style={{ background: "#F59E0B" }}
        >
          💸 {t.trySimulator}
        </Link>
        <Link
          href="/quiz"
          className="block w-full rounded-2xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center text-sm font-medium text-[#6B7280]"
        >
          🎮 {t.doQuiz}
        </Link>

        {/* Rotation hint */}
        <p className="text-center text-[10px] text-[#9CA3AF] mt-4">
          매일 새로운 종목 소개 · {STOCKS.length}개 종목 로테이션 중
        </p>
      </div>

    </main>
  );
}
