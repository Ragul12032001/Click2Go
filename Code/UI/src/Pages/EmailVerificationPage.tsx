// eslint-disable-next-line
import React, { useEffect, useRef, useState } from 'react';
import './CSS/LoginPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Typography, Box, CircularProgress } from '@mui/material';
import loginVideo from "../Assets/login_id.mp4";

// import loginVideoUrls from "../Assets/LogInVideos.json"
import LoginImage from "../Assets/LoginBackground.png";
import Logo from '../Assets/Logo.svg';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../Components/ui/input-otp";
import crypto from 'crypto-js';
import { TIMER_SETTINGS } from '../Services/ConfigurationService';
import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
import config from '../config.json';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setmail, setworkspace, setWorkspaceId, setAdvUrl, setAdminUrl, setForgotPassword, setIsAdmin, setSmsUrl, setOperatorUrl, setRoleId, setAuthUrl } from '../State/slices/AuthenticationSlice';
import { RootState } from '../State/store';
import { useToast } from "../Components/ui/use-toast";
import { Toaster } from "../Components/ui/toaster";

import jwt_decode, { jwtDecode, JwtPayload } from "jwt-decode"; // Replacing jsonwebtoken with jwt-decode
import { setPermissions, setUser_Role_Name } from '../State/slices/AdvertiserAccountSlice';



interface DecodedToken {
    Email: string;
    Name: string;
    WorkspaceId: number;
    RoleId: string;
    exp: number;
    iss: string;
    aud: string;
}


interface OTPProps {
    separator?: React.ReactNode;
    length: number;
    value: string;
    onChange: (value: string) => void;
}

function hashOtp(otp: string): string {
    return crypto.SHA256(otp).toString();
}

function OTP({ }: OTPProps) {
    const [PageLoad, setPageLoad] = useState<boolean>(false);

    return (
        <>
            {PageLoad && (
                <>
                    <p>Loading</p>
                    <div className="page-preloader"></div>
                </>
            )}
            {!PageLoad && (
                <Container maxWidth="xs" sx={{ padding: 2, alignItems: 'center' }}>
                    <Toaster />
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 600, fontSize: '24px', color: '#09090B' }}>
                            Verify your email
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom sx={{ textAlign: 'center', fontWeight: 400, fontSize: '14px', paddingTop: '0.5rem' }} className="text-gray-500">
                            We sent you an email with your one-time password
                        </Typography>
                    </Box>
                </Container>
            )}
        </>
    );
}


export default function EmailVerificationPage() {
    const dispatch = useDispatch();
    const [timer, setTimer] = useState<number>(TIMER_SETTINGS.INITIAL_TIME);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [value, setValue] = React.useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = React.useState("");
    const [Login, setLogin] = React.useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const mail = location.state?.email || location.state?.newEmail || " ";
    const login = location.state?.isLogin || "";

    const [apiUrl, setApiUrl] = useState('');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const toast = useToast();

    const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id);
    const accountId = useSelector((state: RootState) => state.authentication.account_id);

    const isInvited = useSelector((state: RootState) => state.authentication.isInvited);
    const token = useSelector((state: RootState) => state.authentication.inviteToken.token);

    const forgotPassword = useSelector((state: RootState) => state.authentication.forgotPassword);
    // const loginVideo = loginVideoUrls.LogInVideoUrl;


    console.log("FP:", forgotPassword);

    useEffect(() => {
        if (mail) setEmail(mail);
        if (login) setLogin(login);

        fetch('/config.json')
            .then(response => response.json())
            .then(config => {
                setApiUrl(config.API_URL);
                dispatch(setAuthUrl(config.API_URL));
                dispatch(setAdvUrl(config.ApiUrlAdvAcc));
                dispatch(setAdminUrl(config.ApiUrlAdminAcc));
                dispatch(setSmsUrl(config.SmsUrlAdminAcc));
                dispatch(setOperatorUrl(config.OperatorUrl));
            })
            .catch((error) => {
                console.error('Error loading config:', error);
                toast.toast({
                    title: 'Error',
                    description: 'Something went wrong, please try again.',
                });
            });
    }, []);

    useEffect(() => {
        if (timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(intervalRef.current!);
                        setCanResend(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => {
            clearInterval(intervalRef.current!);
        };
    }, [timer]);

    // const setSessionDataWithExpiry = (key: string, value: any, expiryInMinutes: number) => {
    //     const now = new Date().getTime();
    //     const item = {
    //         value: value,
    //         expiry: now + expiryInMinutes * 60 * 1000, // Convert minutes to milliseconds
    //     };
    //     sessionStorage.setItem(key, JSON.stringify(item));
    // };

    const handleSubmit = async (email: string, otp: string) => {
        if (timer <= 0) {
            toast.toast({
                title: "Time Expired",
                description: "Time expired. Please click Resend OTP.",
            });
            setValue("");
            return;
        }

        setIsLoading(true);

        try {
            debugger;
            const response = await axios.post(`${apiUrl}/VerifyOtp`, { Email: email, Otp: otp });

            if (response.status === 200 && response.data.status === "Success") {
                // setSessionDataWithExpiry("otpVerified", "true", 60);
                // setSessionDataWithExpiry("email", email, 1);

                if (response.data?.token != null) {
                    const token = response.data?.token;
                    // Set token in HTTP cookie
                    const isLocalhost = window.location.hostname === 'localhost';

                    // Set cookie properly for localhost and production
                    document.cookie = `AuthToken=${token}; path=/; max-age=${4 * 60 * 60}; ${isLocalhost ? 'SameSite=Lax' : 'SameSite=None; Secure'
                        }`;
                    axios.defaults.withCredentials = true;
                    console.log("Cookies:", document.cookie);
                }
                sessionStorage.setItem("otpVerified", "true",)
                sessionStorage.setItem("email", email)

                await handlePostOTP(email);
                toast.toast({
                    title: "Success",
                    description: "OTP verified successfully",
                });
            } else {
                handleOTPError();
            }
        } catch (error) {
            console.error("Error during OTP verification:", error);
            toast.toast({
                title: "Error",
                description: "An error occurred, please try again.",
            });
            setValue("");
        } finally {
            setIsLoading(false);
        }
    };


    const handlePostOTP = async (email: string) => {
        if (Login === "Login") {
            try {
                const workspaceResponse = await axios.get(`${apiUrl}/GetWorkspaceNameByEmail?EmailId=${email}`);
                if (workspaceResponse.status === 200 && workspaceResponse.data.status === "Success") {
                    const { workspace_name, workspace_type, workspace_id } = workspaceResponse.data.workspaceName;

                    dispatch(setmail(email));
                    dispatch(setworkspace(workspace_name));
                    dispatch(setWorkspaceId(workspace_id));

                    // Store in sessionStorage
                    // setSessionDataWithExpiry("workspace_id", workspace_id.toString(), 60);
                    sessionStorage.setItem("workspace_id", workspace_id)

                    await checkIfAdmin(email);
                    await fetchRoleDetails(accountId, workspace_id);

                    navigateWithDelay(
                        workspace_type === "Telecom Operator" ? "/operatorNavbar/dashboard" : "/navbar/dashboard",
                        { state: { path: workspace_name, email, route: "Dashboard" } }
                    );
                }
            } catch (error) {
                console.error("Error fetching workspace:", error);
            }
        } else if (forgotPassword) {
            navigate("/");
        } else {
            await checkIfAdmin(email);
            if (isInvited) {
                await handleInvitation(email);
            }
            navigate("/personalinfo", { state: { path: "", email } });
        }
    };


    const checkIfAdmin = async (email: string) => {
        try {
            const response = await axios.get(`${apiUrl}/CheckIfAdmin?EmailId=${email}`);
            if (response.data.status === "Success") {
                dispatch(setIsAdmin(response.data.isAdmin));
            } else {
                console.log("CheckIfAdmin API error");
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
        }
    };

    const fetchRoleDetails = async (accountId: number, workspaceId: number) => {
        try {
            const response = await axios.get(
                `${apiUrl}/GetUserWorkspaceRoleDetails/GetUserWorkspaceRoleDetails?accountId=${accountId}&workspaceId=${workspaceId}`
            );

            if (response.data.status === "Success") {
                const roleId = response.data.userWorkspaceRoleDetails[0]?.roleId;
                dispatch(setRoleId(roleId));

                // Store accountId in sessionStorage
                // setSessionDataWithExpiry("accountId", accountId.toString(), 60);
                sessionStorage.setItem("accountId", accountId.toString())

                if (roleId) {
                    await fetchPermissions(roleId);
                }
            } else {
                console.log("GetUserWorkspaceRoleDetails API error");
            }
        } catch (error) {
            console.error("Error fetching user workspace role details:", error);
        }
    };


    const fetchPermissions = async (roleId: string) => {
        try {
            const response = await axios.get(`${apiUrl}/GetPermissionsByRoleId?RoleID=${roleId}`);
            if (response.data.status === "Success") {
                const permissions = JSON.parse(response.data.roleDetails.permissions);
                const role_name = response.data.roleDetails.roleName;
                dispatch(setPermissions(permissions));
                dispatch(setUser_Role_Name(role_name));
            } else {
                console.log("GetPermissionsByRoleId API error");
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
        }
    };

    const handleInvitation = async (email: string) => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const workspaceId = decoded.WorkspaceId;

            dispatch(setWorkspaceId(workspaceId));
            navigate("/personalinfo", { state: { path: "", email } });

        } catch (error) {
            console.error("Error handling invitation:", error);
            toast.toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
            });
        }
    };

    const navigateWithDelay = (path: string, state: any) => {
        setTimeout(() => {
            navigate(path, state);
        }, 2000);
    };

    const handleOTPError = () => {
        console.log("Invalid OTP Response");
        toast.toast({
            title: "Error",
            description: "Invalid OTP. Please try again or wait to resend.",
        });
        setValue("");
    };




    const otpInputRef = useRef<HTMLInputElement>(null); // Specify the input element type


    const handleResendOTP = async (email: string) => {
        setIsLoading(true);
        if (otpInputRef.current) {
            otpInputRef.current.focus(); // Set focus to the first OTP input
        }

        try {
            const response = await axios.post(`${apiUrl}/SendOtp/SendOtp`, {
                Email: email,
            });

            if (response.status === 200 && response.data.status === "Success") {
                setTimer(TIMER_SETTINGS.INITIAL_TIME); // Reset the timer
                setCanResend(false); // Disable the Resend OTP button again
                toast.toast({
                    title: "Success",
                    description: response.data.message,
                });
            } else {
                toast.toast({
                    title: "Error",
                    description: response.data.message,
                });
            }
        } catch (error) {
            console.error("Error during API call:", error);
            toast.toast({
                title: "Error",
                description: "An error occurred, please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };







    return (
        <div className="email-verification-page" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Toaster />
            {isLoading && (
                <div className="loading-overlay">
                    <CircularProgress color="success" />
                </div>
            )}
            <div
                style={{
                    position: 'fixed',
                    top: '30px',
                    left: '30px',
                    zIndex: 20,

                }}
            >
                {/* <img src={Logo} alt="Logo" style={{ width: '170px', height: 'auto' }} /> */}
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
         style={{ position: 'absolute', width: '100%', objectFit: 'fill'}}>
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>s
            </div>

            {/* Right pane without any structural or alignment changes */}
            <div className="right-pane" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="LoginMatCard" style={{ width: '90%', maxWidth: '400px', marginTop: '12px' }}>
                    <OTP length={0} value={''} onChange={() => { }} />
                    <InputOTP

                        ref={otpInputRef} // Assign the ref to the first input

                        maxLength={6}
                        value={value}
                        onChange={(value) => {
                            setValue(value);
                            if (value.length === 6) {
                                const hashedOtp = hashOtp(value);
                                handleSubmit(email, hashedOtp);
                            }
                        }}
                        autoFocus
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="border border-[#E2E8F0]" />
                            <InputOTPSlot index={1} className="border border-[#E2E8F0]" />
                            <InputOTPSlot index={2} className="border border-[#E2E8F0]" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} className="border border-[#E2E8F0]" />
                            <InputOTPSlot index={4} className="border border-[#E2E8F0]" />
                            <InputOTPSlot index={5} className="border border-[#E2E8F0]" />
                        </InputOTPGroup>
                    </InputOTP>

                    <Typography variant="subtitle2" sx={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#000000', fontWeight: 400 }}>
                        Enter your one-time password
                    </Typography>

                    <Typography variant="body2" gutterBottom sx={{ textAlign: 'center', color: '#AEAEAE', cursor: 'pointer', marginTop: '30px' }}>
                        {canResend ? (
                            <Button className='form-button'
                                style={{ backgroundColor: 'black', color: 'white', textTransform: 'capitalize' }}
                                onClick={() => handleResendOTP(email)}
                            >
                                Resend OTP
                            </Button>
                        ) : (
                            `OTP expires in ${timer} seconds`
                        )}
                    </Typography>
                </div>
            </div>
        </div>
    );
}
