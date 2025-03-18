import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WheelComponent from "./components/custom/WheelComponent";
import "./App.css";
import { doc, collection, setDoc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Import Firestore instance

const TMDB_API_KEY = "a352d8dd69841aa3d51bffbdc6088fe4";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // Base URL for poster images

export default function DisneyMovieTracker() {
  const [movies, setMovies] = useState<string[]>([]); // Original list of all movies
  const [filteredMovies, setFilteredMovies] = useState<string[]>([]); // Filtered list based on search
  const [movieImages, setMovieImages] = useState<Record<string, string>>({});
  const [watched, setWatched] = useState(new Set<string>());
  const [randomMovie, setRandomMovie] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    loadWatchedMovies();
    loadMovies();
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      fetchMovieImages(movies); // Fetch movie images after `movies` is updated
      setLoading(false); // Set loading to false after movies are loaded
    }
  }, [movies]); // Runs whenever `movies` is updated

  const loadWatchedMovies = async () => {
    const docRef = doc(db, "movies", "watched");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setWatched(new Set(docSnap.data().movies));
    }
  };
  
  const loadMovies = async () => {
    const moviesCollection = collection(db, "movies"); // Reference the "movies" collection
    const querySnapshot = await getDocs(moviesCollection); // Fetch all documents in the collection
  
    const movieList: string[] = [];
    querySnapshot.forEach((doc) => {
      movieList.push(doc.id); // Use the document ID as the movie name
    });
  
    movieList.sort(() => Math.random() - 0.5); // Shuffle the movie list
    setMovies(movieList);
    console.log(movies);
    setFilteredMovies(movieList); // Initially show all movies
  };

  // Fetch movie posters from TMDb API
  const fetchMovieImages = async (movieList: string[]) => {
    const images: Record<string, string> = {};
    for (const movie of movieList) {
      let res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie + " disney")}`);
      let data = await res.json();
      if (data.results.length === 0) {
        res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie)}`);
        data = await res.json();
      }
      if (data.results.length > 0) {
        images[movie] = `${IMAGE_BASE_URL}${data.results[0].poster_path}`;
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
      // Save to Firestore
      setDoc(doc(db, "movies", "watched"), { movies: [...newSet] });
      return newSet;
    });
  };

  // Function to update movie status in Firestore
  const updateMovieStatus = async (movie: string, status: string) => {
    const movieRef = doc(db, "movies", movie);
    await updateDoc(movieRef, {
      status: status, // Update the movie status
    });
  };

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter the movies based on the search query
    const filtered = movies.filter((movie) => movie.toLowerCase().includes(query));
    setFilteredMovies(filtered);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold text-center mb-4">
        Objectif 100% Disney <span role="img" aria-label="sunglasses">😎</span>
      </h1>

      {loading ? (<p>Chargement...</p>) : (
        <div className="flex">
          <div className="flex-1">
            <div className="wheel-container">
              <WheelComponent
              segments={movies.filter((movie) => !watched.has(movie))}
              segColors={movies
                .filter((movie) => !watched.has(movie))
                .map((_, i) => `hsl(${(i / filteredMovies.length) * 360}, 70%, 50%)`)}
              winningSegment={""}
              onFinished={(segment) => {
                setRandomMovie(segment);
                setIsFinished(true);
              }}
              buttonText="Spin"
              size={window.innerWidth < 768 ? 200 : 280} // Adjust size based on screen width
              fontSize={window.innerWidth < 768 ? "0.5em" : "0.6em"} // Adjust font size for smaller screens
              wordcut={30}
              upDuration={20}
              downDuration={200}
              isOnlyOnce={false}
              />
            </div>
            {isFinished && randomMovie && (
                <div className="text-center mt-4">
                <p className="text-lg font-semibold">{randomMovie}</p>
                {movieImages[randomMovie] && (
                  <a
                  href={`https://www.google.com/search?q=Disney+plus+${encodeURIComponent(randomMovie)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                  <img
                    src={movieImages[randomMovie]}
                    alt={randomMovie}
                    className="movie-image shadow-lg w-40 mx-auto"
                  />
                  </a>
                )}
                </div>
            )}
          </div>
          <div className="flex-1">
            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <Button
                onClick={() => setFilteredMovies(movies)}
                className="mr-2"
              >
                Tout
              </Button>
              <Button
                onClick={() => {
                  const filtered = movies.filter((movie) => watched.has(movie));
                  setFilteredMovies(filtered);
                }}
                className="mr-2"
              >
                Vu
              </Button>
              <Button
                onClick={() => {
                  const filtered = movies.filter((movie) => !watched.has(movie));
                  setFilteredMovies(filtered);
                }}
              >
                Pas vu
              </Button>
            </div>
            <div className="scrollable-box">
              <ul className="mb-4">
                {filteredMovies
                .slice()
                .sort((a, b) => a.localeCompare(b)) // Sort movies by name
                .map((movie) => (
                  <li key={movie} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center movie-item">
                    {movieImages[movie] && (
                    <img src={movieImages[movie]} alt={movie} className="movie-image" />
                    )}
                    <div className="movie-info flex">
                    <p className="font-semibold">{movie}</p>
                    <Button
                      className="watch-button"
                      onClick={() => toggleWatched(movie)}
                    >
                      {watched.has(movie) ? "Vu" : "Pas vu"}
                    </Button>
                    </div>
                  </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}