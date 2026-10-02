  function initKakaoMap(){
    const mapEl = document.getElementById('kakaoMap');
    if (!mapEl) return;

    const appKey = mapEl.dataset.appKey;
    const lat = Number(mapEl.dataset.lat);
    const lng = Number(mapEl.dataset.lng);
    const title = mapEl.dataset.title || '(주)더나은 본사';

    const status = document.getElementById('mapStatus');
    const showMapError = () => {
      status.textContent = '지도를 불러오지 못했습니다. 아래 카카오맵 버튼에서 본사 위치를 확인해 주세요.';
      status.classList.remove('is-hidden');
    };
    const timeout = setTimeout(showMapError, 12000);
    const script = document.createElement('script');
    script.onerror = () => { clearTimeout(timeout); showMapError(); };
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + encodeURIComponent(appKey) + '&autoload=false';
    script.onload = () => {
      if (!window.kakao || !kakao.maps) { clearTimeout(timeout); showMapError(); return; }
      kakao.maps.load(() => {
        const fallbackPosition = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(mapEl, {
          center: fallbackPosition,
          level: 3
        });
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

        function mark(position){
          map.setCenter(position);
          const marker = new kakao.maps.Marker({ position });
          marker.setMap(map);
          const info = new kakao.maps.InfoWindow({
            content: '<div style="padding:9px 13px;font-size:13px;font-weight:700;white-space:nowrap">' + title + '<br><span style="font-weight:400;color:#666">경동스마트밸리 206호</span></div>'
          });
          info.open(map, marker);
        }

        mark(fallbackPosition);
        clearTimeout(timeout);
        status.classList.add('is-hidden');
      });
    };
    document.head.appendChild(script);
  }
  initKakaoMap();

