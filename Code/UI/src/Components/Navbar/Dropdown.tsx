import React, { FC, useEffect, useState } from "react";
import { persistor, resetAppState } from "../../State/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Avatar_custom,
  AvatarFallback_custom,
  AvatarImage_custom,
} from "../ui/avatar_custom";
import { CircleCheck, Plus, User, Settings, LogOut } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { CustomWorkspaceControl } from "../../Pages/Workspace";
import { useDispatch } from "react-redux";
import {
  setAddWorkspaceFromDropdown,
  setCloseAddWorkspaceDialog,
  setPermissions,
  setUser_Role_Name,
  setWorkspace_List,
  clearRefresh,
  triggerRefresh
} from "../../State/slices/AdvertiserAccountSlice";
import {
  setworkspace,
  setIsAdmin,
  setWorkspaceId,
  setmail,
  setRoleId,
  setBaseBillingCountryAuth,
  setAccountId,
} from "../../State/slices/AuthenticationSlice";
import { SetImpersonator } from "../../State/slices/AdminSlice";
import config from "../../config.json";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../Components/ui/tooltip";
import { setWorkspace_Count } from "../../State/slices/AdvertiserAccountSlice"
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { useNavigationGuard } from "./NavigationGuardContext";
// Define props interfaces
interface DropdownMenuDemoProps {
  profileImage: any;
  profileName: string;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Workspace {
  workspace_id: number;
  workspace_name: string;
  workspace_image: string;
  // Add other properties as needed
}

interface WorkspaceDialogProps {
  open: boolean;
  handleClose: () => void;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

// AddWorkspace component
export const AddWorkspace: FC<WorkspaceDialogProps> = ({
  open,
  handleClose,
  setAuthenticated,
}) => {
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [open]);
  const [next, setNext] = useState(true);
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="m-2">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]">
            Create a new workspace
          </DialogTitle>
          <DialogDescription className="font-medium text-[#71717A] text-[14px]">
            Create a new workspace to manage your campaigns and members.
          </DialogDescription>
        </DialogHeader>
        {/* Content, e.g., form fields, buttons */}
        <CustomWorkspaceControl
          setNext={setNext}
          setAuthenticated={setAuthenticated}
        />
      </DialogContent>
    </Dialog>
  );
};

export function DropdownMenuDemo({
  profileImage,
  profileName,
  setAuthenticated,
}: DropdownMenuDemoProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const workspaceList = useSelector((state: RootState) => state.advertiserAccount.workspace_list);
  const [loading, setLoading] = useState(false);
  const [isLoading , setIsLoading ] = useState(false);
  const { safeNavigate } = useNavigationGuard();

  
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    // GetMultipleWorkspacesByEmail();
    setOpen(false);
    dispatch(setAddWorkspaceFromDropdown(false));
  };
  const dispatch = useDispatch();
  const [apiAutUrl, setApiAutUrl] = useState('');
  const email = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const apiUrl = useSelector((state: RootState) => state.authentication.apiURL);
  const isAdmin = useSelector(
    (state: RootState) => state.authentication.isAdmin
  );
  const mdSize = "text-[14px]";
  const closeAddWorkspaceDialog = useSelector(
    (state: RootState) => state.advertiserAccount.closeAddWorkspaceDialog
  );

  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );

  const workspaceName = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );

  const ImpersonatorData = useSelector(
    (state: RootState) => state.admin.Impersonator
  );
  const userPermissions = useSelector(
    (state: RootState) => state.advertiserAccount.permissions
  );
  const userRoleName = useSelector(
    (state: RootState) => state.advertiserAccount.user_role_name
  );

  const workspacecount = useSelector(
    (state: RootState) => state.advertiserAccount.workspace_count
  );

  const refreshTriggers = useSelector(
    (state: RootState) => state.advertiserAccount.refreshTriggers
  );

  const showAdminDropdown =
  isAdmin && (!ImpersonatorData?.ImpersonationState);


    useEffect(() => {
      const fetchConfig = async () => {
        try {
          const response = await fetch("/config.json");
          const config = await response.json();
          setApiAutUrl(config.API_URL);
        } catch (error) {
          console.error("Error loading config:", error);
        }
      };
  
      fetchConfig();
    }, []);


  const GetMultipleWorkspacesByEmail = async () => {
    setIsLoading(true);
    try{
      const response = await axios.get(
        `${apiUrl}/GetMultipleWorkspacesByEmail?EmailId=` + email
      );
      if (response.data.status === "Success") {
      
        console.log(response.data.workspaceList);
        // setWorkspaceList(response.data.workspaceList);

        if(response.data.workspaceList){
          dispatch(setWorkspace_List(response.data.workspaceList)); // Use correct Redux action
          dispatch(setWorkspace_Count(response.data.workspaceList.length));
          dispatch(setBaseBillingCountryAuth(response.data.workspaceList[0].billing_country));
        }
        setIsLoading(false);
      }
    }catch (error) {
      console.error("Network error: ", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastCount = sessionStorage.getItem("lastFetchedWorkspaceCount");
  
    if (lastCount === null || parseInt(lastCount) !== workspacecount) {
      GetMultipleWorkspacesByEmail();
      sessionStorage.setItem("lastFetchedWorkspaceCount", workspacecount.toString());
    }
  }, [workspacecount]);


  useEffect(() => {
    if (closeAddWorkspaceDialog) {
      handleClose();
    }
  }, [closeAddWorkspaceDialog]);

  useEffect(() => {
    const impersonatedEmail = sessionStorage.getItem("impersonatedEmail");
    if (impersonatedEmail) {
      dispatch(setmail(impersonatedEmail));
    }
  }, []);

  useEffect(() => {
    if (refreshTriggers?.workspaceList) {
      GetMultipleWorkspacesByEmail();
      dispatch(clearRefresh("workspaceList"));
    }
  }, [refreshTriggers?.workspaceList]);
  

  const clearAllCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    console.log("All cookies cleared!");
  };

  return (
    <>
    {loading && (
                <div className="loading-overlay flex items-center justify-center h-screen">
                  <CircularProgress color="success" />
                </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="w-[calc(100%-25px)] text-left flex items-center mr-3 ml-0.5 text-gray-500 rounded-lg px-3 py-2 cursor-pointer">
            <Avatar>
              <AvatarImage
                src={profileImage}
                alt="Profile"
                className="h-[25px] w-[25px] rounded-full mt-2"
              />
              <AvatarFallback className="mt-1">
                {/* {email ? email[0].toUpperCase() : "TA"} */}
                {workspaceName? workspaceName[0].toUpperCase() : "C2G"}
              </AvatarFallback>
            </Avatar>
            <span
              className={"text-white bg-transparent sticky ml-[-2px] " + mdSize}
              style={{ fontWeight: "bold" }}
            >
              {profileName.length > 9
                ? `${profileName.slice(0, 9)}...`
                : profileName}
            </span>
            <CaretSortIcon className="ml-4" style={{ color: "#fff" }} />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 cursor-pointer">
        <DropdownMenuGroup className="overflow-y-auto max-h-[calc(40vh)]">
  {isLoading ? (
    <DropdownMenuItem className="flex justify-center items-center">
      Loading....
    </DropdownMenuItem>
  ) : (
    workspaceList &&
    workspaceList.map((workspace) => (
      <TooltipProvider key={workspace.workspace_id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                dispatch(setworkspace(workspace.workspace_name));
                dispatch(setWorkspaceId(workspace.workspace_id));
                sessionStorage.setItem("selectedWorkspaceId", workspace.workspace_id.toString());
                safeNavigate("/navbar/dashboard", {
                  state: { path: workspace.workspace_name, route: "Dashboard" },
                });
              }}
            >
              <Avatar_custom className="mr-2 h-4 w-4">
                <AvatarImage_custom
                  src={`data:image/jpeg;base64,${workspace.workspace_image}`}
                  alt="Profile"
                  className="h-5 w-5 rounded-full"
                />
                <AvatarFallback_custom>
                  {workspace.workspace_name
                    ? workspace.workspace_name[0].toUpperCase()
                    : "W"}
                </AvatarFallback_custom>
              </Avatar_custom>
              <span className="font-normal text-[#020617] text-[14px]">
                {workspace.workspace_name.length >= 17
                  ? `${workspace.workspace_name.slice(0, 17)}...`
                  : workspace.workspace_name}
              </span>
              {workspace.workspace_id === workspaceId ? (
                <div className=" flex flex-grow justify-end">
                  <CircleCheck color="green" size={15} className="ml-2" />
                </div>
              ) : null}
            </DropdownMenuItem>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-normal text-[#020617] text-[14px]">
              {workspace.workspace_name}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ))
  )}
</DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            {["Primary Owner", "Primary Advertiser"].includes(userRoleName) && (
              <DropdownMenuItem
                onClick={() => {
                  if (closeAddWorkspaceDialog) {
                    dispatch(setCloseAddWorkspaceDialog(false));
                  }
                  dispatch(setAddWorkspaceFromDropdown(true));
                  handleOpen();
                }}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="font-normal text-[#020617] text-[14px]">
                  Add new workspace
                </span>
              </DropdownMenuItem>
            )}
         
            </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {ImpersonatorData?.ImpersonationState && (
              <DropdownMenuItem
                onClick={async () => {
                  setLoading(true);
                  sessionStorage.removeItem("impersonatedEmail");
                  dispatch(setmail(ImpersonatorData?.ImpersonatorEmail));
                  dispatch(setworkspace(ImpersonatorData?.ImpersonatorWName));
                  dispatch(setWorkspaceId(ImpersonatorData?.ImpersonatorWID));
                  dispatch(setRoleId(ImpersonatorData?.ImpersonatorRID));
                  dispatch(setAccountId(ImpersonatorData?.ImpersonatorAID));

                  dispatch(triggerRefresh("workspaceList"));
                  dispatch(setWorkspace_List([]));
                  dispatch(
                    SetImpersonator({
                      ImpersonationState: false,
                      ImpersonatorEmail: "",
                      ImpersonatorWName: "",
                      ImpersonatorWID: 0,
                      ImpersonatorRID: 0,
                      ImpersonatorAID: 0,
                    })
                  );
                  const response2 = await axios.get(
                    `${apiAutUrl}/GetPermissionsByRoleId?RoleID=${ImpersonatorData?.ImpersonatorRID}`
                  );
                  if (response2.data.status === "Success") {
                    const permissions = JSON.parse(
                      response2.data.roleDetails.permissions
                    );
                    const role_name = response2.data.roleDetails.roleName;
                    dispatch(setPermissions(permissions));
                    dispatch(setUser_Role_Name(role_name));
                    navigate("/adminNavbar/accounts", {
                      state: { route: "Accounts" },
                    });
                  } else {
                    console.log("GetPermissionsByRoleId API error");
                  }
                }}
                className="flex items-center cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="font-normal text-[#020617] text-[14px]">
                  Stop Impersonation
                </span>
              </DropdownMenuItem>
            )}
            {showAdminDropdown &&   (  
              <DropdownMenuItem
                onClick={() =>
                  safeNavigate("/adminNavbar/home", { state: { route: "Home" } })
                }
                className="flex items-center cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="font-normal text-[#020617] text-[14px]">
                  Admin
                </span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                safeNavigate("/settings/Profile", {
                  state: { path: profileName, route: "Profile" },
                })
              }
              className="flex items-center cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span className="font-normal text-[#020617] text-[14px]">
                Profile settings
              </span>
            </DropdownMenuItem>
            {["Primary Owner", "Primary Advertiser"].includes(userRoleName) && (
              <DropdownMenuItem
                onClick={() =>
                  safeNavigate("/settings/Workspace", {
                    state: { path: profileName, route: "Workspace" },
                  })
                }
                className="flex items-center cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span className="font-normal text-[#020617] text-[14px]">
                  Workspace settings
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="mb-2 flex items-center cursor-pointer"
            onClick={async () => {
              clearAllCookies();
              await persistor.purge(); // Clear persisted state
              await persistor.flush(); // Wait for all writes to finish
              sessionStorage.removeItem("persist:root"); // Remove persisted root
              sessionStorage.removeItem("selectedWorkspaceId");
              sessionStorage.removeItem("workspaceFetched");
              sessionStorage.clear();
              localStorage.clear();
              resetAppState(); // Reset Redux states
              setAuthenticated(false);
              navigate("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="font-normal text-[#020617] text-[14px]">
              Log out
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render AddWorkspace dialog outside the DropdownMenu for better visibility control */}
      <AddWorkspace
        open={open}
        handleClose={handleClose}
        setAuthenticated={setAuthenticated}
      />
    </>
  );
}
