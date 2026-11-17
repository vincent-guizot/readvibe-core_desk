import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchBook = createAsyncThunk('books/detail', async (id, { extra, rejectWithValue }) => {
  try {
    const response = await extra.booksApi.getById(id);
    return response.data;
  } catch (error) {
    return rejectWithValue({ message: error.message, status: error.statusCode });
  }
});

export const saveBook = createAsyncThunk('books/save', async ({ id, payload, coverFile, uploadedCoverUrl }, { extra, rejectWithValue }) => {
  let coverUrl = coverFile ? uploadedCoverUrl || null : null;
  try {
    if (coverFile && !coverUrl) {
      const uploaded = await extra.booksApi.uploadCover(coverFile);
      coverUrl = uploaded.data.url;
    }
    const body = coverUrl ? { ...payload, image: coverUrl } : payload;
    const response = id ? await extra.booksApi.update(id, body) : await extra.booksApi.create(body);
    return response.data;
  } catch (error) {
    return rejectWithValue({ message: error.message || 'Buku gagal disimpan.', uploadedCoverUrl: coverUrl });
  }
}, { condition: (_, { getState }) => !getState().books.save.loading });

export const deleteBook = createAsyncThunk('books/delete', async (id, { extra, rejectWithValue }) => {
  try {
    await extra.booksApi.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message || 'Buku gagal dihapus.');
  }
}, { condition: (_, { getState }) => !getState().books.remove.loading });

const idleMutation = () => ({ loading: false, error: null });
const initialState = {
  detail: { data: null, loading: false, error: null, status: null, requestId: null, bookId: null },
  save: idleMutation(),
  remove: idleMutation(),
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearBookFeedback(state) {
      state.save.error = null;
      state.remove.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBook.pending, (state, action) => {
        state.detail = { data: null, loading: true, error: null, status: null, requestId: action.meta.requestId, bookId: String(action.meta.arg) };
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.data = action.payload;
        state.detail.loading = false;
      })
      .addCase(fetchBook.rejected, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.loading = false;
        state.detail.error = action.payload?.message || action.error.message;
        state.detail.status = action.payload?.status || null;
      })
      .addCase(saveBook.pending, (state) => { state.save = { loading: true, error: null }; })
      .addCase(saveBook.fulfilled, (state) => { state.save = idleMutation(); })
      .addCase(saveBook.rejected, (state, action) => {
        state.save = { loading: false, error: action.payload?.message || action.error.message, uploadedCoverUrl: action.payload?.uploadedCoverUrl || null };
      })
      .addCase(deleteBook.pending, (state) => { state.remove = { loading: true, error: null }; })
      .addCase(deleteBook.fulfilled, (state) => { state.remove = idleMutation(); })
      .addCase(deleteBook.rejected, (state, action) => {
        state.remove = { loading: false, error: action.payload || action.error.message };
      });
  },
});

export const { clearBookFeedback } = booksSlice.actions;
export default booksSlice.reducer;
