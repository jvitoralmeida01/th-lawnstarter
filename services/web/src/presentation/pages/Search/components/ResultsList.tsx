import { useNavigate } from "react-router-dom";
import type { SearchResultEntity } from "../../../../domain/entities/SearchResultEntity";
import { SearchResultEntityType } from "../../../../domain/entities/SearchResultEntity";
import Button from "../../../components/Button";
import EmptySearchImage from "../../../assets/EmptySearch.png";
import { FaFilm, FaUserAstronaut } from "react-icons/fa";

interface ResultsListProps {
  results: SearchResultEntity[];
}

function ResultsList({ results }: ResultsListProps) {
  const navigate = useNavigate();

  const handleSeeDetails = (result: SearchResultEntity) => {
    if (result.entityType === SearchResultEntityType.People) {
      navigate(`/people/${result.id}`);
    } else if (result.entityType === SearchResultEntityType.Films) {
      navigate(`/film/${result.id}`);
    }
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <img
          src={EmptySearchImage}
          alt="Empty search"
          draggable="false"
          className="w-60 h-60 object-contain"
        />
        <div className="flex flex-col gap-xxs items-center text-subtitle text-neutral-400 font-bold whitespace-pre-line">
          There are zero matches.
          <br />
          Use the form to search for People and Movies.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {results.map((result) => (
        <div
          key={`${result.entityType}-${result.id}`}
          className="flex items-center justify-between border-b border-neutral-300 py-xs"
        >
          <div className="flex items-center gap-xs">
            {result.entityType === SearchResultEntityType.People ? (
              <FaUserAstronaut className="text-neutral-300" />
            ) : (
              <FaFilm className="text-neutral-300" />
            )}
            <span className="text-content font-bold text-typography-400">
              {result.name}
            </span>
          </div>
          <Button onClick={() => handleSeeDetails(result)} variant="primary">
            SEE DETAILS
          </Button>
        </div>
      ))}
    </div>
  );
}

export default ResultsList;
