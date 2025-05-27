import React, {
  FC,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import "./CSS/LoginPage.css";
import Logo from "../Assets/Logo.svg";
import LoginImage from "./../Assets/LoginBackground.png";
import loginVideoUrls from "../Assets/LogInVideos.json"
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
// import { ToastContainer, toast } from "react-toastify";
import config from "../config.json";
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import "../Styles/globals.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { UseSelector } from "react-redux";
import {
  setAccountId,
  setAuthProfileBack,
  setBaseBillingCountryAuth,
  setworkspace,
  setWorkspaceData,
  setWorkspaceId,
} from "../State/slices/AuthenticationSlice";
import {
  setCloseAddWorkspaceDialog,
  setPermissions,
  setUser_Role_Name,
} from "../State/slices/AdvertiserAccountSlice";
import { RootState } from "../State/store";
import { useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";
import { Weight } from "lucide-react";
import { error } from "console";
import { Dialpad } from "@mui/icons-material";

interface CustomWorkspaceControlProps {
  setNext: React.Dispatch<React.SetStateAction<boolean>>; // Type for setNext
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CustomWorkspaceControl: FC<CustomWorkspaceControlProps> = ({
  setNext,
  setAuthenticated
}) => {
  const [companyName, setCompanyName] = useState("");
  const [CompanyNameError, setFirstNameError] = useState<string | null>(null);

  const [billingCountry, setBillingCountry] = useState(""); // Default is "United Arab Emirates"

  const [selectedIndustry, setSelectedIndustry] = useState("");

  const [selectedWorkspaceType, setSelectedWorkspaceType] =
    useState(""); //Default to "Advertiser"

  const [fileName, setFileName] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const location = useLocation();
  const email = location.state?.email || "";
  const [apiUrl, setApiUrl] = useState("");
  const [authapiUrl, setAuthApiUrl] = useState("");

  const [countries, setCountries] = useState<{ id: number; label: string }[]>(
    []
  );
  const [industries, setIndustries] = useState<{ id: number; label: string }[]>(
    []
  );
  const [workspace_types, SetWorkspaceTypes] = useState<
    { id: number; label: string }[]
  >([]);

  const emailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const workspaceList = useSelector(
    (state: RootState) => state.advertiserAccount.workspace_list
  ); // ✅ Access workspace list from Redux
  
  const workspaceNames = workspaceList.map((workspace) => workspace.workspace_name.toLowerCase().trim()); // Extract workspace names only
  

  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // State to track button disable status

  //
  const [loading, setLoading] = useState(true);
  const [OperatorType, setOperatorType] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const signupData = useSelector(
    (state: RootState) => state.authentication.signupData
  );
  useEffect(() => {
    console.log("signupData:", signupData);
  }, [signupData]); // Log signupData whenever it changes

  const personalData = useSelector(
    (state: RootState) => state.authentication.userData
  );
  const addWorkspaceFromDropdown = useSelector(
    (state: RootState) => state.advertiserAccount.addWorkspaceFromDropdown
  );

  const [baseBillingCountry, setBaseBillingCountry] = useState("");
  const baseworkspace_id = useSelector((state: RootState) => state.authentication.workspace_id);
  const advUrl = useSelector((state: RootState) => state.authentication.apiURL);
  const baseBillingCountryCode = useSelector((state: RootState) => state.authentication.billingcountry);


  const isAdmin = useSelector(
    (state: RootState) => state.authentication.isAdmin
  );
  console.log(isAdmin);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    GetWorkspaceDetailsByID();
    fetch("/config.json")
      .then((response) => response.json())
      .then((config) => {
        //console.log("config :", config);
        setApiUrl(config.API_URL); // Set the API URL from config
        setAuthApiUrl(config.API_URL); // set the Auth URL from config
      })
      .catch((error) => {
        console.error("Error loading config:", error);
        toast.toast({
          title: "Error",
          description: "Something went wrong, please try again.",
        });
      });
  }, []);

  // Fetch domain list from API
  useEffect(() => {
    if (apiUrl) {
      fetchData();
    }
  }, [apiUrl]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch countries
      const countriesPromise = axios.get(`${apiUrl}/GetCountryList`);
      const industriesPromise = axios.get(`${apiUrl}/GetIndustryList`);
      const workspacePromise = axios.get(`${apiUrl}/GetWorkspaceTypesList`);
      
      // useEffect(() => {
      //   if (baseworkspace_id) {
      //     GetIndustryList("Technology");
      //   }
      // }, [baseworkspace_id]);

      // Wait for all promises to resolve
      const [countriesResponse, industriesResponse, workspaceResponse] =
        await Promise.all([
          countriesPromise,
          industriesPromise,
          workspacePromise,
        ]);

      // Transform and set countries
      if (countriesResponse.data?.countryList) {
        const countries = countriesResponse.data.countryList.map(
          (country: { country_id: number; country_name: string }) => ({
            id: country.country_id,
            label: country.country_name,
          })
        );
        setCountries(countries);
      } else {
        console.log("No countries available in response.");
      }

      // Transform and set industries
      if (industriesResponse.data?.industryList) {
        const industries = industriesResponse.data.industryList.map(
          (industry: { industry_id: number; industry_name: string }) => ({
            id: industry.industry_id,
            label: industry.industry_name,
          })
        );
        setIndustries(industries);
      } else {
        console.log("No industries available in response.");
      }

      // Transform and set workspace types
      if (workspaceResponse.data?.workspaceTypes) {
        const workspaceTypes = workspaceResponse.data.workspaceTypes.map(
          (workspace: { workspace_id: number; workspace_name: string }) => ({
            id: workspace.workspace_id,
            label: workspace.workspace_name,
          })
        );
        SetWorkspaceTypes(workspaceTypes);
      } else {
        console.log("No workspace types available in response.");
      }
    } catch (error) {
      console.error("Error fetching list data:", error);
      toast.toast({
        title: "Error",
        description: "Something went wrong, Please try again",
      });
    } finally {
      setLoading(false); // Ensure loading is stopped in all cases
    }
  };

  const checkOperatorType = (value: any) => {
    debugger;
    if (value === "2") {
      setOperatorType(true);
    } else {
      setOperatorType(false);
    }
  };

  const validateCompanyName = (value: string): boolean => {

    if (value.length === 0) {
      setFirstNameError("Company name cannot be empty.");
      return false;
    }

    // First character should NOT be a special character (letters & numbers allowed)
    const firstChar = value.charAt(0);
    const firstCharRegex = /^[a-zA-Z0-9]/; // Allows letters and numbers

    // Last character should NOT be a special character (letters & numbers allowed)
    const lastChar = value.charAt(value.length - 1);
    const lastCharRegex = /^[a-zA-Z0-9]$/; // Allows letters and numbers

    // Ensure spaces are allowed in between but not at the start or end
    if (!firstCharRegex.test(firstChar)) {
      setFirstNameError('First character should not be a special character or space.');
      return false;
    } else if (!lastCharRegex.test(lastChar)) {
      setFirstNameError('Last character should not be a special character or empty space.');
      return false;
    } else {
      setFirstNameError('');
    }

    setCompanyName(value);
    setFirstNameError(null);
    return true;
  };

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateCompanyName(value)) {
      console.log("Company Name is correct");
    } else {
      console.log("Company Name is incorrect");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setFileName("");
      return;
    }

    const validFileTypes = ["image/jpeg", "image/png"];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const dotCount = (file.name.match(/\./g) || []).length;
    if (dotCount > 1) {
      toast.toast({
        title: "Error",
        description: "Invalid File name.",
      });
      setFileName('');
      return;
    }

    // Check file type
    if (!validFileTypes.includes(file.type)) {
      toast.toast({
        title: "Error",
        description: "Please select a valid image (PNG or JPEG).",
      });
      setFileName("");
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      toast.toast({
        title: "Error",
        description: "File size should not exceed 5MB.",
      });
      setFileName("");
      return;
    }

    // Check image dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 400 || img.height < 400) {
          toast.toast({
            title: "Error",
            description: "Image dimensions must be at least 400x400 pixels.",
          });
          setFileName("");
        } else {
          // Valid image

          setFileName(file.name);

          // Convert image to Base64
          const base64String = reader.result?.toString().split(",")[1]; // Remove metadata
          setBase64Image(base64String || "");
        }
      };
      img.onerror = () => {
        toast.toast({
          title: "Error",
          description: "Invalid image file.",
        });
        setFileName("");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddWorkspaceFromDropdown = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (CompanyNameError) return;
    if (!baseBillingCountry) {
      toast.toast({
        title: "Something went wrong , please try again."
      })
      console.log("Billing country not set");
      return;
    }
    if (workspaceNames.includes(companyName.toLowerCase().trim())) {
      toast.toast({
        title: "Error",
        description: "Company name already exists for this email.",
      });
      console.log("Duplicate Company Name Found:", companyName);
      return; // Stop further execution if name already exists
    }
    setIsButtonDisabled(true); // Disable the button
    console.log("BILLING :", baseBillingCountry);
    console.log("Base Billing Country Code :", baseBillingCountryCode);
    const payload = {
      email: emailId,
      workspaceName: companyName,
      billingCountry: baseBillingCountryCode ? baseBillingCountryCode.toString() : "0",
      workspaceIndustry: selectedIndustry === "Tourism" ? "11" : selectedIndustry,
      workspaceType: selectedWorkspaceType === "Advertiser" ? "1" : selectedWorkspaceType,
      status: "active",
      createdBy: 1,
      createdDate: new Date().toISOString(),
      updatedBy: 1,
      updatedDate: new Date().toISOString(),
      mappingId: 0,
      base64Image,
    };

    console.log("Dialog data:", JSON.stringify(payload, null, 2));

    try {
      const workspaceId = await createWorkspace(payload);
      if (!workspaceId) throw new Error("Failed to retrieve workspace ID");

      await assignUserRoleDropdown(emailId); // Uses your existing function
      await insertbillingstatus(workspaceId);


      // Update Redux state
      dispatch(setworkspace(companyName));
      dispatch(setWorkspaceId(workspaceId));
      setAuthenticated(true);
      dispatch(setCloseAddWorkspaceDialog(true));


      setTimeout(() => {
        toast.toast({
          title: "Success",
          description: "Created Workspace",
        });
        navigate("/navbar/dashboard", {
          state: { path: companyName, email: emailId },
        });
      }, 1000);
    } catch (error) {
      handleError(error); // Uses your existing error handler
    } finally {
      setIsButtonDisabled(false);
    }
  };


  useEffect(() => {
    console.log("addworkspace: " + addWorkspaceFromDropdown);
  });


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (CompanyNameError) return;

    setIsButtonDisabled(true); // Disable the button when clicked
    setLoading(true);

    const payload = {
      email: emailId,
      workspaceName: companyName,
      billingCountry: billingCountry === "United Arab Emirates" ? "14" : billingCountry,
      workspaceIndustry: (selectedIndustry === "Tourism" ? "11" : selectedIndustry).toString(),
      workspaceType: (selectedWorkspaceType === "Advertiser" ? "1" : selectedWorkspaceType).toString(),
      status: "active",
      createdBy: 1,
      createdDate: new Date().toISOString(),
      updatedBy: 1,
      updatedDate: new Date().toISOString(),
      mappingId: 0,
      base64Image,
    };

    console.log("Payload being sent:", payload);

    dispatch(setworkspace(companyName));
    dispatch(setWorkspaceData(payload));
    dispatch(setBaseBillingCountryAuth(billingCountry));

    try {
      await registerUser();
      await insertPersonalInfo();
      const workspaceId = await createWorkspace(payload);
      if (!workspaceId) throw new Error("Failed to retrieve workspace ID");

      dispatch(setWorkspaceId(workspaceId));
      const selectedMode = (selectedWorkspaceType === "2" ? "InsertOperator" : "InsertAdmin");
      await assignUserRole(email, selectedMode);
      const { path, workspaceType } = await fetchWorkspaceDetails(email);
      const selected_role_id = (selectedWorkspaceType === "2") ? 11 : isAdmin ? 1 : 2;
      await fetchAndStorePermissions(selected_role_id);
      await insertbillingstatus(workspaceId);
      await getaccountId(email);

      toast.toast({
        title: "SignUp Successful",
        description: "You have successfully signed up for our platform.",
      });

      setTimeout(() => {
        navigate(workspaceType === "Telecom Operator" ? "/operatorNavbar/dashboard" : "/navbar/dashboard", { state: { path, email } });
        setNext(true);
      }, 2000);
    } catch (error) {
      handleError(error);
    } finally {
      setIsButtonDisabled(false);
      setLoading(false);
    }
  };

  // API Helper Functions
  const registerUser = async () => {
    const response = await axios.post(`${apiUrl}/UserRegister`, signupData);
    if (response.data[0].Status !== "Success") throw new Error("User registration failed");
  };

  const getaccountId = async (Email: string) =>{
    const Account_response = await axios.post(`${apiUrl}/GetUserAccountByEmail`, {
      email: Email
    });
    if (Account_response.data[0]?.Status === "Success") {
      const userAccountId = Account_response.data[0]?.User_Account_Id;
      dispatch(setAccountId(userAccountId));
      console.log("Account_ID :" , userAccountId); 
    } else {
      console.log("User account ID not found");
    }
  }
 

  const insertPersonalInfo = async () => {
    const response = await axios.post(`${apiUrl}/InsertUserPersonalInfo`, personalData);
    if (response.data.status !== "Success") throw new Error("Failed to insert personal data");
  };

  const createWorkspace = async (payload: any) => {
    const response = await axios.post(`${apiUrl}/InsertWorkspaceInfo`, payload);
    if (response.data.status !== "Success") throw new Error("Failed to create workspace");
    return response.data.workspaceId;
  };

  const assignUserRole = async (email: string, selectedMode: string) => {
    const response = await axios.post(`${apiUrl}/InsertUserWorkspaceRole`, { Mode: selectedMode, EmailId: email });
    if (response.status !== 200 || response.data.status !== "Success") throw new Error("Failed to assign user role");
  };

  const assignUserRoleDropdown = async (email: string) => {
    const response = await axios.post(`${apiUrl}/InsertUserWorkspaceRole`, { Mode: "InsertAdmin", EmailId: email });
    if (response.status !== 200 || response.data.status !== "Success") throw new Error("Failed to assign user role");
  };

  const fetchWorkspaceDetails = async (email: string) => {
    const response = await axios.get(`${apiUrl}/GetWorkspaceNameByEmail?EmailId=${email}`);
    if (response.status !== 200 || response.data.status !== "Success") throw new Error("Failed to fetch workspace details");

    return {
      path: response.data.workspaceName.workspace_name || "Admin",
      workspaceId: response.data.workspaceName.workspace_id,
      workspaceType: response.data.workspaceName.workspace_type,
    };
  };

  const insertbillingstatus = async (workpaceid: number) => {
    const response = await axios.post(`${apiUrl}/InsertWorkspaceBillingStatus?workspaceid=${workpaceid}`);
    if (response.data.status !== "Success") throw new Error(response.data.status_description || "Failed to insert billing details");
    setAuthenticated(true);
  };

  const fetchAndStorePermissions = async (roleId: number) => {
    const response = await axios.get(`${apiUrl}/GetPermissionsByRoleId?RoleID=${roleId}`);
    if (response.data.status !== "Success") throw new Error(response.data.status_description || "Failed to fetch permissions");

    const permissions = JSON.parse(response.data.roleDetails.permissions);
    const role_name = response.data.roleDetails.roleName;
    dispatch(setPermissions(permissions));
    dispatch(setUser_Role_Name(role_name));
  };

  const handleError = (error: any) => {
    console.error("Error:", error);
    toast.toast({
      title: "Error",
      description: error.message || "An unexpected error occurred. Please try again.",
    });
  };

  const GetWorkspaceDetailsByID = async () => {
    axios
      .post(`${advUrl}/GetWorkspaceDetailsByWorkspaceID`, {
        workspaceId: baseworkspace_id, // Email ID for the user
      })
      .then((response) => {
        console.log("response:", response);

        if (response.data.length > 0 && response.data[0].Status === "Success") {
          const Billing_Country = response.data[0].Billing_Country;
          console.log("Billing_Country:", Billing_Country);
          // Parse and update address details
          if (Billing_Country) {
            try {
              console.log("Address details:", Billing_Country);
              setBaseBillingCountry(Billing_Country);
            } catch (error) {
              console.error("Error parsing address:", error);
            }
          }
        } else {
          console.error(
            "Failed to get user details:",
            response.data[0]?.Status_Description
          );
        }
      })
      .catch((error) => {
        console.error("Error in submitting form:", error);
      });
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackButton = () => {
    dispatch(setAuthProfileBack(true));
    setNext(false);
  };

  return (
    <>
      {
        (!addWorkspaceFromDropdown ? (
          <>
            {loading && (
              <div className="loading-overlay flex items-center justify-center h-screen">
                <CircularProgress color="success" />
              </div>
            )}

            <Container maxWidth="xs" sx={{ padding: 2 }}>
              <Toaster />
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="pageprogress"
                    className="whitespace-nowrap text-left"
                    style={{
                      fontSize: "14px",
                      color: "#71717A",
                      fontWeight: 400,
                    }}
                  >
                    2/2
                  </Label>
                  <ArrowLeftIcon
                    onClick={handleBackButton}
                    className="cursor-pointer"
                  />
                </div>

                <span
                  style={{ textAlign: "left" }}
                  className="text-[24px] text-[#09090B] font-semibold mb-0"
                >
                  Create your workspace
                </span>

                <div className="grid w-full max-w-md items-start gap-1.5 mt-1">
                  <Label
                    htmlFor="companyLogo"
                    className="whitespace-nowrap text-left font-medium text-[14px] text-[#020617] mb-1 "
                    style={{ marginTop: "2rem" }}
                  >
                    Company logo
                  </Label>
                  <div className="flex w-full items-center gap-2">
                    <Input
                      type="text"
                      value={fileName}
                      readOnly
                      className="flex-grow w-[80%] border-[#E2E8F0] placeholder-[#64748B]"
                      placeholder="Choose File   No file chosen"
                      style={{ fontWeight: 500 }}
                    />
                    <Button
                      type="button"
                      onClick={handleUploadClick}
                      className="font-medium text-[14px] bg-[#F1F5F9] w-[30%] text-[#0F172A] hover:bg-gray-300 focus:ring-[#F1F5F9]  mt--1"
                      style={{
                        height: "2.2rem",
                        padding: "0 0.5rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      Upload image
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="companyLogo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <p
                    className="text-sm text-gray-500 mt-0"
                    style={{
                      textAlign: "left",
                      fontSize: "13px",
                      color: "#64748B",
                    }}
                  >
                    * .png, * .jpeg files up to 5MB at least 400px by 400px
                  </p>
                </div>

                <div className="grid w-full max-w-md items-start gap-1.5">
                  <Label
                    htmlFor="companyname"
                    className="whitespace-nowrap text-left font-medium text-[14px] text-[#020617]"
                    style={{ marginTop: "0.6rem" }}
                  >
                    Company name
                  </Label>
                  <Input
                    required
                    id="companyname"
                    placeholder="Enter your company name.."
                    className="w-full border-gray-200 placeholder:font-normal placeholder:text-[#64748B] rounded-[7px] custom-placeholder"
                    onChange={handleFirstNameChange}
                  />
                  {CompanyNameError && (
                    <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">
                      {CompanyNameError}
                    </p>
                  )}
                </div>


                <div className="grid w-full max-w-md items-start gap-1.5">
  <Label
    htmlFor="workspacetype"
    className="whitespace-nowrap text-left font-medium text-[14px] text-[#020617] mb-1 "
    style={{ marginTop: "0.6rem" }}
  >
    Workspace type
  </Label>
  <Select
    onValueChange={(value) => {
      console.log("Raw Value from Dropdown:", value); // Log the raw value
      setSelectedWorkspaceType(value); // Update state
      checkOperatorType(value);
    }}
  >
    <SelectTrigger className="w-full border border-gray-200 px-4 py-2 rounded-md flex justify-between items-center text-[#64748B]">
      <span className={selectedWorkspaceType ? "text-black" : "text-[#64748B]"}>
        {selectedWorkspaceType || "Select your workspace type"}
      </span>
    </SelectTrigger>

    <SelectContent className="z-50 max-h-60 overflow-auto w-[100%]"> {/* Fixed width */}
      {workspace_types.map((data) => (
        <SelectItem
          className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
          key={data.id}
          value={data.label}
        >
          {data.label} {/* Simplified to avoid extra structure causing double check marks */}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="grid w-full max-w-md items-start gap-1.5">
  <Label
    htmlFor="companyindustry"
    className="whitespace-nowrap text-left font-medium text-[14px] text-[#020617] mb-1"
    style={{ marginTop: "0.6rem" }}
  >
    Industry
  </Label>

  <Select
    onValueChange={(value) => {
      console.log("Raw Value from Dropdown:", value);
      setSelectedIndustry(value);
    }}
  >
    <SelectTrigger className="ww-full border-gray-200 relative px-4 py-2 rounded-md flex justify-between items-center text-[#64748B]">
  <span className={selectedIndustry ? "text-black" : "text-[#64748B]"}>
    <SelectValue placeholder="Select your industry" />
  </span>
</SelectTrigger>


    {/* <SelectTrigger className="w-full border border-gray-200 px-4 py-2 rounded-md flex justify-between items-center text-[#64748B]">
      <SelectValue placeholder={selectedIndustry} />
      {/* <span className={selectedIndustry ? "text-black" : "text-[#64748B]"}>
        {selectedIndustry || "Select your industry"}
      </span> */}
    {/* </SelectTrigger> */} 

    <SelectContent className="z-50 max-h-40 overflow-auto w-full"> {/* Fixed width */}
      {industries.map((data) => (
        <SelectItem
          className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
          key={data.id}
          value={data.id.toString()}
        >
          <div className="flex items-center w-full">
                            <span className="cursor-pointer">{data.label}</span>
                            {(selectedIndustry === data.label) && (
                              <CheckIcon />
                            )}
                          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="grid w-full max-w-md items-start gap-1.5">
  <Label
    htmlFor="billingcountry"
    className="whitespace-nowrap text-left font-medium text-[14px] text-[#020617] mb-1 "
    style={{ marginTop: "0.6rem" }}
  >
    {OperatorType ? "Country" : "Billing Country"}
  </Label>

  <Select
    onValueChange={(value) => {
      console.log("Raw Value from Dropdown:", value);
      setBillingCountry(value);
    }}
  >


    <SelectTrigger className="w-full border-gray-200 relative px-4 py-2 rounded-md flex justify-between items-center text-[#64748B]">
      <span className={billingCountry ? "text-black" : "text-[#64748B]"}>
      <SelectValue placeholder="Select your billing country" />
      </span>
    </SelectTrigger>

    <SelectContent className="z-50 max-h-[120px] overflow-auto w-[100%]"> {/* Fixed width */}
      {countries.map((country) => (
        <SelectItem
          className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
          key={country.id}
          value={country.id.toString()}
        >
            <div className="flex items-center w-full">
              <span className="cursor-pointer">{country.label}</span>
                            {billingCountry === country.label&& (
                              <CheckIcon/>
                            )}
                          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


                <Button
                  type="submit"
                  className="w-full mt-4 bg-[#007AFF] text-[#FAFAFA] font-medium text-[14px] form-button"
                  style={{
                    padding: "0.4rem",
                    height: "2rem",
                  }}
                  disabled={isButtonDisabled} // Disable the button
                >
                  {isButtonDisabled ? "Processing..." : "Complete"}
                </Button>
              </Box>
            </Container>
          </>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center">
                <CircularProgress color="success" />
              </div>
            ) : (
              <Box
                component="form"
                onSubmit={handleAddWorkspaceFromDropdown}
                sx={{ display: "flex", flexDirection: "column" }}
                className="space-y-3"
              >
                <div className="grid w-full items-start gap-1.5">
                  <Label
                    htmlFor="companyLogo"
                    className="whitespace-nowrap text-left"
                    style={{
                      fontSize: "14px",
                      color: "#020617",
                      fontWeight: 500,
                    }}
                  >
                    Company logo
                  </Label>
                  <div className="flex w-full items-center gap-2">
                    <Input
                      type="text"
                      value={fileName}
                      readOnly
                      className="flex-grow w-[80%] border-gray-400"
                      placeholder="Choose File   No file chosen"
                    />
                    <Button
                      type="button"
                      onClick={handleUploadClick}
                      className="bg-gray-200 w-[30%]  hover:bg-gray-300 focus:ring-gray-400 h-8.1 mt--1 form-button"
                    >
                      Upload image
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="companyLogo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontSize: "0.78rem", marginTop: "0.2rem" }}
                  >
                    *.png, *.jpeg files up to 5MB at least 400px by 400px
                  </p>
                </div>

                <div className="grid w-full items-start gap-1.5 mt-2">
  <Label
    htmlFor="companyname"
    className="whitespace-nowrap text-left"
    style={{
      fontSize: "14px",
      marginTop: "0.9rem",
      color: "#020617",
      fontWeight: 500,
    }}
  >
    Company name
  </Label>
  <Input
    required
    id="companyname"
    placeholder="Enter your company name.."
    className="w-full border-gray-400 rounded-[7px] custom-placeholder"
    onChange={handleFirstNameChange}
  />
  {CompanyNameError && (
    <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">
      {CompanyNameError}
    </p>
  )}
</div>

<div className="grid w-full items-start gap-1.5 mt-2">
  <Label
    htmlFor="billingcountry"
    className="whitespace-nowrap text-left"
    style={{
      fontSize: "14px",
      marginTop: "0.9rem",
      color: "#020617",
      fontWeight: 500,
    }}
  >
    Billing country
  </Label>
  <Input
    required
    id="billingcountry"
    placeholder={baseBillingCountry}
    className="w-full border-gray-400 rounded-[7px] custom-placeholder"
    disabled
  />
</div>

<div className="grid w-full items-start gap-1.5 mt-2">
  <Label
    htmlFor="companyindustry"
    className="whitespace-nowrap text-left"
    style={{
      fontSize: "14px",
      marginTop: "0.9rem",
      color: "#020617",
      fontWeight: 500,
    }}
  >
    Company industry
  </Label>
  <Select
    onValueChange={(value) => {
      console.log("Raw Value from Dropdown:", value);
      setSelectedIndustry(value);
    }}
    defaultValue={selectedIndustry === "Tourism" ? "11" : selectedIndustry}
  >
    <SelectTrigger className="w-full border-gray-200 text-gray-500">
      <SelectValue placeholder="Select your industry" />
    </SelectTrigger>
    <SelectContent className="absolute z-50 top-full max-h-40 overflow-auto">
      {industries.map((data) => (
        <SelectItem 
          className="cursor-pointer"
          key={data.id} 
          value={data.id.toString()}
          textValue={data.label} // Use textValue to avoid adding check in item text
        >
          {data.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="grid w-full items-start gap-1.5 mt-2">
  <Label
    htmlFor="workspacetype"
    className="whitespace-nowrap text-left"
    style={{
      fontSize: "14px",
      marginTop: "0.9rem",
      color: "#020617",
      fontWeight: 500,
    }}
  >
    Workspace type
  </Label>
  <Select
    onValueChange={(value) => {
      console.log("Raw Value from Dropdown:", value);
      setSelectedWorkspaceType(value);
    }}
    defaultValue={selectedWorkspaceType === "Advertiser" ? "1" : selectedWorkspaceType}
  >
    <SelectTrigger className="w-full border-gray-200 text-gray-500">
      <SelectValue placeholder="Select your workspace type" />
    </SelectTrigger>
    <SelectContent className="absolute z-50 top-full max-h-20 overflow-auto">
      {workspace_types
        .filter((data) => data.label !== "Telecom Operator")
        .map((data) => (
          <SelectItem 
            className="cursor-pointer" 
            key={data.id} 
            value={data.id.toString()}
            textValue={data.label}
          >
            {data.label}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>
                <Button
                  type="submit"
                  className="w-full mt-2 bg-[#007AFF] text-[14px] font-medium form-button"
                  disabled={isButtonDisabled} // Disable the button
                >
                  {isButtonDisabled ? "Processing..." : "Complete"}
                </Button>
              </Box>
            )}
          </>
        ))}
    </>
  );
};
debugger

const Workspace: FC = () => {
  const loginVideo = loginVideoUrls.LogInVideoUrl;
  return (
    <div className="login-page" style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          position: "fixed",
          top: "30px",
          left: "30px",
          zIndex: 20,
        }}
      >
        <img src={Logo} alt="Logo" style={{ width: "170px", height: "auto" }} />
      </div>
      <div
        className="left-pane"
        style={{
          flex: "1",
          // backgroundImage: url(${figmaPageImage}),
          // backgroundSize: 'cover',
          backgroundPosition: "center",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="background-video"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "fill",
          }}
        >
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div
        className="right-pane"
        style={{
          flex: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="LoginMatCard"
          style={{ width: "90%", maxWidth: "400px" }}
        >
          {/* <CustomWorkspaceControl /> */}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
