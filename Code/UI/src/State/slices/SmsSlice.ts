import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface SMSState{
smppConnectStatus:boolean;
}

const initialState: SMSState = {
smppConnectStatus:false,
};

const SmsSlice = createSlice({
    name: 'SmsSlice',
    initialState:initialState,
    reducers:{
        setSMPPStatus:(state,action: PayloadAction<boolean>)=>{
            state.smppConnectStatus = action.payload;
        },
        resetState: () => initialState,
    }
})

export const {setSMPPStatus, resetState} = SmsSlice.actions;

export default SmsSlice.reducer;