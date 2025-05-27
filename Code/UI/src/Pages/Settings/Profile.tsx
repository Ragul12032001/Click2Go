import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Typography } from '@mui/material';
import { Card } from 'src/Components/ui/card';
import { Input } from 'src/Components/ui/input';
import { Button } from 'src/Components/ui/button';
//import { toast, ToastContainer } from 'react-toastify';
import axios from '../../utils/axiosConfig'
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'src/State/store';
import { Image } from 'lucide-react';
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import crypto from 'crypto-js';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/Components/ui/dialog";
import CircularProgress from "@mui/material/CircularProgress";

const Profile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [name, setName] = useState('Sebastian Swaczynski');
  const [email, setEmail] = useState('');
  const [repeatEmail, setRepeatEmail] = useState('');
  const [repeatEmailError, setRepeatEmailError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [base64Image, setBase64Image] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [userPersonalId, setUserPersonalId] = useState('');
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const id = localStorage.getItem("userid");
  const mailId = useSelector((state: RootState) => state.authentication.userEmail);
  const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id);
  // const createdBy = useSelector((state: RootState) => state.authentication.createdBy);

  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [API_URL, setAPI_URL] = useState("");
  const token = localStorage.getItem('token'); // Or sessionStorage.getItem('token')
  const [UserRole, setUserRole] = useState('');

  const accountId = useSelector((state: RootState) => state.authentication.account_id);

  useEffect(() => {
    setIsLoading(true);
    const fetchConfig = async () => {

      try {

        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set API URL from config
        console.log(apiUrlAdvAcc);

        setAPI_URL(config.API_URL);
        console.log(API_URL);

        GetPersonalinfoByEmail();

      } catch (error) {
        console.error("Error loading config:", error);
      }
      finally {
        setIsLoading(false);
      };
    };

    fetchConfig();
  }, []);


  useEffect(() => {
    if (apiUrlAdvAcc) {
      const id = localStorage.getItem("userid");
      GetPersonalinfoByEmail();
      //console.log("Full response data:",{apiUrlAdvAcc}/GetRoleNameByEmailAndWorkspace);
      GetRoleNameByEmailAndWorkspace();
    }
  }, [apiUrlAdvAcc]); // Runs when apiUrlAdminAcc is updated


  function hashPasword(pass: string): string {
    return crypto.SHA256(pass).toString();
  }


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    if (!file) {
      setFileName('');
      setErrorMessage("No file selected.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const validFileTypes = ["image/jpeg", "image/png"];
    const maxFileSize = 5 * 1024 * 1024;

    const dotCount = (file.name.match(/\./g) || []).length;
    if (dotCount > 1) {
      setFileName('');
      setErrorMessage("Invalid file name");
      return;
    }

    if (!validFileTypes.includes(file.type)) {
      setErrorMessage("Please select a valid image (PNG or JPEG).");
      // setTimeout(() => setErrorMessage(null), 3000);
      setFileName('');
      return;
    } else {
      setErrorMessage('')
    }

    if (file.size > maxFileSize) {
      setErrorMessage("File size should not exceed 5MB.");
      // setTimeout(() => setErrorMessage(null), 3000);
      setFileName('');
      return;
    } else {
      setErrorMessage('')
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 400 || img.height < 400) {
          setErrorMessage("Image dimensions must be at least 400x400 pixels.");
          // setTimeout(() => setErrorMessage(null), 3000);
          setFileName('');
        } else {
          // Valid image
          // setSuccessMessage("Image uploaded successfully!");
          // setTimeout(() => setSuccessMessage(null), 3000);
          setErrorMessage('')

          // Convert image to Base64
          const base64String = reader.result?.toString().split(",")[1]; // Remove metadata
          setFileName(file.name);
          setBase64Image(base64String || " ");
          event.target.value = "";
        }
      };
      img.onerror = () => {
        setErrorMessage("Invalid image file.");
        setTimeout(() => setErrorMessage(null), 3000);
        setFileName('');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateImage = async () => {
    setIsLoading(true);
    const mappingId = userPersonalId;
    if (!mappingId) {
      toast.toast({
        title: "Error",
        description: "Could not retrieve user personal ID.",
        duration: 3000,
      });
      return;
    }

    if (!base64Image) {
      setErrorMessage("No valid image selected.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Image :", base64Image);
      const response = await axios.put(`${apiUrlAdvAcc}/UpdateLogo_personal_id/UpdateLogo`, {
        CreatedBy: accountId,
        MappingId: mappingId,
        Image: base64Image,
        UpdatedBy: accountId,
        UpdatedDate: new Date(),
        CreatedDate: new Date(),

      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", response.data);

      if (response.data.status === "Success") {
        setFileName('');
        setBase64Image(" ");
        setErrorMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.toast({
          title: "Success",
          description: "Logo updated successfully.",
          duration: 3000,
        });
      } else {
        toast.toast({
          title: "Error",
          description: "Failed to update logo.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.toast({
        title: "Error",
        description: "An error occurred while updating the logo.",
        duration: 3000,
      });
    }
    finally {
      setIsLoading(false);
    };
  }

  console.log("mail:", mailId);


  const handleOpen = () => {
    setIsAlertOpen(true);
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };



  const handleAccountDeletion = async (mailId: any) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/DeleteAccountByEmail?email=${mailId}`);
      if (response.status === 200) {
        setIsLoading(false);
        toast.toast({
          title: "Success",
          description: "Profile Deleted Successfully",
          duration: 1000,
        });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      setIsLoading(false);
      toast.toast({
        title: "Failed",
        description: "Error in Deletion",
        duration: 3000,
      });
      console.error("Error deleting account:", error);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const confirmDelete = () => {
    handleAccountDeletion(mailId); // Replace with dynamic mailId
  };

  const validateName = (value: string): boolean => {
    const regex = /^[a-zA-Z][a-zA-Z0-9\s_-]*$/;
    return regex.test(value);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value.trim();
    setEmail(newEmail);

    if (!newEmail) {
      setEmailError("Email field cannot be empty.");
    } else if (!validateEmail(newEmail)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const handleRepeatEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRepeatEmail = e.target.value.trim();
    setRepeatEmail(newRepeatEmail);

    if (!newRepeatEmail) {
      setRepeatEmailError("Email field cannot be empty.");
      // setTimeout(() => setRepeatEmailError(""), 3000);
    } else if (newRepeatEmail !== email) {
      setRepeatEmailError("Emails do not match!");
    } else {
      setRepeatEmailError("");
    }
  };


  const validatePassword = (newPassword: string) => {
    setNewPassword(newPassword)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return false;
    } else {
      setPasswordError(null);
      return true;
    }
  };


  const reValidatePassword = (repeatNewPassword: string) => {
    setRepeatNewPassword(repeatNewPassword);
    if (repeatNewPassword !== newPassword) {
      setNewPasswordError("Passwords do not match.");
      return false;
    } else {
      setNewPasswordError(null); // Clear the error if passwords match
      return true;
    }
  };

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

    if (!value) {
      setFullNameError('Please fill the field.'); // Empty field error
    } else if (!nameRegex.test(value)) {
      setFullNameError('Name should contain only letters.'); // Validation error
    } else {
      setFullNameError(''); // Clear error for valid input
    }

    setFullName(value); // Update the state
  };


  const GetPersonalinfoByEmail = () => {
    setIsLoading(true);
    axios
      .post(
        `${apiUrlAdvAcc}/GetPersonalSettingsDetailsByEmail`,
        {
          userEmail: mailId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Full response data:", response.data);

        // Check if the API responded with a success status
        if (response.data?.status === "Success") {
          const personalInfo = response.data.personalInfoList?.[0]; // Access the first item in the personalInfoList array

          if (personalInfo) {
            const userFirstName = personalInfo.firstName;
            const userLastName = personalInfo.lastName;
            const emailAcc = personalInfo.email;
            const userPersonalId = personalInfo.userPersonalId;

            setFirstName(userFirstName);
            setLastName(userLastName);
            setFullName(`${userFirstName} ${userLastName}`);
            setEmail(emailAcc);
            setUserPersonalId(userPersonalId);

            console.log("UemailAcc:", emailAcc);
            console.log("UuserFirstName:", userFirstName);
            console.log("UuserLastName:", userLastName);
          } else {
            console.error("Personal info list is empty or undefined.");

            //   toast.toast({
            //     title: "Error",
            //     description: response.data.status_Description,
            //     duration: 3000,
            // });
          }
        } else if (response.data.status_Description) {
          console.error(response.data.status_Description);
          // toast.toast({
          //     title: "Error",
          //     description: response.data.status_Description,
          //     duration: 3000,
          // });
        } else {
          toast.toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            duration: 3000,
          });
        }
      })
      .catch((error) => {
        console.error("Error in getting personal info data:", error);

      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const GetRoleNameByEmailAndWorkspace = () => {
    setIsLoading(true);
    axios
      .post(
        `${apiUrlAdvAcc}/GetRoleNameByEmailAndWorkspace`,
        {
          email: mailId,
          workspaceInfoId: workspaceId,
        }

      )
      .then((response) => {
        console.log("response data:", response.data);
        const firstItem = response.data?.[0];

        if (firstItem?.Status === "Success") {
          const RoleName = firstItem.Role_Name;
          // if (response.data?.Status === "Success") {
          //  const RoleName = response.data.Role_Name?.[0]; // Access the first item in the personalInfoList array
          setUserRole(RoleName);
          console.log("RoleName:", RoleName);

        } else if (response.data.status_Description) {
          console.error(response.data.status_Description);
          toast.toast({
            title: "Error",
            description: response.data.status_Description,
            duration: 3000,
          });
        } else {
          toast.toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
            duration: 3000,
          });
        }
      })
      .catch((error) => {
        console.error("Error in getting User Role info data:", error);

      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  const handleProfileUpdate = async () => {
    console.log("Updating profile...");

    // Trim input to remove unnecessary spaces
    const trimmedName = fullName.trim();

    if (fullNameError) {
      console.log("Validation error exists. Update blocked.");
      return;
    }
    // Validation: Check if the full name is empty
    if (!trimmedName) {
      setFullNameError("Please fill the field.");
      return;
    }
    setFullNameError("");

    // Validation: Ensure only letters and spaces are allowed
    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    if (!nameRegex.test(trimmedName)) {
      setFullNameError("Name should contain only letters.");
      return;
    }

    // Clear previous error if input is valid
    //setFullNameError(""); // Clear error message

    // Split full name into first and last name
    const nameParts = trimmedName.split(/\s+/); // Removes extra spaces and splits words
    const Fname = nameParts[0] || "";
    const Lname = nameParts.slice(1).join(" ") || "";

    setIsLoading(true);

    axios.put(`${apiUrlAdvAcc}/UpdateUserProfile/updateProfile`, {
      "UserEmail": mailId, // Email ID for the user
      "firstName": Fname,
      "lastName": Lname
    }, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token here
      },
    })
      .then(response => {
        console.log("response:", response);
        if (response.data.status === 'Success') {
          setFullName(`${Fname} ${Lname}`);
          console.log(`${Fname} ${Lname}`);
          toast.toast({
            title: "Success",
            description: "Profile Updated Successfully",
            duration: 3000,
          });
        } else {
          toast.toast({
            title: "Error",
            description: response.data.Status_Description,
            duration: 3000,
          });
          console.error('Update failed:', response.data.Status_Description);
        }
      })
      .catch(error => {
        toast.toast({
          title: "Error",
          description: "Error in Profile update",
          duration: 3000,
        });
        console.error("Error in Profile update", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleUpdatePassword = async () => {

    if (!newPassword) {
      setPasswordError("Password field cannot be empty.")
      return;
    }

    if (!repeatNewPassword) {
      setNewPasswordError("Password field cannot be empty.")
      return;
    }

    if (passwordError || newPasswordError) {
      return;
    }

    setIsLoading(true);
    axios.post(`${API_URL}/UpdatePassword`, {
      "email": mailId, // Email ID for the user
      "newPassword": hashPasword(newPassword)// Stringify the current notification state
    })
      .then(response => {
        if (response.data[0]?.Status === "Success") {
          toast.toast({
            title: "Success",
            description: "Password updated successfully",
            duration: 3000,
          })
          setNewPassword("");
          setRepeatNewPassword("");
        } else {
          toast.toast({
            title: "Error",
            description: "Failed to update Password",
            duration: 3000,
          })

          console.error(response.data.status_Description);
        }
      })
      .catch(error => {
        console.error("Error during UpdatePassword API call:", error);
        toast.toast({
          title: "Error",
          description: "An error occurred, please try again",
          duration: 3000,
        })
      })
      .finally(() => {
        setIsLoading(false);
      })
  };


  useEffect(() => {
    const id = localStorage.getItem("userid");
    console.log("id :" + id);
    console.log(" Redux mail id: " + mailId);
    console.log("fullNameE" + fullName);
  }, []);


  const handleEmailUpdate = async () => {
    //Check if email and repeatEmail match before proceeding
    if (emailError || repeatEmailError) {
      return; // Stop further execution if emails don't match
    }

    if (!email) {
      setEmailError("Email field cannot be empty.")
      return;
    }

    if (!repeatEmail) {
      setRepeatEmailError("Email field cannot be empty.")
      return;
    }

    // Validate email
    // if (!validateEmail(email)) {
    //   setEmailError("Please enter a valid email address.");

    //   setIsLoading(false);
    //   return;
    // }
    // setEmailError('');
    setIsLoading(true);
    axios.put(`${apiUrlAdvAcc}/UpdateUserEmailAddress/updateEmailAddress`, {
      "existingEmail": mailId, // Email ID for the user
      "newEmail": email// Stringify the current notification state
    }, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token here
      },
    })
      .then(response => {
        console.log("response:", response);
        if (response.data.status === 'Success') {
          setEmail(email);
          toast.toast({
            title: "Success",
            description: "Your Email Address Updated successfully",
            duration: 3000,
          });

        } else if (response.data.status === 'Error' && response.data.status_Description === 'Email already exists!') {
          toast.toast({
            title: "Error",
            description: "Email already exists!",
            duration: 3000,
          });
          setRepeatEmail('');
        } else {
          toast.toast({
            title: "Error",
            description: "Failed to update email address",
            duration: 3000,
          });
          setRepeatEmail('');
        }
      })
      .catch(error => {

        toast.toast({
          title: "Error",
          description: "Failed to update email address",
          duration: 3000,
        })
        console.error("Error in Email update", error);
      })
      .finally(() => {
        setIsLoading(false);
      })
  };


  const handlePasswordUpdate = () => {
    setPasswordError('');
    if (newPassword === repeatNewPassword) {
      toast.toast({
        title: "Success",
        description: "Password updated",
        duration: 3000,
      })

    } else {
      setPasswordError('New passwords do not match!');
    }
  };

  return (

    <div className="flex h-screen">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
          <CircularProgress className="text-primary" />
        </div>
      )}
      <div className="flex-grow p-2 overflow-y-auto">

        {/* Profile Picture */}
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl ">
          <Typography component="h2" className="mb-4" style={{ fontSize: '14px', fontWeight: 700, color: '#020617', paddingBottom: '6px' }} ><b>Your profile picture</b></Typography>
          <Typography className="mb-4 mt-1" style={{ fontSize: '14px', color: '#64748B', fontWeight: 400 }}>Please choose a photo to upload as your profile picture.</Typography>
          {/* <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="mb-4"
        />
        {imagePreview && (
          <div className="mb-4 w-32 border border-black overflow-hidden rounded"> 
            <img 
              src={imagePreview} 
              alt="Profile Preview" 
              className="w-full h-auto max-h-32 object-contain" 
            />
          </div>
        )} */}
          <div className="flex items-center gap-2 mt-4 cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}>
            {/* <div>
              {(!imagePreview && <Image className='h-[24px] w-[24px]' />)
                || (imagePreview && <img src={imagePreview} className='h-[24px]' />)}
            </div> */}
            <div className="flex-col">
              <div className='flex gap-2'>
                <Input
                  type="text"
                  value={fileName}
                  readOnly
                  className="flex-grow w-[100%] border-[#E2E8F0] placeholder-[#64748B]"
                  placeholder="No file chosen"
                  style={{ fontWeight: 500 }}
                />
                <Button
                  type="button"
                  onClick={handleUploadClick}
                  className="font-medium text-[14px] bg-[#F1F5F9] w-[50%] text-[#fff] hover:bg-gray-300 focus:ring-[#F1F5F9]  mt--1 form-button"
                  style={{
                    height: "2.2rem",
                    padding: "0 0.5rem",
                    fontSize: "0.8rem",
                  }}
                >
                  Upload image
                </Button>
              </div>
              {/* Error and Success Messages */}
              {errorMessage && (
                <Typography className="font-sans italic" style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>
                  {errorMessage}
                </Typography>
              )}
              <p
                className="text-sm text-gray-500 mt-2"
                style={{
                  textAlign: "left",
                  fontSize: "13px",
                  color: "#64748B",
                  marginBottom: "2px"
                }}
              >
                * .png, * .jpeg files up to 5MB at least 400px by 400px
              </p>

            </div>
            <input
              ref={fileInputRef}
              id="companyLogo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageUpload}
            />

          </div>
          {/* disabled={isLoading} */}
          <Button onClick={handleUpdateImage} disabled={isLoading} className="py-1 px-3 text-sm w-[128px] mt-1 form-button" style={{ fontWeight: 400, fontSize: '14px' }}>
            {isLoading ? 'Updating...' : 'Update image'}
          </Button>
        </Card>

        <Toaster />
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl">
          <Typography component="h3"
            className="mb-4" style={{ fontSize: '14px', fontWeight: 700, color: '#020617', paddingBottom: '6px' }} ><b>Your name</b></Typography>
          <p className='' style={{ fontSize: '14px', color: '#64748B', fontWeight: 400 }}>Update your name to be displayed on your profile.</p>

          <div className='mb-4 mt-4'>
            <Input
              required
              id="profilename"
              placeholder="Sebastian Swaczynski"
              value={fullName}
              onChange={handleFirstNameChange}
            />

            {fullNameError && (
              <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">
                {fullNameError}
              </p>
            )}
          </div>


          <Button onClick={handleProfileUpdate} disabled={isLoading} className="py-1 px-3 text-sm w-[128px] mt-[-2] form-button" style={{ fontWeight: 400, fontSize: '14px' }}>
            {isLoading ? 'Updating...' : 'Update profile'}
          </Button>



        </Card>


        {/* Update Email Section */}
        {/* <Card className="mb-8 p-6 border border-grey text-left max-w-xl">
          <Typography component="h3" className="mb-4" style={{ fontSize: '14px', fontWeight: 700, color: '#020617', paddingBottom: '6px' }} ><b>Update your email</b></Typography>
          <Typography component="p" className="mb-4" style={{ fontSize: '14px', color: '#64748B', fontWeight: 400 }}>Update your email address you use to login to your account.</Typography>
          <div className='mb-4'>
            <Input className="mb-2 mt-4" required type="email" value={email} onChange={handleEmailChange} placeholder="Your new email" aria-label="Your new email" />
            {emailError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{emailError}</p>}
            <Input className="mb-2 mt-2" value={repeatEmail} onChange={handleRepeatEmailChange} placeholder="Repeat email" aria-label="Repeat email" />
            {repeatEmailError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{repeatEmailError}</p>}
          </div>
          <Button onClick={handleEmailUpdate} className="py-2 px-4 w-[178px] mt-[-1]" style={{ fontWeight: 400, fontSize: '14px' }}>Update email address</Button>

        </Card> */}


        {/* Update Password Section */}
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl">
          <Typography component="h3" className="mb-4" style={{ fontSize: '14px', fontWeight: 700, color: '#020617', paddingBottom: '6px' }} ><b>Update your password</b></Typography>
          <Typography component="p" className="mb-4" style={{ fontSize: '14px', color: '#64748B', fontWeight: 400 }}>Update your password to keep your account secure.</Typography>
          <div className='mb-4'>
            <Input className="mb-2 mt-4" type="password" value={newPassword} onChange={(e) => validatePassword(e.target.value)}
              placeholder="New password" aria-label="New password" />
            {passwordError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{passwordError}</p>}
            <Input className="mb-2 mt-2" type="password" value={repeatNewPassword} onChange={(e) => reValidatePassword(e.target.value)}
              placeholder="Repeat new password" aria-label="Repeat new password" />
            {newPasswordError && <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left ">{newPasswordError}</p>}
          </div>
          <Button onClick={handleUpdatePassword} className="py-2 px-4 text-sm w-[150px] mt-2 form-button" style={{ fontWeight: 400, fontSize: '14px' }}>Update password</Button>
        </Card>

        {/* Delete Account Section */}
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl border-2 border-red-600">
          <Typography component="h3" className="mb-4"
            style={{
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '24px',
              color: '#020617',
              letterSpacing: '-1.5%',
              paddingBottom: '6px'

            }}> Danger zone</Typography>
          <Typography component="p" className="mb-4" style={{ fontWeight: 400, color: '#64748B', fontSize: '14px', lineHeight: '20px', paddingBottom: '6px' }}>
            Some actions cannot be undo. Please be careful.
          </Typography>
          <Typography component="h3" className="mb-4"
            style={{
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '24px',
              color: '#020617',
              paddingBottom: '6px',
              letterSpacing: '-1.5%'

            }}>Delete team</Typography>
          <Typography component="p" className="mb-4" style={{ fontWeight: 400, fontSize: '14px', color: '#64748B', lineHeight: '20px' }}>
            This will delete your account and the accounts you own. Furthermore, we will immediately cancel any active subscriptions. This action cannot be undone.
          </Typography>
          <Button
            //onClick={handleOpen} 
            onClick={() => {
              // if (UserRole === 'Primary Owner' || UserRole === 'Primary Advertiser') {
              //   handleOpen(); // Open the dialog if the user is the Primary Owner or Primary Advertiser
              // } else {
              //   toast.toast({
              //     title: "Access denied",
              //     description: "Access denied. You are not the Primary Advertiser.",
              //     duration: 3000,
              //   })
              // }
              handleOpen();
            }}
            className="text-white py-2 px-4 text-sm hover:bg-red-700 w-[167px]" style={{ backgroundColor: "#EF4444", fontWeight: 500, fontSize: '14px' }}>
            Delete your account
          </Button>

          <Dialog
            open={isAlertOpen}
            onOpenChange={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"

          >
            <DialogContent className="max-w-xl ">
              <DialogTitle className="text-18px font-semibold text-[#09090B]">
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-14px font-medium text-[#71717A] mt-1">
                If you delete your account, you are the owner of the workspace, so the workspace will also be deleted. Do you want to proceed?
              </DialogDescription>
              <div className="flex justify-end gap-4">
                <Button disabled={isLoading} variant="outline" className="px-4 py-2 w-24" onClick={handleClose}>
                  Cancel
                </Button>
                <Button className="px-4 py-2 w-24 bg-red-500 text-white hover:bg-red-600" onClick={confirmDelete} autoFocus>
                  {isLoading ? "Deleting..." : "OK"}
                </Button>
              </div>
            </DialogContent>


          </Dialog>
        </Card>
        <div className="mb-20" />
      </div>
    </div>
  );
};

export default Profile;