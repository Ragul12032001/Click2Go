import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WhatsappState{
    wabaId:string;
    phoneId:string;
    code:string;
}

const initialState:WhatsappState={
    wabaId:"",
    phoneId:"",
    code:"",
}

const WhatsappSlice = createSlice({
    name: 'WhatsappSlice',
    initialState:initialState,
    reducers:{
        setWabaId:(state,action: PayloadAction<string>)=>{

            state.wabaId=action.payload;
        },
        setPhoneId:(state,action: PayloadAction<string>)=>{
            state.phoneId=action.payload;
        },
        setCode:(state,action:PayloadAction<string>)=>{
            state.code=action.payload;
        },
        resetState: () => initialState,
        
    }
}) 

export const {setWabaId,setPhoneId,setCode, resetState} = WhatsappSlice.actions;

export default WhatsappSlice.reducer;