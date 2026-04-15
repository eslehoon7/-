import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LogOut, Trash2, Plus, Image as ImageIcon, FileText, Phone, Calendar, CheckCircle, Home, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quotes' | 'portfolios' | 'mainImage'>('quotes');
  
  const [quotes, setQuotes] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  
  // Main Image State
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [newMainImageFile, setNewMainImageFile] = useState<File | null>(null);
  const [isMainImageUploading, setIsMainImageUploading] = useState(false);

  // Portfolio Form
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    serviceType: '인테리어 철거'
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

    // Fetch Main Image
    const unsubMainImage = onSnapshot(doc(db, 'siteConfig', 'mainImage'), (docSnap) => {
      if (docSnap.exists()) {
        setMainImageUrl(docSnap.data().url);
      }
    }, (error) => {
      console.error("Error fetching main image:", error);
    });

    return () => {
      unsubQuotes();
      unsubPortfolios();
      unsubMainImage();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-blocked') {
        alert("팝업이 차단되었습니다. 브라우저의 팝업 차단을 해제하거나, 우측 상단의 '새 탭에서 열기' 버튼을 눌러 새 창에서 시도해주세요.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("승인되지 않은 도메인입니다. Firebase 콘솔에서 이 도메인을 승인된 도메인에 추가해주세요.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        alert("로그인 창이 닫혔습니다. 다시 시도해주세요.");
      } else {
        alert(`로그인에 실패했습니다. (${error.message || error.code || '알 수 없는 오류'})`);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 10) {
        alert("이미지는 최대 10장까지만 업로드 가능합니다.");
        setImageFiles(filesArray.slice(0, 10));
      } else {
        setImageFiles(filesArray);
      }
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewMainImageFile(e.target.files[0]);
    }
  };

  const handleUpdateMainImage = async () => {
    if (!newMainImageFile) {
      alert("변경할 이미지를 선택해주세요.");
      return;
    }

    if (newMainImageFile.size > 5 * 1024 * 1024) {
      alert("파일 크기가 너무 큽니다. (최대 5MB)");
      return;
    }

    setIsMainImageUploading(true);
    try {
      const fileRef = ref(storage, `siteConfig/mainImage_${Date.now()}_${newMainImageFile.name}`);
      
      await Promise.race([
        uploadBytes(fileRef, newMainImageFile),
        new Promise((_, reject) => setTimeout(() => reject(new Error('업로드 시간 초과')), 15000))
      ]);
      
      const url = await getDownloadURL(fileRef);
      
      // Update Firestore document
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'siteConfig', 'mainImage'), { url, updatedAt: serverTimestamp() });

      setNewMainImageFile(null);
      alert("메인 이미지가 성공적으로 변경되었습니다.");
    } catch (error: any) {
      console.error("Error updating main image:", error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setIsMainImageUploading(false);
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      alert("최소 1장의 이미지를 선택해주세요.");
      return;
    }

    // 파일 용량 체크 (장당 5MB 제한)
    for (const file of imageFiles) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`파일 크기가 너무 큽니다: ${file.name}\n(사진 1장당 최대 5MB까지 업로드 가능합니다)`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const imageUrls: string[] = [];
      
      for (const file of imageFiles) {
        const fileRef = ref(storage, `portfolios/${Date.now()}_${file.name}`);
        
        // 15초 타임아웃 설정 (무한 로딩 방지)
        await Promise.race([
          uploadBytes(fileRef, file),
          new Promise((_, reject) => setTimeout(() => reject(new Error('업로드 시간 초과')), 15000))
        ]);
        
        const url = await getDownloadURL(fileRef);
        imageUrls.push(url);
      }

      await addDoc(collection(db, 'portfolios'), {
        ...newPortfolio,
        imageUrls,
        createdAt: serverTimestamp()
      });
      
      setNewPortfolio({ title: '', description: '', serviceType: '인테리어 철거' });
      setImageFiles([]);
      alert("시공사례가 추가되었습니다.");
    } catch (error: any) {
      console.error("Error adding portfolio:", error);
      alert(`업로드 실패: ${error.message}\n\n[해결방법]\n1. Firebase Storage(저장소)가 '시작하기'로 활성화되었는지 확인해주세요.\n2. 사진 용량이 너무 크거나 인터넷 연결이 불안정할 수 있습니다.`);
    } finally {
      setIsUploading(false);
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
          <img src="https://i.postimg.cc/4ddy9L3L/kkomacheolgeo-logo.png" alt="로고" className="h-12 mx-auto mb-6" />
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
          <img src="https://i.postimg.cc/4ddy9L3L/kkomacheolgeo-logo.png" alt="로고" className="h-10 object-contain mb-4" />
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
          <button 
            onClick={() => setActiveTab('mainImage')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'mainImage' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <ImageIcon className="w-5 h-5" />
            메인화면 관리
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">메인이미지 및 추가 사진 업로드 (첫 번째 사진이 메인)</label>
                    <input 
                      type="file" 
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                    />
                    {imageFiles.length > 0 && (
                      <p className="text-sm text-slate-500 mt-2">선택된 파일: {imageFiles.length}장</p>
                    )}
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
                  <button type="submit" disabled={isUploading} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> 업로드 중...</> : '등록하기'}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                  <div className="h-48 bg-slate-100 relative">
                    <img src={item.imageUrls?.[0] || item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    {item.imageUrls && item.imageUrls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                        +{item.imageUrls.length - 1}
                      </div>
                    )}
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

        {activeTab === 'mainImage' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">메인화면 관리</h2>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">홈페이지 대표 이미지 변경</h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">현재 적용된 이미지</p>
                  <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    {mainImageUrl ? (
                      <img src={mainImageUrl} alt="현재 메인 이미지" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        기본 이미지가 적용되어 있습니다.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-2">새로운 이미지 업로드</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                  />
                  <p className="text-xs text-slate-500 mt-2">권장 해상도: 1920x1080 픽셀 이상 (가로형 이미지)</p>
                </div>

                <button 
                  onClick={handleUpdateMainImage}
                  disabled={isMainImageUploading || !newMainImageFile}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isMainImageUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> 업로드 중...</> : '메인 이미지 변경하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
