/**
 * OMST Personality Analyzer v1.0
 * 8괘 기질 데이터를 기반으로 MBTI 및 애니어그램(날개)을 추정하는 엔진
 */

window.OMST_Analyzer = {
    // 1. MBTI 추정 로직
    estimateMBTI: function(outer, inner) {
        // 가중치 계산
        const scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
        const combined = {};
        const keys = ["건", "태", "리", "진", "손", "감", "간", "곤"];
        
        keys.forEach(k => {
            combined[k] = (outer[k] || 0) + (inner[k] || 0);
        });

        // E/I 축: 외향(건, 진, 태) vs 내향(곤, 간, 감)
        scores.E = (combined["건"] * 1.2) + (combined["진"] * 1.0) + (combined["태"] * 1.0);
        scores.I = (combined["곤"] * 1.2) + (combined["간"] * 1.0) + (combined["감"] * 0.8);

        // S/N 축: 감각(곤, 간, 태) vs 직관(리, 손, 감)
        scores.S = (combined["곤"] * 1.0) + (combined["간"] * 1.2) + (combined["태"] * 0.5);
        scores.N = (combined["리"] * 0.8) + (combined["손"] * 1.2) + (combined["감"] * 1.0);

        // T/F 축: 사고(건, 리) vs 감정(태, 감, 곤)
        scores.T = (combined["건"] * 1.2) + (combined["리"] * 1.5);
        scores.F = (combined["태"] * 1.2) + (combined["감"] * 1.0) + (combined["곤"] * 0.8);

        // J/P 축: 판단(건, 간, 리) vs 인식(진, 손, 태)
        scores.J = (combined["건"] * 1.0) + (combined["간"] * 1.5) + (combined["리"] * 0.8);
        scores.P = (combined["진"] * 1.5) + (combined["손"] * 1.0) + (combined["태"] * 0.5);

        const type = (scores.E >= scores.I ? "E" : "I") +
                     (scores.S >= scores.N ? "S" : "N") +
                     (scores.T >= scores.F ? "T" : "F") +
                     (scores.J >= scores.P ? "J" : "P");
        
        return { type: type, scores: scores };
    },

    // 2. 애니어그램 추정 로직 (날개 포함)
    estimateEnneagram: function(outer, inner) {
        const combined = {};
        const keys = ["건", "태", "리", "진", "손", "감", "간", "곤"];
        keys.forEach(k => combined[k] = (outer[k] || 0) + (inner[k] || 0));

        // 괘별 애니어그램 후보 매칭
        const mappings = [
            { type: 1, key: "건", label: "개혁가" },
            { type: 2, key: "곤", label: "조력가" },
            { type: 3, key: "리", label: "성취자" },
            { type: 4, key: "감", label: "개인주의자" },
            { type: 5, key: "간", label: "탐구자" },
            {     type: 6, key: "손", label: "충실가" },
            { type: 7, key: "태", label: "열정가" },
            { type: 8, key: "진", label: "도전가" },
            { type: 9, key: "곤", label: "평화주의자" } // 곤은 2번과 9번 복합
        ];

        // 점수 기반 정렬
        const sorted = mappings.map(m => ({
            type: m.type,
            score: combined[m.key] || 0,
            label: m.label
        })).sort((a, b) => b.score - a.score);

        const main = sorted[0];
        // 날개 찾기: 주유형과 인접한 번호(예: 8번이면 7w8 또는 8w9) 중 점수가 높은 것
        const wings = [
            main.type === 1 ? 9 : main.type - 1,
            main.type === 9 ? 1 : main.type + 1
        ];
        const wingCandidates = sorted.filter(s => wings.includes(s.type));
        const wingType = wingCandidates.length > 0 ? wingCandidates[0].type : (main.type === 9 ? 8 : main.type + 1);

        return { main: main.type, wing: wingType, label: main.label };
    },

    // 3. 데이터베이스: 설명 문구
    descriptions: {
        mbti: {
            "ESTJ": "체계적이고 효율적인 관리자. 건(乾)의 주도성과 리(離)의 논리성이 결합되어 리더십이 매우 강합니다.",
            "ENTJ": "대담한 전략가. 건(乾)의 권위와 진(震)의 돌격력이 만나 혁신적인 결과를 만들어냅니다.",
            "ESFJ": "따뜻하고 사교적인 조력자. 태(兌)의 소통능력과 곤(坤)의 헌신이 조화를 이룹니다.",
            "ENFJ": "카리스마 넘치는 이타주의자. 태(兌)의 밝은 에너지와 건(乾)의 책임감이 결합되었습니다.",
            "ESTP": "활동적이고 감각적인 도전자. 진(震)의 기동성과 리(離)의 현실 감각이 뛰어납니다.",
            "ENTP": "지적인 호기심이 넘치는 발명가. 리(離)의 지력과 손(巽)의 지략이 합쳐져 창의적입니다.",
            "ESFP": "에너지가 넘치는 연예인. 태(兌)의 기쁨과 진(震)의 역동성이 삶을 즐겁게 만듭니다.",
            "ENFP": "열정적인 협력가. 태(兌)의 공감과 손(巽)의 유연함이 다양한 가능성을 엽니다.",
            "ISTJ": "청렴결백하고 신중한 현실주의자. 간(艮)의 안정감과 건(乾)의 원칙이 확고합니다.",
            "INTJ": "독립적인 전략가. 간(艮)의 인내와 리(離)의 통찰력이 깊은 내면의 세계를 구축합니다.",
            "ISFJ": "수호자형 조력자. 곤(坤)의 포용력과 간(艮)의 꾸준함이 주변을 평안하게 합니다.",
            "INFJ": "통찰력 있는 이상주의자. 감(坎)의 깊이와 손(巽)의 수양이 만나 고결한 정신을 보여줍니다.",
            "ISTP": "만능 재주꾼. 간(艮)의 정적 능력과 리(離)의 분석력이 도구 활용에 능하게 합니다.",
            "INTP": "논리적인 사색가. 리(離)의 지적 집요함과 감(坎)의 고독한 사색이 결합되었습니다.",
            "ISFP": "예술가적 영혼. 감(坎)의 감성과 손(巽)의 부드러움이 조용한 매력을 발산합니다.",
            "INFP": "잔다르크형 이상주의자. 감(坎)의 깊은 공감과 손(巽)의 지적 탐구가 조화를 이룹니다."
        },
        enneagram: {
            1: "완벽을 추구하는 리더. 매사에 엄격한 기준을 지키는 당신은 주역의 건(乾) 기질과 닮아 있습니다.",
            2: "사랑을 나누는 헌신가. 타인을 돌보는 기쁨을 아는 당신은 대지 같은 곤(坤)의 성질을 품고 있습니다.",
            3: "목표를 향해 뛰는 성취자. 화려한 결과와 인정을 중시하는 당신은 불꽃 같은 리(離)의 속성을 지닙니다.",
            4: "감수성이 풍부한 예술가. 고유한 자아를 탐구하는 당신은 깊은 물인 감(坎)의 심연을 가지고 있습니다.",
            5: "세상을 관찰하는 지식인. 조용히 지혜를 쌓는 당신은 흔들리지 않는 산, 간(艮)의 기질을 나타냅니다.",
            6: "안전을 지키는 충실가. 신중하게 미래를 대비하는 당신은 부드러운 바람 손(巽)의 지략을 닮았습니다.",
            7: "즐거움을 찾는 열정가. 새로운 경험을 갈구하는 당신은 기쁨의 못인 태(兌)의 에너지를 발산합니다.",
            8: "판을 주도하는 도전자. 거침없이 돌파하는 당신은 천둥 같은 진(震)의 역동성을 상징합니다.",
            9: "평화를 만드는 중재자. 모든 것을 수용하고 인내하는 당신은 조화로운 곤(坤)과 간(艮)의 미덕을 지녔습니다."
        }
    },

    // 4. 리포트 렌더링 함수
    renderSection: function(outer, inner) {
        const mbti = this.estimateMBTI(outer, inner);
        const enne = this.estimateEnneagram(outer, inner);
        const mbtiDesc = this.descriptions.mbti[mbti.type] || "다각도로 분석 중인 유형입니다.";
        const enneDesc = this.descriptions.enneagram[enne.main] || "깊이 있는 기질 탐구 중입니다.";

        return `
            <div id="personality-analysis-section" style="margin-bottom: 50px; font-family: var(--font-main);">
                <div style="background: rgba(0,45,98,0.04); border: 1px solid rgba(0,45,98,0.1); border-radius: 30px; padding: 40px 30px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.03);">
                    <div style="font-size: 0.8rem; color: #002D62; letter-spacing: 5px; font-weight: 800; margin-bottom: 12px; opacity: 0.7;">TOTAL RESONANCE ANALYSIS</div>
                    <h3 style="font-size: 1.7rem; color: #1a1a1a; margin-bottom: 30px; font-family: 'Noto Serif KR', serif; font-weight: 800;">심층 성격 상관분석</h3>
                    
                    <p style="font-size: 1.05rem; color: #555; line-height: 1.9; margin-bottom: 40px; word-break: keep-all; padding: 0 10px;">
                        "OMST는 단편적인 심리 지표를 넘어, 8가지 우주적 에너지가 당신의 내면과 외면에서 어떻게 상호작용하는지를 <strong>입체적으로 분석</strong>합니다. <br>
                        기존의 정형화된 유형론을 우리 고유의 기질 데이터로 재해석한 당신의 현대적 자아상입니다."
                    </p>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; direction: ltr;">
                        <!-- MBTI 분석 카드 -->
                        <div style="background: #fff; padding: 30px 20px; border-radius: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.02); border-bottom: 4px solid #002D62;">
                            <div style="font-size: 0.75rem; color: #999; margin-bottom: 10px; font-weight: 700;">추정 성격 유형 (MBTI)</div>
                            <div style="font-size: 2.2rem; font-weight: 900; color: #002D62; margin-bottom: 15px; letter-spacing: -1px;">${mbti.type}</div>
                            <p style="font-size: 0.95rem; line-height: 1.7; color: #333; word-break: keep-all;">${mbtiDesc}</p>
                        </div>
                        
                        <!-- 애니어그램 분석 카드 -->
                        <div style="background: #fff; padding: 30px 20px; border-radius: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.02); border-bottom: 4px solid #D4AF37;">
                            <div style="font-size: 0.75rem; color: #999; margin-bottom: 10px; font-weight: 700;">핵심 기질 지표 (Enneagram)</div>
                            <div style="font-size: 2.2rem; font-weight: 900; color: #D4AF37; margin-bottom: 15px; letter-spacing: -1px;">Type ${enne.main}w${enne.wing}</div>
                            <p style="font-size: 0.95rem; line-height: 1.7; color: #333; word-break: keep-all;"><strong>[${enne.label}]</strong> <br> ${enneDesc}</p>
                        </div>
                    </div>

                    <div style="margin-top: 35px; font-size: 0.85rem; color: #aaa; font-style: italic;">
                        * 본 분석은 OMST 주역 기질 데이터를 기반으로 추정한 상관지표입니다.
                    </div>
                </div>
            </div>
        `;
    }
};
