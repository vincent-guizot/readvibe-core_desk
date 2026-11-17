import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from '../../features/workspace/workspaceSlice';
import booksReducer from '../../features/books/booksSlice';
import { booksApi } from '../../services/catalog-api';

export const store = configureStore({
  reducer: { workspace: workspaceReducer, books: booksReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    thunk: { extraArgument: { booksApi } },
  }),
});
