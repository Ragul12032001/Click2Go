import React, { FC, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  BrowserRouter,
} from "react-router-dom";

import Checkout from "../Pages/Settings/CheckOut";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../State/store"; // Adjust based on your Redux store structure
import { useLocation } from "react-router-dom";
import { setmail } from "../State/slices/AuthenticationSlice";

import SignInPage from "../Pages/SignInPage";
import SignupPage from "../Pages/SignupPage";
import EmailVerificationPage from "../Pages/EmailVerificationPage";
import PersonalInfo from "../Pages/PersonalInfo";

import Navbar from "../Components/Navbar/Navbar";
import OperatorNavbar from "../Components/Navbar/OperatorNavbar";
import AdminNavbar from "../Admin/AdminNavbar/AdminNavbar";
import Layout from "../Components/Navbar/Layout";

import Dashboard from "../Pages/Dashboard";
import CampaignList from "../Pages/Campaign/CampaignList";
import CreateCampaign from "../Pages/Campaign/CreateCampaign";
import TemplateList from "../Pages/Templates/TemplateList";
import CreateTemplate from "../Pages/Templates/CreateTemplate";
import ChannelList from "../Pages/Channel/ChannelList";
import Audience from "../Pages/Audiences/Audience";
import Whatsapp from "../Pages/Channel/Whatsapp";

import Billing from "../Pages/Settings/Billing";
import Members from "../Pages/Settings/Members";
import Notification from "../Pages/Settings/Notification";
import Profile from "../Pages/Settings/Profile";
import WorkspaceSettings from "../Pages/Settings/Workspace_settings";

// Admin Pages
import AdminReport from "../Admin/AdminPages/Adminreports";

import AdminHome from "../Admin/AdminPages/AdminHome";
import Accounts from "../Admin/AdminPages/Accounts/AdminAccounts";
import AdminCampaignList from "../Admin/AdminPages/AdminCampaignList";
import AdminCampaignReview from "../Admin/AdminPages/AdminCampaignReview";
import Audiences from "../Admin/AdminPages/Audiences";
import AdminTeam from "../Admin/AdminPages/AdminTeam";
import Advertiser from "../Admin/AdminPages/advertiser";
import AdminPlans from "../Admin/AdminPages/Plans/AdminPlans";
import CreatePlans from "../Admin/AdminPages/Plans/CreatePlans";
import AdminChannelList from "../Admin/AdminPages/Channels/AdminChannelList";
import AdminSMS from "../Admin/AdminPages/Channels/AdminSMS";

// Operator Pages
import OperatorDashboard from "../Operator/OperatorDashboard";
import OperatorCampaignList from "../Operator/OperatorCampaignList";
import OperatorCampaignReview from "../Operator/OperatorCampaignReview";
import OperatorDataList from "../Operator/OperatorDataList";
import OperatorMembers from "../Operator/OperatorMembers";

// Import the new Protected Route Components
import ProtectedRoute from "./ProtectedRoute";
import ProtectedRouteWithPermissions from "./ProtectedRouteWithPermissions";
import SMS from "../Pages/Channel/SMS";
import AdminWhatsapp from "../Admin/AdminPages/Channels/AdminWhatsapp";
import UnderDev from "../Pages/UnderDev";
import SmsConnections from "../Admin/AdminPages/Channels/SmsConnections";
import SmsList from "../Admin/AdminPages/Channels/SmsList";
import Click2GOWA from "../Admin/AdminPages/Channels/Click2gowa";

const RoutesComponent: FC = () => {
  const [userEmailId, setUserEmailId] = useState("");
  const [authenticated, setAuthenticated] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  // Get user permissions from Redux
  const userPermissions = useSelector(
    (state: RootState) => state.advertiserAccount.permissions);
  console.log("Permissions :", userPermissions);

  // Get user permissions from Redux
  const userRoleName = useSelector(
    (state: RootState) => state.advertiserAccount.user_role_name);

  console.log("ROLE_NAME :", userRoleName);

  useEffect(() => {
    const impersonatedEmail = sessionStorage.getItem("impersonatedEmail");
    const email = sessionStorage.getItem("email");
  
    if (impersonatedEmail) {
      dispatch(setmail(impersonatedEmail));
      console.log("Impersonated Email Set:", impersonatedEmail);
    } else if (email) {
      dispatch(setmail(email));
      console.log("Original Email Set:", email);
    }
  }, [location]);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    setAuthenticated(!!email);  // Set true if email exists, false otherwise
  }, []);

  return (

    <Routes>
      <Route path="*" element={<Navigate to="/" />} />

      {/* Public Routes */}
      <Route
        path="/"
        element={<SignInPage setAuthenticated={setAuthenticated} setUserEmailId={setUserEmailId} />}
      />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/otpverify" element={<EmailVerificationPage />} />
      <Route path="/personalinfo" element={<PersonalInfo setAuthenticated={setAuthenticated} />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute authenticated={authenticated} />}>
        {/* Navbar Routes */}
        <Route path="/navbar" element={<Navbar setAuthenticated={setAuthenticated} />}>
          <Route path="dashboard" element={
            userRoleName === "Campaign Manager" ? <Navigate to="/navbar/campaignlist" /> :
              userRoleName === "Audience Manager" ? <Navigate to="/navbar/audiences" /> :
                userRoleName === "Channel Specialist" ? <Navigate to="/navbar/channels" /> :
                  <Dashboard />
          } />
          <Route path="campaignlist" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Campaigns_View"><CampaignList /></ProtectedRouteWithPermissions>} />
          <Route path="createcampaign" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Campaigns_Create"><CreateCampaign /></ProtectedRouteWithPermissions>} />
          <Route path="templatelist" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Template_View"><TemplateList /></ProtectedRouteWithPermissions>} />
          <Route path="createtemplate" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Template_Create"><CreateTemplate /></ProtectedRouteWithPermissions>} />
          <Route path="channels" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Channels_View"><ChannelList /></ProtectedRouteWithPermissions>} />
          <Route path="audiences" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Audience_View"><Audience /></ProtectedRouteWithPermissions>} />
          <Route path="whatsapp" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Channels_Edit"><Whatsapp /></ProtectedRouteWithPermissions>} />
          <Route path="sms" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Channels_Edit"><SMS /></ProtectedRouteWithPermissions>} />
          <Route path="push notification" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Channels_Edit"><UnderDev /></ProtectedRouteWithPermissions>} />
          <Route path="travelad" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Channels_Edit"><UnderDev /></ProtectedRouteWithPermissions>} />
          <Route path="indosat" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Channels_Edit"><UnderDev /></ProtectedRouteWithPermissions>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/adminNavbar" element={<AdminNavbar setAuthenticated={setAuthenticated} />}>
          <Route path="home" element={<AdminHome />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="campaigns" element={<AdminCampaignList />} />
          <Route path="campaignreview" element={<AdminCampaignReview />} />
          <Route path="channels" element={<AdminChannelList />} />
          <Route path="audiences" element={<Audiences />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="plans" element={<AdminPlans />} />
             <Route path="Reports" element={<AdminReport />} />
          <Route path="advertiser" element={<Advertiser />} />
          <Route path="createplans" element={<CreatePlans />} />
          <Route path="sms" element={<AdminSMS />} />
          <Route path="click2gowa" element={<Click2GOWA />} />
          <Route path="smslist" element={<SmsList />} />
          <Route path="smsConnections" element={<SmsConnections />} />
          <Route path="whatsapp" element={<AdminWhatsapp />} />
          <Route path="push notification" element={<UnderDev />} />
          <Route path="wechat" element={<UnderDev />} />
          <Route path="travelad(whatsapp)" element={<UnderDev />} />
          <Route path="indosat(whatsapp)" element={<UnderDev />} />
        </Route>

        {/* Operator Routes */}
        <Route path="/operatorNavbar" element={<OperatorNavbar setAuthenticated={setAuthenticated} />}>
          <Route path="dashboard" element={
            userRoleName === "Operator Campaign Manager" ? <Navigate to="/operatorNavbar/campaignlist" /> :
              <OperatorDashboard />
          } />

          <Route path="campaignlist" element={
            <ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="TO_Campaigns_View">
              <OperatorCampaignList />
            </ProtectedRouteWithPermissions>
          } />
          <Route path="campaignreview" element={
            <ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="TO_Campaigns_Edit">
              <OperatorCampaignReview />
            </ProtectedRouteWithPermissions>
          } />
          <Route path="datalist" element={
            <ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="TO_Data_View">
              <OperatorDataList />
            </ProtectedRouteWithPermissions>
          } />
          <Route path="members" element={
            <ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="TO_Members_View">
              <OperatorMembers />
            </ProtectedRouteWithPermissions>
          } />
        </Route>




        {/* Settings Routes */}
        <Route path="/settings" element={<Layout />}>
          <Route path="billing" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Billings_View"><Billing /></ProtectedRouteWithPermissions>} />
          <Route path="members" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Member_View"><Members /></ProtectedRouteWithPermissions>} />
          <Route path="notification" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Notification_View"><Notification email={userEmailId} /></ProtectedRouteWithPermissions>} />
          <Route path="profile" element={<Profile />} />
          <Route path="workspace" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Workspace_View"><WorkspaceSettings /></ProtectedRouteWithPermissions>} />
          <Route path="checkout" element={<ProtectedRouteWithPermissions permissions={userPermissions} requiredPermission="ADV_Billings_View"><Checkout/></ProtectedRouteWithPermissions>} />
        </Route>
      </Route>
    </Routes>

  );
};

export default RoutesComponent;
