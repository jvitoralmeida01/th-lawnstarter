import { FaFilm, FaUserAstronaut } from "react-icons/fa";
import { SearchResultEntityType } from "../../../../domain/entities/SearchResultEntity";

interface RadioSelectorProps {
  selectedTypes: SearchResultEntityType[];
  onToggle: (type: SearchResultEntityType) => void;
}

function RadioSelector({ selectedTypes, onToggle }: RadioSelectorProps) {
  const isPersonSelected = selectedTypes.includes(
    SearchResultEntityType.People
  );
  const isFilmSelected = selectedTypes.includes(SearchResultEntityType.Films);

  return (
    <div className="flex flex-col gap-xs">
      <label className="flex items-center gap-xs cursor-pointer">
        <input
          type="checkbox"
          name="searchType"
          value={SearchResultEntityType.People}
          checked={isPersonSelected}
          onChange={() => onToggle(SearchResultEntityType.People)}
          className="w-3 h-3 appearance-none outline-2 outline-offset-2 outline-neutral-300 rounded-full focus:ring-2 focus:ring-primary-300 focus:ring-offset-0 cursor-pointer checked:bg-primary-300 checked:outline-primary-500"
        />
        <FaUserAstronaut className="text-neutral-300" />
        <span className="text-content font-bold text-typography-400">
          People
        </span>
      </label>
      <label className="flex items-center gap-xs cursor-pointer">
        <input
          type="checkbox"
          name="searchType"
          value={SearchResultEntityType.Films}
          checked={isFilmSelected}
          onChange={() => onToggle(SearchResultEntityType.Films)}
          className="w-3 h-3 appearance-none outline-2 outline-offset-2 outline-neutral-300 rounded-full focus:ring-2 focus:ring-primary-300 focus:ring-offset-0 cursor-pointer checked:bg-primary-300 checked:outline-primary-500"
        />
        <FaFilm className="text-neutral-300" />
        <span className="text-content font-bold text-typography-400">
          Movies
        </span>
      </label>
    </div>
  );
}

export default RadioSelector;
