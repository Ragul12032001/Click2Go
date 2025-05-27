// State/slices/CampaignSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CampaignState {
  campaignName: string;
  channel: string;
  template: string;
  selectedShortCode: string;
  selectedFromCountry: string[];   
  selectedToCountry: string[];    
  audience: string;                
  budgetType: string;             
  campaignBudget: string;         
  campaignStartDate: string;     
  campaignEndDate: string;     
  dailyRecipientLimit: string;  
  messageFrequency: string | null;
  sequentialDelivery: boolean;
  preventDuplicateMessages: boolean;
  deliveryStartTime: string | null;
  deliveryEndTime: string | null;

}

const savedCampaign = sessionStorage.getItem("draftedCampaign");
const initialState: CampaignState = savedCampaign
  ? JSON.parse(savedCampaign)
  : {
      campaignName: "",
      channel: "",
      template: "",
      selectedShortCode: "",
      selectedFromCountry: [],
      selectedToCountry: [],
      audience: "",
      budgetType: "",
      campaignBudget: "",
      campaignStartDate: "",
      campaignEndDate: "",
      dailyRecipientLimit: "",
      messageFrequency: "",
      sequentialDelivery: false,
      preventDuplicateMessages: false,
      deliveryStartTime: "",
      deliveryEndTime: ""

    };

const CampaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    setDraftedCampaign: (state, action: PayloadAction<Partial<CampaignState>>) => {
      const updated = { ...state, ...action.payload };
      sessionStorage.setItem("draftedCampaign", JSON.stringify(updated));
      return updated;
    },
    clearDraftedCampaign: () => {
      sessionStorage.removeItem("draftedCampaign");
      return {
        campaignName: "",
        channel: "",
        template: "",
        selectedShortCode: "",
        selectedFromCountry: [],
        selectedToCountry: [],
        audience: "",
        budgetType: "",
        campaignBudget: "",
        campaignStartDate: "",
        campaignEndDate: "",
        dailyRecipientLimit: "",
        messageFrequency: "",
        sequentialDelivery: false,
        preventDuplicateMessages: false,
        deliveryStartTime: "",
        deliveryEndTime: ""
      };
    },
    resetState: () => initialState, 
  },
});

export const { setDraftedCampaign, clearDraftedCampaign,resetState, } = CampaignSlice.actions;
export default CampaignSlice.reducer;
