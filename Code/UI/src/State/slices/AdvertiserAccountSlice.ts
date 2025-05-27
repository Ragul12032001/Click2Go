import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface Workspace {
    workspace_id: number;
    workspace_name: string;
    workspace_image: string;
  }

interface AdvAccState{
    createBreadCrumb:boolean,
    addWorkspaceFromDropdown: boolean,
    closeAddWorkspaceDialog: boolean,
    from_date: string,
    to_date: string,
    create_template_is_loading:boolean,
    incountry: string[],
    targetCountry: string | string[];
    currentCampaignData :string;
    permissions: string[],
    user_role_name: string,
    from_Admin: boolean,
    workspace_list: Workspace[];
    sent_count_sidenav: number,
    createCampaign: Boolean,
    workspace_count: number,
    total_available_count_sidenav:number,
    refreshTriggers: {
        [key: string]: boolean;
      };
}

const initialState:AdvAccState={
    createBreadCrumb:false,
    addWorkspaceFromDropdown:false,
    closeAddWorkspaceDialog:false,
    from_date: '',
    to_date:'',
    create_template_is_loading:true,
    incountry:["3","4","5"],
    targetCountry: "",
    currentCampaignData: "",
    permissions: [],
    user_role_name: '',
    from_Admin: false,
    workspace_list: [],
    sent_count_sidenav: 0,
    createCampaign: false,
    workspace_count: 0,
    total_available_count_sidenav:0,
    refreshTriggers: {},
}

const AdvertiserAccountSlice = createSlice({
    name: 'AdvertiserAccount',
    initialState:initialState,
    reducers:{
        setFromAdmin:(state,action: PayloadAction<boolean>) => {
            state.from_Admin = action.payload;
        },
        setCreateBreadCrumb:(state,action: PayloadAction<boolean>)=>{

            state.createBreadCrumb=action.payload;
        },

        setAddWorkspaceFromDropdown:(state,action: PayloadAction<boolean>)=>{
            state.addWorkspaceFromDropdown=action.payload;
        },
        setCloseAddWorkspaceDialog:(state,action: PayloadAction<boolean>)=>{
            state.closeAddWorkspaceDialog=action.payload;
        },
        setFromDate:(state,action: PayloadAction<string>)=>{
            state.from_date=action.payload;
        },
        setToDate:(state,action: PayloadAction<string>)=>{
            state.to_date=action.payload;
        },
        setCreateTemplateLoading:(state,action: PayloadAction<boolean>)=>{
            state.create_template_is_loading=action.payload;
        },
        setInCountry:(state,action: PayloadAction<string[]>)=>{
            state.incountry=action.payload;
        },
        setTargetCountry:(state,action: PayloadAction<string[]>)=>{
            state.targetCountry=action.payload;
        },

        setcurrentCampaignData:(state,action: PayloadAction<string>)=>{
            state.currentCampaignData=action.payload;
        },
        //For Setting Permissions
        setPermissions:(state,action: PayloadAction<string[]>) => {
            state.permissions = action.payload;
        } , 
        setUser_Role_Name:(state,action: PayloadAction<string>) => {
            state.user_role_name = action.payload;
        },
        setWorkspace_List:(state,action: PayloadAction<Workspace[]>) => {
            state.workspace_list = action.payload;
        },
        setSentCount:(state,action: PayloadAction<number>) => {
            state.sent_count_sidenav = action.payload;
        },
        setCreateCampaign:(state,action: PayloadAction<boolean>)=>{
            state.createCampaign=action.payload;
        },
        setWorkspace_Count:(state,action: PayloadAction<number>) => {
            state.workspace_count = action.payload;
        },
        setTotalAvailableCount:(state,action: PayloadAction<number>) => {
            state.total_available_count_sidenav = action.payload;
        },

        triggerRefresh: (state, action: PayloadAction<string>) => {
            state.refreshTriggers[action.payload] = true;
        },
        clearRefresh: (state, action: PayloadAction<string>) => {
            state.refreshTriggers[action.payload] = false;
        },

        resetState: () => initialState,
        
    }
})

export const {
    setCreateBreadCrumb,
    setAddWorkspaceFromDropdown,
    setCloseAddWorkspaceDialog,
    setCreateTemplateLoading,
    setInCountry,
    setTargetCountry,
    setcurrentCampaignData,
    setPermissions,
    setUser_Role_Name,
    setFromAdmin,
    setWorkspace_List,
    setSentCount,
    setCreateCampaign,
    setWorkspace_Count,
    setTotalAvailableCount,
    triggerRefresh,
    clearRefresh,
    resetState
} = AdvertiserAccountSlice.actions;

export default AdvertiserAccountSlice.reducer;