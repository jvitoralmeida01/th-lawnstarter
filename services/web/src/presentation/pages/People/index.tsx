import { useNavigate } from "react-router-dom";
import Surface from "../../components/Surface.tsx";
import Button from "../../components/Button.tsx";
import EmptySearchImage from "../../assets/EmptySearch.png";
import usePeoplePageData from "./hooks/usePeoplePageData.tsx";
import { TextLink } from "../../components/TextLink.tsx";
import { FaFilm, FaUserAstronaut } from "react-icons/fa";
import { CiCircleInfo } from "react-icons/ci";

function PeoplePage() {
  const data = usePeoplePageData();
  const navigate = useNavigate();

  if (data.loading) {
    return (
      <Surface className="container max-w-4xl h-xl md:h-lg mx-auto flex flex-col relative">
        <div className="flex flex-col gap-m items-center justify-center min-h-full">
          <div className="text-subtitle text-typography-300 animate-pulse">
            Searching...
          </div>
        </div>
      </Surface>
    );
  }

  if (data.error || !data.person) {
    return (
      <Surface className="container max-w-4xl h-xl md:h-lg mx-auto flex flex-col relative">
        <div className="flex flex-col gap-m items-center justify-center min-h-full">
          <img
            src={EmptySearchImage}
            alt="Empty search"
            draggable="false"
            className="w-60 h-60 object-contain"
          />
          <div className="flex flex-col gap-xxs items-center text-subtitle text-neutral-400 font-bold whitespace-pre-line">
            {data.error || "No Starwars characters around here!"}
          </div>
        </div>
      </Surface>
    );
  }

  return (
    <Surface
      className="container max-w-4xl min-h-lg max-h-xl md:max-h-lg mx-auto flex flex-col relative"
      actionComponent={
        <Button onClick={() => navigate("/")} variant="primary">
          BACK TO SEARCH
        </Button>
      }
    >
      <div className="p-l md:overflow-y-scroll no-scrollbar pb-20">
        <div className="flex items-center gap-xs mb-l">
          <FaUserAstronaut className="text-neutral-500" />
          <h1 className="text-title text-typography-400 font-bold bg-neutral-900">
            {data.person.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-l mb-l">
          <div>
            <div className="flex items-center w-full gap-xs mb-xs pb-s border-b border-neutral-300">
              <CiCircleInfo className="text-neutral-500 w-3 h-3" />
              <h2 className="text-subtitle text-typography-400 font-bold">
                Details
              </h2>
            </div>
            <div className="flex flex-col gap-xxs">
              <div className="flex flex-row gap-xxs">
                <h2 className="text-content text-typography-400">
                  Birth Year:
                </h2>
                <h2 className="text-content text-typography-400 font-bold">
                  {data.person.birthYear}
                </h2>
              </div>

              <div className="flex flex-row gap-xxs">
                <h2 className="text-content text-typography-400">Gender:</h2>
                <h2 className="text-content text-typography-400 font-bold">
                  {data.person.gender}
                </h2>
              </div>

              <div className="flex flex-row gap-xxs">
                <h2 className="text-content text-typography-400">Eye Color:</h2>
                <h2 className="text-content text-typography-400 font-bold">
                  {data.person.eyeColor}
                </h2>
              </div>

              <div className="flex flex-row gap-xxs">
                <h2 className="text-content text-typography-400">
                  Hair Color:
                </h2>
                <h2 className="text-content text-typography-400 font-bold">
                  {data.person.hairColor}
                </h2>
              </div>

              <div className="flex flex-row gap-xxs">
                <h2 className="text-content text-typography-400">Height:</h2>
                <h2 className="text-content text-typography-400 font-bold">
                  {data.person.height}
                </h2>
              </div>

              <div className="flex flex-row gap-xxs">
                <h2 className="text-content text-typography-400">Mass:</h2>
                <h2 className="text-content text-typography-400 font-bold">
                  {data.person.mass}
                </h2>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center w-full gap-xs mb-xs pb-s border-b border-neutral-300">
              <FaFilm className="text-neutral-500 w-3 h-3" />
              <h2 className="text-subtitle text-typography-400 font-bold">
                Movies
              </h2>
            </div>
            <div className="text-content flex flex-wrap gap-xxs">
              {data.person.films.map((film, index) => (
                <span key={film.id} className="flex">
                  <TextLink to={`/film/${film.id}`}>{film.name}</TextLink>
                  <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-accent-hover"></span>
                  {index < (data.person?.films.length ?? 0) - 1 && (
                    <span className="text-typography-300">, </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Surface>
  );
}

export default PeoplePage;
