const axios = require('axios');
const NodeCache = require('node-cache');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '1b7c076a0e4849aeefd1f3c429c79f3';
    this.baseURL = 'https://api.themoviedb.org/3';
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hora
  }

  async getTrending(mediaType = 'all', timeWindow = 'week') {
    const cacheKey = `trending_${mediaType}_${timeWindow}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/trending/${mediaType}/${timeWindow}`, {
        params: { api_key: this.apiKey }
      });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar trending:', error.message);
      return { results: [] };
    }
  }

  async searchMulti(query, page = 1) {
    const cacheKey = `search_${query}_${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/search/multi`, {
        params: { 
          api_key: this.apiKey,
          query,
          page,
          include_adult: false
        }
      });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Erro na busca:', error.message);
      return { results: [] };
    }
  }

  async getMovieDetails(movieId) {
    const cacheKey = `movie_${movieId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [movie, credits, videos] = await Promise.all([
        axios.get(`${this.baseURL}/movie/${movieId}`, {
          params: { api_key: this.apiKey }
        }),
        axios.get(`${this.baseURL}/movie/${movieId}/credits`, {
          params: { api_key: this.apiKey }
        }),
        axios.get(`${this.baseURL}/movie/${movieId}/videos`, {
          params: { api_key: this.apiKey }
        })
      ]);

      const result = {
        ...movie.data,
        credits: credits.data,
        videos: videos.data
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error.message);
      return null;
    }
  }

  async getTVDetails(tvId) {
    const cacheKey = `tv_${tvId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [tv, credits, videos, seasons] = await Promise.all([
        axios.get(`${this.baseURL}/tv/${tvId}`, {
          params: { api_key: this.apiKey }
        }),
        axios.get(`${this.baseURL}/tv/${tvId}/credits`, {
          params: { api_key: this.apiKey }
        }),
        axios.get(`${this.baseURL}/tv/${tvId}/videos`, {
          params: { api_key: this.apiKey }
        }),
        axios.get(`${this.baseURL}/tv/${tvId}/seasons`, {
          params: { api_key: this.apiKey }
        })
      ]);

      const result = {
        ...tv.data,
        credits: credits.data,
        videos: videos.data,
        seasons: seasons.data
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar detalhes da série:', error.message);
      return null;
    }
  }

  async getPopularMovies(page = 1) {
    const cacheKey = `popular_movies_${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/movie/popular`, {
        params: { 
          api_key: this.apiKey,
          page
        }
      });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error.message);
      return { results: [] };
    }
  }

  async getPopularTV(page = 1) {
    const cacheKey = `popular_tv_${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/tv/popular`, {
        params: { 
          api_key: this.apiKey,
          page
        }
      });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar séries populares:', error.message);
      return { results: [] };
    }
  }

  async getTopRated(mediaType = 'movie', page = 1) {
    const cacheKey = `toprated_${mediaType}_${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/${mediaType}/top_rated`, {
        params: { 
          api_key: this.apiKey,
          page
        }
      });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar top rated:', error.message);
      return { results: [] };
    }
  }

  async getUpcomingMovies(page = 1) {
    const cacheKey = `upcoming_movies_${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseURL}/movie/upcoming`, {
        params: { 
          api_key: this.apiKey,
          page
        }
      });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes próximos:', error.message);
      return { results: [] };
    }
  }

  getImageURL(path, size = 'w500') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  getBackdropURL(path, size = 'original') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

module.exports = new TMDBService();