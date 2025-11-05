import { compareTwoStrings } from "string-similarity";
import type { SearchResult } from "../../domain/entities/swapi.js";
import type { SWAPIRepository } from "../ports/SWAPIRepository.js";

export class SearchUseCase {
  constructor(private swapiRepository: SWAPIRepository) {}

  private calculateRelevanceScore(name: string, query: string): number {
    const lowerName = name.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match gets highest score
    if (lowerName === lowerQuery) {
      return 1.0;
    }

    // Starts with query gets high score
    if (lowerName.startsWith(lowerQuery)) {
      return 0.9;
    }

    // Contains query gets medium-high score
    if (lowerName.includes(lowerQuery)) {
      return 0.8;
    }

    // String similarity for fuzzy matching
    return compareTwoStrings(lowerName, lowerQuery);
  }

  async execute(
    query: string,
    entityTypes: ("people" | "films")[]
  ): Promise<SearchResult[]> {
    const results: (SearchResult & { relevanceScore: number })[] = [];

    if (entityTypes.includes("people")) {
      try {
        const peopleResponse = await this.swapiRepository.searchPeople(query);
        for (const person of peopleResponse.result) {
          // Use public uid first, then extract from URL, never use
          let id: string | null = null;

          // First priority: use uid
          if (person.uid) {
            id = person.uid;
          }
          // Second priority: extract from URL
          else if (person.url) {
            const match = person.url.match(/\/people\/(\d+)\/?$/);
            if (match) {
              id = match[1];
            }
          }

          if (id && person.properties.name) {
            results.push({
              id,
              name: person.properties.name,
              entityType: "people",
              relevanceScore: this.calculateRelevanceScore(
                person.properties.name,
                query
              ),
            });
          }
        }
      } catch (error) {
        console.warn("Error searching people:", error);
      }
    }

    if (entityTypes.includes("films")) {
      try {
        const filmsResponse = await this.swapiRepository.searchFilms(query);
        for (const film of filmsResponse.result) {
          let id: string | null = null;

          if (film.uid) {
            id = film.uid;
          } else if (film.url) {
            const match = film.url.match(/\/films\/(\d+)\/?$/);
            if (match) {
              id = match[1];
            }
          }

          if (id && film.properties.title) {
            results.push({
              id,
              name: film.properties.title,
              entityType: "films",
              relevanceScore: this.calculateRelevanceScore(
                film.properties.title,
                query
              ),
            });
          }
        }
      } catch (error) {
        console.warn("Error searching films:", error);
      }
    }

    // Sort by relevance score (highest first), then alphabetically for same score
    results.sort((a, b) => {
      const scoreDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return a.name.localeCompare(b.name);
    });

    // Remove relevanceScore from final results
    return results.map(({ relevanceScore, ...result }) => result);
  }
}
