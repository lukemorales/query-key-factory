import { queryOptions, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

async function getUser(id: string) {
  return Promise.resolve<User>({ id, firstName: 'Luke', lastName: 'Morales' });
}

const userOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', { userId }] as const,
    queryFn: () => getUser(userId),
  });

const queryClient = useQueryClient();
const cacheData = queryClient.getQueryData(userOptions('user_AFKH8912389ASKOIP').queryKey);
//     ^? const cacheData: User | undefined

cacheData;
