import React, { useState, useEffect, useCallback } from 'react';
import '../style/payhistory.css';
import jaxios from '../util/JWTUtil';
import { useSelector } from 'react-redux';

function PayHistory() {
    const loginUser = useSelector((state) => state.user);

    const [payList, setPayList] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // 날짜 포맷
    // ==========================================
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('ko-KR');
    };

    // ==========================================
    // 결제 내역 조회
    // ==========================================
    const fetchPayHistory = useCallback(async () => {
        if (!loginUser?.num) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const response = await jaxios.get(`/api/charge/getPayment?mnum=${loginUser.num}`);
            setPayList(response.data.paymentList || []);
        } catch (error) {
            console.error('결제 내역 조회 실패:', error);
            setPayList([]);
        } finally {
            setLoading(false);
        }
    }, [loginUser?.num]);

    useEffect(() => {
        fetchPayHistory();
    }, [fetchPayHistory]);

    // ==========================================
    // 렌더링
    // ==========================================
    return (
        <div className="payhistory-container">

            {/* 헤더 */}
            <div className="payhistory-header">
                <h2>결제 내역</h2>
            </div>

            {/* 리스트 */}
            <div className="payhistory-list">
                {loading ? (
                    <div className="payhistory-empty">불러오는 중...</div>
                ) : payList.length > 0 ? (
                    payList.map((item) => (
                        <div key={item.num} className="payhistory-card">

                            <div className="payhistory-card-top">
                                <span className="payhistory-plan">{item.productName}</span>
                                {item.price != null && (
                                    <span className="payhistory-price">
                                        {Number(item.price).toLocaleString()}원
                                    </span>
                                )}
                            </div>

                            <div className="payhistory-card-body">
                                <div className="payhistory-row">
                                    <span>결제일</span>
                                    <strong>{formatDate(item.indate)}</strong>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="payhistory-empty">결제 내역이 없습니다.</div>
                )}
            </div>

        </div>
    );
}

export default PayHistory;