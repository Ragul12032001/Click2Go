import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminState{
    InReviewCount:number;
}

const initialState: AdminState = {
    InReviewCount:0,
};

const OperatorSlice = createSlice({
    name: 'OperatorSlice',
    initialState:initialState,
    reducers:{
        SetCampaignInReviewCount:(state,action: PayloadAction<number>)=>{
            state.InReviewCount = action.payload;
        },
        resetState: () => initialState,
    }
})

export const {SetCampaignInReviewCount, resetState} = OperatorSlice.actions;

export default OperatorSlice.reducer;