import { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { doc, collection, setDoc, getDoc, getDocs, updateDoc } from "firebase/firestore";

export interface UseMoviesReturn {
    movies: string[];
    filteredMovies: string[];
    watched: Set<string>;
    movieImages: Record<string, string>;
    loading: boolean;
    setFilteredMovies: (movies: string[]) => void;
    toggleWatched: (movie: string) => Promise<void>;
    filterMovies: (query: string) => void;
}

export function useMovies(): UseMoviesReturn {
    const [movies, setMovies] = useState<string[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<string[]>([]);
    const [movieImages, setMovieImages] = useState<Record<string, string>>({});
    const [watched, setWatched] = useState(new Set<string>());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWatchedMovies();
        loadMovies();
    }, []);

    useEffect(() => {
        if (movies.length > 0) {
            // Logic changed: Use local images instead of fetching from TMDB
            // Assuming images are downloaded to /public/movies/ via python script
            const localImages: Record<string, string> = {};
            movies.forEach(movie => {
                // Sanitize to match python script: .replace(/[^a-zA-Z0-9 \-_]/g, '').trim()
                const safeName = movie.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
                localImages[movie] = `/movies/${safeName}.jpg`;
            });
            setMovieImages(localImages);
            setLoading(false);
        }
    }, [movies]);

    const loadWatchedMovies = async () => {
        try {
            const docRef = doc(db, "movies", "watched");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setWatched(new Set(docSnap.data().movies));
            }
        } catch (error) {
            console.error("Error loading watched movies:", error);
        }
    };

    const loadMovies = async () => {
        try {
            const moviesCollection = collection(db, "movies");
            const querySnapshot = await getDocs(moviesCollection);

            const movieList: string[] = [];
            querySnapshot.forEach((doc) => {
                // "watched" is the document storing the user's watched list, not a movie itself
                if (doc.id !== "watched") {
                    movieList.push(doc.id);
                }
            });

            // Randomize initial order
            movieList.sort(() => Math.random() - 0.5);
            setMovies(movieList);
            setFilteredMovies(movieList);
        } catch (error) {
            console.error("Error loading movies:", error);
        }
    };

    const updateMovieStatus = async (movie: string, status: string) => {
        try {
            const movieRef = doc(db, "movies", movie);
            await updateDoc(movieRef, {
                status: status,
            });
        } catch (error) {
            console.error("Error updating movie status:", error);
        }
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
            // Firestore update for the set
            setDoc(doc(db, "movies", "watched"), { movies: [...newSet] }).catch(e => console.error(e));
            return newSet;
        });
    };

    const filterMovies = (query: string) => {
        const lowerQuery = query.toLowerCase();
        const filtered = movies.filter((movie) => movie.toLowerCase().includes(lowerQuery));
        setFilteredMovies(filtered);
    };

    return {
        movies,
        filteredMovies,
        watched,
        movieImages,
        loading,
        setFilteredMovies,
        toggleWatched,
        filterMovies,
    };
}
