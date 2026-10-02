# 더나은 홈페이지

HTML·CSS·JavaScript 파일을 그대로 배포합니다. 빌드, npm 설치, Astro, 별도 서버 프로그램은 필요하지 않습니다.

## 수정 위치

| 내용 | 파일 |
| --- | --- |
| 페이지 본문·제목·검색 설명 | `index.html`, `services.html`, `partners.html`, `location.html` |
| 공통 PC·모바일 메뉴 | `includes/header.html` |
| 공통 푸터 | `includes/footer.html` |
| 채용 공고 URL·문구 | `js/site-config.js` |
| 채용 배너 모양 | `includes/recruitment.html` |
| 스타일·인터랙션·이미지 | `css/`, `js/`, `assets/` |

헤더·푸터는 `js/bootstrap.js`가 불러옵니다. 공통 메뉴가 준비된 후 메뉴 동작과 장면을 초기화하므로 모바일 메뉴를 열면 배경 모션도 이전처럼 멈춥니다. 본문과 기본 히어로는 각 HTML에 남아 있습니다.

JavaScript를 끄면 각 페이지의 `<noscript>` 안내만 보입니다. 내용은 회사명, 이메일, 전화번호, 회사 주소, JavaScript 활성화 안내입니다. 연락처 변경 시 공통 헤더·푸터와 각 페이지의 기본 연락처·`<noscript>`도 함께 수정합니다. JS가 켜져 있어도 공통 HTML 요청이 실패하면 기본 이메일·전화 링크가 남습니다.

채용 공고는 `js/site-config.js`의 `recruitment.url`에 실제 사람인 공고 주소를 넣으면 나타납니다. 빈 문자열이면 숨깁니다.

## 미리보기

정적 웹 서버에서 확인합니다. Python이 있다면 아래 명령 하나로 볼 수 있습니다. 파일을 합치거나 변환하지 않으며, 수정 후 브라우저를 새로고침하면 됩니다.

```sh
python3 -m http.server 4321 --bind 127.0.0.1
```

주소는 `http://127.0.0.1:4321/`입니다. `file://`로 직접 열면 브라우저가 공통 HTML의 fetch를 차단할 수 있으므로 HTTP 주소를 사용합니다.

## 배포

아래 파일·폴더를 그대로 올립니다.

- 루트의 `*.html`, `robots.txt`, `sitemap.xml`
- `assets/`, `css/`, `js/`, `includes/`

회사 서버는 일반 정적 파일 호스팅만 있으면 됩니다. 기존 `.html` 주소와 회사 대표 도메인의 검색 메타정보·사이트맵을 유지합니다. `config/nginx-location.conf.example`은 기존 주소의 301 이동·404 응답·캐시 설정 참고용입니다.

GitHub Pages에서도 상대 경로로 동작합니다. `.github/workflows/deploy.yml`은 파일을 복사해서 업로드만 합니다. 빌드·패키지 설치는 없고, 검토본에만 `noindex`를 적용합니다. 워크플로를 사용하려면 저장소 Settings → Pages → Source를 GitHub Actions로 선택합니다. 회사 서버 파일은 이 워크플로가 수정하지 않습니다.

## 지도

카카오 지도 공개 JavaScript 키와 본사 좌표는 `location.html`의 `#kakaoMap` 데이터 속성에서 관리합니다. Kakao Developers에 실제 실행 출처가 등록되어 있어야 합니다. 등록되지 않은 로컬 출처에서 발생하는 `401 domain mismatched`는 HTML이나 마커 위치를 바꿔 해결할 수 없습니다. 실패 시 페이지의 카카오맵 링크를 이용할 수 있습니다.

히어로의 실제 지형 데이터는 `scripts/data/location-map-data.json`에 있습니다. 지형을 변경할 때만 아래 명령을 사용합니다. 평소 수정·배포에는 필요하지 않습니다.

```sh
python3 scripts/build-location-map.py
```

이 명령은 `location.html`의 지도 주석 구간만 갱신합니다. 실제 지리 좌표와 OpenStreetMap 출처 표시를 유지합니다.

Three.js 0.186.1과 GSAP 3.15.0은 `assets/vendor/`에서 로컬 파일로 사용하며 라이선스와 출처를 함께 보관합니다.
