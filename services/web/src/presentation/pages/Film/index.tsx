import { useNavigate } from "react-router-dom";
import Surface from "../../components/Surface.tsx";
import Button from "../../components/Button.tsx";
import { TextLink } from "../../components/TextLink.tsx";
import EmptySearchImage from "../../assets/EmptySearch.png";
import useFilmPageData from "./hooks/useFilmPageData.tsx";
import { FaFilm, FaUserAstronaut } from "react-icons/fa";
import { CiTextAlignLeft } from "react-icons/ci";

function FilmPage() {
  const data = useFilmPageData();
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

  if (data.error || !data.film) {
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
            {data.error}
          </div>
        </div>
      </Surface>
    );
  }

  return (
    <Surface
      className="container max-w-4xl max-h-xl md:max-h-lg mx-auto flex flex-col relative"
      actionComponent={
        <Button onClick={() => navigate("/")} variant="primary">
          BACK TO SEARCH
        </Button>
      }
    >
      <div className="p-l overflow-y-scroll no-scrollbar pb-20">
        <div className="flex items-center gap-xs mb-l">
          <FaFilm className="text-neutral-500" />
          <h1 className="text-title text-typography-400 font-bold m-0">
            {data.film.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-l mb-l">
          <div>
            <div className="flex items-center w-full gap-xs mb-xs pb-s border-b border-neutral-300">
              <CiTextAlignLeft className="text-neutral-500 w-3 h-3" />
              <h2 className="text-subtitle text-typography-400 font-bold">
                Opening Crawl
              </h2>
            </div>
            <div className="text-content text-typography-400 whitespace-pre-line">
              {data.film.openingCrawl}
            </div>
          </div>

          <div>
            <div className="flex items-center w-full gap-xs mb-xs pb-s border-b border-neutral-300">
              <FaUserAstronaut className="text-neutral-500 w-3 h-3" />
              <h2 className="text-subtitle text-typography-400 font-bold">
                Characters
              </h2>
            </div>
            <div className="text-content flex flex-wrap gap-xxs">
              {data.film.characters.map((character, index) => (
                <span key={character.id} className="flex">
                  <TextLink to={`/people/${character.id}`}>
                    {character.name}
                  </TextLink>
                  {index < (data.film?.characters.length ?? 0) - 1 && (
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

export default FilmPage;
