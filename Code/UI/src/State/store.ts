import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session"; // Use sessionStorage
import { combineReducers } from "redux";

// Import your reducers
import AuthenticationReducer, { resetState as resetAuthState } from "./slices/AuthenticationSlice";
import AdvertiserAccountSlice, { resetState as resetAdvertiserState } from "./slices/AdvertiserAccountSlice";
import whatsappSlice, { resetState as resetWhatsappState } from "./slices/WhatsappSlice";
import adminSlice, { resetState as resetAdminState } from "./slices/AdminSlice";
import OperatorSlice, { resetState as resetOperatorState } from "./slices/OperatorSlice"
import SmsSlice, { resetState as resetSmsState } from "./slices/SmsSlice";
import TemplateSlice, { resetState as resetTemplateState } from "./slices/TemplateSlice";
import CampaignSlice, { resetState as resetCampaignState } from "./slices/CampaignSlice";
// Combine reducers

const rootReducer = combineReducers({
  authentication: AuthenticationReducer,
  advertiserAccount: AdvertiserAccountSlice,
  whatsapp: whatsappSlice,
  admin:adminSlice,
  operator:OperatorSlice,
  sms:SmsSlice,
  template:TemplateSlice,
  campaign:CampaignSlice
});

// Define Redux Persist configuration
const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: "root", // Storage key prefix
  storage: storageSession, // Use sessionStorage instead of localStorage
  whitelist: ["authentication", "advertiserAccount", "admin","operator","template","campaign"], // Reducers to persist
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
});

// Create persistor
export const persistor = persistStore(store);

export const resetAppState = () => {
  store.dispatch(resetAuthState());
  store.dispatch(resetAdvertiserState());
  store.dispatch(resetWhatsappState());
  store.dispatch(resetAdminState());
  store.dispatch(resetOperatorState());
  store.dispatch(resetSmsState());
  store.dispatch(resetTemplateState());
  store.dispatch(resetCampaignState());

  persistor.purge();
};

// Define types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



// import { configureStore } from "@reduxjs/toolkit";
// import AuthenticationReducer from "./slices/AuthenticationSlice";
// import AdvertiserAccountSlice from "./slices/AdvertiserAccountSlice";
// import whatsappSlice from "./slices/WhatsappSlice";


// export const store = configureStore({
//     reducer: {
//         authentication: AuthenticationReducer,
//         advertiserAccount: AdvertiserAccountSlice,
//         whatsapp:whatsappSlice,
//     }
    
// })

// export type RootState = ReturnType<typeof store.getState>;
// export type  AppDispatch = typeof store.dispatch;



