import { useEffect, useState } from "react";
import { useGetSearchResultsUseCase } from "../../../../infrastructure/di";
import {
  SearchResultEntityType,
  type SearchResultEntity,
} from "../../../../domain/entities/SearchResultEntity";

const searchPlaceholders = [
  "e.g. Darth Vader, A New Hope, Luke Skywalker, Return of the Jedi",
  "e.g. Chewbacca, Yoda, Boba Fett",
  "e.g. The Empire Strikes Back, The Force Awakens",
];

export interface SearchPageData {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchPlaceholder: string;
  selectedTypes: SearchResultEntityType[];
  handleToggleType: (type: SearchResultEntityType) => void;
  results: SearchResultEntity[];
  loading: boolean;
  handleSearch: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function useSearchPageData(): SearchPageData {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    searchPlaceholders[1]
  );
  const [selectedTypes, setSelectedTypes] = useState<SearchResultEntityType[]>([
    SearchResultEntityType.People,
  ]);
  const [results, setResults] = useState<SearchResultEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const getSearchResultsUseCase = useGetSearchResultsUseCase();

  const handleToggleType = (type: SearchResultEntityType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || selectedTypes.length === 0) {
      return;
    }

    try {
      setLoading(true);
      const searchResults = await getSearchResultsUseCase.execute(
        searchTerm.trim(),
        selectedTypes
      );
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const hasPersonType = selectedTypes.includes(SearchResultEntityType.People);
    const hasFilmType = selectedTypes.includes(SearchResultEntityType.Films);

    if (hasPersonType && hasFilmType) {
      setSearchPlaceholder(searchPlaceholders[0]);
    } else if (hasPersonType) {
      setSearchPlaceholder(searchPlaceholders[1]);
    } else {
      setSearchPlaceholder(searchPlaceholders[2]);
    }
  }, [selectedTypes]);

  return {
    searchTerm,
    setSearchTerm,
    searchPlaceholder,
    selectedTypes,
    handleToggleType,
    results,
    loading,
    handleSearch,
    handleKeyDown,
  };
}

export default useSearchPageData;
