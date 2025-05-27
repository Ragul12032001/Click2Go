import React, { FC, useEffect, useState } from "react";
import loginVideo from "../Assets/login_id.mp4";
import Logo from '../Assets/Logo3.svg';
import { Link, useNavigate } from "react-router-dom";
import { Input } from '../Components/ui/input';
import { Button } from "../Components/ui/button";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
import crypto from 'crypto-js';
import {setForgotPassword ,setForgotEmail, setAccountId } from '../State/slices/AuthenticationSlice';
import { useDispatch,useSelector } from "react-redux";
import { RootState } from "../State/store";
import { useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";
import { jwtDecode } from "jwt-decode";

import { Eye, EyeOff } from 'lucide-react';



interface CustomSignupFormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserEmailId: React.Dispatch<React.SetStateAction<string>>;
}

const CustomSignupForm: FC<CustomSignupFormProps> = ({ email, setEmail, setAuthenticated, setUserEmailId }) => {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState<string | null>(null);
  // const [passwordError, setPasswordError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [apiUrl, setApiUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false); // To control modal visibility
  const [newEmail, setNewEmail] = useState(''); // For the email input in the modal
  // const [newPassword, setNewPassword] = useState(''); // For the new password input
  // const [confirmPassword, setConfirmPassword] = useState(''); // For confirm password
  const [changePassword, setChangePassword] = useState(false);
  const [otp, setOtp] = useState<string>(""); // Define the OTP state
  const dispatch = useDispatch();

  const [repasswordError, setRePasswordError] = useState<string | null>(null);
  const forgotMail=useSelector((state:RootState)=>state.authentication.forgotEmail) || " ";

  const [newPasswordError, setNewPasswordError] = useState(false);
  // const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const toast = useToast();

  const decode: (token: string) => any = jwtDecode as unknown as (token: string) => any;

  //
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);




  const forgotPassword = useSelector((state:RootState)=>state.authentication.forgotPassword);

  //
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);


  useEffect(()=> {
    if(forgotPassword === false){

    }

  },[forgotPassword]);


  const handleCancelForgotPassword = () => {
    setChangePassword(false); // Hide the email input for forgot password
    setNewEmail("");
    dispatch(setForgotPassword(false));
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
  };



  const handleSubmitUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission default behavior
    setIsLoading(true);
    if (!newPassword || !confirmPassword) {
      toast.toast({
        title: "Error",
        description: "Both password fields are required",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.toast({
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }
  
    try {
      const response = await axios.post(`${apiUrl}/UpdatePassword`, {
        email: forgotMail,
        newPassword: hashPasword(newPassword),
      });
  
      if (response.data[0]?.Status === "Success") {
        toast.toast({
          title: "Success",
          description: "Password updated successfully",
        });
        setTimeout(() => {
          setIsLoading(false);
          dispatch(setForgotPassword(false));
          navigate("/"); // Navigate without adding query parameters
        }, 1000);
      } else {
        toast.toast({
          title: "Error",
          description: "An error occurred, please try again",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during UpdatePassword API call:", error);
      toast.toast({
        title: "Error",
        description: "An error occurred, please try again",
      });
      setIsLoading(false);
    }
  };
  

  const handleForgotButtonClick = ()=> {
    setChangePassword(true);
  }


  const handleForgotPassword = async (e: React.FormEvent): Promise<void> => {
  
    e.preventDefault();
    setIsLoading(true);
    setChangePassword(true);
    dispatch(setForgotEmail(newEmail));
    setEmailError(null);
  
    try {
      
      const response = await axios.post(`${apiUrl}/ForgotPassword`, {
        email: newEmail,   
      });

      console.log('ForgotPassword Response:', response);

      if (response.data[0]?.Status === "Success") {
        toast.toast({
          title: "Success",
          description: "OTP sent to email",
        })
        const Close=()=>{
          setIsLoading(false);
          setUserEmailId(newEmail);
          dispatch(setForgotPassword(true));
          navigate("/otpverify", { state: { newEmail } });
        }
        Close();
      } else {
        const errorMessage = response.data[0]?.Status_Description;
        console.log(errorMessage);
        if (errorMessage === "Email does not exist.") {
          const Close=()=>{
            setIsLoading(false);
          }
          Close();
        toast.toast({
          title: "Error",
          description: "Email does not exist",
        })
        } else {
          const Close=()=>{
            setIsLoading(false);
          }
          Close();
          toast.toast({
            title: "Error",
            description: "An error occurred",
          })
        }
      }
    } catch (error) {
      console.error("Error during ForgotPassword API call:", error);
      toast.toast({
        title: "Error",
        description: "An error occurred",
      })
      console.log("Error ");
      setIsLoading(false);
    }
  };
  
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
  

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  function hashPasword(pass: string): string {
    return crypto.SHA256(pass).toString();
  }

  const handleNext = async (e: React.FormEvent): Promise<void> => {
    const isLogin = "Login";
    setIsLoading(true);
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    setEmailError(null);

    if (password.trim() === "") {
      setPasswordError("Password cannot be empty");
      setIsLoading(false);
      return;
    }

    setPasswordError(null);

    try {
      const response = await axios.post(`${apiUrl}/UserLogin`, {
        email: email,
        phoneNumber: "string",
        emailVerified: "string",
        phoneVerified: "string",
        password: hashPasword(password),
      });

      if (response.data[0]?.Status === "Success") {
        
        const Account_response = await axios.post(`${apiUrl}/GetUserAccountByEmail`, {
          email: email
        });
        if (Account_response.data[0]?.Status === "Success") {
          localStorage.setItem("userid", Account_response.data[0]?.User_Account_Id);
          const userAccountId = Account_response.data[0]?.User_Account_Id;
          console.log("Account_ID :" , userAccountId);
          dispatch(setAccountId(userAccountId)); 
        } else {
          console.log("User account ID not found");
        }
        toast.toast(
          {
            title: "Success",
            description: "OTP sent to your email",
          }
        )
const Close=()=>{
  setAuthenticated(true);
  setUserEmailId(email);
  setIsLoading(false);
  navigate('/otpverify', { state: { isLogin, email } });
}
Close();
      } else {
        const errorMessage = response.data[0]?.Status_Description;
        if (errorMessage === "Password verification failed.") {
          const Close=()=>{
            setIsLoading(false);
          }
          Close();
          toast.toast({
            title: "Error",
            description: "Invalid password",
          })
        } else if (errorMessage === "Email does not exist." || errorMessage === "Email not found. Please create an account first") {
          const Close=()=>{
            setIsLoading(false);
          }
          Close();
          toast.toast({
            title: "Error",
            description:"Email not found. Please create an account first.",
          })
        } else {
          const Close=()=>{
            setIsLoading(false);
          }
          Close();
          toast.toast({
            title: "Error",
            description:"Please check your network connection",
          })
        }
      }
    } catch (error) {
      console.error('Error during API call:', error);
      toast.toast({
        title: "Error",
        description: "Something went wrong, please try again",
      })
      setIsLoading(false);
    }  
  };

  const validatePassword = (pass: string): void => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(pass)) {
      setPasswordError(
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    } else {
      setPasswordError(null); // Clear error if password is valid
    }
  };
  
  


  const reValidatePassword = (confirmPass: string): void => {
    if (confirmPass !== newPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError(null); // Clear the error if passwords match
    }
  };
  

  return (
    <Container maxWidth="xs" style={{ width: '400px' }}>
      <Toaster />
      {isLoading && (
        <div className="loading-overlay">
          <CircularProgress color="success" />
        </div>
      )}
  
      {forgotPassword ? (
        // Password Reset Section (If forgotPassword is true)
        <Box component="form" onSubmit={handleSubmitUpdatePassword} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom style={{ textAlign: 'center', fontWeight: 600, fontSize: '20px', color: '#09090B' }}>
            Set New Password
          </Typography>
          <Typography variant="body2" style={{ textAlign: 'center', color: '#71717A', fontSize: '14px', paddingTop: '8px' }}>
            Enter your new password below
          </Typography>

          <div className="relative">
          <Input
          required
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          className="w-[350px] h-[36px] border-[#E4E4E7] rounded-[7px] mt-2 pr-10 custom-password"
          value={newPassword}
          onChange={(e) => {
            const value = e.target.value;
            setNewPassword(value); // Update new password state
            validatePassword(value); // Trigger validation for new password
          }}
        />
       <button
          type="button"
          onClick={() => setShowNewPassword((prev) => !prev)}
          className="absolute right-3 top-[60%] transform -translate-y-[50%] text-gray-500"
        >
          {showNewPassword ? (
            <Eye style={{ width: "14px", height: "14px" }} />
              ) : (
            <EyeOff style={{ width: "14px", height: "14px" }} />
          )}
        </button>
        </div>

        {passwordError && (
          <Typography  color= "error"  variant= "body2" sx={{ textAlign: "center" }}>
            {passwordError}
          </Typography>
        )}

        <div className="relative">
        <Input
          required
            type={showRePassword ? "text" : "password"}
          placeholder="Confirm New Password"
          className="w-[350px] h-[36px] border-[#E4E4E7] rounded-[7px] mt-2 pr-10 custom-password"
          value={confirmPassword}
          onChange={(e) => {
            const value = e.target.value;
            setConfirmPassword(value); // Update confirm password state
            reValidatePassword(value); // Trigger validation for confirm password
          }}
        />
           <button
              type="button"
              onClick={() => setShowRePassword((prev) => !prev)}
              className="absolute right-3 top-[60%] transform -translate-y-[50%] text-gray-500"
            >
              {showRePassword ? (
                <Eye style={{ width: "14px", height: "14px" }} />
              ) : (
                <EyeOff style={{ width: "14px", height: "14px" }} />
              )}
            </button>
        </div>

        {confirmPasswordError && (
          <Typography  color= "error"  variant= "body2" sx={{ textAlign: "center" }}>
            {confirmPasswordError}
          </Typography>
        )}

          <Box display="flex" mt={2} justifyContent="space-between" width="100%">
            <Button onClick={handleCancelForgotPassword} className="w-[170px]" style={{ backgroundColor: '#E4E4E7', color: '#09090B' }}>
              Cancel
            </Button>
            <Button type="submit" className="w-[170px] form-button" style={{color: '#fff' }}>
              Submit
            </Button>
          </Box>
        </Box>
      ) : changePassword ? (
        // Change Password Section (If changePassword is true and forgotPassword is false)
        <Box component="form" onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom style={{ textAlign: 'center', fontWeight: 600, fontSize: '20px', color: '#09090B' }}>
            Reset Your Password
          </Typography>
          <Typography variant="body2" style={{ textAlign: 'center', color: '#71717A', fontSize: '14px', paddingTop: '8px' }}>
            Enter your email to reset your password
          </Typography>
          <Input
          required
            type="email"
            placeholder="Enter your email"
            className="w-[350px] h-[36px] border-[#E4E4E7] rounded-[7px] mt-2"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Box display="flex" mt={2} justifyContent="space-between" width="100%">
            <Button onClick={handleCancelForgotPassword} className="w-[170px]" style={{ backgroundColor: '#E4E4E7', color: '#09090B' }}>
              Cancel
            </Button>
            <Button type="submit" className="w-[170px] form-button" style={{color: '#fff' }}>
              Submit
            </Button>
          </Box>
        </Box>
      ) : (
        // Login Section (If both forgotPassword and changePassword are false)
        <Box component="form" onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" gutterBottom style={{ textAlign: 'center', fontWeight: 600, fontSize: '24px', color: '#09090B', marginBottom: 0 }}>
            Log in to Click2Go
          </Typography>
          <Typography variant="body1" gutterBottom style={{ textAlign: 'center', color: '#71717A', fontSize: '14px', paddingTop: '8px' }}>
            Enter your email below to access your account
          </Typography>
          <Box className='space-y-2 mt-6'>
     
            <Input
              required
              type="email"
              placeholder="name@example.com"
              // className="w-[350px] h-[36px] border-[#E4E4E7] custom-placeholder rounded-[7px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Typography color="error" variant="body2" style={{ textAlign: 'center' }}>
              {emailError}
            </Typography>
  
            {/* Password Input with Show/Hide Icon */}
            <div className="relative">
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                // className="w-[350px] h-[36px] border-[#E4E4E7] custom-placeholder rounded-[7px] pr-10 custom-password" 
                // Add padding-right for the icon
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
                <button
                 type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[50%] transform -translate-y-[50%] text-gray-500"
                >
                {showPassword ? (
                  <Eye style={{ width: "14px", height: "14px" }} />
                    ) : (
                  <EyeOff style={{ width: "14px", height: "14px" }} />
                )}
                </button>

            </div>

            
            <Typography color="error" variant="body2" style={{ textAlign: 'center' }}>
              {passwordError}
            </Typography>
          </Box>
  
          <Button type="submit" className="w-[350px] h-[36px] mt-0 form-button" style={{ backgroundColor: '#007AFF', color: '#fff' }} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in with company email"}
          </Button>
  
          {/* Forgot Password Link */}
          <Box textAlign="center" mt={1}>
            <Link
              to="#"
              onClick={handleForgotButtonClick} // Open the modal when clicked
              className="text-gray underline"
              style={{ fontSize: '14px', color: '#1a7727' }}
            >
              Forgot Password
            </Link>
          </Box>
  
          <Box display="flex" style={{ width: '100%', justifyContent: "center" }} className='mt-5'>
            <Typography variant="body2" style={{ textAlign: 'center', color: '#71717A', fontSize: '14px', maxWidth: '300px' }}>
              By clicking continue, you agree to <br /> our{' '}
              <Link to="#" className="text-gray underline">Terms of Service</Link> and{' '}
              <Link to="#" className="text-gray underline">Privacy Policy</Link>.
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
  
  
};

const SignInPage: FC<{
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserEmailId: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setAuthenticated, setUserEmailId }) => {
  const [email, setEmail] = useState<string>("");

  const forgotpassword = useSelector((state:RootState) => state.authentication.forgotPassword);

  return (
    <div
      className="login-page"
      style={{
        display: 'flex',
        background: '#e2ffe5',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'fixed',
   
          left: '30px',
          zIndex: 20,
          width: '170px',
        }}
      >
        {/* <img src={Logo} alt="Logo" style={{ maxWidth: '100%', height: 'auto' }} /> */}
      </div>

      <div
        className="left-pane"
        style={{
          background: '#e2ffe5',
          flex: '2.2',
          // backgroundImage: `url(${figmaPageImage})`,
          // backgroundSize: 'cover',
          backgroundPosition: 'center',
         
          position: 'relative',
          overflow: 'hidden'
        }}
      
      >
         <video autoPlay loop muted playsInline className="background-video"
         style={{ position: 'absolute', width: '100%', objectFit: 'fill'}}>
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
       </div> 

      <div
        className="right-pane"
        style={{
          
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Box
          style={{
            width: '400px',
            maxWidth: '100%',
          }}
        >
          <CustomSignupForm
            email={email}
            setEmail={setEmail}
            setAuthenticated={setAuthenticated}
            setUserEmailId={setUserEmailId}
          />
        </Box>
      </div>

      {!forgotpassword && 
      <div className="absolute top-0 right-0 p-8">
      <Link to="/signup" style={{ color: '#1a7727' }}>
        Sign up
      </Link>
    </div>} 
      
    </div>
  );
};

export default SignInPage;
