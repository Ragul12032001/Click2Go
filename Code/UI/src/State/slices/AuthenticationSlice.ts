import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interfaces for data structures
interface SignupData {
    email: string;
    phoneNumber: string;
    emailVerified: string;
    phoneVerified: string;
    password: string;

}

interface InviteTokenData {
    token: string;
}

interface PersonalInfo {
    firstName: string;
    email: string;
    lastName: string;
    emailSubscription: string;
    alternateNumber: string | null;
    city: string;
    country: number;
    address: string;
    languagePreference: number;
    gender: string;
    dateOfBirth: string;
    status: string;
    createdBy: number;
    createdDate: string;
    updatedBy: number;
    updatedDate: string;
    mappingId: number;
    base64Image: string;
    //
    fileName: string;

}

interface WorkspaceInfo {
    email: string;
    workspaceName: string;
    billingCountry: string;
    workspaceIndustry: string;
    workspaceType: string; // E.g., "Admin" or "Advertiser"
    status: string;
    createdBy: number;
    createdDate: string;
    updatedBy: number;
    updatedDate: string;
    mappingId: number;
    base64Image: string;
}

// const loadEmail = () => {
//     try {
//         return sessionStorage.getItem("userEmail") || "";
//     } catch (e) {
//         console.error("Could not load email from sessionStorage", e);
//         return "";
//     }
// };

interface LoginState {
    workspaceName: string;
    userEmail: string;
    isAuthenticated: boolean;
    isAdmin: boolean;
    count: number;
    workspace_id: number;
    role_id: number;
    workspaceType: string; // New field added for workspace type
    userData?: PersonalInfo;
    workspaceData?: WorkspaceInfo;
    signupData?: SignupData;
    authURL: string;
    apiURL: string;
    forgotPassword: boolean;
    forgotEmail: string;

    //Invite Members
    isInvited: boolean;
    inviteToken: InviteTokenData; // No longer optional
    account_id: number;
    billingcountry: string;

    authprofileback: boolean;

    //sarvash
    adminUrl: string;

    smsUrl: string;

    operatorUrl: string;

}

// Initial state
const initialState: LoginState = {
    workspaceName: "Admin",
    // userEmail: loadEmail(),
    userEmail: "",
    isAuthenticated: false,
    isAdmin: false,
    count: 0,
    workspace_id: 0,
    role_id: 0,
    workspaceType: "", // Initialize with an empty string
    userData: undefined,
    workspaceData: undefined,
    signupData: undefined,
    apiURL: "",
    forgotPassword: false,
    forgotEmail: "",


    //Tamil
    isInvited: false,
    inviteToken: { token: "" }, // Ensure it's always defined
    authprofileback: false,
    account_id: 0,
    billingcountry: "",

    //sarvash
    adminUrl: "",
    smsUrl: "",
    operatorUrl: "",
    authURL: "",
};



// Authentication Slice
const AuthenticationSlice = createSlice({
    name: "Authentication",
    initialState: initialState,
    reducers: {
        setAccountId: (state, action: PayloadAction<number>) => {
            state.account_id = action.payload;
        },

        setAuthProfileBack: (state, action: PayloadAction<boolean>) => {
            state.authprofileback = action.payload;
        },

        // Action to set the user email
        setmail: (state, action: PayloadAction<string>) => {
            state.userEmail = action.payload;
            // sessionStorage.setItem("userEmail", action.payload);
        },


        // Action to set the workspace ID
        setWorkspaceId: (state, action: PayloadAction<number>) => {
            state.workspace_id = action.payload;
        },


        setRoleId: (state, action: PayloadAction<number>) => {
            state.role_id = action.payload;
        },

        // Action to set the workspace name
        setworkspace: (state, action: PayloadAction<string>) => {
            state.workspaceName = action.payload;
        },

        // Action to set personal information
        setPersonalData: (state, action: PayloadAction<PersonalInfo>) => {
            state.userData = action.payload;
        },

        // Action to set workspace information
        setWorkspaceData: (state, action: PayloadAction<WorkspaceInfo>) => {
            state.workspaceData = action.payload;
            state.workspaceType = action.payload.workspaceType; // Automatically set workspaceType
        },

        // Action to set signup data
        setSignupData: (state, action: PayloadAction<SignupData>) => {
            state.signupData = action.payload;
        },

        // Action to set the API URL
        setAdvUrl: (state, action: PayloadAction<string>) => {
            state.apiURL = action.payload;
        },

        setAuthUrl: (state, action: PayloadAction<string>) => {
            state.authURL = action.payload;
        },

        // Action to toggle forgot password
        setForgotPassword: (state, action: PayloadAction<boolean>) => {
            state.forgotPassword = action.payload;
        },

        // Action to set the email for forgot password
        setForgotEmail: (state, action: PayloadAction<string>) => {
            state.forgotEmail = action.payload;
        },

        // Action to set workspace type directly (optional)
        setWorkspaceType: (state, action: PayloadAction<string>) => {
            state.workspaceType = action.payload;
        },

        setIsAdmin: (state, action: PayloadAction<boolean>) => {
            state.isAdmin = action.payload;
        },


        setIsInvited: (state, action: PayloadAction<boolean>) => {
            state.isInvited = action.payload;
        },

        setInviteToken: (state, action: PayloadAction<string>) => {
            state.inviteToken!.token = action.payload; // Use non-null assertion or safely update the token
        },

        setAdminUrl: (state, action: PayloadAction<string>) => {
            state.adminUrl = action.payload; // Use non-null assertion or safely update the token
        },

        setSmsUrl: (state, action: PayloadAction<string>) => {
            state.smsUrl = action.payload; // Use non-null assertion or safely update the token
        },

        setOperatorUrl: (state, action: PayloadAction<string>) => {
            state.operatorUrl = action.payload; // Use non-null assertion or safely update the token
        },

        setBaseBillingCountryAuth: (state, action: PayloadAction<string>) => {
            state.billingcountry = action.payload;
        },
        resetState: () => initialState,
    },

});

// Export actions and reducer
export const {
    setmail,
    setworkspace,
    setPersonalData,
    setSignupData,
    setIsAdmin,
    setWorkspaceData,
    setWorkspaceId,
    setRoleId,
    setAdvUrl,
    setForgotPassword,
    setForgotEmail,
    setWorkspaceType, // New action exported
    setIsInvited,
    setInviteToken,
    setAdminUrl,
    setAuthProfileBack,
    setSmsUrl,
    setOperatorUrl,
    setAccountId,
    setAuthUrl,
    setBaseBillingCountryAuth,
    resetState
} = AuthenticationSlice.actions;


export default AuthenticationSlice.reducer;