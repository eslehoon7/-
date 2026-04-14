/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Phone, CheckCircle2, ArrowRight, ShieldCheck, Clock, Trash2, HardHat, Wrench, Home, Building2, RefreshCw, Truck, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import logoImg from "./assets/logo.png";

export default function MainPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  
  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    address: '',
    scale: '',
    scope: '',
    special: '',
    waste: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPortfolios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone || !quoteForm.address) {
      alert("이름, 연락처, 현장주소는 필수 입력 항목입니다.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const detailsText = `주소: ${quoteForm.address}\n규모: ${quoteForm.scale}\n범위: ${quoteForm.scope}\n특별규정: ${quoteForm.special}\n폐기물: ${quoteForm.waste}\n기타: ${quoteForm.details}`;
      
      await addDoc(collection(db, 'quotes'), {
        name: quoteForm.name,
        phone: quoteForm.phone,
        service: "온라인 견적 문의",
        details: detailsText,
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      alert("견적 문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.");
      setQuoteForm({
        name: '', phone: '', address: '', scale: '', scope: '', special: '', waste: '', details: ''
      });
    } catch (error) {
      console.error("Error submitting quote:", error);
      alert("접수 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-200">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/70 backdrop-blur-md border-b border-slate-100' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <img src="https://drive.google.com/uc?export=view&id=1zZwAUL76C3kZTUIO8LevVj8mtmWGBpas" alt="꼬마철거 로고" className="h-12 w-auto object-contain" referrerPolicy="no-referrer" />
          </a>
          <div className={`hidden md:flex items-center gap-8 text-base font-medium transition-colors duration-300 ${isScrolled ? 'text-slate-600' : 'text-white/90'}`}>
            <div className="relative group">
              <a href="#services" className="hover:text-orange-500 transition-colors py-6">서비스</a>
              <div className="absolute top-[calc(100%+5px)] left-1/2 -translate-x-1/2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
                <a href="#services" className="px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">인테리어 철거</a>
                <a href="#services" className="px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">아파트/주택 철거</a>
                <a href="#services" className="px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">상가/폐업 철거</a>
                <a href="#services" className="px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">원상복구 철거</a>
                <a href="#services" className="px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">폐기물 처리</a>
              </div>
            </div>
            <a href="#features" className="hover:text-orange-500 transition-colors">특징</a>
            <a href="#contact" className="hover:text-orange-500 transition-colors">연락하기</a>
          </div>
          <a href="#quote" className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${isScrolled ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">온라인견적문의</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-48 px-6 bg-slate-900 flex items-center min-h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1572295727871-7638149ea3d7?q=80&w=2070&auto=format&fit=crop" 
            alt="철거 현장" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="max-w-2xl space-y-6">
            <p className="text-orange-500 font-medium text-xl italic tracking-tight">
              새로운 시작을 위한 가장 깨끗한 비움
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              보이지 않는 곳까지 완벽하게<br />
              꼬마철거입니다.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              평택 및 경기 전 지역 상가, 아파트, 폐업 철거부터 까다로운 폐기물 처리까지!<br />
              내 공간을 다루는 마음으로 가장 신속하고 깔끔한 원스톱 철거 서비스를 제공합니다.
            </p>
            <div className="pt-4">
              <a href="tel:010-5722-2980" className="inline-flex items-center gap-3 bg-[#1e293b] text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-slate-800 transition-colors border border-slate-700">
                <Phone className="w-6 h-6" />
                <span>상담문의</span>
                <span className="text-orange-500">010-5722-2980</span>
              </a>
            </div>
          </div>
        </div>

        {/* Overlapping Cards (Desktop) */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-20 px-6 hidden lg:block">
          <div className="max-w-6xl mx-auto grid grid-cols-5 gap-4">
            {[
              { title: "인테리어 철거", icon: <Wrench className="w-8 h-8 text-[#1e293b]" /> },
              { title: "아파트·주택 철거", icon: <Home className="w-8 h-8 text-[#1e293b]" /> },
              { title: "상가·폐업 철거", icon: <Building2 className="w-8 h-8 text-[#1e293b]" /> },
              { title: "원상복구 철거", icon: <RefreshCw className="w-8 h-8 text-[#1e293b]" /> },
              { title: "폐기물 처리", icon: <Truck className="w-8 h-8 text-[#1e293b]" /> }
            ].map((card, i) => (
              <div key={i} onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-6 text-center group hover:-translate-y-1 transition-transform cursor-pointer border border-slate-100">
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-orange-500 flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
                  {card.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 whitespace-nowrap">{card.title}</h3>
                <p className="text-xs text-slate-400 group-hover:text-orange-500 transition-colors">바로가기 +</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Cards */}
      <div className="lg:hidden bg-slate-50 px-6 pt-12 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { title: "인테리어 철거", icon: <Wrench className="w-6 h-6 text-[#1e293b]" /> },
            { title: "아파트·주택 철거", icon: <Home className="w-6 h-6 text-[#1e293b]" /> },
            { title: "상가·폐업 철거", icon: <Building2 className="w-6 h-6 text-[#1e293b]" /> },
            { title: "원상복구 철거", icon: <RefreshCw className="w-6 h-6 text-[#1e293b]" /> },
            { title: "폐기물 처리", icon: <Truck className="w-6 h-6 text-[#1e293b]" /> }
          ].map((card, i) => (
            <div key={i} onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white rounded-xl shadow-sm p-4 text-center border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-orange-500 flex items-center justify-center mb-3">
                {card.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{card.title}</h3>
              <p className="text-[10px] text-slate-400">바로가기 +</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="pt-12 lg:pt-40 pb-24 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">왜 꼬마철거를 선택해야 할까요?</h2>
            <p className="text-slate-600 text-lg">젊은 감각과 철저한 책임감으로 기존 철거 업체의 편견을 깹니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-orange-500" />,
                title: "젊고 책임감 있는 시공",
                desc: "소통이 원활하고 책임감 강한 젊은 팀원들이 내 가게를 정리한다는 마음으로 꼼꼼하게 작업합니다."
              },
              {
                icon: <Trash2 className="w-8 h-8 text-orange-500" />,
                title: "폐기물 처리까지 완벽하게",
                desc: "철거 후 발생하는 엄청난 양의 폐기물, 분리수거부터 반출까지 골치 아픈 과정을 모두 알아서 해결해 드립니다."
              },
              {
                icon: <Clock className="w-8 h-8 text-orange-500" />,
                title: "신속하고 정확한 일정 준수",
                desc: "다음 공정이나 일정에 차질이 없도록 약속된 기한 내에 완벽하게 작업을 마무리합니다."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">어떤 작업이든 맡겨주세요</h2>
              <p className="text-slate-600 text-lg">상가부터 주거공간까지, 꼬마철거의 생생한 최신 작업 현장을 확인하세요.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolios.length > 0 ? portfolios.map((portfolio) => (
              <div key={portfolio.id} className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute top-4 left-4 z-20 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    {portfolio.serviceType}
                  </div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={portfolio.imageUrl} 
                    alt={portfolio.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-1">{portfolio.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">{portfolio.description}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                등록된 시공사례가 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-8 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
            <HardHat className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            철거 폐기물 처리 고민 끝!
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            합리적인 견적과 깔끔한 마무리로 보답하겠습니다.<br />
            지금 바로 무료 방문 견적을 신청하세요.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:010-5722-2980" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-400 transition-colors">
              <Phone className="w-6 h-6" />
              010-5722-2980
            </a>
          </div>
        </div>
      </section>

      {/* Quote Request Form Section */}
      <section id="quote" className="py-24 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">온라인 견적 문의</h2>
            <p className="text-slate-600 text-lg">상세히 적어주실수록 더욱 정확한 가견적 안내가 가능합니다.</p>
          </div>
          
          <form onSubmit={handleQuoteSubmit} className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">신청인 이름 <span className="text-orange-500">*</span></label>
                <input type="text" required value={quoteForm.name} onChange={e => setQuoteForm({...quoteForm, name: e.target.value})} placeholder="홍길동" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">신청인 연락처 <span className="text-orange-500">*</span></label>
                <input type="tel" required value={quoteForm.phone} onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})} placeholder="010-0000-0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">철거현장주소 <span className="text-orange-500">*</span></label>
              <input type="text" required value={quoteForm.address} onChange={e => setQuoteForm({...quoteForm, address: e.target.value})} placeholder="상세 주소를 입력해주세요" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">철거현장규모</label>
                <input type="text" value={quoteForm.scale} onChange={e => setQuoteForm({...quoteForm, scale: e.target.value})} placeholder="예: 30평, 100헤베 등" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">철거요구범위</label>
                <input type="text" value={quoteForm.scope} onChange={e => setQuoteForm({...quoteForm, scope: e.target.value})} placeholder="예: 내부 전체 철거, 바닥 제외 등" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">별도 특별규정</label>
                <input type="text" value={quoteForm.special} onChange={e => setQuoteForm({...quoteForm, special: e.target.value})} placeholder="예: 야간작업만 가능, 소음제한 등" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">폐기물별도처리부분</label>
                <input type="text" value={quoteForm.waste} onChange={e => setQuoteForm({...quoteForm, waste: e.target.value})} placeholder="예: 대형 냉장고 2대 별도 처리 등" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">기타문의사항</label>
              <textarea rows={4} value={quoteForm.details} onChange={e => setQuoteForm({...quoteForm, details: e.target.value})} placeholder="기타 궁금하신 사항이나 추가 요청사항을 적어주세요." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white resize-none"></textarea>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50">
                {isSubmitting ? '접수 중...' : '무료 견적 신청하기'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-4">
              <a href="#" className="flex items-center gap-2 inline-block">
                <img src="https://drive.google.com/uc?export=view&id=1zZwAUL76C3kZTUIO8LevVj8mtmWGBpas" alt="꼬마철거 로고" className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
              </a>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                새로운 시작을 위한 가장 완벽한 비움.<br />
                보이지 않는 곳까지 책임지는 꼬마철거가 함께합니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-4">서비스</h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#services" className="hover:text-orange-500 transition-colors">인테리어 철거</a></li>
                <li><a href="#services" className="hover:text-orange-500 transition-colors">아파트/주택 철거</a></li>
                <li><a href="#services" className="hover:text-orange-500 transition-colors">상가/폐업 철거</a></li>
                <li><a href="#services" className="hover:text-orange-500 transition-colors">원상복구 철거</a></li>
                <li><a href="#services" className="hover:text-orange-500 transition-colors">폐기물 처리</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4">빠른 링크</h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-orange-500 transition-colors">특징</a></li>
                <li><a href="#contact" className="hover:text-orange-500 transition-colors">연락하기</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} 꼬마철거. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/admin" className="text-slate-500 hover:text-slate-900 transition-colors">관리자페이지</Link>
              <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">이용약관</a>
              <a href="#" className="text-slate-900 font-medium hover:text-orange-500 transition-colors">개인정보처리방침 (개인정보이용동의)</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
