import WheelComponent from "@/components/custom/WheelComponent";

export default function Home({
  movies,
  filteredMovies,
  watched,
  randomMovie,
  isFinished,
  movieImages,
  loading,
  handleSearchChange,
  toggleWatched,
  setFilteredMovies,
  setRandomMovie,
  setIsFinished,
}: {
  movies: string[];
  filteredMovies: string[];
  watched: Set<string>;
  randomMovie: string | null;
  isFinished: boolean;
  movieImages: Record<string, string>;
  loading: boolean;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleWatched: (movie: string) => void;
  setFilteredMovies: (movies: string[]) => void;
  setRandomMovie: (movie: string) => void;
  setIsFinished: (finished: boolean) => void;
}) {
  return (
    <div className="flex h-full min-h-screen">

      {/* Main Content */}
      <div className="flex-1 p-6 w-full">
        <h1 className="text-3xl font-semibold text-center mb-4">
          Objectif 100% Disney <span role="img" aria-label="sunglasses">😎</span>
        </h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="flex gap-4">
            {/* Left Column: Wheel */}
            <div className="flex-1">
              <div className="wheel-container">
                <WheelComponent
                  segments={movies.filter((movie) => !watched.has(movie))}
                  segColors={movies
                    .filter((movie) => !watched.has(movie))
                    .map(
                      (_, i) =>
                        `hsl(${(i / filteredMovies.length) * 360}, 70%, 50%)`
                    )}
                  winningSegment={""}
                  onFinished={(segment) => {
                    setRandomMovie(segment);
                    setIsFinished(true);
                  }}
                  buttonText="Spin"
                  size={window.innerWidth < 768 ? 190 : 270}
                  fontSize={window.innerWidth < 768 ? "0.5em" : "0.6em"}
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
                      href={`https://www.google.com/search?q=Disney+plus+${encodeURIComponent(
                        randomMovie
                      )}`}
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

            {/* Right Column: Movie List */}
            <div className="flex-1">
              {/* Counter */}
              <div className="counter-container">
                <p className="text-lg">
                  Il en reste seulement {movies.length - watched.size}/{movies.length} !!
                </p>
              </div>
              {/* Search Bar */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search movies..."
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
              <div className="filter-buttons">
                <button
                  onClick={() => setFilteredMovies(movies)}
                  className="mr-2"
                >
                  Tout
                </button>
                <button
                  onClick={() => {
                    const filtered = movies.filter((movie) =>
                      watched.has(movie)
                    );
                    setFilteredMovies(filtered);
                  }}
                  className="mr-2"
                >
                  Vu
                </button>
                <button
                  onClick={() => {
                    const filtered = movies.filter(
                      (movie) => !watched.has(movie)
                    );
                    setFilteredMovies(filtered);
                  }}
                  className="mr-2"
                >
                  Pas vu
                </button>
              </div>
              <div className="scrollable-box">
                <ul className="mb-4">
                  {filteredMovies
                    .slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((movie) => (
                      <li
                        key={movie}
                        className="flex items-center justify-between p-2 border-b"
                      >
                        <div className="flex items-center movie-item">
                          {movieImages[movie] && (
                            <img
                              src={movieImages[movie]}
                              alt={movie}
                              className="movie-image"
                            />
                          )}
                          <div className="movie-info flex">
                            <p className="font-semibold">{movie}</p>
                            <button
                              className="watch-button"
                              onClick={() => toggleWatched(movie)}
                            >
                              {watched.has(movie) ? "Vu" : "Pas vu"}
                            </button>
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
    </div>
  );
}