import React, { FC, useEffect, useState } from "react";
import { persistor, resetAppState } from "../../State/store";
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
import { Avatar_custom, AvatarFallback_custom, AvatarImage_custom } from "../ui/avatar_custom";
import { CircleCheck, Plus, User, Settings, LogOut } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { CustomWorkspaceControl } from "../../Pages/Workspace";
import { useDispatch } from "react-redux";
import { setAddWorkspaceFromDropdown,setCloseAddWorkspaceDialog } from "../../State/slices/AdvertiserAccountSlice";
import {
  setworkspace,
  setIsAdmin,
  setWorkspaceId,
  setmail,
  setRoleId,
  setAccountId
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
} from "../ui/tooltip";
// Define props interfaces
interface DropdownMenuDemoProps {
  profileImage: any;
  profileName: string;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Workspace {
  workspace_id: number;
  workspace_name: string;
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
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]">Create a new workspace</DialogTitle>
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

// DropdownMenuDemo component
export function DropdownMenuDemo({
  profileImage,
  profileName,
  setAuthenticated,
}: DropdownMenuDemoProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const dispatch = useDispatch();
  // const [apiUrl, setApiUrl] = useState('');
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

  const workspaceId = useSelector((state:RootState)=>state.authentication.workspace_id);

  const ImpersonatorData = useSelector((state: RootState) => state.admin.Impersonator);  
  const userPermissions = useSelector((state: RootState) => state.advertiserAccount.permissions);
  const userRoleName = useSelector((state: RootState) => state.advertiserAccount.user_role_name);


  // const seturl=async()=>{
  //   await setApiUrlAdvAcc(config.ApiUrlAdvAcc);
  // }
  useEffect(() => {
    // seturl();
    try {
      const GetMultipleWorkspacesByEmail = async () => {
        const response = await axios.get(
          `${apiUrl}/GetMultipleWorkspacesByEmail?EmailId=` + email
        );
        if (response.data.status === "Success") {
          console.log(response.data.workspaceList);
          setWorkspaceList(response.data.workspaceList);
        }
      };
      GetMultipleWorkspacesByEmail();
    } catch (error) {
      console.error("Network error: ", error);
    }
  }, []);

  useEffect(() => {
    if (closeAddWorkspaceDialog) {
      handleClose();
    }
  }, [closeAddWorkspaceDialog]);

  const clearAllCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    console.log("All cookies cleared!");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="w-[calc(100%-25px)] text-left flex items-center mr-3 ml-0.5 text-gray-500 hover:text-black rounded-lg px-3 py-2 cursor-pointer">
            <Avatar>
              <AvatarImage
                src={profileImage}
                alt="Profile"
                className="h-[25px] w-[25px] rounded-full mt-2"
              />
              <AvatarFallback className="mt-1">{email?email[0].toUpperCase():"TA"}</AvatarFallback>
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
          <DropdownMenuGroup>
            {workspaceList &&
              workspaceList.map((data) => (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                      className="cursor-pointer"
                        onClick={() => {
                          dispatch(setworkspace(data.workspace_name));
                          dispatch(setWorkspaceId(data.workspace_id));
                          navigate("/operatorNavbar/dashboard", {
                            state: { path: data.workspace_name },
                          });
                        }}
                      >
                        <Avatar_custom className="mr-2 h-4 w-4">
                          <AvatarImage_custom
                            src={profileImage}
                            alt="Profile"
                            className="h-5 w-5 rounded-full"
                          />
                          <AvatarFallback_custom className="">{data.workspace_name?data.workspace_name[0].toUpperCase():"W"}</AvatarFallback_custom>
                        </Avatar_custom>
                        <span 
                          className="font-normal text-[#020617] text-[14px]"
                          key={data.workspace_id}>
                          {data.workspace_name.length >= 17
                            ? `${data.workspace_name.slice(0, 17)}...`
                            : data.workspace_name}
                        </span>
                        {data.workspace_id === workspaceId ? (
                          <>
                            <div className=" flex flex-grow justify-end">
                              <CircleCheck
                                color="green"
                                size={15}
                                className="ml-2"
                              />
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-normal text-[#020617] text-[14px]">{data.workspace_name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator /> 
          <DropdownMenuGroup>
            {ImpersonatorData?.ImpersonationState && <DropdownMenuItem
                onClick={() => {
                  sessionStorage.removeItem("impersonatedEmail");
                  dispatch(setmail(ImpersonatorData?.ImpersonatorEmail));
                  dispatch(setworkspace(ImpersonatorData?.ImpersonatorWName));
                  dispatch(setWorkspaceId(ImpersonatorData?.ImpersonatorWID));
                  dispatch(setRoleId(ImpersonatorData?.ImpersonatorRID));
                  dispatch(setAccountId(ImpersonatorData?.ImpersonatorAID));
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
                  navigate("/adminNavbar/accounts",{state:{route:"Accounts"}});
                }}
                className="flex items-center cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="font-normal text-[#020617] text-[14px]">
                  Stop Impersonation
                </span>
              </DropdownMenuItem> }
        </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
          className="mb-2 flex items-center cursor-pointer"
          onClick={async () => {
            clearAllCookies();
            await persistor.purge(); // Clear persisted state
            await persistor.flush(); // Wait for all writes to finish
            sessionStorage.removeItem("persist:root"); // Remove persisted root
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
