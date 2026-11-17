import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getWorkspaceResource, resourceEndpoints } from '../../services/workspace-api';

export const fetchResource = createAsyncThunk(
  'workspace/fetchResource',
  async (resource, { rejectWithValue }) => {
    try {
      return await getWorkspaceResource(resource);
    } catch (error) {
      return rejectWithValue(error.message || 'Data gagal dimuat.');
    }
  },
  { condition: (resource, { getState }) => !getState().workspace[resource]?.loading },
);

const objectResources = ['dashboardData', 'wishlistIntelligence', 'readingTrends'];
const initialState = Object.fromEntries(Object.keys(resourceEndpoints).map((key) => [
  key, { data: objectResources.includes(key) ? null : [], loading: false, error: null, requestId: null },
]));

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResource.pending, (state, action) => {
        const resource = state[action.meta.arg];
        resource.loading = true;
        resource.error = null;
        resource.requestId = action.meta.requestId;
      })
      .addCase(fetchResource.fulfilled, (state, action) => {
        const resource = state[action.meta.arg];
        if (resource.requestId !== action.meta.requestId) return;
        resource.data = action.payload;
        resource.loading = false;
      })
      .addCase(fetchResource.rejected, (state, action) => {
        const resource = state[action.meta.arg];
        if (resource.requestId !== action.meta.requestId) return;
        resource.loading = false;
        resource.error = action.payload || action.error.message;
      });
  },
});

export const refreshWorkspace = () => (dispatch) => Promise.all(
  Object.keys(resourceEndpoints).map((resource) => dispatch(fetchResource(resource))),
);
export default workspaceSlice.reducer;
