import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { closeModal } from "../modal/modalSlice";
import postService from "./postService";



const initialState = {
  posts: [],
  error: null,
  status: "idle",  //'idle' | 'loading' | 'fulfilled' | 'failed'
};

//creat post
export const addPost = createAsyncThunk("posts/add", async (post, thunkAPI) => {
  const { rejectWithValue, dispatch } = thunkAPI;
  try {
    dispatch(closeModal());
    return await postService.addPost(post);
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// fetch all posts
export const fetchPosts = createAsyncThunk(
  "posts/fetchAll",
  async (_, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await postService.fetchAll();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// delete a post
export const deleteOne = createAsyncThunk(
  "posts/deleteOne",
  async (id, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    try {
      dispatch(closeModal());
      return await postService.deleteOne(id);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// update a post
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ id, form }, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    try {
      dispatch(closeModal());
      return await postService.updatePost(id, form);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//find a post by id
export const FindPost = createAsyncThunk(
  "posts/FindPost",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await postService.FindPost(id);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//like  post
export const likePost = createAsyncThunk(
  "posts/likePost",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      return await postService.likePost(id);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reset: (state) => {
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPost.pending, (state, action) => {
        state.status = "Loading";
        state.error = null;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(addPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = "Loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteOne.pending, (state, action) => {
        state.status = "Loading";
        state.error = null;
      })
      .addCase(deleteOne.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const { arg } = action.meta;
        if (arg) {
          state.posts = state.posts.filter((item) => item._id !== arg);
        }
      })
      .addCase(deleteOne.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updatePost.pending, (state, action) => {
        state.status = "Loading";
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.status = "fulfilled";

        const {
          arg: { id },
        } = action.meta;
        if (id) {
          state.posts = state.posts.map((item) =>
            item._id === id ? action.payload : item
          );
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(likePost.pending, (state, action) => {
        state.status = "Loading";
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const { arg } = action.meta;
        if (arg) {
          const posts = state.posts.filter((item) => item._id !== arg);
          state.posts = [...posts, action.payload];
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { reset } = postSlice.actions;
export default postSlice.reducer;