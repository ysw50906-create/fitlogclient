import React, { useEffect, useRef } from 'react';
import '../style/CompanyInfo.css';

function CompanyInfo() {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    // ========================================
    // 회사 정보
    // ========================================

    const company = {
        name: 'fitlog',
        ceo: '홍길동',
        businessNumber: '123-45-67890',
        phone: '02-1234-5678',
        email: 'fitlog@example.com',
        address: '서울특별시 구로구 경인로 557 삼영빌딩 4층',
    };

    // ========================================
    // 카카오맵
    // ========================================

    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!window.kakao || !window.kakao.maps) {
            console.error('카카오맵 SDK가 로드되지 않았습니다.');
            return;
        }

        window.kakao.maps.load(() => {
            const coords = new window.kakao.maps.LatLng(
                37.503077,
                126.879009
            );

            const kakaoMap = new window.kakao.maps.Map(
                mapContainerRef.current,
                {
                    center: coords,
                    level: 3,
                }
            );

            new window.kakao.maps.Marker({
                map: kakaoMap,
                position: coords,
            });
        });
    }, []);

    return (
        <div className="company-info-container">

            <div className="company-info-card">

                <div className="company-info-title">
                    회사 정보
                </div>

                <div className="company-info-row">
                    <div className="company-info-label">
                        회사명
                    </div>

                    <div className="company-info-value">
                        {company.name}
                    </div>
                </div>

                <div className="company-info-row">
                    <div className="company-info-label">
                        대표자
                    </div>

                    <div className="company-info-value">
                        {company.ceo}
                    </div>
                </div>

                <div className="company-info-row">
                    <div className="company-info-label">
                        사업자등록번호
                    </div>

                    <div className="company-info-value">
                        {company.businessNumber}
                    </div>
                </div>

                <div className="company-info-row">
                    <div className="company-info-label">
                        전화번호
                    </div>

                    <div className="company-info-value">
                        {company.phone}
                    </div>
                </div>

                <div className="company-info-row">
                    <div className="company-info-label">
                        이메일
                    </div>

                    <div className="company-info-value">
                        {company.email}
                    </div>
                </div>

            </div>

            <div className="company-info-card">

                <div className="company-info-title">
                    회사 위치
                </div>

                <div className="company-map">
                    <div
                        ref={mapContainerRef}
                        className="company-map-container"
                    />
                </div>

                <div className="company-map-address">
                    📍 {company.address}
                </div>

            </div>

            <div className="company-info-card">

                <div className="company-info-title">
                    이용약관
                </div>

                <div className="company-terms">

                    <div className="company-terms-title">
                        제1조 (목적)
                    </div>

                    <div className="company-terms-content">
                        이 약관은 {company.name}이 제공하는
                        서비스의 이용과 관련하여 회사와 회원의
                        권리, 의무 및 책임사항을 규정함을 목적으로
                        합니다.
                    </div>


                    <div className="company-terms-title">
                        제2조 (회원가입)
                    </div>

                    <div className="company-terms-content">
                        회원은 회사가 정한 가입 절차에 따라
                        회원가입을 신청할 수 있습니다.
                        회원은 가입 시 정확한 정보를 제공해야 합니다.
                    </div>


                    <div className="company-terms-title">
                        제3조 (서비스 이용)
                    </div>

                    <div className="company-terms-content">
                        회원은 관계 법령 및 본 약관을 준수하여
                        서비스를 이용해야 합니다.
                        타인의 권리를 침해하거나 서비스 운영을
                        방해하는 행위를 해서는 안 됩니다.
                    </div>


                    <div className="company-terms-title">
                        제4조 (회원의 의무)
                    </div>

                    <div className="company-terms-content">
                        회원은 본인의 계정 정보를 안전하게 관리해야
                        하며, 자신의 계정을 타인에게 양도하거나
                        대여해서는 안 됩니다.
                    </div>


                    <div className="company-terms-title">
                        제5조 (게시물)
                    </div>

                    <div className="company-terms-content">
                        회원이 작성한 게시물에 대한 책임은 해당
                        게시물을 작성한 회원에게 있습니다.
                        회사는 서비스 운영에 부적절한 게시물을
                        삭제하거나 이용을 제한할 수 있습니다.
                    </div>


                    <div className="company-terms-title">
                        제6조 (서비스 이용 제한)
                    </div>

                    <div className="company-terms-content">
                        회원이 본 약관을 위반하거나 서비스의 정상적인
                        운영을 방해하는 경우 회사는 서비스 이용을
                        제한할 수 있습니다.
                    </div>


                    <div className="company-terms-title">
                        제7조 (서비스 변경 및 종료)
                    </div>

                    <div className="company-terms-content">
                        회사는 서비스 운영상 필요한 경우 서비스의
                        일부 또는 전부를 변경하거나 종료할 수 있습니다.
                    </div>


                    <div className="company-terms-title">
                        제8조 (면책)
                    </div>

                    <div className="company-terms-content">
                        회사는 천재지변, 네트워크 장애 등 회사가
                        합리적으로 통제할 수 없는 사유로 발생한
                        서비스 이용 장애에 대해서는 책임을 지지
                        않습니다.
                    </div>


                    <div className="company-terms-title">
                        제9조 (약관의 변경)
                    </div>

                    <div className="company-terms-content">
                        회사는 필요한 경우 본 약관을 변경할 수 있으며,
                        변경된 약관은 서비스 내에서 공지합니다.
                    </div>


                    <div className="company-terms-title">
                        제10조 (문의)
                    </div>

                    <div className="company-terms-content">
                        서비스 이용과 관련된 문의사항은 아래 연락처로
                        문의할 수 있습니다.
                        <br />
                        전화: {company.phone}
                        <br />
                        이메일: {company.email}
                    </div>

                </div>

            </div>

            <div className="company-info-card">

                <div className="company-info-title">
                    개인정보처리방침
                </div>

                <div className="company-terms">

                    <div className="company-terms-title">
                        1. 개인정보의 수집
                    </div>

                    <div className="company-terms-content">
                        회사는 서비스 제공을 위해 필요한 범위에서
                        회원의 개인정보를 수집할 수 있습니다.
                    </div>


                    <div className="company-terms-title">
                        2. 개인정보의 이용
                    </div>

                    <div className="company-terms-content">
                        수집된 개인정보는 회원관리, 서비스 제공,
                        고객문의 대응 및 서비스 개선을 위해
                        이용됩니다.
                    </div>


                    <div className="company-terms-title">
                        3. 개인정보의 보관
                    </div>

                    <div className="company-terms-content">
                        회사는 관련 법령에서 정한 기간 또는
                        개인정보 수집 및 이용 목적이 달성될 때까지
                        개인정보를 보관합니다.
                    </div>


                    <div className="company-terms-title">
                        4. 개인정보의 보호
                    </div>

                    <div className="company-terms-content">
                        회사는 회원의 개인정보를 안전하게 보호하기
                        위해 필요한 보안 조치를 시행합니다.
                    </div>

                </div>

            </div>

            <div className="company-footer">

                <div className="company-footer-name">
                    {company.name}
                </div>

                <div className="company-footer-info">
                    대표자: {company.ceo}
                </div>

                <div className="company-footer-info">
                    사업자등록번호: {company.businessNumber}
                </div>

                <div className="company-footer-info">
                    주소: {company.address}
                </div>

                <div className="company-footer-info">
                    전화: {company.phone}
                </div>

                <div className="company-footer-info">
                    이메일: {company.email}
                </div>

            </div>

        </div>
    );
}

export default CompanyInfo;
