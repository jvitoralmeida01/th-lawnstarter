import "./App.css";
import { Route, Routes } from "react-router-dom";
import SearchPage from "../pages/Search";
import FilmPage from "../pages/Film";
import Layout from "../components/Layout";
import PeoplePage from "../pages/People";
import NotFoundPage from "../pages/NotFound";
import StatisticsPage from "../pages/Statistics";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/film/:id" element={<FilmPage />} />
        <Route path="/people/:id" element={<PeoplePage />} />
        <Route path="/statistics" element={<StatisticsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
