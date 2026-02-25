type MockSource = {
  provider: "naver" | "kakao" | "google" | "blog";
  sourceUrl: string | null;
  snippetText: string;
  rating: number | null;
};

export function generateMockCrawlData(locationName: string): MockSource[] {
  const sources: MockSource[] = [];

  // Naver 5건
  for (let i = 1; i <= 5; i++) {
    sources.push({
      provider: "naver",
      sourceUrl: `https://map.naver.com/place/${1000000 + i}`,
      snippetText: generateSnippet(locationName, "naver", i),
      rating: 3.5 + Math.random() * 1.5,
    });
  }

  // Kakao 5건
  for (let i = 1; i <= 5; i++) {
    sources.push({
      provider: "kakao",
      sourceUrl: `https://place.map.kakao.com/${2000000 + i}`,
      snippetText: generateSnippet(locationName, "kakao", i),
      rating: 3.0 + Math.random() * 2.0,
    });
  }

  // Google 5건
  for (let i = 1; i <= 5; i++) {
    sources.push({
      provider: "google",
      sourceUrl: `https://maps.google.com/place/${3000000 + i}`,
      snippetText: generateSnippet(locationName, "google", i),
      rating: 3.0 + Math.random() * 2.0,
    });
  }

  // Blog 2건
  for (let i = 1; i <= 2; i++) {
    sources.push({
      provider: "blog",
      sourceUrl: `https://blog.naver.com/reviewer${i}/post${4000000 + i}`,
      snippetText: generateBlogSnippet(locationName, i),
      rating: null,
    });
  }

  return sources;
}

export function generateMockSummary(
  locationName: string,
  sources: MockSource[],
): { totalCount: number; averageRating: number | null; summaryText: string } {
  const rated = sources.filter((s) => s.rating != null);
  const avgRating =
    rated.length > 0
      ? Math.round(
          (rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length) *
            10,
        ) / 10
      : null;

  return {
    totalCount: sources.length,
    averageRating: avgRating,
    summaryText: `${locationName}에 대해 총 ${sources.length}개의 자료를 수집했습니다. 네이버 ${sources.filter((s) => s.provider === "naver").length}건, 카카오 ${sources.filter((s) => s.provider === "kakao").length}건, 구글 ${sources.filter((s) => s.provider === "google").length}건, 블로그 ${sources.filter((s) => s.provider === "blog").length}건의 리뷰와 정보를 분석했습니다.${avgRating ? ` 평균 평점은 ${avgRating}점입니다.` : ""} 대체로 긍정적인 평가가 많으며, 분위기와 서비스에 대한 언급이 자주 등장합니다.`,
  };
}

function generateSnippet(
  locationName: string,
  provider: string,
  index: number,
): string {
  const snippets: Record<string, string[]> = {
    naver: [
      `${locationName} 방문 후기 - 분위기가 정말 좋고 음식도 맛있었어요. 특히 인테리어가 감각적이라 사진 찍기에도 좋습니다.`,
      `${locationName} 추천! 주말에 방문했는데 웨이팅이 좀 있었지만 그만한 가치가 있었습니다.`,
      `${locationName} 평일 점심에 다녀왔어요. 가성비 좋고 직원분들 친절합니다.`,
      `${locationName} 재방문 의사 100%! 메뉴가 다양하고 맛도 일정해서 만족스럽습니다.`,
      `${locationName} 데이트 코스로 딱! 조용하고 분위기 있는 곳이에요.`,
    ],
    kakao: [
      `${locationName} - 위치가 좋고 접근성이 뛰어납니다. 주차도 편리해요.`,
      `${locationName} 리뷰: 서비스 퀄리티가 높고 가격대비 만족도 높은 곳입니다.`,
      `${locationName} 한 줄 평: 재방문하고 싶은 곳. 특히 디저트 추천합니다.`,
      `${locationName} 방문기: 아이와 함께 방문하기 좋은 곳이에요. 키즈존도 있습니다.`,
      `${locationName} 후기: 깔끔한 인테리어와 맛있는 음식, 합리적인 가격이 매력적입니다.`,
    ],
    google: [
      `Great experience at ${locationName}. The atmosphere is wonderful and the food quality is excellent.`,
      `${locationName} is a must-visit. Friendly staff and delicious menu options.`,
      `Visited ${locationName} last weekend. A bit crowded but worth the wait.`,
      `${locationName} review: Clean, well-organized, and great service. Highly recommended.`,
      `${locationName} - One of the best spots in the area. Will definitely come back.`,
    ],
  };

  return snippets[provider]?.[index - 1] ?? `${locationName} 리뷰 #${index}`;
}

function generateBlogSnippet(locationName: string, index: number): string {
  const snippets = [
    `[${locationName} 방문 후기] 오늘은 요즘 핫한 ${locationName}에 다녀왔어요! 솔직히 기대 이상이었습니다. 분위기부터 음식, 서비스까지 모두 만족스러웠고, 다음에 또 방문하고 싶은 곳이에요. 사진과 함께 자세한 후기를 남깁니다.`,
    `[솔직 후기] ${locationName} 가볼만한 곳? 최근 ${locationName}을 방문했는데요, SNS에서 본 것처럼 인테리어가 예쁘고 사진 찍기 좋은 곳이었어요. 메뉴 구성도 다양하고 맛도 괜찮았습니다. 다만 주말에는 웨이팅이 좀 길 수 있으니 평일 방문을 추천합니다.`,
  ];

  return snippets[index - 1] ?? `${locationName} 블로그 리뷰 #${index}`;
}
