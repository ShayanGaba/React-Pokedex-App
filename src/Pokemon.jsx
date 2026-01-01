import { useEffect, useState, useMemo } from "react";
import "./Pokemon.css";

export const Pokemon = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("pokeFavorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("pokeTheme");
    return saved || "dark";
  });
  const [showMoreTypes, setShowMoreTypes] = useState(false);

  const API = "https://pokeapi.co/api/v2/pokemon?limit=151";

  const primaryTypes = [
    { name: "all", emoji: "⚡", color: "#6B7280" },
    { name: "fire", emoji: "🔥", color: "#F59E0B" },
    { name: "water", emoji: "💧", color: "#3B82F6" },
    { name: "grass", emoji: "🌿", color: "#10B981" },
    { name: "electric", emoji: "⚡", color: "#FBBF24" },
  ];

  const secondaryTypes = [
    { name: "psychic", emoji: "🔮", color: "#EC4899" },
    { name: "ice", emoji: "❄️", color: "#06B6D4" },
    { name: "dragon", emoji: "🐉", color: "#8B5CF6" },
    { name: "dark", emoji: "🌑", color: "#64748b" },
    { name: "fairy", emoji: "✨", color: "#F472B6" },
  ];

  const allTypes = showMoreTypes
    ? [...primaryTypes, ...secondaryTypes]
    : primaryTypes;

  const fetchPokemon = async () => {
    if (!navigator.onLine) {
      setError("You are offline. Please check your connection.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch Pokemon list");
      const data = await res.json();

      const detailedPokemon = data.results.map(async (curPokemon) => {
        const pokemonResponse = await fetch(curPokemon.url);
        if (!pokemonResponse.ok)
          throw new Error(`Failed to fetch ${curPokemon.name}`);
        return await pokemonResponse.json();
      });

      const detailedResponse = await Promise.allSettled(detailedPokemon);
      const validPokemon = detailedResponse
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      setPokemon(validPokemon);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message || "Network error – check your connection.");
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const toggleFavorite = (id) => {
    const newFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem("pokeFavorites", JSON.stringify(newFavs));
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("pokeTheme", newTheme);
  };

  const showRandomPokemon = () => {
    const randomPoke = pokemon[Math.floor(Math.random() * pokemon.length)];
    setSelectedPokemon(randomPoke);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredPokemon = useMemo(
    () =>
      pokemon.filter((p) => {
        const matchesSearch = p.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType =
          selectedType === "all" ||
          p.types.some((t) => t.type.name === selectedType);
        return matchesSearch && matchesType;
      }),
    [pokemon, searchTerm, selectedType]
  );

  const sortedPokemon = useMemo(
    () =>
      [...filteredPokemon].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "id") return a.id - b.id;
        if (sortBy === "hp") return b.stats[0].base_stat - a.stats[0].base_stat;
        if (sortBy === "attack")
          return b.stats[1].base_stat - a.stats[1].base_stat;
        return 0;
      }),
    [filteredPokemon, sortBy]
  );

  const displayedPokemon = sortedPokemon.slice(0, displayCount);

  const isSingleResult = displayedPokemon.length === 1;

  if (loading) {
    return (
      <div className={`app ${theme}`}>
        <div className="loading-container">
          <div className="pokeball-spinner">
            <div className="pokeball-center"></div>
          </div>
          <div className="loading-text">
            <span>Catching Pokémon</span>
            <span className="loading-dots"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`app ${theme}`}>
        <div className="error-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-message">{error} Try again?</p>
            <button
              className="retry-button"
              onClick={fetchPokemon}
              aria-label="Retry loading Pokemon"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <div className="toggle-icon">{theme === "dark" ? "☀️" : "🌙"}</div>
      </button>

      <div className="pokemon-container">
        <div className="header">
          <h1 className="main-title">
            <span className="title-word">LET'S</span>
            <span className="title-word">CATCH</span>
            <span className="title-word">POKÉMON</span>
          </h1>
          <p className="subtitle">Explore the first 151 Pokemon!</p>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <div className="search-icon-left">🔍</div>
            <input
              type="text"
              placeholder="Search your Pokémon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search Pokemon"
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="controls-wrapper">
          <div className="controls-row">
            <div className="type-filters-compact">
              {allTypes.map((type) => (
                <button
                  key={type.name}
                  className={`type-chip ${
                    selectedType === type.name ? "active" : ""
                  }`}
                  onClick={() => setSelectedType(type.name)}
                  data-type={type.name}
                  aria-label={`Filter by ${type.name} type`}
                  aria-pressed={selectedType === type.name}
                >
                  <span className="chip-emoji" aria-hidden="true">
                    {type.emoji}
                  </span>
                  <span className="chip-label">{type.name}</span>
                </button>
              ))}
              {!showMoreTypes && (
                <button
                  className="type-chip more-btn"
                  onClick={() => setShowMoreTypes(true)}
                  aria-label="Show more types"
                >
                  <span className="chip-label">+{secondaryTypes.length}</span>
                </button>
              )}
            </div>

            <div className="action-controls">
              <select
                className="compact-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort Pokemon"
              >
                <option value="id">ID</option>
                <option value="name">Name</option>
                <option value="hp">HP</option>
                <option value="attack">ATK</option>
              </select>

              <button
                className="action-btn random"
                onClick={showRandomPokemon}
                aria-label="Show random Pokemon"
              >
                <span className="btn-text">🎲</span>
                <span className="btn-label">Random</span>
              </button>
            </div>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-chip">
            <span className="stat-icon">📊</span>
            <span className="stat-text">{filteredPokemon.length} Pokémon</span>
          </div>
          {favorites.length > 0 && (
            <div className="stat-chip favorite-chip">
              <span className="stat-icon">💙</span>
              <span className="stat-text">{favorites.length} Favorites</span>
            </div>
          )}
        </div>

        <ul className={`pokemon-grid ${isSingleResult ? "single-result" : ""}`}>
          {displayedPokemon.map((curPokemon, index) => (
            <li
              key={curPokemon.id}
              className="pokemon-card"
              style={{ "--card-index": index }}
            >
              <div className="card-glow"></div>

              <div className="card-header">
                <span className="pokemon-id">
                  #{String(curPokemon.id).padStart(3, "0")}
                </span>
                <button
                  className="favorite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(curPokemon.id);
                  }}
                  aria-label={`Toggle favorite for ${curPokemon.name}`}
                >
                  <svg
                    className={`heart-icon ${
                      favorites.includes(curPokemon.id) ? "filled" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={
                        favorites.includes(curPokemon.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </svg>
                </button>
              </div>

              <div
                className="pokemon-image"
                onClick={() => setSelectedPokemon(curPokemon)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setSelectedPokemon(curPokemon)
                }
                aria-label={`View details for ${curPokemon.name}`}
              >
                <div className="image-glow"></div>
                <img
                  loading="lazy"
                  src={
                    curPokemon.sprites?.other?.["official-artwork"]
                      ?.front_default ||
                    curPokemon.sprites?.front_default ||
                    "/fallback-pokeball.png"
                  }
                  alt={`Image of ${curPokemon.name}`}
                />
              </div>

              <div className="pokemon-info">
                <h2 className="pokemon-name">{curPokemon.name}</h2>

                <div className="pokemon-types">
                  {curPokemon.types.map((type, index) => (
                    <span
                      key={index}
                      className={`type-badge type-${type.type.name}`}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>

                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="stat-label">HP</span>
                    <span className="stat-value">
                      {curPokemon.stats[0].base_stat}
                    </span>
                  </div>
                  <div className="quick-stat">
                    <span className="stat-label">ATK</span>
                    <span className="stat-value">
                      {curPokemon.stats[1].base_stat}
                    </span>
                  </div>
                  <div className="quick-stat">
                    <span className="stat-label">DEF</span>
                    <span className="stat-value">
                      {curPokemon.stats[2].base_stat}
                    </span>
                  </div>
                </div>

                <button
                  className="details-btn"
                  onClick={() => setSelectedPokemon(curPokemon)}
                  aria-label={`View details for ${curPokemon.name}`}
                >
                  <span>View Details</span>
                  <svg className="btn-arrow" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {displayCount < sortedPokemon.length && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={() => setDisplayCount((prev) => prev + 20)}
              aria-label="Load more Pokemon"
            >
              <span>Load More</span>
              <div className="btn-shimmer"></div>
            </button>
          </div>
        )}

        {showBackToTop && (
          <button
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {selectedPokemon && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedPokemon(null)}
            role="dialog"
            aria-labelledby="modal-title"
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setSelectedPokemon(null)}
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="modal-header">
                <h2 id="modal-title" className="modal-title">
                  {selectedPokemon.name}
                </h2>
                <span className="modal-id">
                  #{String(selectedPokemon.id).padStart(3, "0")}
                </span>
              </div>

              <div className="modal-image">
                <div className="modal-image-glow"></div>
                <img
                  src={
                    selectedPokemon.sprites?.other?.["official-artwork"]
                      ?.front_default ||
                    selectedPokemon.sprites?.front_default ||
                    "/fallback-pokeball.png"
                  }
                  alt={`Image of ${selectedPokemon.name}`}
                />
              </div>

              <div className="modal-types">
                {selectedPokemon.types.map((type, index) => (
                  <span
                    key={index}
                    className={`type-badge type-${type.type.name}`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <h3>Physical Stats</h3>
                  <div className="physical-stats">
                    <div className="stat-item">
                      <span className="stat-label">Height</span>
                      <span className="stat-value">
                        {selectedPokemon.height / 10}m
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Weight</span>
                      <span className="stat-value">
                        {selectedPokemon.weight / 10}kg
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-section">
                  <h3>Base Stats</h3>
                  <div className="main-stats">
                    {selectedPokemon.stats.map((stat, index) => (
                      <div key={index} className="stat-row">
                        <span className="stat-name">
                          {stat.stat.name.replace("-", " ")}
                        </span>
                        <div className="stat-bar">
                          <div
                            className="stat-progress"
                            style={{
                              width: `${Math.min(
                                (stat.base_stat / 255) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="stat-number">{stat.base_stat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Abilities</h3>
                  <div className="abilities-list">
                    {selectedPokemon.abilities.map((ability, index) => (
                      <span key={index} className="ability-tag">
                        {ability.ability.name.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
