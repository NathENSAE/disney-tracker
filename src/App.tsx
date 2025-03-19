import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/custom/Layout";
import Home from "./pages/Home";
import Other from "./pages/Other";
import { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { doc, collection, setDoc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import "./App.css";

export default function App() {
  const [movies, setMovies] = useState<string[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<string[]>([]);
  const [movieImages, setMovieImages] = useState<Record<string, string>>({});
  const [watched, setWatched] = useState(new Set<string>());
  const [randomMovie, setRandomMovie] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadWatchedMovies();
    loadMovies();
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      fetchMovieImages(movies);
      setLoading(false);
    }
  }, [movies]);

  const loadWatchedMovies = async () => {
    const docRef = doc(db, "movies", "watched");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setWatched(new Set(docSnap.data().movies));
    }
  };

  const loadMovies = async () => {
    const moviesCollection = collection(db, "movies");
    const querySnapshot = await getDocs(moviesCollection);

    const movieList: string[] = [];
    querySnapshot.forEach((doc) => {
      movieList.push(doc.id);
    });

    movieList.sort(() => Math.random() - 0.5);
    setMovies(movieList);
    setFilteredMovies(movieList);
  };

  const fetchMovieImages = async (movieList: string[]) => {
    const images: Record<string, string> = {};
    for (const movie of movieList) {
      let res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=a352d8dd69841aa3d51bffbdc6088fe4&query=${encodeURIComponent(movie + " disney")}`);
      let data = await res.json();
      if (data.results.length === 0) {
        res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=a352d8dd69841aa3d51bffbdc6088fe4&query=${encodeURIComponent(movie)}`);
        data = await res.json();
      }
      if (data.results.length > 0) {
        images[movie] = `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
      }
    }
    setMovieImages(images);
  };

  const toggleWatched = async (movie: string) => {
    setWatched((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movie)) {
        newSet.delete(movie);
        updateMovieStatus(movie, "Non vu");
      } else {
        newSet.add(movie);
        updateMovieStatus(movie, "Vu");
      }
      setDoc(doc(db, "movies", "watched"), { movies: [...newSet] });
      return newSet;
    });
  };

  const updateMovieStatus = async (movie: string, status: string) => {
    const movieRef = doc(db, "movies", movie);
    await updateDoc(movieRef, {
      status: status,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = movies.filter((movie) => movie.toLowerCase().includes(query));
    setFilteredMovies(filtered);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home
                movies={movies}
                filteredMovies={filteredMovies}
                watched={watched}
                randomMovie={randomMovie}
                isFinished={isFinished}
                movieImages={movieImages}
                loading={loading}
                handleSearchChange={handleSearchChange}
                toggleWatched={toggleWatched}
                setFilteredMovies={setFilteredMovies}
                setRandomMovie={setRandomMovie}
                setIsFinished={setIsFinished}
              />
            </Layout>
          }
        />
        <Route
          path="/other"
          element={
            <Layout>
              <Other />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
