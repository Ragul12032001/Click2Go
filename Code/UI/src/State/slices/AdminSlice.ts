import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Impersonator{
    ImpersonationState:boolean;
    ImpersonatorEmail:string;
    ImpersonatorWName:string;
    ImpersonatorWID:number;
    ImpersonatorRID:number;
    ImpersonatorAID:number;
}

interface AdminState{
InReviewCount:number;
Impersonator?:Impersonator;
}

const initialState: AdminState = {
InReviewCount:0,
Impersonator:undefined,
};

const AdminSlice = createSlice({
    name: 'AdminSlice',
    initialState:initialState,
    reducers:{
        SetCampaignInReviewCount:(state,action: PayloadAction<number>)=>{
            state.InReviewCount = action.payload;
        },
        SetImpersonator:(state,action: PayloadAction<Impersonator>)=>{
            state.Impersonator = action.payload;
        },
        resetState: () => initialState,
    }
})

export const {SetCampaignInReviewCount,SetImpersonator, resetState} = AdminSlice.actions;

export default AdminSlice.reducer;