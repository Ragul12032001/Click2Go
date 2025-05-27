import React, { FC, useEffect, useState } from "react";
import figmaPageImage from "../Assets/LoginBackground.png";
import GoogleIcon from "@mui/icons-material/Google";
import Logo from "../Assets/Logo.svg";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import loginVideo from "../Assets/login_id.mp4";
import axios from "axios";
import config from '../config.json'
import crypto from "crypto-js"; // For hashing passwords
import jwt_decode, { jwtDecode, JwtPayload } from "jwt-decode"; // Replacing jsonwebtoken with jwt-decode
import { useDispatch } from "react-redux";
import {
  setAdvUrl,
  setAuthProfileBack,
  setInviteToken,
  setIsInvited,
  setmail,
  setSignupData,
  setworkspace,
} from "../State/slices/AuthenticationSlice";
import { useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";
import { RootState } from "../State/store";
import { useSelector } from 'react-redux';

import { Eye, EyeOff } from 'lucide-react';
import { error } from "console";




interface DecodedToken {
  Email: string;
  Name: string;
  WorkspaceId: string;
  RoleId: string;
  exp: number;
  iss: string;
  aud: string;
}

// CustomSignupForm component
interface CustomSignupFormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  name: string;
  workspaceId: number | null;
  roleId: number | null;
  apiUrl: string;
  //Tamil
  status: string;
}

const CustomSignupForm: FC<CustomSignupFormProps> = ({
  email,
  setEmail,
  name,
  workspaceId,
  roleId,
  apiUrl,
}) => {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [repasswordError, setRePasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const dispatch = useDispatch();


  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const toast = useToast();


  const validatePassword = (pass: string): void => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    if (!passwordRegex.test(pass)) {
      setPasswordError(
        "Password must be between 8 and 12 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
    } else {
      setPasswordError(null);
    }
  };


  const reValidatePassword = (pass: string): void => {
    if (pass !== password) {
      setRePasswordError("Passwords do not match.");
    } else {
      setRePasswordError(null);
    }
  };

  function hashPassword(pass: string): string {
    return crypto.SHA256(pass).toString();
  }

  const handleNext = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    // Reset error messages before validation
    setEmailError(null);
    setPasswordError(null);
    setRePasswordError(null);

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");

      setIsLoading(false);
      return;
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );

      setIsLoading(false);
      return;
    }

    // Validate confirm password
    if (password !== repassword) {
      setRePasswordError("Passwords do not match.");

      setIsLoading(false);
      return;
    }

    // Proceed with API call if all validations pass
    try {
      const hashedPassword = hashPassword(password); // Hashing the password before sending
      const signupData = {
        email: email,
        phoneNumber: "string",
        emailVerified: "string",
        phoneVerified: "string",
        password: hashedPassword,
        //Tamil
        status: "active",
      };

      dispatch(setSignupData(signupData));

      const response = await axios.post(`${apiUrl}/CheckEmailExists`, {
        email,
      });

      if (response.data[0]?.Status === "Success") {
        dispatch(setmail(email));
        dispatch(setAuthProfileBack(false));
        navigate("/otpverify", { state: { email } });
        toast.toast({
          title: "Success",
          description: "OTP sent to your email",
        });
      } else {
        const errorMessage = response.data[0]?.Status_Description || "Unknown error";
        console.log(errorMessage);
        if (
          errorMessage.includes("A network-related or instance-specific error occurred") ||
          errorMessage.includes("Could not open a connection to SQL Server")
        ) {
          console.log("Database connection error: ", errorMessage); // For debugging or monitoring tools
          toast.toast({
            title: "Error",
            description: "We’re experiencing technical difficulties. Please try again later.",
          });
        }
        else if (errorMessage === "Email already exists. Please use a different email.") {
          console.log("error: ", errorMessage); // For debugging or monitoring tools
          toast.toast({
            title: "Error",
            description: "Email already exists",
          });
          setTimeout(() => {
          }, 2000);
        }
        else {
          console.log("error: ", errorMessage); // For debugging or monitoring tools
          toast.toast({
            title: "Error",
            description: "Something went wrong, please try again",
          });
          setTimeout(() => {
          }, 2000);
        }

      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast.toast({
        title: "Error",
        description: 'Something went wrong, please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  //
  // Handle email change and validate
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    if (!validateEmail(emailValue)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(""); // Clear the error if valid
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  return (
    <Container sx={{ width: "400px" }}>
      <Toaster />
      {isLoading && (
        <div className="loading-overlay">
          <CircularProgress color="success" />
        </div>
      )}
      <Box
        component="form"
        onSubmit={handleNext}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "24px",
            mb: "1px",
          }}
        >
          Create an account
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            textAlign: "center",
            color: "#71717A ",
            fontSize: "14px",
            pt: 2,
            mb: 0,
          }}
        >
          Enter your email below to create your account
        </Typography>

        <Box className="flex-col mt-6 space-y-2">
          <Input
            required
            type="email"
            placeholder="name@example.com"
            className="w-[350px] h-[36px] border-[#E4E4E7] custom-placeholder rounded-[6px]"
            value={email}
            onChange={handleEmailChange}
          />
          {emailError && (
            <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">{emailError}</p>
          )}

          <div className="relative">
            <Input
              required
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              className="w-[350px] h-[36px] border-[#E4E4E7] custom-placeholder rounded-[6px] pr-10 custom-password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value); // Update password state
                validatePassword(value); // Validate password input
              }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[50%] transform -translate-y-[50%] text-gray-500"
            >
              {showNewPassword ? (
                <Eye style={{ width: "14px", height: "14px" }} />
              ) : (
                <EyeOff style={{ width: "14px", height: "14px" }} />
              )}
            </button>
          </div>


          {passwordError && (
            <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">{passwordError}</p>
          )}

          <div className="relative">
            <Input
              required
              type={showRePassword ? "text" : "password"}
              placeholder="Re-enter password"
              className="w-[350px] h-[36px] border-[#E4E4E7] custom-placeholder rounded-[6px] pr-10 custom-password"
              value={repassword}
              onChange={(e) => {
                setRePassword(e.target.value);
                reValidatePassword(e.target.value);
              }}
            />
            <button
              type="button"
              onClick={() => setShowRePassword((prev) => !prev)}
              className="absolute right-3 top-[50%] transform -translate-y-[50%] text-gray-500"
            >
              {showRePassword ? (
                <Eye style={{ width: "14px", height: "14px" }} />
              ) : (
                <EyeOff style={{ width: "14px", height: "14px" }} />
              )}
            </button>
          </div>

          {repasswordError && (
            <p className="text-red-500 text-xs font-medium mt-1 mb-4 font-sans italic ml-1">{repasswordError}</p>
          )}
        </Box>

        <Button
          type="submit"
          className="w-[350px] h-[36px] mt-1 form-button"
          style={{
            backgroundColor: "#007AFF",
            color: "#FAFAFA",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {isLoading ? "Signing up..." : "Sign up with company email"}
        </Button>
        <Box
          display="flex"
          style={{ width: "100%", justifyContent: "center" }}
          className="mt-6 px-8"
        >
          <Typography
            variant="body2"
            style={{
              textAlign: "center",
              color: "#71717A",
              fontSize: "14px",
              maxWidth: "300px",
            }}
          >
            By clicking continue, you agree to <br /> our{" "}
            <Link
              to="#"
              style={{ color: "#71717A", textDecoration: "underline" }}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="#"
              style={{ color: "#71717A", textDecoration: "underline" }}
            >
              Privacy Policy
            </Link>
            .
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

const SignupPage: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [workspaceId, setWorkspaceId] = useState<number | null>(null)
  const [roleId, setRoleId] = useState<number | null>(null);
  const [apiUrl, setApiUrl] = useState("");
  const location = useLocation();
  const toast = useToast();
  const isInvited = useSelector((state: RootState) => state.authentication.isInvited);
  const inviteToken = useSelector((state: RootState) => state.authentication.inviteToken);
  const [tokenReady, setTokenReady] = useState(false);
  //tamil
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    console.log("token: " + token);
    if (token) {
      try {

        dispatch(setInviteToken(token));
        const decoded = jwtDecode<DecodedToken>(token); // Now jwtDecode should work as expected
        console.log(decoded);


        setEmail(decoded.Email);
        setName(decoded.Name);
        setWorkspaceId(parseInt(decoded.WorkspaceId));
        setRoleId(parseInt(decoded.RoleId));


        console.log("Workspace Idd :", workspaceId);
        console.log("Role Id :", roleId);
        console.log("Name :", name);

        dispatch(setIsInvited(true));


        console.log("IsInvited : ", isInvited);
        console.log("Invite Token : ", inviteToken);
        setTokenReady(true);


      } catch (error) {
        console.error("Invalid token:", error);
        toast.toast({
          title: "error",
          description: "Invalid or expired invite link",
        })
      }
    }
  }, []);

  useEffect(() => {
    if (tokenReady && apiUrl && email) {
      CheckInviteValidation(email);
    }
  }, [tokenReady, apiUrl, email]);



  const CheckInviteValidation = async (email: string) => {
    debugger;
    console.log("CheckInviteValidation called with:", email);
    try {
      const response = await axios.get(`${apiUrl}/CheckInviteExpirationByEmail?email=${email}`);
      if (response.data.status === "Invite Expired") {
        toast.toast({
          title: "Access Denied",
          description: "Invitation Expired or Removed by the Owner"
        });
        navigate("/");

      } else {
        console.error("Error occurred");
      }
    }
    catch (e) {
      console.error("Error occurred:" + e);

    }
  }




  useEffect(() => {
    fetch('/config.json')
      .then((response) => response.json())
      .then((config) => {
        setApiUrl(config.API_URL);
      })
      .catch((error) => {
        console.error('Error loading config:', error);
        toast.toast({
          title: 'Error',
          description: 'Something went wrong, please try again.',
        });
      });
  }, []);

  return (
    <div
      className="signup-page"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      <div style={{ position: "fixed", top: "30px", left: "30px", zIndex: 20 }}>
        {/* <img src={Logo} alt="Logo" style={{ width: "170px", height: "auto" }} /> */}
      </div>

      <div
        className="left-pane"
        style={{
          flex: '2.2',
          // backgroundImage: `url(${figmaPageImage})`,
          // backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}

      >
        <video autoPlay loop muted playsInline className="background-video"
          style={{ position: 'absolute', width: '100%', objectFit: 'fill' }}>
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
          height: "100vh",
        }}
      >
        <CustomSignupForm
          email={email}
          setEmail={setEmail}
          name={name}
          workspaceId={workspaceId}
          roleId={roleId}
          apiUrl={apiUrl}
          status="active"
        />
      </div>

      <div className="absolute top-0 right-0 p-8">
        <Link to="/signin" style={{ color: "#1a7727" }}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
