import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RowData {
    buttonType: string;
    buttonText: string;
    buttonTypeDropdown: string;
    websiteUrl: string;
    countryCode: string;
    callPhoneNumber: string;
    copyOfferCode: string;
}

interface BoxItem {
    action: string;
}

interface TemplateState {
    platform: string;
    language: string;
    templateName: string;
    templateId: string;
    senderId: string;
    headerType: string;
    headerText: string;
    headerFile: File | null;
    bodyText: string;
    footerText: string;
    buttonRows: RowData[];
    channel: string;
    selectedOption: string;
    textInput: string;
    mediaBase64: string;
    boxes: BoxItem[];
}

// Load initial state from sessionStorage
const savedTemplate = sessionStorage.getItem("draftedTemplate");
const initialState: TemplateState = savedTemplate
    ? JSON.parse(savedTemplate)
    : {
          platform: "",
          language: "",
          templateName: "",
          templateId: "",
          senderId:"",
          headerType: "",
          headerText: "",
          headerFile: null,
          bodyText: "",
          footerText: "",
          buttonRows: [],
          channel: "",
          selectedOption: "",
          textInput: "",
          mediaBase64: "",
          boxes: [],
      };

const templateSlice = createSlice({
    name: "template",
    initialState,
    reducers: {
        setDraftedTemplate: (state, action: PayloadAction<Partial<TemplateState>>) => {
            const updatedState = { ...state, ...action.payload };
            sessionStorage.setItem("draftedTemplate", JSON.stringify(updatedState));
            return updatedState;
        },
        clearDraftedTemplate: () => {
            sessionStorage.removeItem("draftedTemplate");
            return initialState;
        },

        resetState: () => initialState,
    },
});

export const { setDraftedTemplate, clearDraftedTemplate, resetState } = templateSlice.actions;
export default templateSlice.reducer;
