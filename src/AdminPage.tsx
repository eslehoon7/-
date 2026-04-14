import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { LogOut, Trash2, Plus, Image as ImageIcon, FileText, Phone, Calendar, CheckCircle, Home } from 'lucide-react';
import logoImg from "./assets/logo.png";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quotes' | 'portfolios'>('quotes');
  
  const [quotes, setQuotes] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  // Portfolio Form
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    imageUrl: '',
    serviceType: '인테리어 철거'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch Quotes
    const qQuotes = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching quotes:", error);
    });

    // Fetch Portfolios
    const qPortfolios = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
    const unsubPortfolios = onSnapshot(qPortfolios, (snapshot) => {
      setPortfolios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching portfolios:", error);
    });

    return () => {
      unsubQuotes();
      unsubPortfolios();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'portfolios'), {
        ...newPortfolio,
        createdAt: serverTimestamp()
      });
      setNewPortfolio({ title: '', description: '', imageUrl: '', serviceType: '인테리어 철거' });
      alert("시공사례가 추가되었습니다.");
    } catch (error) {
      console.error("Error adding portfolio:", error);
      alert("추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, 'portfolios', id));
      } catch (error) {
        console.error("Error deleting portfolio:", error);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩중...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <img src="/logo.png" alt="로고" className="h-12 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">관리자 로그인</h1>
          <p className="text-slate-500 mb-8">관리자 권한이 있는 계정으로 로그인해주세요.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Google 계정으로 로그인
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full mt-4 text-slate-500 hover:text-slate-900 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <img src="https://drive.google.com/uc?export=view&id=1zZwAUL76C3kZTUIO8LevVj8mtmWGBpas" alt="로고" className="h-10 object-contain mb-4" referrerPolicy="no-referrer" />
          <p className="text-sm text-slate-400">관리자 대시보드</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('quotes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'quotes' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <FileText className="w-5 h-5" />
            견적문의 관리
          </button>
          <button 
            onClick={() => setActiveTab('portfolios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'portfolios' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <ImageIcon className="w-5 h-5" />
            시공사례 관리
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            홈페이지로 가기
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'quotes' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">온라인 견적문의 내역</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-slate-100 bg-slate-50 font-medium text-slate-700">
                  문의 목록 ({quotes.length})
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {quotes.map(quote => (
                    <button
                      key={quote.id}
                      onClick={() => setSelectedQuote(quote)}
                      className={`w-full text-left p-4 rounded-xl transition-colors ${selectedQuote?.id === quote.id ? 'bg-orange-50 border border-orange-200' : 'hover:bg-slate-50 border border-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900">{quote.name}</span>
                        <span className="text-xs text-slate-400">
                          {quote.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{quote.service}</p>
                    </button>
                  ))}
                  {quotes.length === 0 && (
                    <div className="text-center p-8 text-slate-400 text-sm">문의 내역이 없습니다.</div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[600px] overflow-y-auto">
                {selectedQuote ? (
                  <div className="space-y-8">
                    <div className="border-b border-slate-100 pb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">고객 정보</h3>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">이름</p>
                            <p className="font-medium text-slate-900">{selectedQuote.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">연락처</p>
                            <p className="font-medium text-slate-900">{selectedQuote.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">필요 서비스</p>
                            <p className="font-medium text-slate-900">{selectedQuote.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">접수일</p>
                            <p className="font-medium text-slate-900">{selectedQuote.createdAt?.toDate().toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">상세 내용</h3>
                      <div className="bg-slate-50 p-6 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                        {selectedQuote.details || "상세 내용이 없습니다."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p>왼쪽 목록에서 문의를 선택해주세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolios' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">시공사례 관리</h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                새 시공사례 등록
              </h3>
              <form onSubmit={handleAddPortfolio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
                    <input 
                      type="text" 
                      required
                      value={newPortfolio.title}
                      onChange={e => setNewPortfolio({...newPortfolio, title: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="예: 평택 OO상가 원상복구 철거"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">서비스 종류</label>
                    <select 
                      value={newPortfolio.serviceType}
                      onChange={e => setNewPortfolio({...newPortfolio, serviceType: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option>인테리어 철거</option>
                      <option>아파트/주택 철거</option>
                      <option>상가/폐업 철거</option>
                      <option>원상복구 철거</option>
                      <option>폐기물 처리</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">이미지 URL</label>
                    <input 
                      type="url" 
                      required
                      value={newPortfolio.imageUrl}
                      onChange={e => setNewPortfolio({...newPortfolio, imageUrl: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-4 flex flex-col">
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 mb-1">상세 설명</label>
                    <textarea 
                      required
                      value={newPortfolio.description}
                      onChange={e => setNewPortfolio({...newPortfolio, description: e.target.value})}
                      className="w-full flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      placeholder="시공 과정 및 결과에 대한 설명을 입력하세요."
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                    등록하기
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                  <div className="h-48 bg-slate-100 relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="absolute top-3 right-3 bg-white/90 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <span className="inline-block px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full mb-3">
                      {item.serviceType}
                    </span>
                    <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
