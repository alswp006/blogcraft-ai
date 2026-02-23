# BlogCraft AI (blogcraft-ai)

# PRD
## Background / Problem
- 데이터 포인트 1: 블로그 글 작성에 매번 **1–2시간**이 소요되며, 특히 사진이 많은 장소 리뷰는 정리 자체가 번거롭다.
- 데이터 포인트 2: (예시 사용자) 애드센스를 달았지만 월 수익이 **5만원** 수준으로, 방문자 대비 수익이 낮다.

가족 구성원들이 각자 블로그를 운영하지만, 말투/스타일을 유지하면서도 글 작성 시간을 줄이기 어렵다. 기존 AI 글쓰기 도구는 “AI 티”가 나 독자가 쉽게 알아차리고, SEO/수익화 지식 부족으로 같은 트래픽에서도 수익이 낮다. 결과적으로 “시간 절약 + 개인 문체 유지 + SEO/수익화 적용”을 동시에 해결하는 도구가 필요하다.

## Goal (1-sentence product definition)
가족 구성원이 **사진+메모만으로 10분 이내**에 개인 블로그 스타일을 유지한 글을 생성하고, **주 3회 이상 작성 사용자 70%** 및 **3개월 내 월 평균 수익 30% 증가(자체 보고)**를 달성한다.

## Non-goals
- 블로그 플랫폼에 대한 **자동 포스팅/자동 발행** 기능
- **공개 SaaS 출시**(가족 전용 사용 전제)
- **실시간 수익/검색순위 분석 대시보드**
- 블로그 플랫폼 **API 연동**(티스토리/네이버 등)
- **백링크 자동 생성** 서비스

## Target Users (personas + use cases)
- 민지 (32세, 주부 블로거) — 맛집/육아 블로그 운영. 아이 돌보느라 시간이 부족하고, **친근한 말투를 유지하면서 빠르게 업로드**하고 싶다. 애드센스 수익이 낮아 **수익화 팁**이 필요.
- 준호 (28세, 개발자) — 테크/여행 블로그를 분리 운영. 카테고리마다 **톤이 달라 일관된 문체 유지가 번거롭고**, SEO를 알지만 매번 챙기기 싫다.

## Target Market
- South Korea (KR)

## Data Entities (nouns with key fields)
- Category
  - id, name
  - description (optional)
  - createdAt, updatedAt
- LearningSample
  - id, categoryId
  - sourceType: `url | file`
  - sourceUrl (nullable), fileName (nullable)
  - rawText
  - createdAt
- StyleProfile
  - id, categoryId
  - profileJson (문체/어투/문장 구조 분석 결과)
  - sampleCount
  - createdAt, updatedAt
- Post
  - id, categoryId
  - locationName
  - overallNote
  - title
  - contentMarkdown
  - status: `draft | generated | exported`
  - createdAt, updatedAt
- Photo
  - id, postId
  - originalFileName
  - storedFilePath
  - memo (필수)
  - sortOrder (드래그 정렬 반영)
- CrawlSource
  - id, postId
  - provider: `naver | kakao | google | blog`
  - sourceUrl (nullable)
  - snippetText
  - rating (nullable)
  - createdAt
- CrawlSummary
  - id, postId
  - totalCount (max 17)
  - averageRating (nullable)
  - summaryText
- PlagiarismCheck
  - id, postId, versionId
  - similarityScore (0–100)
  - comparedSourceIds (CrawlSource id list)
  - passed (boolean)
  - createdAt
- SeoAnalysis
  - id, postId, versionId
  - keywordDensityScore
  - titleOptimizationScore
  - metaDescriptionScore
  - readabilityScore
  - internalLinksScore
  - overallScore
  - suggestions (string list)
  - createdAt
- MonetizationTip
  - id, categoryId
  - recommendedMethod (예: 애드센스/제휴마케팅/쿠팡파트너스 등)
  - tipText (글 하단용 문구)
  - createdAt, updatedAt
- PostVersion
  - id, postId
  - versionNumber
  - promptNote (예: “더 친근하게, 주차 강조”)
  - title
  - contentMarkdown
  - createdAt

## Core Flow (numbered steps)
1. 사용자가 카테고리 생성 후, 샘플 글을 URL/파일로 **최소 5개** 등록한다.
2. 새 글 작성에서 카테고리를 선택하고, 장소명/전체 후기를 입력한다.
3. 사진을 **최대 20장** 업로드하고, 각 사진에 **메모(필수)**를 입력한 뒤 드래그로 순서를 정한다.
4. 생성 버튼을 눌러 제한적 크롤링(네이버/카카오/구글 각 5개 + 블로그 2개, **총 최대 17개**)을 수행하고 요약을 확인한다.
5. 말투 프로필을 적용해 글을 생성하고, 표절 1차 검증 및 SEO 5항목 점수/제안을 확인한다.
6. 필요 시 재생성(추가 지시 입력) 후 Markdown과 사진 ZIP을 다운로드하여 블로그에 수동 게시한다.

## Success Metrics (measurable)
- 카테고리당 학습 데이터(샘플) **5개 이상 등록률 ≥ 80%**
- 평균 글 생성 완료(시작~내보내기) **10분 이내 달성률 ≥ 90%**
- 표절 검사 **통과율 ≥ 95%**
- SEO 점수 **80점 이상 글 비율 ≥ 70%**
- 주간 글 작성 빈도 **주 3회 이상 유저 비율 ≥ 70%**

## MVP Scope (exhaustive feature list)
- 카테고리별 말투 학습: URL/파일 샘플 업로드 → 문체/어투/구조 분석 결과 저장(카테고리별 상이한 스타일 지원)
- 제한적 다중 소스 크롤링: 장소명 기반 네이버/카카오/구글 각 5개 + 블로그 2개(총 17개) 수집 및 요약(참고 개수/평균 평점 포함)
- 사진 기반 글 구성: 최대 20장 업로드, 사진별 메모 필수, 드래그로 순서 조정
- 내보내기: Markdown 내보내기 + 사진 파일명 자동 정리 후 ZIP 다운로드(예: `01_시그니처라떼.jpg`)
- 표절 방지 1차 검증: 생성 결과를 크롤링 원본과 비교하여 유사도 높으면 재작성 유도/수행
- SEO 자동 분석 및 제안: 키워드 밀도/제목/메타설명/가독성/내부링크 5항목 점수와 개선 제안 제공 + 카테고리별 수익화 팁(링크 삽입은 사용자 수동)

## Target Audience & Marketing
- Target user persona (1 sentence: who they are, what they need)  
  블로그 수익화를 시도하는 가족 구성원으로, **내 말투를 유지한 채 사진+메모만으로 빠르게 글을 만들고 SEO/수익화 가이드를 받고 싶다**.
- Key value proposition (1 sentence: why this app over alternatives)  
  “AI 티” 없이 **카테고리별 내 문체를 재현**하면서 **10분 내 글 완성 + SEO 점검 + 수익화 팁**까지 한 번에 제공한다.
- 3 top features for landing page hero section  
  1) 카테고리별 말투 학습  
  2) SEO 자동 분석 및 개선 제안(5항목 점수화)  
  3) 카테고리별 수익화 가이드(글 하단 팁 생성)
- Desired brand tone (e.g., professional, playful, minimal, bold)  
  professional

## Monetization Strategy
- Recommended strategy: **none**  
  MVP는 “가족 전용(공개 SaaS 비출시)” 전제이므로 결제/유료화는 적용하지 않는다.
- Pricing tiers (if applicable): N/A
- Premium features (if freemium): N/A  
  (참고: 추후 공개 전환 시 지역(kr) 권장 결제수단은 Toss/KakaoPay/Stripe이며, 기본 전략은 freemium이 적합하나 MVP 범위에서는 제외)

## Assumptions
1. 가족 구성원들은 카테고리당 샘플 글 **최소 5개**를 확보할 수 있다.
2. 사진 기반 리뷰(맛집/여행/제품 등)가 MVP의 주요 사용 시나리오이다.
3. 크롤링은 “최대 17개 소스” 제한으로도 글 생성에 필요한 근거 요약을 제공할 수 있다.
4. 사용자는 자동 발행이 아닌 **다운로드 후 수동 게시**를 수용한다.
5. SEO 점수화 5항목은 초보자에게도 이해 가능한 형태로 설명될 수 있다.
6. 표절 1차 검증은 “법적 리스크를 완전 제거”가 아니라 **고위험 사례를 사전에 탐지**하는 수준이다.
7. 카테고리별 수익화 팁은 링크 자동 삽입 없이도 행동 유도에 의미가 있다.
8. Web-only로도 가족 구성원의 주요 작업(업로드/생성/내보내기)이 완료된다.

## Open Questions
1. “카테고리”의 초기 프리셋은 고정 5개(식당/숙소/여행지/테크/제품)만 허용하는가, 사용자 커스텀을 허용하는가?
2. 크롤링 대상 “블로그 2개”의 선정 기준(최신/조회수/키워드 일치 등)은 무엇인가?
3. 표절 유사도 “재작성 트리거” 기준값(예: similarityScore ≥ X)은 얼마로 설정할 것인가?
4. SEO 분석에서 “내부 링크 점수”는 사용자가 실제 링크 URL을 넣기 전에도 평가가 가능한가(예: 링크 placeholder 허용)?
5. 가족 전용의 운영 방식: 계정은 가족 구성원별로 개별 가입인가, 아니면 가족 단위 워크스페이스 개념이 필요한가(MVP 범위 결정)?