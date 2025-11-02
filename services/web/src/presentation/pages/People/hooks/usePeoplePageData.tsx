import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { PersonDetailsEntity } from "../../../../domain/entities/PersonEntity";
import { useGetPersonDetailsByIdUseCase } from "../../../../infrastructure/di";

export interface PeoplePageData {
  personId: string | undefined;
  person: PersonDetailsEntity | null;
  loading: boolean;
  error: string | null;
}

function usePeoplePageData(): PeoplePageData {
  const { id } = useParams<{ id: string }>();

  const [person, setPerson] = useState<PersonDetailsEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPersonDetailsUseCase = useGetPersonDetailsByIdUseCase();

  useEffect(() => {
    async function loadPerson() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getPersonDetailsUseCase.execute(id);
        setPerson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load person");
      } finally {
        setLoading(false);
      }
    }

    loadPerson();
  }, [id]);

  return {
    personId: id,
    person,
    loading,
    error,
  };
}

export default usePeoplePageData;
