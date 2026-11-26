import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const movies = {
  action: { genre: '액션', title: '매드 맥스: 분노의 도로', english: 'MAD MAX: FURY ROAD', description: '황폐한 사막을 가로질러 자유를 향해 달리는 사람들의 이야기. 숨 돌릴 틈 없는 추격전을 보고 싶을 때 추천해요.' },
  romance: { genre: '로맨스', title: '라라랜드', english: 'LA LA LAND', description: '재즈 피아니스트와 배우 지망생이 로스앤젤레스에서 만나 꿈과 사랑을 잇는다. 음악이 흐르는 로맨스를 보고 싶을 때 추천해요.' },
  animation: { genre: '애니메이션', title: '센과 치히로의 행방불명', english: 'SPIRITED AWAY', description: '낯선 세계에 들어선 치히로가 부모님을 구하기 위해 온천에서 일한다. 신비로운 모험을 보고 싶을 때 추천해요.' },
};

function readRoute() {
  const [path, genre] = location.hash.slice(1).split('/').filter(Boolean);
  return { recommendation: path === 'recommend', genre: Object.hasOwn(movies, genre) ? genre : 'action' };
}

function readSaved(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (error) { return fallback; }
}

function useSavedState(key, fallback) {
  const [value, setValue] = useState(() => readSaved(key, fallback));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { /* Continue with session state if storage is unavailable. */ }
  }, [key, value]);
  return [value, setValue];
}

function Header({ recommendation, dark, onToggleTheme }) {
  return <header className="top"><div className="wrap bar">
    <a className="brand" href="#/">나만의 영화 추천</a>
    <nav aria-label="주 메뉴">
      <a href="#/" aria-current={!recommendation ? 'page' : undefined}>홈</a>
      <a href="#/recommend/action" aria-current={recommendation ? 'page' : undefined}>영화 추천</a>
    </nav>
    <button className="theme" type="button" aria-pressed={dark} onClick={onToggleTheme}>다크모드 {dark ? '켜짐' : '꺼짐'}</button>
  </div></header>;
}

function GenreLinks({ selected }) {
  return <nav className="genres" aria-label="영화 장르">
    {Object.entries(movies).map(([id, movie]) =>
      <a key={id} href={'#/recommend/' + id} aria-current={selected === id ? 'page' : undefined}>{movie.genre}</a>
    )}
  </nav>;
}

function HomePage() {
  return <main className="wrap home">
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">오늘의 영화</span>
        <h1>나만의 영화<br />추천 홈페이지</h1>
        <p>보고 싶은 분위기에 맞춰 장르를 고르면<br className="desktop" /> 오늘 볼 영화 한 편을 추천해요.</p>
      </div>
      <div className="film" aria-hidden="true"><i></i><i></i><i></i></div>
    </section>
    <section className="pick"><h2>어떤 장르를 보고 싶나요?</h2><GenreLinks /></section>
  </main>;
}

function RecommendationPage({ genre, likes, onLike }) {
  const movie = movies[genre];
  return <main className="wrap recommendation">
    <a className="back" href="#/">← 홈으로</a>
    <h1>장르별 영화 추천</h1>
    <GenreLinks selected={genre} />
    <article className="movie">
      <div className={'art ' + genre} aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="details">
        <span className="eyebrow">{movie.genre}</span>
        <h2>{movie.title}</h2><p className="english">{movie.english}</p>
        <p>{movie.description}</p>
        <button className="like" type="button" onClick={onLike}>♡ 좋아요</button>
        <span className="count" aria-live="polite">좋아요 {likes}개</span>
      </div>
    </article>
  </main>;
}

function App() {
  const [route, setRoute] = useState(readRoute);
  const [dark, setDark] = useSavedState('movie-theme', false);
  const [likes, setLikes] = useSavedState('movie-likes', {});
  useEffect(() => {
    const onNavigate = () => setRoute(readRoute());
    window.addEventListener('hashchange', onNavigate);
    return () => window.removeEventListener('hashchange', onNavigate);
  }, []);
  useEffect(() => {
    document.title = route.recommendation ? '장르별 영화 추천 | 나만의 영화 추천' : '나만의 영화 추천 홈페이지';
  }, [route.recommendation]);
  const count = likes[route.genre] || 0;
  return <div className={dark ? 'site dark' : 'site'}>
    <Header recommendation={route.recommendation} dark={dark} onToggleTheme={() => setDark(value => !value)} />
    {route.recommendation
      ? <RecommendationPage genre={route.genre} likes={count} onLike={() => setLikes(previous => Object.assign({}, previous, { [route.genre]: (previous[route.genre] || 0) + 1 }))} />
      : <HomePage />}
    <footer className="wrap">나만의 영화 추천 홈페이지</footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
