import { createQueryKeyStore } from './create-query-key-store';

type PersistedSpraypaintRecord = {
  id: string;
};

const Team = {
  all: async () => ({ data: [] as PersistedSpraypaintRecord[] }),
};

const teamQueries = createQueryKeyStore({
  teams: {
    allStats: {
      queryKey: null, // TS error for type null
      queryFn: () => Team.all().then((data) => data.data),
    },
  },
});

teamQueries.teams.allStats; // this works fine

const teamQueriesObject = {
  allStats: () => ({
    queryKey: [''] as const,
    queryFn: () => {
      const query = Team.all();
      return query.then((data) => data.data);
    },
  }),
} as const;

const queries = createQueryKeyStore({
  teams: teamQueriesObject, // teams got the TS error below
});

queries.teams.allStats(); // this completion does not work.
