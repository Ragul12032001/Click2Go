import React, { ChangeEvent, FC, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from '../../Components/ui/input';
import { Button } from "../../Components/ui/button";
import { CircularProgress, Typography } from "@mui/material";
import { Card } from "src/Components/ui/card";
import axios from "axios";
//import { toast, ToastContainer } from 'react-toastify';
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { Image } from 'lucide-react';
import { RootState } from 'src/State/store';
import { useDispatch, useSelector } from 'react-redux';
import config from '../../config.json';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/Components/ui/dialog";


// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../Components/ui/select";
import { setworkspace, setWorkspaceId } from "../../State/slices/AuthenticationSlice";
interface Country {
  country_id: number,
  country_name: string
}
interface Industry {
  industry_id: number,
  industry_name: string
}
const Workspace_settings: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [UserRole, setUserRole] = useState('');
  const mailId = useSelector((state: RootState) => state.authentication.userEmail);
  const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id);
  const [name, setName] = useState('');
  const [Streetname, setStreetName] = useState('');
  const [countrylist, setcountrylist] = useState<Country[]>([]);
  const [industrylist, setindustrylist] = useState<Industry[]>([]);
  const [Streetnumber, setStreetnumber] = useState<number | string>(''); // Can store as number or empty string initially
  const [Code, setCode] = useState<number | string>(''); // Postal Code should be an integer
  const [City, setcity] = useState('');
  const [State, setstate] = useState('');
  const [Country, setcountry] = useState('');
  const [Industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [fileName, setFileName] = useState<string>('');
  const [base64Image, setBase64Image] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nameError, setnameError] = useState<string | null>(null);
  const [Address, setAddress] = useState('');
  const [StreetNameError, setStreetNameError] = useState<string | null>(null);
  const [StreetNumberError, setStreetNumberError] = useState<string | null>(null);
  const [PostalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [CityError, setCityError] = useState<string | null>(null);
  const [StateError, setStateError] = useState<string | null>(null);
  const [CountryError, setCountryError] = useState<string | null>(null);
  const [IndustryError, setIndustryError] = useState<string | null>(null);
  const [WarningMessage, setWarningMessage] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const id = localStorage.getItem("userid");
  const Existing_mailId = useSelector((state: RootState) => state.authentication.userEmail);
  const toast = useToast();
  const accountId = useSelector((state: RootState) => state.authentication.account_id);

  //const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState<string | undefined>(undefined); // Initialize with `undefined` or an empty string
  const apiUrlAdvAcc = useSelector((state: RootState) => state.authentication.apiURL);

  const workspace_list = useSelector((state: RootState) => state.advertiserAccount.workspace_list);

  const wid = useSelector((state: RootState) => state.authentication.workspace_id);

  // useEffect(() => {
  //   setIsLoading(true);
  //   const fetchConfig = async () => {
  //     try {
  //       const response = await fetch("/config.json");
  //       console.log("fetch config::", response);
  //       const config = await response.json();

  //       console.log("Config loaded:", config); // Debugging log
  //       // setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set API URL from config

  //     } catch (error) {
  //       console.error("Error loading config:", error);

  //     }
  //     finally {
  //       setIsLoading(false);
  //     };
  //   };

  //   fetchConfig();
  // }, []);

  useEffect(() => {
    // debugger;
    if (!apiUrlAdvAcc) {
      // Show a toast message when apiUrlAdvAcc is not available
      toast.toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        duration: 3000, // Show for 3 seconds
      });
      return; // Prevent further execution if the URL is missing
    }  // Prevent early API calls
    console.log(apiUrlAdvAcc);
    console.log("API URL available, fetching initial data...");
    GetWorkspaceDetailsByID();
    getcountrylist();
    getindustrylist()
  }, [apiUrlAdvAcc]);// Runs when apiUrlAdminAcc is updated

  useEffect(() => {
    if (mailId && workspaceId) {
      GetRoleNameByEmailAndWorkspace();
    }
  }, [mailId, workspaceId]);



  const GetRoleNameByEmailAndWorkspace = () => {
    setIsLoading(true);
    if (!mailId || !workspaceId || !apiUrlAdvAcc) {
      console.log("Waiting for mailId and workspaceId...");
      return; // Prevent API call if data is missing
    }

    axios
      .post(`${apiUrlAdvAcc}/GetRoleNameByEmailAndWorkspace`, {
        email: mailId,
        workspaceInfoId: workspaceId,
      })
      .then((response) => {
        console.log("response data:", response.data);
        const firstItem = response.data?.[0];

        if (firstItem?.Status === "Success") {
          setUserRole(firstItem.Role_Name);
          console.log("RoleName:", firstItem.Role_Name);
        } else {
          console.error("API Error:", response.data.status_Description);
          // toast.toast({  // Corrected toast usage
          //   title: "Error",
          //   description: "Something went wrong. Please try again.",
          //   duration: 3000,
          // });
        }
      })
      .catch((error) => {
        console.error("Error in getting User Role info data:", error);

        // toast.toast({  // Corrected toast usage
        //   title: "Error",
        //   description: "Something went wrong. Please try again.",
        //   duration: 3000,
        // });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const dispatch = useDispatch();
  // const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const workspace_id = useSelector((state: RootState) => state.authentication.workspace_id);

  const getcountrylist = async () => {
    //  debugger;
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetCountryList`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token here
        },
      });
      if (response.data.status === "Success") {
        setcountrylist(response.data.countryList as Country[]); // Safeguard for empty array
        console.log(response.data.countryList, 'countrylist');
      } else if (response.data.status_Description) {
        console.error(response.data.status_Description);
        // toast.toast({
        //     title: "Error",
        //     description: response.data.status_Description,
        //     duration: 3000,
        // });
      } else {
        // toast.toast({
        //     title: "Error",
        //     description: "Something went wrong. Please try again.",
        //     duration: 3000,
        // });
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);

    } finally {
      setIsLoading(false);
    }
  };
  const getindustrylist = async () => {
    //debugger;
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetIndusryList`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token here
        },
      });
      if (response.data.status === "Success") {
        setindustrylist(response.data.industryList as Industry[]); // Safeguard for empty array
        console.log(response.data.industryList, 'industrylist');
      } else if (response.data.status_Description) {
        console.error(response.data.status_Description);
        // toast.toast({
        //     title: "Error",
        //     description: response.data.status_Description,
        //     duration: 3000,
        // });
      } else {
        // toast.toast({
        //     title: "Error",
        //     description: "Something went wrong. Please try again.",
        //     duration: 3000,
        // });
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);

    } finally {
      setIsLoading(false);
    }
  };

  const handleStreetNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("StreetNumber::", value);
    // Check if the value contains only numbers
    const regex = /^[0-9]*$/;

    // Check if the length is <= 10 (or any other number you prefer)
    if (!regex.test(value)) {
      setStreetNumberError('Street number can only contain numbers.');
    } else if (value.length > 10) {
      setStreetNumberError('Street number cannot be longer than 10 digits.');
    } else {
      setStreetNumberError(''); // Clear the error when the input is valid
      setStreetnumber(value);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("StreetNumber::", value);
    // Check if the value contains only numbers
    const regex = /^[0-9]*$/;

    // Check if the length is <= 10 (or any other number you prefer)
    if (!regex.test(value)) {
      setPostalCodeError('Postal code can only contain numbers.');
    } else if (value.length > 6) {
      setPostalCodeError('Postal number cannot be longer than 6 digits.');
    } else {
      setPostalCodeError(''); // Clear the error when the input is valid
      setCode(value);
    }
  };

  const handleStreetNameChange = (e: ChangeEvent<HTMLInputElement>) => {

    const value = e.target.value;

    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

    if (!value) {
      setStreetNameError('Please fill the field.');
    } else if (!nameRegex.test(value)) {
      setStreetNameError('Name must contain only letters.');
    } else {
      setStreetNameError('');
    }

    setStreetName(value);
  };

  // Handle City input change with validation (only letters)
  const handleCityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/; // Allow only letters and spaces

    if (!regex.test(value)) {
      setCityError('City name can only contain letters and spaces.');
    } else {
      setCityError(''); // Clear the error when the input is valid
    }
    setcity(value);
  };

  // Handle State input change with validation (only letters)
  const handleStateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/; // Allow only letters and spaces

    if (!regex.test(value)) {
      setStateError('State name can only contain letters and spaces.');
    }
    else {
      setStateError('');
    }
    setstate(value);
  };

  const handleCompanyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!value.trim()) {
      setnameError('Please fill the field.');
      setName(value);
      return;
    }

    // First character should NOT be a special character (letters & numbers allowed)
    const firstChar = value.charAt(0);
    const firstCharRegex = /^[a-zA-Z0-9]/; // Allows letters and numbers

    // Last character should NOT be a special character (letters & numbers allowed)
    const lastChar = value.charAt(value.length - 1);
    const lastCharRegex = /^[a-zA-Z0-9]$/; // Allows letters and numbers

    // Ensure spaces are allowed in between but not at the start or end
    if (!firstCharRegex.test(firstChar)) {
      setnameError('First character should not be a special character.');
    } else if (!lastCharRegex.test(lastChar)) {
      setnameError('Last character should not be a special character or empty space.');
    } else {
      setnameError('');
    }

    setName(value);
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.toast({
      title: "Success",
      description: "Profile updated successfully",
      duration: 3000,
    })

    setIsLoading(false);
  };

  const sample = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.toast({
      title: "Success",
      description: "Profile updated successfully",
      duration: 3000,
    })

    setIsLoading(false);
  };



  const UpdateWorkspaceAddress = async () => {

    if (StreetNameError || StreetNumberError || PostalCodeError || CityError || StateError) {
      return;
    }


    if (!Streetname || !Streetnumber || !Code || !City || !State || !Country) {
      setWarningMessage('Please fill in all the fields before submitting.');
      return; // Prevent form submission or API call
    } else {
      setWarningMessage('');
    }
    if (!Country) {
      setCountryError('Please select a country before submitting.');
      return; // Prevent form submission or API call
    } else {
      setCountryError('');
    }
    console.log("value::", State);

    setIsLoading(true);
    axios.put(`${apiUrlAdvAcc}/updateWorkSpaceAddress`, {
      "workspaceid": workspace_id,
      "streetName": Streetname || "",
      "streetNumber": String(Streetnumber) || "",
      "city": City || "",
      "postalCode": String(Code) || "",
      "state": State || "",
      "billingCountry": Country || ""
    }
      //   ,{
      //     headers: {
      //         Authorization: `Bearer ${token}`, // Include the token here
      //     },
      // }
    )

      .then(response => {
        console.log("response:", response);
        console.log("res:", response)
        if (response.data.status === 'Success') {

          toast.toast({
            title: "Success",
            description: "Company Address Updated Successfully",
            duration: 3000,
          })

          setTimeout(() => {

          }, 3000);
        } else {
          toast.toast({
            title: "Error",
            description: "Company Address Update Failed",
            duration: 3000,
          })
          console.error('Update failed:', response.data.Status_Description);
        }
      })
      .catch(error => {
        toast.toast({
          title: "Error",
          description: "Company Address Update Failed",
          duration: 3000,
        })
        console.error("Error in Workspace Address update", error);
      }).finally(() => {
        setIsLoading(false);
      });
  };

  const GetWorkspaceDetailsByID = async () => {
    axios
      .post(`${apiUrlAdvAcc}/GetWorkspaceDetailsByWorkspaceID`, {
        workspaceId: workspace_id, // Email ID for the user
      })
      .then((response) => {
        console.log("response:", response);

        if (response.data.length > 0 && response.data[0].Status === "Success") {
          const Workspace_Name = response.data[0].Workspace_Name;
          const Billing_Country = response.data[0].Billing_Country;
          const workspace_industry = response.data[0].Workspace_Industry;
          const address = response.data[0].Address; // Corrected case

          // Update main details
          setName(Workspace_Name);
          setcountry(Billing_Country);
          setIndustry(workspace_industry);
          setAddress(address);



          console.log("Workspace_Name:", Workspace_Name);
          console.log("Billing_Country:", Billing_Country);
          console.log("workspace_industry:", workspace_industry);
          console.log("address:", address);

          // Parse and update address details
          if (address) {
            console.log("Address::", address);
            try {
              const parsedAddress = JSON.parse(address);
              setStreetName(parsedAddress.street_name || "");
              setStreetnumber(parsedAddress.street_number || "");
              setCode(parsedAddress.postal_code || "");
              setcity(parsedAddress.city || "");
              setstate(parsedAddress.state || "");

              console.log("Address details:", parsedAddress);
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

  const UpdateWorkSpaceIndustry = async () => {

    if (!Industry) {
      setIndustryError('Please select a Industry before submitting.');
      return; // Prevent form submission or API call
    }
    // try{
    //   console.log("workspaceIndustry:" + Industry);
    // const data={
    // "userEmail": Existing_mailId,  
    // "workspaceIndustry" : Industry
    // }
    // console.log("data:" ,data);

    // console.log ("API:" , config.ApiUrlAdvAcc+"/UpdateWorkspaceIndustry/updateWorkspaceIndustry", data);


    // const response = await axios.put(config.ApiUrlAdvAcc+"/UpdateWorkspaceIndustry/updateWorkspaceIndustry", data);
    setIsLoading(true);
    axios.put(`${apiUrlAdvAcc}/updateWorkspaceIndustry`, {
      "workspaceid": workspace_id,
      "workspaceIndustry": Industry
    }
      //   ,{
      //     headers: {
      //         Authorization: `Bearer ${token}`, // Include the token here
      //     },
      // }
    )

      .then(response => {
        console.log("res:", response)
        if (response.data.status === 'Success') {
          toast.toast({
            title: "Success",
            description: "Company Industry Updated successfully",
            duration: 3000,
          })

          setTimeout(() => {

          }, 3000);
        } else {
          toast.toast({
            title: "Error",
            description: "Company Industry Update Failed",
            duration: 3000,
          })
          console.error('Update failed:', response.data.Status_Description);
        }
      }).catch(error => {
        toast.toast({
          title: "Error",
          description: "Company Industry Update Failed",
          duration: 3000,
        })
        console.error("Error in Company Industry update", error);
      }).finally(() => {
        setIsLoading(false);
      });

  };

  const handleCompanyUpdate = async () => {
    if (nameError) {
      return;
    }
    setIsLoading(true);
    axios.put(`${apiUrlAdvAcc}/UpdateWorkSpaceName`, {
      "workspaceId": workspace_id,
      "newWorkspaceName": name
    }

    )

      .then(response => {
        console.log("workspaceId", workspace_id,);
        console.log("newWorkspaceName", name);
        console.log("res:", response)
        if (response.data.status === 'Success') {

          toast.toast({
            title: "Success",
            description: "Company name Updated Successfully",
            duration: 3000,
          })
          dispatch(setworkspace(name));
          setTimeout(() => {

          }, 3000);

        } else {
          toast.toast({
            title: "Error",
            description: "Company name Update Failed",
            duration: 3000,
          })
          console.error('Update failed:', response.data.Status_Description);
        }
      })
      .catch(error => {
        toast.toast({
          title: "Error",
          description: "Company name Update Failed",
          duration: 3000,
        })
        console.error("Error in Profile update", error);
      }).finally(() => {
        setIsLoading(false);
      });

  };

  useEffect(() => {
    const id = localStorage.getItem("userid");
    console.log("id :" + id);
    // handleCompanyUpdate();
    // setName(name);

  }, []);


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
          setErrorMessage('');
          setFileName(file.name);
          // Convert image to Base64
          const base64String = reader.result?.toString().split(",")[1]; // Remove metadata
          setBase64Image(base64String || "");

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
    const mappingId = workspace_id;

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
      const response = await axios.put(`${apiUrlAdvAcc}/UpdateLogo_workspace_id`, {
        CreatedBy: accountId,
        MappingId: mappingId,
        Image: base64Image,
        UpdatedBy: workspace_id,
        UpdatedDate: new Date(),
        CreatedDate: new Date(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", response.data);

      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Logo updated successfully.",
          duration: 3000,
        });

        setFileName('');
        setBase64Image('');
        setErrorMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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


  const handleOpen = () => {
    setIsAlertOpen(true);
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  const token = localStorage.getItem('token');

  const handleAccountDeletion = async () => {
    setIsLoading(true);
    console.log("Workspace List :" , workspace_list);
    console.log("OLD workspace ID :" , wid);
    
    // Get the next available workspace_id (other than the given one)
    const nextWorkspace = workspace_list.find((ws) => ws.workspace_id !== wid);
    let newwid:number ;
    let newworkspaceName:string ;
    if (nextWorkspace) {
      newwid = nextWorkspace.workspace_id;
      newworkspaceName = nextWorkspace.workspace_name;
      
      console.log("New Workspace ID:", newwid);
      console.log("New Workspace Name:", newworkspaceName);
    } else {
      console.log("No other workspace found.");
    } 
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/deleteworkspce?workspaceid=${workspace_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token here
          },
        }
      );

      if (response.status === 200) {
        setIsLoading(false);
        toast.toast({
          title: "Success",
          description: "Your Workspace has been deleted!",
          duration: 1000,
        });
        setTimeout(()=>{
          dispatch(setWorkspaceId(newwid?newwid:0));
          dispatch(setworkspace(newworkspaceName?newworkspaceName:""));
          newwid?
            navigate("/navbar/dashboard/"):
            navigate("/");
        },1000);
      }
    } catch (error) {
      setIsLoading(false);
      toast.toast({
        title: "Failed",
        description: "Error in Deletion",
        duration: 3000,
      });
      console.error("Error deleting workspace:", error);
    } finally {
      handleClose(); // Ensures handleClose() runs after the API call
    }
  };

  const confirmDelete = () => {
    handleAccountDeletion(); // 
  };



  return (
    <div className="flex h-screen">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
          <CircularProgress className="text-primary" />
        </div>
      )}

      <div className="flex-grow ml-0 p-2 overflow-y-auto ">
        <Toaster />
        {/* Comapany logo */}
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl ">

          <Typography
            component="h2"
            className=" mb-4"
            style={{
              fontWeight: 600,
              fontSize: "14px",
              paddingBottom: "6px",
              lineHeight: "24px",
              color: "#020617"
            }}
          >
            <b>Company logo</b>
          </Typography>
          <Typography
            className="mb-4 mt-1"
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#64748B",
              lineHeight: "24px",
            }}
          >
            Update your team's logo to make it easier to identify
          </Typography>

          <div
            className="flex items-center gap-2 mt-4 cursor-pointer"
            onClick={() => document.getElementById("file-upload")?.click()}
          >

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
                  className="font-medium text-[14px] bg-[#F1F5F9] w-[50%] text-[#fff] hover:bg-gray-300 focus:ring-[#F1F5F9]
                    mt--1 form-button"
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
          <Button onClick={handleUpdateImage} disabled={isLoading} className="py-1 px-3 text-sm w-[128px] mt-1 form-button" style={{ fontWeight: 400, fontSize: '14px' }}>
            {isLoading ? 'Updating...' : 'Update image'}
          </Button>
        </Card>

        {/* Profile Information Section */}
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl">
          <Typography
            component="h3"
            className="mb-4"
            style={{ fontWeight: 600, fontSize: "14px", paddingBottom: "6px", color: "#020617" }}
          >
            <b>Company name</b>
          </Typography>
          <Typography
            component="p"
            className="mb-4"
            style={{ fontSize: "14px", fontWeight: 400, color: "#64748B" }}
          >
            Update your team's name
          </Typography>
          <Input
            className="mb-[-2] mt-6 text-[#020617] text-[14px] font-normal"
            value={name}
            // onChange={(e) => setName(e.target.value)}
            onChange={handleCompanyNameChange}
            placeholder="Your name"
            aria-label="Your name"
          />
          {nameError && (
            <p className="text-red-500 text-xs font-medium mt-1 mb-2 font-sans italic ml-1">{nameError}</p>
          )}
          <Button
            onClick={handleCompanyUpdate}
            disabled={isLoading}
            className="py-1 px-3 text-sm w-[35%] mt-4 form-button" style={{ fontWeight: 500, fontSize: '14px', color: "#F8FCFC" }}
          >
            {isLoading ? "Updating..." : "Update Company Name"}
          </Button>
        </Card>

        {/* Update Email Section */}
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl">
          <Typography
            component="h3"
            className="mb-4"
            style={{ fontWeight: 600, fontSize: "14px", paddingBottom: "6px", color: "#020617" }}
          >
            <b>Company address</b>
          </Typography>
          <Typography
            component="p"
            className="mb-4"
            style={{ fontSize: "14px", fontWeight: 400, color: "#64748B" }}
          >
            Update your company address
          </Typography>
          {WarningMessage && (
            <p className="text-red-500 text-xs font-medium mt-1 font-sans italic text-left ">{WarningMessage}</p>
          )}
          
          <div className="mb-4 mt-4">
            <div className="mb-4 mt-4">
              <Input
                value={Streetname}
                // onChange={(e) => setStreetName(e.target.value)}
                onChange={handleStreetNameChange}
                placeholder="Street name"
                aria-label="Street Name" />
              {StreetNameError && (
                <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{StreetNameError}</p>
              )}
            </div>

            <div className="mb-4 mt-4">
              <Input
                value={Streetnumber}
                // onChange={(e) => setStreetnumber(e.target.value)}
                onChange={handleStreetNumberChange}
                placeholder="Street number"
                aria-label="Street number"
              />
              {StreetNumberError && (
                <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{StreetNumberError}</p>
              )}
            </div>

            <div className="mb-4 mt-4">
              {/* <Input className="mb-4 mt-4" value={Streetnumber} onChange={handleStreetNumberChange} placeholder="Street number" aria-label="Street Number" /> */}
              <Input
                value={City}
                // onChange={(e) => setcity(e.target.value)}
                onChange={handleCityChange}
                placeholder="City"
                aria-label="City"
              />
              {CityError && (
                <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{CityError}</p>
              )}
            </div>

            <div className="mb-4 mt-4">
              <Input
                value={Code}
                //  onChange={(e) => setCode(e.target.value)}
                onChange={handlePostalCodeChange}
                placeholder="Postal Code"
                aria-label="Postal Code"
              />
              {PostalCodeError && (
                <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{PostalCodeError}</p>
              )}
            </div>

            <div className="mb-4 mt-4">
              {/* <Input className="mb-4 mt-4" value={Code} onChange={handlePostalCodeChange} placeholder="Postal Code" aria-label="Postal Code" /> */}
              <Input
                value={State}
                required
                // onChange={(e) => setstate(e.target.value)}
                onChange={handleStateChange}
                placeholder="State"
                aria-label="State"
              />
              {StateError && (
                <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">{StateError}</p>
              )}
            </div>

            <div className="mb-4 mt-4">
              <Input
                  required
                  id="billingcountry"
                  placeholder={Country}
                  className="w-full border-gray-400 rounded-[7px] custom-placeholder"
                  disabled
              />
              {CountryError && (
                <Typography className="text-red-500 mb-4">{CountryError}</Typography>
              )}
            </div>

          </div>
          <Button
            onClick={UpdateWorkspaceAddress}
            disabled={isLoading}
            className="py-1 px-3 text-sm w-[204px] mt-4 form-button" style={{ fontWeight: 500, fontSize: '14px', color: "#F8FCFC" }}
          >
            {isLoading ? "Updating..." : "Update Company address"}
          </Button>
        </Card>

        <Card className="mb-8 p-6 border border-grey text-left max-w-xl">
          <Typography
            component="h3"
            className="mb-4"
            style={{ fontWeight: 600, fontSize: "14px", paddingBottom: "6px", color: "#020617" }}
          >
            <b>Company industry</b>
          </Typography>
          <Typography
            component="p"
            className="mb-4"
            style={{ fontSize: "14px", fontWeight: 400, color: "#64748B" }}
          >
            We collect this information for analytics and to provide more
            accurate guidance for your account.
          </Typography>

          <Select
            value={Industry}
            onValueChange={(value) => {
              console.log("Selected Industry:", value); // Log the selected value
              setIndustry(value); // Update state with the selected value
            }}
          >
            <SelectTrigger className="text-gray-500 mt-4 text-left w-full p-2 border border-gray-300 rounded">
              <SelectValue
                className="text-gray-500"
                placeholder="Select Industry"
              />
            </SelectTrigger>
            <SelectContent>
              {industrylist.map((industry) => (
                <SelectItem
                  className="cursor-pointer"
                  key={industry.industry_id}
                  value={industry.industry_name}
                >
                  {industry.industry_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {IndustryError && (
            <Typography className="text-red-500 mb-4">{IndustryError}</Typography>
          )}
          <Button
            onClick={UpdateWorkSpaceIndustry}
            disabled={isLoading}
            className="py-1 px-3 text-sm w-[140px] form-button" style={{ fontWeight: 500, fontSize: '14px', color: "#F8FCFC" }}
          >
            {isLoading ? "Updating..." : "Update Industry"}
          </Button>

        </Card>

        {/* Delete Account Section */}
        <Card className="mb-8 p-6 border border-grey text-left max-w-xl border-2 border-red-600">
          <Typography
            component="h3"
            className="mb-4"
            style={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "24px",
              color: "#020617",
              letterSpacing: "-1.5%",
              paddingBottom: "6px",
            }}
          >
            {" "}
            Danger zone
          </Typography>
          <Typography
            component="p"
            className="mb-4"
            style={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#64748B",
            }}
          >
            Some actions cannot be undo. Please be careful.
          </Typography>
          <Typography
            component="h3"
            className="mb-4"
            style={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "24px",
              color: "#020617",
              letterSpacing: "-1.5%",
              paddingBottom: "6px",
            }}
          >
            Delete team
          </Typography>
          <Typography
            component="p"
            className="mb-4"
            style={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#64748B",
            }}
          >
            This action cannot be undone. All data associated with this team
            will be deleted.
          </Typography>
          <Button
            onClick={() => {
              if (UserRole === 'Primary Owner' || UserRole ==='Primary Advertiser') {
                handleOpen(); // Open the dialog if the user is the Primary Owner or Primary Advertiser
              } else {
                toast.toast({
                  title: "Access denied",
                  description: "Access denied. You are not a Primary Advertiser.",
                  duration: 3000,
                })
              }
            }}
            // onClick={handleAccountDeletion}
            className="bg-[#EF4444] text-white py-2 px-4 text-sm hover:bg-red-700 w-[167px]"
          >
            <span style={{ fontWeight: 500, fontSize: '14px', color: "#F8FCFC" }}>   Delete your workspace </span>
          </Button>



          <Dialog
            open={isAlertOpen}
            onOpenChange={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"

          >
            <DialogContent className="max-w-xl ">
              <DialogHeader>
               <DialogTitle className="text-18px font-semibold text-[#09090B] mb-2">
                Delete Account
                </DialogTitle>
                <DialogDescription className="text-14px font-medium text-[#71717A]">
                If you delete your Workspace, the associated data will also be deleted. Do you want to proceed?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-4">
                <Button disabled={isLoading} variant="outline" className="px-4 py-2 w-24" onClick={handleClose}>
                  Cancel
                </Button>
                <Button className="px-4 py-2 w-24 bg-red-500 text-white hover:bg-red-600" onClick={confirmDelete} autoFocus>
                  {isLoading?"Deleting...":"OK"}
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

export default Workspace_settings;
