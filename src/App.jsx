import { useEffect, useState } from "react";
// import { Routes, Route } from "react-router-dom";
import callAPI from "./utils/movieApiCalls";
import "./App.css";

import Header from "./components/Header";

function App() {
  const [movies, setMovies] = useState([]);

  async function fetchData() {
    try {
      const response = await callAPI(
        "/movie/now_playing?language=en-US&page=1",
      );
      if (response.status === 200) {
        const data = await response.json();
        setMovies(data.results);
        console.log(data.results);
      }
    } catch (err) {
      console.error(`${err.status}: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Header />
      <h1>WatchaWatchin</h1>
      <section>
        <ul>
          {movies.length ? (
            movies.map((movie) => {
              return <li key={movie.id}>{movie.title}</li>;
            })
          ) : (
            <p>Loading...</p>
          )}
        </ul>
      </section>
    </>
  );
}

export default App;
