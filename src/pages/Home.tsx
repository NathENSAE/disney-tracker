import { useState } from "react";
import WheelComponent from "@/components/custom/WheelComponent";
import { useMovies } from "@/hooks/useMovies";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function Home() {
  const {
    movies,
    filteredMovies,
    watched,
    movieImages,
    loading,
    toggleWatched,
    filterMovies,
    setFilteredMovies,
  } = useMovies();

  const [randomMovie, setRandomMovie] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'watched' | 'unwatched'>('all');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    filterMovies(event.target.value);
  };

  const spinSegments = movies.filter((movie) => !watched.has(movie));
  // Limit segments if too many to prevent wheel issues? 
  // For now keeping original logic but ensuring we have segments
  const wheelSegments = spinSegments.length > 0 ? spinSegments : ["Tout vu!"];
  const wheelColors = wheelSegments.map(
    (_, i) => `hsl(${(i / wheelSegments.length) * 360}, 70%, 50%)`
  );

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen gap-6 p-6">

      {/* Left Column: Movie List */}
      <div className="flex-1 flex flex-col space-y-4 h-full overflow-hidden order-2 md:order-1">

        {/* Stats & Tools */}
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Progression</span>
              <span className="font-bold text-primary">
                {watched.size} / {movies.length} ({Math.round((watched.size / (movies.length || 1)) * 100)}%)
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(watched.size / (movies.length || 1)) * 100}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un film..."
                  className="pl-8"
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={selectedFilter === 'all' ? "default" : "outline"}
                  className="cursor-pointer py-2 hover:bg-primary/90"
                  onClick={() => {
                    setSelectedFilter('all');
                    setFilteredMovies(movies);
                  }}
                >
                  Tout
                </Badge>
                <Badge
                  variant={selectedFilter === 'watched' ? "default" : "outline"}
                  className="cursor-pointer py-2 hover:bg-primary/90"
                  onClick={() => {
                    setSelectedFilter('watched');
                    setFilteredMovies(movies.filter(m => watched.has(m)));
                  }}
                >
                  Vu
                </Badge>
                <Badge
                  variant={selectedFilter === 'unwatched' ? "default" : "outline"}
                  className="cursor-pointer py-2 hover:bg-primary/90"
                  onClick={() => {
                    setSelectedFilter('unwatched');
                    setFilteredMovies(movies.filter(m => !watched.has(m)));
                  }}
                >
                  Pas vu
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scrollable Movie Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {filteredMovies
              .sort((a, b) => a.localeCompare(b))
              .map((movie) => (
                <Card key={movie} className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${watched.has(movie) ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>
                  <div className="relative aspect-[2/3] w-full bg-secondary/30">
                    {movieImages[movie] ? (
                      <img
                        src={movieImages[movie]}
                        alt={movie}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground p-4 text-center text-sm">
                        {movie}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={watched.has(movie) ? "secondary" : "default"}>
                        {watched.has(movie) ? "Vu" : "À voir"}
                      </Badge>
                    </div>
                  </div>
                  <CardFooter className="p-3 bg-card/90">
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate flex-1" title={movie}>
                        {movie}
                      </span>
                      <button
                        onClick={() => toggleWatched(movie)}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${watched.has(movie) ? 'bg-primary border-primary text-primary-foreground' : 'border-input hover:bg-secondary'}`}
                      >
                        {watched.has(movie) && "✓"}
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
          {filteredMovies.length === 0 && !loading && (
            <div className="text-center py-20 text-muted-foreground">
              Aucun film trouvé.
            </div>
          )}
        </div>
      </div>

      {/* Right Column (Now Order 2): Wheel & Random Result */}
      <div className="flex-1 flex flex-col items-center justify-start space-y-6 order-1 md:order-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent text-center">
          Disney Tracker
        </h1>

        <div className="relative w-full max-w-[500px] flex justify-center py-8">
          {/* Wheel Container */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            spinSegments.length > 0 ? (
              <div className="scale-75 md:scale-100 transition-transform">
                <WheelComponent
                  segments={wheelSegments}
                  segColors={wheelColors}
                  winningSegment={""}
                  onFinished={(segment) => {
                    setRandomMovie(segment);
                    setIsFinished(true);
                  }}
                  buttonText="SPIN"
                  size={250}
                  fontSize="0.8em"
                  wordcut={30}
                  upDuration={100}
                  downDuration={600}
                  isOnlyOnce={false}
                />
              </div>
            ) : (
              <div className="text-xl text-muted-foreground">Félicitations ! Vous avez tout vu !</div>
            )
          )}
        </div>

        {/* Winner Display */}
        {isFinished && randomMovie && (
          <Card className="w-full max-w-sm border-primary/50 shadow-lg shadow-primary/10 animate-in fade-in zoom-in duration-500">
            <CardContent className="flex flex-col items-center p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">C'est parti pour...</h2>
              <div className="text-xl font-semibold text-primary">{randomMovie}</div>
              {movieImages[randomMovie] && (
                <a
                  href={`https://www.google.com/search?q=Disney+plus+${encodeURIComponent(
                    randomMovie
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={movieImages[randomMovie]}
                    alt={randomMovie}
                    className="rounded-lg shadow-md w-48 object-cover"
                  />
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}