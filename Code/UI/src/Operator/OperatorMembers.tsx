import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "src/Components/ui/card";
import { Button } from "src/Components/ui/button";
import { Input } from "src/Components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/Components/ui/table";
import { Badge } from "src/Components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "src/Components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "src/Components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/Components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "src/Components/ui/select";
import { Label } from "src/Components/ui/label";
import { CaretSortIcon, PlusIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "src/State/store";
// import { ToastContainer, toast } from "react-toastify";
import { toast, useToast } from "src/Components/ui/use-toast";
import { Toaster } from "src/Components/ui/toaster";
import { CircularProgress, DialogActions, DialogContentText } from "@mui/material";

interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  joined_at: string;
  wId: number;
  image: string;
  // assuming date is a string in ISO format
}

interface InviteMember {
  member_id: number;
  name: string;
  email: string;
  role: string;
  invited_at: string;
  expires_date: string;
  status: string;
}

interface ValidationError {
  emailError: string;
  roleError: string;
}

interface Roles {
  role_id: number;
  role_name: string;
}

const Members: React.FC = () => {
  // const initialMembers: Member[] = [
  //   { name: 'Alice Johnson', email: 'alice@example.com',role:'owner', joinedDate:'2024-10-11T10:30:00Z',wId:0 },
  //   { name: 'John Doe', email: 'john@example.com',role:'owner', joinedDate:'2024-09-25T09:15:00Z',wId:0 },
  //   { name: 'Jane Smith', email: 'jane@example.com',role:'owner', joinedDate: '2024-11-01T14:45:00Z',wId:0 },
  //   { name: 'Bob Brown', email: 'bob@example.com', role:'owner', joinedDate: '2024-08-21T12:00:00Z',wId:0 },
  // ];

  // const inviteMembersList : InviteMember[] = [
  //   {
  //     name: "John Doe",
  //     role: "Admin",
  //     invitedAt: "01/01/2024",
  //     expiresAt: "01/07/2024",
  //     status: "Active",
  //   },
  //   {
  //     name: "Jane Smith",
  //     role: "Member",
  //     invitedAt: "02/01/2024",
  //     expiresAt: "02/07/2024",
  //     status: "Pending",
  //   },
  //   {
  //     name: "Alice Johnson",
  //     role: "Owner",
  //     invitedAt: "03/01/2024",
  //     expiresAt: "03/07/2024",
  //     status: "Active",
  //   },
  // ];

  const [open, setOpen] = useState(false);
  // const [members, setCurrentMembers] = useState([{ email: '', role: 'Member' }]);

  //const roles = ['Member', 'owner'];

  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [inviteSearchTerm, setInviteSearchTerm] = useState("");
  const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
  const [isPrimaryOperator, setIsPrimaryOperator] = useState(false);
  // const [isPrimaryAdvertiser, setIsPrimaryAdvertiser] = useState(false);

  const [originalMembers, setOriginalMembers] = useState<Member[]>([]); // For resetting
  const [isSorted, setIsSorted] = useState(false);

  const [inviteCurrentMembers, setInviteCurrentMembers] = useState<
    InviteMember[]
  >([]);
  const [inviteOriginalMembers, setInviteOriginalMembers] = useState<
    InviteMember[]
  >([]); // For resetting
  const [isInviteSorted, setIsInviteSorted] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedUserMail, setSelectedUserMail] = useState<string>("");
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([
    { emailError: "", roleError: "" },
  ]);
  const [emailErrors, setEmailErrors] = useState<string>("")
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  console.log("id :" + workspaceId);
  const [invitedMembers, setInvitedMembers] = useState([
    {
      member_id: 0,
      email: "",
      role: "",
      first_name: "",
      last_name: "",
      wId: workspaceId,
    },
  ]);
  const [roles, setRoles] = useState<Roles[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUserEdit, setIsuserEdit] = useState(false);
  const toast = useToast();
  const [imageSrc, setImageSrc] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [delete_personalemail, setdelete_personalemail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const [touchedFields, setTouchedFields] = useState<boolean[]>([]);
  const workspacename = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );
  const personalemail = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  console.log("Email : " + personalemail);
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setApiUrl(config.API_URL);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (apiUrlAdvAcc) {
        // Debugging log
        try {
          await getRolesList();
          await getMemebersList();
          await getPendingMembersList();
          debugger;
          await fetchProfileImage(); // Load the channel list
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("apiUrlAdvAcc is missing", {
          apiUrlAdvAcc,
        }); // Log to help debug
      }
    };

    fetchData();
  }, [apiUrlAdvAcc]);

  useEffect(() => {
    if (!isAlertOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [isAlertOpen]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString); // Parse the date string
    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2-digit day
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear(); // Get the full year
    return `${day}/${month}/${year}`; // Return the formatted string
  };

  const getMemebersList = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetUserDetailsByWorkspace?WorkspaceId=${workspaceId}`
      );

      if (response.data.status == "Success") {
        const membersList = response.data.usersWorkspaceList;

        setCurrentMembers(membersList);
        setOriginalMembers(membersList);

        // Check if the logged-in user is a Primary Owner
        const loggedInUser = membersList.find(
          (member: Member) => member.email === personalemail
        );

        if (loggedInUser && loggedInUser.role === "Primary Operator") {
          setIsPrimaryOperator(true);
          // Update state if the user is a Primary Advertiser
        } else {
          setIsPrimaryOperator(false);
          // setIsPrimaryAdvertiser(false); // Otherwise, set it to false
        }

        console.log(
          "Member's List:",
          JSON.stringify(response.data.usersWorkspaceList, null, 2)
        );
        setIsLoading(false)
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false)
    }
  };

  const UpdateUserRole = async (role: string, email: string) => {
    setIsLoading(true);
    // const selectedRole = roles.find((findrole) => findrole.role_name === role);

    // // Get the channel ID, or null if not found
    // const updateRoleId = selectedRole ? selectedRole.role_id : null;
    try {
      const response = await axios.put(
        `${apiUrlAdvAcc}/UpdateUserRole?WorkspaceId=${workspaceId}&Email=${email}&RoleId=${Number(
          role
        )}`
      );
      if (response.data.status == "Success") {
        setIsuserEdit(false);
        setOpen(false);
        console.log("User Role Updated Successfully");
        getMemebersList();
        toast.toast({
          title: "Success",
          description: "User Role Updated Successfully.",
        });
        setIsLoading(false);
      } else {
        setIsuserEdit(false);
        setOpen(false);
        console.log("Error Updating User Role");
        toast.toast({
          title: "Error",
          description: "Error Updating User Role.",
        });
        setIsLoading(false);
      }
    } catch (e) {
      setIsuserEdit(false);
      setOpen(false);
      console.log("Error Updating User Role");
      toast.toast({
        title: "Error",
        description: "Error Updating User Role.",
      });
    }
  };

  const getPendingMembersList = async () => {
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetMembersByWorkspaceId?workspaceId=${workspaceId}`
      );

      debugger;
      if (response.data.status == "Success") {
        setInviteCurrentMembers(response.data.members);
        setInviteOriginalMembers(response.data.members);
        console.log("Pending Member's List:" + response.data.members);
      } else {
        console.log("No pending members");
        setInviteCurrentMembers([]);
        setInviteOriginalMembers([]);
      }

      debugger;
    } catch (err) {
      setError("Failed to fetch members. Please try again later.");
      console.error("Error fetching members:", err);
    }
  };

  const getPendingMemberById = async (memberId: number) => {
    debugger;
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetPendingMemberById?workspaceId=${workspaceId}&memberId=${memberId}`
      );
      debugger;
      if (response.data.status === "Success") {
        const memberDetails = response.data.members[0];
        //updateRole=memberDetails[0].role;
        // Find the matching role_id for the role_name from the API response
        const matchedRole = roles.find(
          (role) => role.role_name === memberDetails.role
        );

        setInvitedMembers([
          {
            member_id: memberId,
            email: memberDetails.email,
            role: matchedRole?.role_id?.toString() || "", // Use the role_id or an empty string if not found
            first_name: "",
            last_name: "",
            wId: workspaceId,
          },
        ]);
        console.log("Pending Members : " + invitedMembers);
        setIsUpdating(true);
        setOpen(true); // Open the dialog box
      } else {
        console.error("Failed to fetch member details:", response.data.message);
        toast.toast({
          title: "Error",
          description: "Failed to fetch member details. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
      toast.toast({
        title: "Error",
        description: "An error occurred while fetching member details.",
      });
    }
  };

  const GetUserRoleById = async (memberId: number, email: string) => {
    debugger;
    try {
      setSelectedUserMail(email);
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetUserRoleById?Email=${email}`
      );
      debugger;
      if (response.data.status === "Success") {
        const userRoleDetails = response.data.userRole[0];

        setInvitedMembers([
          {
            member_id: memberId,
            email: email,
            role: userRoleDetails?.role_id || "", // Use the role_id or an empty string if not found
            first_name: "",
            last_name: "",
            wId: workspaceId,
          },
        ]);
        console.log("Pending Members : " + invitedMembers);
        setIsUpdating(true);
        setOpen(true); // Open the dialog box
      } else {
        console.error("Failed to fetch member details:", response.data.message);
        toast.toast({
          title: "Error",
          description: "Failed to fetch member details. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
      toast.toast({
        title: "Error",
        description: "An error occurred while fetching member details.",
      });
    }
  };

  // const getRolesList = async () => {
  //   try {
  //     const response = await axios.get(`${apiUrlAdvAcc}/GetAdvRolesList`);

  //     // Assuming the response data contains a 'CountryList' field as discussed earlier
  //     if (response.data && response.data.rolesList) {

  //       setRoles(response.data.rolesList);
  //       console.log("Country List : ", response.data.rolesList);
  //     } else {
  //       console.log("No roles list available in response.");
  //     }
  //   } catch (error) {
  //     // Handle error if API call fails

  //     console.error("Error fetching error list:", error);
  //   } finally {
  //   }
  // };

  const getRolesList = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetAdvRolesList`);

      if (response.data && response.data.rolesList) {
        console.log("Roles List Response:", response.data.rolesList);


        const filteredRoles = response.data.rolesList.filter(
          (role: { role_id: number; }) =>
            role.role_id > 11
        );
        setRoles(filteredRoles);
        console.log("Filtered Roles List:", filteredRoles);
      } else {
        console.log("No roles list available in response.");
      }
    } catch (error) {
      console.error("Error fetching roles list:", error);
    }
  };

  const fetchProfileImage = async () => {
    debugger;
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetProfileImage`, {
        params: { EmailId: personalemail },
      });

      if (response.data.status === "Success") {
        // Decode base64 string and create a data URL
        const base64String = response.data.image[0].image;
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        setImageSrc(dataUrl);
      } else {
        console.error(
          "Failed to fetch image:",
          response.data.status_Description
        );
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleMemberSearch = (value: string) => {
    setMemberSearchTerm(value);

    // If user cleared the search, revert to the full list
    if (!value.trim()) {
      setCurrentMembers(originalMembers);
      return;
    }

    const searchValue = value.toLowerCase();

    // Filter on first_name + last_name (and/or email, etc.)
    const filtered = originalMembers.filter((member) => {
      const fullName = (
        member.first_name +
        " " +
        member.last_name
      ).toLowerCase();
      return fullName.includes(searchValue);
    });

    setCurrentMembers(filtered);
  };

  // 2) For PENDING INVITES
  // The search handler for pending invites
  const handleInviteSearch = (value: string) => {
    setInviteSearchTerm(value);

    if (!value.trim()) {
      // Revert to the full invites list
      setInviteCurrentMembers(inviteOriginalMembers);
      return;
    }

    const searchValue = value.toLowerCase();
    const filtered = inviteOriginalMembers.filter((m) =>
      m.email.toLowerCase().includes(searchValue)
    );
    setInviteCurrentMembers(filtered);
  };

  const handleSendInvites = async () => {

    if (!validateRows()) {
      // If validation fails, do not proceed
      return;
    }
    setIsLoading(true)
    try {
      const data = invitedMembers.map((member) => ({
        WorkspaceId: workspaceId,
        email: member.email,
        role: member.role,
        InvitedAt: new Date().toISOString(),
        status: "Active",
        IsAccepted: "No",
        InvitedBy: personalemail,
      }));

      const response = await axios.post(
        `${apiUrlAdvAcc}/InsertPendingInvitedMembers`,
        data
      );

      if (response.data.status === "Success") {
        debugger;
        const { alreadyInvited, successfullyInvited } = response.data;

        // Display toast for members already invited
        if (alreadyInvited && alreadyInvited.length > 0) {
          toast.toast({
            title: "Warning",
            description: `These members are already invited: ${alreadyInvited.join(
              ", "
            )}`,
          });

          setIsLoading(false);
        }

        // Handle successfully invited members
        if (successfullyInvited && successfullyInvited.length > 0) {
          const requestData = successfullyInvited.map((email: string) => {
            const member = invitedMembers.find((m) => m.email === email);
            return {
              Email: member?.email || "",
              Name: member?.first_name || "",
              WorkspaceId: member?.wId || workspaceId,
              RoleId: parseInt(member?.role || "0"),
            };
          });

          const response2 = await axios.post(
            `${apiUrl}/SendInvite/send-invite`,
            requestData
          );

          if (response2.data.status === "Success") {
            toast.toast({
              title: "Success",
              description: "Invites sent successfully.",
            });
            setIsLoading(false);
          } else {
            toast.toast({
              title: "Error",
              description: "Error sending email invites.",
            });
            setIsLoading(false);
          }
        }

        // Reset the form and close dialog
        setInvitedMembers([
          {
            member_id: 0,
            email: "",
            role: "",
            first_name: "",
            last_name: "",
            wId: workspaceId,
          },
        ]);
        handleClose();
        getPendingMembersList();
      } else {
        handleClose();
        toast.toast({
          title: "Error",
          description: "Error sending email invites.",
        });

        setIsLoading(false);
        //(response.data.Status_Description || "An unknown error occurred.");
      }
    } catch (error) {
      console.error("Error sending invites:", error);
      handleClose();
      toast.toast({
        title: "Error",
        description: "Error sending email invites.",
      });
      setIsLoading(false);
    }
  };

  const updateSendInvites = async (member_id: number) => {
    setIsLoading(true);
    try {
      const member = invitedMembers.find((m) => m.member_id === member_id); // Find the specific member
      if (!member) {
        toast.toast({
          title: "Error",
          description: "Member not found.",
        });
        setIsLoading(false);
        return;
      }

      // Prepare request data for the send-invite API
      const requestData = [
        {
          Email: member.email, // Member's email address
          Name: member.first_name || "", // Member's first name or an empty string if not provided
          WorkspaceId: member.wId || workspaceId, // Workspace ID for the invite
          RoleId: parseInt(member.role || "0"), // Role ID, converted to an integer
        },
      ];

      // Execute send-invite API
      const response1 = await axios.post(
        `${apiUrl}/SendInvite/send-invite`,
        requestData
      );

      if (response1.data.status === "Success") {
        // Proceed to update pending invites after successfully sending the invite
        const data = {
          WorkspaceId: workspaceId,
          email: member.email,
          role: member.role,
          InvitedAt: new Date().toISOString(),
          status: "Active",
          IsAccepted: "No",
          InvitedBy: personalemail,
        };
        setIsLoading(false);

        const response2 = await axios.put(
          `${apiUrlAdvAcc}/UpdatePendingInvitedMembers?member_id=${member_id}`,
          data // Send the single member object
        );

        if (response2.data.status === "Success") {
          toast.toast({
            title: "Success",
            description: "Invite updated and sent successfully.",
          });
          setIsLoading(false);
          handleClose();
          getPendingMembersList();
        } else {
          toast.toast({
            title: "Error",
            description: "Error updating the invite after sending.",
          });
          setIsLoading(false);
          handleClose();
        }
      } else {
        toast.toast({
          title: "Error",
          description: "Error sending the invite email.",
        });
        setIsLoading(false);
        handleClose();
      }
    } catch (e) {
      console.error("Error updating invite:", e);
      handleClose();
      toast.toast({
        title: "Error",
        description: "An unexpected error occurred while processing invites.",
      });
    }
  };

  const DeleteSendInvites = async (member_id: number) => {
    debugger;
    try {
      const response = await axios.delete(
        `${apiUrlAdvAcc}/DeletePendingMemberById?MemberId=${member_id}` // Send the single member object
      );

      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Invite deleted successfully.",
        });
        getPendingMembersList();
      } else {
        toast.toast({
          title: "Error",
          description: "Error deleting the invite.",
        });
      }
    } catch (e) {
      console.error("Error deleting invite:", e);
      toast.toast({
        title: "Error",
        description: "Error deleting invites.",
      });
    }
  };

  const handleMemberChange = (
    index: number,
    field: keyof Member,
    value: string
  ) => {
    const updatedMembers = [...invitedMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    } as unknown as Member;
    setInvitedMembers(updatedMembers);
  };

  const handleEmailChange = (index: number, emailValue: string) => {
    const updatedMembers = [...invitedMembers];
    updatedMembers[index].email = emailValue;
    setInvitedMembers(updatedMembers);

    // Validate the email immediately
    const updatedErrors = [...errors];
    if (!emailValue) {
      updatedErrors[index].emailError = "Email is required";
    } else if (!isValidEmail(emailValue)) {
      updatedErrors[index].emailError = "Invalid email address";
    } else {
      updatedErrors[index].emailError = ""; // Clear the error if valid
    }
    setErrors(updatedErrors);
  };

  // This function is triggered when the input field loses focus (onBlur event)
  const handleBlur = (index: number, value: string) => {
    // Only check for invalid email when the user leaves the input field
    if (!value) {
      setErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[index].emailError = "Email is required";
        return newErrors;
      });
    } else if (!isValidEmail(value)) {
      setErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[index].emailError = "Invalid email address";
        return newErrors;
      });
    }
  };

  const handleRoleChange = (index: number, roleValue: string) => {
    const updatedMembers = [...invitedMembers];
    updatedMembers[index].role = roleValue;
    setInvitedMembers(updatedMembers);

    // Immediately clear or set error for role if needed
    const updatedErrors = [...errors];
    if (!roleValue) {
      updatedErrors[index].roleError = "Role is required";
      setErrors(updatedErrors);
    } else {
      updatedErrors[index].roleError = "";
    }

  };

  /**
   * Validate all rows:
   * If a member has empty email or role, set the respective error message.
   */
  const validateRows = () => {
    let isValid = true;
    const newErrors = invitedMembers.map((member) => {
      const errorObj: ValidationError = { emailError: "", roleError: "" };

      // Check if email is empty
      if (!member.email) {
        errorObj.emailError = "Email is required";
        isValid = false;
      } else if (!isValidEmail(member.email)) {
        errorObj.emailError = "Invalid email address";
        isValid = false;
      }

      // Check if role is empty
      if (!member.role) {
        errorObj.roleError = "Role is required";
        isValid = false;
        setIsLoading(false);
      } else {
        errorObj.roleError = "";
      }

      return errorObj;
    });

    setErrors(newErrors);
    return isValid;
  };

  // Helper function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    setEmailErrors(isValid ? "" : "Invalid email address");

    return isValid;
  };

  const handleAddMember = () => {
    setInvitedMembers([
      ...invitedMembers,
      {
        member_id: 0,
        email: "",
        role: "",
        first_name: "",
        last_name: "",
        wId: 0,
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = invitedMembers.filter((_, i) => i !== index);
    setInvitedMembers(updatedMembers);
  };

  const handlePersonalDeleteClick = (accountEmail: string) => {
    console.log(`Deleting Personal Account : ${accountEmail}`);
    setdelete_personalemail(accountEmail);
    setIsAlertOpen(true);
  };

  const handleDeleteClose = () => {
    setIsAlertOpen(false); // Close the dialog

    // Focus on the next interactive element (e.g., a button, input field, etc.)
    // Assuming there's a button with the ref `myButton`
    const firstFocusableElement = document.querySelector(
      ".focusable"
    ) as HTMLElement;
    firstFocusableElement?.focus(); // Set focus to the first focusable element
  };

  const confirmDelete = async () => {
    debugger;
    try {
      console.log(`Deleting Personal Account: ${delete_personalemail}`);

      // Indicate loading state
      setIsLoading(true);

      // Make the API call
      const response = await axios.delete(
        `${apiUrlAdvAcc}/DeleteUserRole?email=${delete_personalemail}&WorkspaceId=${workspaceId}`
      );
      const errorMessage = response.data[0]?.status_Description;
      if (response.status === 200) {
        // Check if the response has the expected status and description
        setIsAlertOpen(false);
        toast.toast({
          title: "Success",
          description: "Account Deleted Successfully",
        });
      } else {
        toast.toast({
          title: "Error",
          description: "Something went wrong, please try again.",
        });
      }
    } catch (error) {
      // Handle errors
      toast.toast({
        title: "Error",
        description: "Something went wrong, please try again.",
      });
      console.error("Error deleting personal:", error);
    } finally {
      // Reset loading state and refresh the account list
      getMemebersList();
    }
  };

  const sortByField = (
    field: keyof Member,
    type: "string" | "number" | "date" = "string"
  ) => {
    debugger;
    const sortedMembers = [...originalMembers].sort((a, b) => {
      if (type === "number") {
        return Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        return Date.parse(a[field] as string) - Date.parse(b[field] as string);
      } else {
        return String(a[field]).localeCompare(String(b[field]));
      }
    });
    //setOriginalMembers(currentMembers); // Save original state
    setCurrentMembers(sortedMembers); // Set sorted members
  };

  // Function to handle sorting based on column clicked
  const sortMembers = (tableHeader: string) => {
    if (isSorted) {
      // Reset to original list if already sorted
      setCurrentMembers(originalMembers);
    } else {
      switch (tableHeader) {
        case "ByMemberName":
          sortByField("first_name", "string"); // Sorting by member name
          break;
        case "ByMemberEmail":
          sortByField("email", "string"); // Sorting by member email
          break;
        case "ByMemberRole":
          sortByField("role", "string"); // Sorting by who invited
          break;
        case "ByInviteDate":
          sortByField("joined_at", "string"); // Sorting by invite date
          break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted); // Toggle sorting state
    console.log("Sorted members:", currentMembers); // Debugging
  };

  const sortInviteByField = (
    field: keyof InviteMember,
    type: "string" | "number" | "date" = "string"
  ) => {
    const sortedMembers = [...inviteCurrentMembers].sort((a, b) => {
      if (type === "number") {
        return Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        return Date.parse(a[field] as string) - Date.parse(b[field] as string);
      } else {
        return String(a[field]).localeCompare(String(b[field]));
      }
    });
    setInviteOriginalMembers(inviteCurrentMembers); // Save original state
    setInviteCurrentMembers(sortedMembers); // Set sorted members
  };

  // Function to handle sorting based on column clicked
  const sortInviteMembers = (tableHeader: string) => {
    if (isSorted) {
      // Reset to original list if already sorted
      setInviteCurrentMembers(inviteOriginalMembers);
    } else {
      switch (tableHeader) {
        case "ByInviteMemberName":
          sortInviteByField("name", "string"); // Sorting by member name
          break;
        case "ByInviteMemberRole":
          sortInviteByField("role", "string"); // Sorting by member email
          break;
        case "ByMemberInvitedAt":
          sortInviteByField("invited_at", "string"); // Sorting by who invited
          break;
        case "ByMemberExpiresAt":
          sortInviteByField("expires_date", "string"); // Sorting by invite date
          break;
        case "ByMemberStatus":
          sortInviteByField("status", "string"); // Sorting by invite date
          break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted); // Toggle sorting state
    console.log("Sorted members:", currentMembers); // Debugging
  };

  const handleOpen = () => {
    setInvitedMembers([
      {
        member_id: 0,
        email: "",
        role: "",
        first_name: "",
        last_name: "",
        wId: workspaceId,
      },
    ]);
    setIsUpdating(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="p-6 flex flex-col gap-6">

      <Toaster />
      {isLoading && (
        <div className="loading-overlay">
          <CircularProgress color="success" />
        </div>
      )}
      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-left">Team Members</h2>
              <p className="text-sm text-gray-600">
                Here you can manage the members of your team.
              </p>
            </div>
            {(isPrimaryOperator) && ( // Check if the user is a Primary Owner
              <Button className="w-48 text-white mt-0 form-button" onClick={handleOpen}>
                <PlusIcon className="w-4 h-4 text-white" /> Invite members
              </Button>
            )}

            <Dialog open={open} onOpenChange={handleClose}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isUserEdit
                      ? "Update Member"
                      : isUpdating
                        ? "Update Invitation"
                        : "Invite Members"}{" "}
                    to your Team
                  </DialogTitle>
                  <DialogDescription>
                    {isUserEdit
                      ? "Update the role details for the member."
                      : isUpdating
                        ? "Update the invitation details for the member."
                        : "Invite members to your team by entering their email and role."}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[300px]">
                  {invitedMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4  overflow-y-auto max-h-[300px] "
                    >
                      {/* Email Container */}
                      <div className="flex flex-col w-72">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={member.email}
                          onChange={(e) => {
                            handleMemberChange(index, "email", e.target.value)
                            isValidEmail(e.target.value)
                          }
                          }
                          // onBlur={(e) => handleBlur(index, e.target.value)}
                          className="w-full"
                          disabled={isUpdating} // Disable editing of the email field when updating
                        />
                        {/* Error message for email */}
                        {/* {errors[index]?.emailError && (
                          <p className="text-red-500 text-sm mt-1 self-start">
                            {errors[index].emailError}
                          </p>
                        )} */}
                        <div className="min-h-[20px] mt-1">
                        {emailErrors && (
                          <p className="text-red-500 h-[20px] text-sm mt-1 self-start">
                            {emailErrors}
                          </p>
                        )}
                        </div>
                        
                      </div>

                      {/* Role Container */}
                      <div className="flex flex-col mb-[-4]">
                        <Label>Role</Label>
                        <Select
                          value={member.role}
                          onValueChange={(value) => {
                            handleMemberChange(index, "role", value);
                            setSelectedRoleId(value);
                            handleRoleChange(index, value);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue
                              className="text-[#64748B]"
                              placeholder="Select Role"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem
                                key={role.role_id}
                                value={role.role_id.toString()}
                              >
                                {role.role_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Error message for role */}
                        <div className="min-h-[20px] mt-1">
                          {errors[index]?.roleError && (
                            <p className="text-red-500 text-sm  self-start">
                              {errors[index].roleError}
                            </p>

                          )}
                        </div>
                      </div>

                      {invitedMembers.length > 1 && (
                        <Button
                          variant="ghost"
                          className="w-6 mb-6"
                          onClick={() => handleRemoveMember(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* <Button
                  variant="link"
                  onClick={handleAddMember}
                  className="mt-2 justify-start"
                >
                  + Add another one
                </Button> */}
                {!isUpdating && (
                  <Button
                    variant="link"
                    onClick={handleAddMember}
                    className="mt-2 justify-start"
                  >
                    + Add another one
                  </Button>
                )}

                <Button
                  className="w-[465px] text-white mt-2 form-button"
                  onClick={() => {
                    if (isUserEdit) {
                      UpdateUserRole(selectedRoleId, selectedUserMail);
                    } else if (isUpdating) {
                      updateSendInvites(selectedMemberId);
                    } else {
                      handleSendInvites();
                    }
                  }}
                >
                  {isUserEdit
                    ? isLoading
                      ? "Updating..."
                      : "Update"
                    : isUpdating
                      ? isLoading
                        ? "Updating Invitation..."
                        : "Update Invitation"
                      : isLoading
                        ? "Sending Invites..."
                        : "Send Invites"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

        </CardHeader>
        <div className="mt-2 pr-6 pl-6">
          <Input
            placeholder="Search members by name"
            value={memberSearchTerm}
            onChange={(e) => handleMemberSearch(e.target.value)}
          />
        </div>
        <CardContent>
          <div className="rounded-md border mt-4">
            <Table
              className="rounded-xl whitespace-nowrap border-gray-200 "
              style={{ color: "#020202", fontSize: "15px" }}
            >
              <TableHeader className="text-center">
                <TableRow>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start cursor-pointer">
                      Name{" "}
                      <CaretSortIcon
                        onClick={() => sortMembers("ByMemberName")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Email{" "}
                      <CaretSortIcon
                        onClick={() => sortMembers("ByMemberEmail")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Role{" "}
                      <CaretSortIcon
                        onClick={() => sortMembers("ByMemberRole")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Joined at{" "}
                      <CaretSortIcon
                        onClick={() => sortMembers("ByInviteDate")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMembers && currentMembers.length > 0 ? (
                  currentMembers.map((member) => (
                    <TableRow key={member.member_id}>
                      <TableCell className="flex items-center space-x-2 py-4">
                        <Avatar>
                          <AvatarImage src={member.image ? `data:image/jpeg;base64,${member.image}` : undefined} />
                          <AvatarFallback className="mt-1">
                            {member.first_name?.[0].toUpperCase() || "N/A"}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {member.first_name + " " + member.last_name}
                        </span>
                        {member.email === personalemail && (
                          <Badge className="ml-2 bg-blue-500 text-white">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        {member.email}
                      </TableCell>
                      <TableCell className="text-left">
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: "#DFA548" }}
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        {formatDate(member.joined_at)}
                      </TableCell>
                      {(isPrimaryOperator) && (
                        <TableCell>

                          <DropdownMenu>
                            {/* <DropdownMenuTrigger className={`ml-2 cursor-pointer w-5 h-5 ${member.role === "Primary Operator" ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              disabled={member.role === "Primary Operator"} // Disable trigger for self
                            >
                              •••
                            </DropdownMenuTrigger> */}
                             {!(member.role === 'Primary Operator' || member.role === 'Primary Owner') && (
                                                          <DropdownMenuTrigger className="ml-2 cursor-pointer">
                                                            •••
                                                          </DropdownMenuTrigger>
                                                        )}
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsuserEdit(true);

                                  //setSelectedRoleId(member.role); // Set the member ID
                                  GetUserRoleById(
                                    member.member_id,
                                    member.email
                                  );
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  handlePersonalDeleteClick(member.email)
                                } // Open dialog on delete click
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Dialog
                            open={isAlertOpen}
                            onOpenChange={setIsAlertOpen}
                          >
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Confirm Delete</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this account?
                                </DialogDescription>
                              </DialogHeader>

                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    variant="outline"
                                    className="w-24"
                                    onClick={handleDeleteClose}
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button
                                  className="w-24"
                                  onClick={confirmDelete}
                                  autoFocus
                                >
                                  OK
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites Section */}
      <Card className="mb-[100px]">
        <CardHeader>
          <div>
            <h2 className="text-lg font-bold text-left">Pending Invites</h2>
            <p className="text-sm text-gray-600 text-left">
              Here you can manage the pending invitations to your team.
            </p>
          </div>
          <Input
            placeholder="Search invitations by name"
            className="mt-4"
            value={inviteSearchTerm}
            onChange={(e) => handleInviteSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table
              className="rounded-xl whitespace-nowrap border-gray-200"
              style={{ color: "#020202", fontSize: "15px" }}
            >
              <TableHeader className="text-center">
                <TableRow>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Name{" "}
                      <CaretSortIcon
                        onClick={() => sortInviteMembers("ByInviteMemberName")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Role{" "}
                      <CaretSortIcon
                        onClick={() => sortInviteMembers("ByInviteMemberRole")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Invited at{" "}
                      <CaretSortIcon
                        onClick={() => sortInviteMembers("ByMemberInvitedAt")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Expires at{" "}
                      <CaretSortIcon
                        onClick={() => sortInviteMembers("ByMemberExpiresAt")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      Status{" "}
                      <CaretSortIcon
                        onClick={() => sortInviteMembers("ByMemberStatus")}
                        className="cursor-pointer"
                      />
                    </div>
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-left">
                {inviteCurrentMembers.length > 0 ? (
                  inviteCurrentMembers.map((member) => (
                    <TableRow>
                      <TableCell className="flex items-center space-x-2 py-4">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span>{member.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: "#DFA548" }}
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.invited_at)}</TableCell>
                      <TableCell>{formatDate(member.expires_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            className="text-white"
                            style={{ backgroundColor: "#479E98" }}
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </TableCell>
                      {(isPrimaryOperator) && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="ml-2 cursor-pointer">
                              •••
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMemberId(member.member_id); // Set the member ID
                                  getPendingMemberById(member.member_id); // Fetch details for the member
                                }} // Pass the member's ID
                              >
                                Update Invitation
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMemberId(member.member_id);
                                  DeleteSendInvites(member.member_id);
                                }}
                              >
                                Remove Invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



export default Members;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
