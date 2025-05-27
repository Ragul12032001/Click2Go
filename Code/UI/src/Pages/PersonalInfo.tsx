import React, {
  FC,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import "./CSS/LoginPage.css";
import LoginImage from "./../Assets/LoginBackground.png";
import loginVideo from "../Assets/login_id.mp4";
import loginVideoUrls from "../Assets/LogInVideos.json"
import Logo from "../Assets/Logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import "../Styles/globals.css";
import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
import config from "../config.json";
import { CustomWorkspaceControl } from "./Workspace";
import { useDispatch } from "react-redux";
import { setPersonalData, setworkspace } from "../State/slices/AuthenticationSlice";
import { useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";
import { RootState } from "../State/store";
import { useSelector } from "react-redux";
import jwt_decode, { jwtDecode, JwtPayload } from "jwt-decode"; // Replacing jsonwebtoken with jwt-decode
import { Switch } from "../Components/ui/switch";
import { Roofing } from "@mui/icons-material";
import { setPermissions, setUser_Role_Name } from "../State/slices/AdvertiserAccountSlice";



interface CustomLoginControlProps {
  setNext: React.Dispatch<React.SetStateAction<boolean>>;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DecodedToken {
  Email: string;
  Name: string;
  WorkspaceId: string;
  RoleId: string;
  exp: number;
  iss: string;
  aud: string;
}

const CustomLoginControl: FC<CustomLoginControlProps> = ({ setNext, setAuthenticated }) => {
  const [PageLoad, setPageLoad] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const location = useLocation();
  const email = location.state?.email || "";

  const [subscribe, setSubscribe] = useState<boolean>(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [base64Image, setBase64Image] = useState<string>("");

  const [fileError, setFileError] = useState<string | null>(null);

  const [LoginState, SetLoginState] = React.useState<{
    UserName: string;
    Password: string;
  }>({ UserName: "Arul", Password: "arul@123" });
  const navigate = useNavigate();

  const [apiUrl, setApiUrl] = useState("");

  const dispatch = useDispatch();

  const toast = useToast();

  //Tamil
  const signupData = useSelector(
    (state: RootState) => state.authentication.signupData
  );
  const isInvited = useSelector((state: RootState) => state.authentication.isInvited);
  const token = useSelector((state: RootState) => state.authentication.inviteToken.token);

  const [isLoading, setIsLoading] = useState(true); // Tracks the loading state

  const retrivedPersonalData = useSelector((state: RootState) => state.authentication.userData);
  const isprofileback = useSelector((state: RootState) => state.authentication.authprofileback);

  const [isResponseSuccess, setIsResponseSuccess] = useState(false);




  const setRetrivedPersonalDetails = () => {
    if (retrivedPersonalData) {
      // If data exists, set first name
      setFirstName(retrivedPersonalData.firstName);
      setLastName(retrivedPersonalData.lastName);
      if (retrivedPersonalData.emailSubscription === "Yes") {
        setSubscribe(true);
      }
      setFileName(retrivedPersonalData.fileName);
      setBase64Image(retrivedPersonalData.base64Image);

      console.log("Retrieved personal details:", retrivedPersonalData);
    } else {
      // If data is undefined, handle gracefully
      setFirstName(""); // Or use an empty string if that's the intended fallback
      console.log("No personal details found.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetch("/config.json")
      .then((response) => response.json())
      .then((config) => {
        setApiUrl(config.API_URL);
        setIsLoading(false);

        if (isprofileback) {
          // Calling the function here
          setRetrivedPersonalDetails();
        }

      })
      .catch((error) => {
        console.error("Error loading config:", error);
        setIsLoading(false);
        toast.toast({
          title: "Error",
          description: "Something went wrong, please try again.",
        });
      });
  }, []); 
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default back behavior
      event.preventDefault();
      // Navigate to login page when back button is clicked
      navigate("/login", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);// Dependency array remains unchanged


  const validateName = (value: string): boolean => {
    const regex = /^[a-zA-Z]*$/;
    return regex.test(value);
  };

  

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateName(value)) {
      setFirstName(value);
      setFirstNameError(null);
    } else {
      setFirstNameError("First name must only contain letters");
    }
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateName(value)) {
      setLastName(value);
    } else {
      setLastNameError("Last name must only contain letters");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      setFileName(""); // Clear file name
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
      setFileName(""); // Clear file name
      toast.toast({
        title: "Error",
        description: "Please select a valid image (PNG or JPEG).",
      });
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      setFileName(""); // Clear file name
      toast.toast({
        title: "Error",
        description: "File size should not exceed 5MB.",
      });
      return;
    }

    // Check image dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 400 || img.height < 400) {
          setFileName(""); // Clear file name
          toast.toast({
            title: "Error",
            description: "Image dimensions must be at least 400x400 pixels.",
          });
        } else {
          setFileName(file.name); // Set file name
          const base64String = reader.result?.toString().split(",")[1];
          setBase64Image(base64String || ""); // Set Base64 string
        }
      };
      img.onerror = () => {
        setFileName(""); // Clear file name
        toast.toast({
          title: "Error",
          description: "Invalid image file.",
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true); // Set loading state to true
    try {
      const data = {
        firstName,
        email,
        lastName,
        emailSubscription: subscribe ? "Yes" : "No",
        alternateNumber: null,
        city: "Your City",
        country: 0,
        address: "Your Address",
        languagePreference: 0,
        gender: "Your Gender",
        dateOfBirth: new Date().toISOString(),
        status: "active",
        createdBy: 1,
        createdDate: new Date().toISOString(),
        updatedBy: 1,
        updatedDate: new Date().toISOString(),
        mappingId: 0,
        base64Image,
        fileName,
      };

      // Save personal data in the store
      dispatch(setPersonalData(data));

      if (isInvited) {
        const decoded = jwtDecode<DecodedToken>(token);
        const wid = decoded.WorkspaceId;
        try {
          const signUpResponse = await axios.post(`${apiUrl}/UserRegister`, signupData);
          console.log("res: " + signUpResponse);

          if (signUpResponse.data[0].Status === "Success") {
            const personalResponse = await axios.post(
              `${apiUrl}/InsertUserPersonalInfo`,
              data
            );

            if (personalResponse.data.status === "Success") {
              let path = "";
              const response = await axios.get(
                `${apiUrl}/GetWorkspaceNameById?workspace_id=${wid}`
              );

              if (
                response.status === 200 &&
                response.data.status === "Success"
              ) {
                dispatch(setworkspace(response.data.workspaceName));
                path = response.data.workspaceName;
              } else {
                path = "Admin";
              }

              const userWorkspaceRole = {
                Mode: "InsertFromInvite",
                EmailId: email,
                WorkspaceId: decoded.WorkspaceId,
                RoleId: decoded.RoleId,
              };
              const UserWorkspaceRoleResponse = await axios.post(
                `${apiUrl}/InsertUserWorkspaceRole`,
                userWorkspaceRole
              );

              if (
                UserWorkspaceRoleResponse.status === 200 &&
                UserWorkspaceRoleResponse.data.status === "Success"
              ) {
                const response = await axios.get(`${apiUrl}/GetPermissionsByRoleId?RoleID=${decoded.RoleId}`);
                if (response.data.status === "Success") {
                  console.log("PERMISSIONS : ", response.data.roleDetails.permissions);
                  const permissions = JSON.parse(response.data.roleDetails.permissions);
                  const role_name = response.data.roleDetails.roleName;
                  dispatch(setPermissions(permissions));
                  dispatch(setUser_Role_Name(role_name));
                  toast.toast({
                    title: "SignUp Successful",
                    description:
                      "You have successfully signed up for our platform.",
                  });

                  // Navigation logic only for isInvited === true
                  setTimeout(() => {
                    navigate("/navbar/dashboard", {
                      state: { path, email },
                    });
                    setIsLoading(false);
                  }, 2000);
                } else {
                  toast.toast({
                    title: "Error",
                    description: "Failed to create role for user. Please try again.",
                  });
                }
                setIsResponseSuccess(true);
                setAuthenticated(true);

              } else {
                toast.toast({
                  title: "Error",
                  description: "Failed to create role for user. Please try again.",
                });
              }
            } else {
              toast.toast({
                title: "Error",
                description: "Failed to create user. Please try again.",
              });
            }
          } else {
            toast.toast({
              title: "Error",
              description: "Failed to create personal data. Please try again.",
            });
          }
        } catch (error) {
          console.error("Error uploading data:", error);
          toast.toast({
            title: "Error",
            description:
              "Something went wrong please try again.",
          });
        }
      } else {
        // For isInvited === false
        toast.toast({
          title: "Success",
          description: "The personal details saved successfully.",
        });
        setNext(true); // This will move to the "next page"
      }
    } catch (error) {
      console.error("Error uploading data:", error);
      toast.toast({
        title: "Error",
        description:
          "Something went wrong please try again.",
      });
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {isLoading && (
        <>
          <CircularProgress color="success" />
        </>
      )}

      {!isLoading && (

        <Container sx={{ width: "400px", padding: "0.5rem" }}>
          <Toaster />
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              fontSize: "0.85rem",
            }}
          >
            <Label
              htmlFor="pageprogress"
              className="whitespace-nowrap text-left"
              style={{ fontSize: "14px", color: "#71717A", fontWeight: 400 }}
            >
              1/2
            </Label>

            <span
              style={{ textAlign: "left" }}
              className="text-[24px] text-[#09090B] font-semibold mb-0">
              Let us get to know you
            </span>

            <Label
              htmlFor="profilePicture"
              className="whitespace-nowrap text-left mb-1"
              style={{ fontSize: "14px", marginTop: "2rem", fontWeight: "500", color: "#020617" }}
            >
              Profile picture
            </Label>
            <div className="flex w-full  gap-2">
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
                className="font-medium text-[14px] bg-[#F1F5F9] w-[30%] text-[#fff] hover:bg-gray-300
                 focus:ring-[#F1F5F9]  mt--1 form-button"
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
              id="profilePicture"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
            <p
              className="text-sm mt-0"
              style={{ fontSize: "13px", color: "#64748B", textAlign: "left" }}
            >
              * .png, * .jpeg files up to 5MB at least 400px by 400px
            </p>

            <Label
              htmlFor="firstName"
              className="whitespace-nowrap text-left mb-1"
              style={{ fontSize: "14px", marginTop: "0.9rem", fontWeight: "500", color: "#020617" }}
            >
              First name
            </Label>
            <Input
              required
              id="firstName"
              placeholder="Enter your first name.."
              value={firstName}
              className="w-full flex-grow  border-gray-200 placeholder:font-normal placeholder:text-[#64748B]"
              onChange={handleFirstNameChange}
            />




            <Label
              htmlFor="lastName"
              className="whitespace-nowrap text-left mb-1"
              style={{ fontSize: "14px", marginTop: "0.9rem", fontWeight: "500", color: "#020617" }}
            >
              Last name
            </Label>
            <Input
              required
              id="lastName"
              placeholder="Enter your last name.."
              value={lastName}
              className="w-full flex-grow  border-gray-200 placeholder:font-normal placeholder:text-[#64748B]"
              onChange={handleLastNameChange}
            />

            <Label
              htmlFor="email"
              className="whitespace-nowrap text-left mb-1"
              style={{ fontSize: "14px", marginTop: "0.9rem", fontWeight: "500", color: "#020617" }}
            >
              Email
            </Label>
            <Input
              required
              disabled
              type="email"
              id="email"
              value={email}
              placeholder="sebastian@nike.com"
              className="w-full flex-grow  border-gray-200"
              style={{ fontSize: "14px", color: "#020617", backgroundColor: "#E2E8F0" }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",  // Align items vertically at the center
                justifyContent: "space-between",
                mt: 3,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                <span
                  className="text-[14px] font-medium text-[#020617] mb-1"
                  style={{ textAlign: "left" }}
                >
                  Subscribe to product update emails
                </span>
                <span
                  className="text-[14px] font-normal text-[#64748B]"
                  style={{ textAlign: "left" }}
                >
                  Get the latest updates about features <br />
                  and product updates.
                </span>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",  // Align vertically with the text
                  marginBottom: "30px"
                }}
              >

                <Switch
                  checked={subscribe}
                  onCheckedChange={(checked) => setSubscribe(checked)}
                  className="data-[state=checked]:bg-green-500  data-[state=checked] mr-1.5 scale-125"
                  // className='ata-[state=unchecked]:bg-gray-300 transition-colors ml-10 '

                />
              </Box>
            </Box>


            {/* <Button
              type="submit"
              className="w-full mt-6 bg-[#007AFF] font-medium text-[14px] text-[#FAFAFA]"
              style={{
                padding: "0.4rem",
                height: "2rem",
              }}
            >
              {isInvited ? "Complete" : "Continue"}
            </Button> */}

            <Button
              type="submit"
              disabled={isResponseSuccess} // Disable button while loading
              className={`w-full mt-6 font-medium text-[14px] ${isLoading ? "bg-[#007AFF]" : "bg-[#007AFF] form-button"
                } text-[#FAFAFA]`}
              style={{
                padding: "0.4rem",
                height: "2rem",
              }}
            >
              {isLoading
                ? "Processing..." // Show "Processing..." when loading
                : isInvited
                  ? "Complete" // Show "Complete" if user is invited
                  : "Continue"}
            </Button>
          </Box>
        </Container>
      )}
    </>
  );
};

const PersonalInfo: FC<{
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setAuthenticated }) => {
  const [next, setNext] = React.useState<boolean>(false);
  // const loginVideo = loginVideoUrls.LogInVideoUrl;


  return (
    <div
      className="personal-info-page"
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "30px",
          left: "30px",
          zIndex: 20,
        }}
      >
        {/* <img src={Logo} alt="Logo" style={{ width: "170px", height: "auto" }} /> */}
      </div>

      <div
        className="left-pane"
        style={{
          flex: '2',
          // backgroundImage: `url(${figmaPageImage})`,
          // backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}

      >
          <video autoPlay loop muted playsInline className="background-video"
                 style={{ position: 'absolute', width: '100%', objectFit: 'fill'}}>
                  <source src={loginVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
        {/* <video autoPlay loop muted playsInline className="background-video"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'fill' }}>
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
      </div>
      <div
        className="right-pane"
        style={{
          flex: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            width: "400px",
            maxWidth: "100%",
          }}
        >
          {!next ? (
            <CustomLoginControl setNext={setNext} setAuthenticated={setAuthenticated} />
          ) : (
            <CustomWorkspaceControl
              setNext={setNext}
              setAuthenticated={setAuthenticated}
            />
          )}
        </Box>
      </div>
    </div>
  );
};

export default PersonalInfo;