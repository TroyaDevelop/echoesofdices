import { searchRepository } from './search.repository';

export const searchService = {
  async searchAll(query: string) {
    return searchRepository.searchAll(query);
  },
};
