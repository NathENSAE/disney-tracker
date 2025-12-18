import os
import json
import urllib.request
import urllib.parse
import re

# Configuration
TMDB_API_KEY = "a352d8dd69841aa3d51bffbdc6088fe4"
FIRESTORE_PROJECT_ID = "disneyapp-60462"
FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{FIRESTORE_PROJECT_ID}/databases/(default)/documents/movies"
OUTPUT_DIR = os.path.join("public", "movies")

def get_movies():
    print("Fetching movies from Firestore...")
    movies = []
    
    # Firestore REST API default page size is 20. limit set to 300 to capture all.
    next_page_token = None
    
    # Simple set to avoid duplicates if any
    seen_movies = set()

    count = 0 
    
    while True:
        url = FIRESTORE_URL + "?pageSize=300"
        if next_page_token:
            url += f"&pageToken={next_page_token}"
            
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                
                if 'documents' in data:
                    for doc in data['documents']:
                        # The document name is "projects/.../documents/movies/MovieName"
                        movie_name = doc['name'].split('/')[-1]
                        if movie_name not in seen_movies:
                            movies.append(movie_name)
                            seen_movies.add(movie_name)
                
                next_page_token = data.get('nextPageToken')
                if not next_page_token:
                    break
        except Exception as e:
            print(f"Error fetching from Firestore: {e}")
            break
            
    return movies

def sanitize_filename(name):
    # Keep only alphanumeric, spaces, hyphens, underscores
    # Matches JS: .replace(/[^a-zA-Z0-9 \-_]/g, '').trim()
    return re.sub(r'[^a-zA-Z0-9 \-_]', '', name).strip()

def search_and_download(movie_name):
    safe_name = sanitize_filename(movie_name)
    if not safe_name:
        return
        
    filename = f"{safe_name}.jpg"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if os.path.exists(filepath):
        # uncoment to force update
        # print(f"Skipping {movie_name} (already exists)")
        return 

    print(f"Searching for {movie_name}...")
    try:
        query = urllib.parse.quote(f"{movie_name} disney")
        search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={query}"
        
        with urllib.request.urlopen(search_url) as response:
            data = json.loads(response.read().decode())
            
            poster_path = None
            if data.get('results'):
                poster_path = data['results'][0].get('poster_path')
            
            # Retry without "disney" if no results
            if not poster_path:
                query = urllib.parse.quote(movie_name)
                search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={query}"
                with urllib.request.urlopen(search_url) as retry_res:
                    data = json.loads(retry_res.read().decode())
                    if data.get('results'):
                        poster_path = data['results'][0].get('poster_path')

            if poster_path:
                image_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
                print(f"Downloading {movie_name} to {filename}...")
                
                # Download with user agent to avoid blocking
                opener = urllib.request.build_opener()
                opener.addheaders = [('User-agent', 'Mozilla/5.0')]
                urllib.request.install_opener(opener)
                
                urllib.request.urlretrieve(image_url, filepath)
            else:
                print(f"No image found for {movie_name}")

    except Exception as e:
        print(f"Error processing {movie_name}: {e}")

def main():
    if not os.path.exists(OUTPUT_DIR):
        try:
            os.makedirs(OUTPUT_DIR)
        except OSError as e:
            print(f"Error creating directory {OUTPUT_DIR}: {e}")
            return
        
    movies = get_movies()
    print(f"Found {len(movies)} movies.")
    
    for i, movie in enumerate(movies):
        search_and_download(movie)
        if i % 10 == 0:
            print(f"Processed {i+1}/{len(movies)}")

if __name__ == "__main__":
    main()
