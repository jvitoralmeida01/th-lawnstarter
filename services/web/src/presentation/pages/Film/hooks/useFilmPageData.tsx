import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { FilmDetailsEntity } from "../../../../domain/entities/FilmEntity";
import { useGetFilmDetailsByIdUseCase } from "../../../../infrastructure/di";

export interface FilmPageData {
  filmId: string | undefined;
  film: FilmDetailsEntity | null;
  loading: boolean;
  error: string | null;
}

function useFilmPageData(): FilmPageData {
  const { id } = useParams<{ id: string }>();

  const [film, setFilm] = useState<FilmDetailsEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFilmDetailsUseCase = useGetFilmDetailsByIdUseCase();

  useEffect(() => {
    async function loadFilm() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getFilmDetailsUseCase.execute(id);
        setFilm(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load film");
      } finally {
        setLoading(false);
      }
    }

    loadFilm();
  }, [id]);

  return {
    filmId: id,
    film,
    loading,
    error,
  };
}

export default useFilmPageData;
