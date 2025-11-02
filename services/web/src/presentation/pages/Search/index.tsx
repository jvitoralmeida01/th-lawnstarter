import Surface from "../../components/Surface";
import Button from "../../components/Button";
import Textfield from "./components/Textfield";
import RadioSelector from "./components/RadioSelector";
import ResultsList from "./components/ResultsList";
import useSearchPageData from "./hooks/useSearchPageData.tsx";

function SearchPage() {
  const data = useSearchPageData();

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-l">
        <Surface className="p-l flex flex-col gap-m h-fit md:col-span-2">
          <h2 className="text-subtitle text-typography-400 font-bold">
            What are you searching for?
          </h2>
          <RadioSelector
            selectedTypes={data.selectedTypes}
            onToggle={data.handleToggleType}
          />
          <Textfield
            value={data.searchTerm}
            onChange={data.setSearchTerm}
            placeholder={data.searchPlaceholder}
            onKeyDown={data.handleKeyDown}
          />
          <Button
            onClick={data.handleSearch}
            variant="primary"
            disabled={data.loading || !data.searchTerm.trim()}
          >
            SEARCH
          </Button>
        </Surface>

        <Surface className="p-l flex flex-col min-h-lg max-h-xl md:max-h-lg h-fit md:col-span-3 overflow-y-scroll no-scrollbar">
          <h2 className="text-subtitle text-typography-400 font-bold border-b border-neutral-300 pb-xs">
            Results
          </h2>
          <div className="flex-1 flex flex-col">
            {data.loading ? (
              <div className="flex flex-col gap-m items-center justify-center flex-1">
                <div className="text-subtitle text-neutral-400 font-bold animate-pulse">
                  Searching...
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <ResultsList results={data.results} />
              </div>
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}

export default SearchPage;
