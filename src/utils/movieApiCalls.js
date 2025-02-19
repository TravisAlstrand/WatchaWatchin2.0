const MOVIEDB_KEY = import.meta.env.VITE_MOVIEDB_KEY;

const baseUrl = "https://api.themoviedb.org/3";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${MOVIEDB_KEY}`,
  },
};

export default function callAPI(url) {
  const completeUrl = `${baseUrl}${url}`;
  return fetch(completeUrl, options);
}
