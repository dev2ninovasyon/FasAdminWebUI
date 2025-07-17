import { createSlice } from "@reduxjs/toolkit";

interface StateType {
  id?: number | any;
  token?: string;
}

const initialState: StateType = {
  id: 0,
  token: "",
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setId: (state: StateType, action) => {
      state.id = action.payload;
    },
    setToken: (state: StateType, action) => {
      state.token = action.payload;
    },
    resetToNull: (state: StateType, action) => {
      if (action.payload == "") {
        state.id = undefined;
        state.token = undefined;
      }
    },
  },
});

export const { setId, setToken, resetToNull } = UserSlice.actions;

export default UserSlice.reducer;
