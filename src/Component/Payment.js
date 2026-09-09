import React, { useState } from 'react';
import '../style/payment.css';
import { useNavigate } from 'react-router-dom';

// ==========================================
// 구독 플랜 데이터
// ==========================================
const PLANS = [
    { id: 'monthly', orderName: '월 정기구독', period: '30일', price: 1000 },
    { id: 'halfYear', orderName: '6개월 구독', period: '180일', price: 5500 },
    { id: 'yearly', orderName: '년 정기구독', period: '365일', price: 10000 },
];

function Payment() {
    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] = useState('monthly');

    // ==========================================
    // 결제하기 클릭
    // ==========================================
    const handlePayment = () => {
        const plan = PLANS.find((p) => p.id === selectedPlan);

        if (!plan) return;

        // Paypop.js 가 팝업창에 나올 페이지고 그 url 은 /paypop
        const url = `/paypop/${encodeURIComponent(plan.orderName)}/${plan.price}`;
        window.open(url, "결제창", "width=480,height=720");
    };

    const currentPlan = PLANS.find((p) => p.id === selectedPlan);

    // ==========================================
    // 렌더링
    // ==========================================
    return (
        <div className="payment-container">

            {/* 헤더 */}
            <div className="payment-header">
                <h2>구독 플랜 선택</h2>
                <p>원하는 구독 기간을 선택해주세요.</p>
            </div>

            {/* 플랜 리스트 */}
            <div className="plan-list">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`plan-card ${selectedPlan === plan.id ? 'plan-card-active' : ''}`}
                        onClick={() => setSelectedPlan(plan.id)}
                    >
                        <div className="plan-card-radio">
                            <div className="radio-circle">
                                {selectedPlan === plan.id && <div className="radio-dot" />}
                            </div>
                        </div>

                        <div className="plan-card-info">
                            <div className="plan-card-orderName">{plan.orderName}</div>
                            <div className="plan-card-period">{plan.period}</div>
                        </div>

                        <div className="plan-card-price">
                            {plan.price.toLocaleString()}원
                        </div>
                    </div>
                ))}
            </div>

            {/* 결제 요약 */}
            <div className="payment-summary">
                <span>결제 금액</span>
                <strong>{currentPlan ? currentPlan.price.toLocaleString() : 0}원</strong>
            </div>

            {/* 결제하기 버튼 */}
            <button type="button" className="payment-submit-btn" onClick={handlePayment}>
                결제하기
            </button>

        </div>
    );
}

export default Payment;
