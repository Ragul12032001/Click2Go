import React, { FC, useEffect, useState } from "react";
import { Progress } from "../../Components/ui/progress";
import Logo from "../../Assets/Logo2.svg";
import { Users, CreditCard } from "lucide-react";
import { DropdownMenuDemo } from "./AdminDropdown";
import {
  HomeIcon,
  LightningBoltIcon,
  PaperPlaneIcon,
  BackpackIcon,
  AvatarIcon,
  ViewHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Components/ui/resizable";
import { cn } from "../../lib/utils";
import { Separator } from "../../Components/ui/separator";
import { Tabs, TabsContent } from "../../Components/ui/tabs";
import { TooltipProvider } from "../../Components/ui/tooltip";
import { Link, Outlet } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../Components/ui/breadcrumb";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/State/store";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { SetCampaignInReviewCount } from "../../State/slices/AdminSlice";
import { Button } from "@mui/material";
import NotificationBellAdmin from "../../Components/ui/NotificationBellAdmin";
import { FaRegCreditCard } from "react-icons/fa";

// Define the menu items with routes as content
const menuItems = [
  { label: "Home", icon: HomeIcon, path: "home" },
  { label: "Accounts", icon: BackpackIcon, path: "accounts" },
  { label: "Campaigns", icon: PaperPlaneIcon, path: "campaigns" },
  { label: "Audiences", icon: Users, path: "audiences" },
  { label: "Channels", icon: LightningBoltIcon, path: "channels" },
  { label: "Team", icon: AvatarIcon, path: "team" },
  { label: "Plans", icon: CreditCard, path: "plans" },
  { label: "Reports", icon: FaRegCreditCard, path: "Reports" },

  // { label: "Advertiser", icon: Users, path: "advertiser" },
];

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  onClick: () => void;
  select: string;
  // setInReviewCount:React.Dispatch<React.SetStateAction<number>>;
  // InReviewCount:number;
  count: number;
}

interface Notification {
  id: number;
  workspaceName: string;
  workspaceId: number;
  channelName: string;
  status: string;
  createdAt: string; // ISO date string format
}


const NavItem: FC<NavItemProps> = ({
  icon: Icon,
  label,
  path,
  onClick,
  count,
  select,
}) => {
  const dispatch = useDispatch();

  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setapiUrlAdminAcc(config.ApiUrlAdminAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  const isSelected = select === label;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`w-full text-left flex items-center justify-between space-x-3 text-[14px] rounded-lg px-3 py-2 ${isSelected
        ? "text-[#fff] bg-[#F1F5F9]"
        : "text-[#fff] hover:text-black hover:bg-[#F1F5F9]"
        }`}
    >
      {/* Left side with icon and label */}
      <div className="flex items-center space-x-3">
        <Icon
          className={`font-medium ${isSelected ? "text-[#fff]" : "text-[#64748B]"
            }`}
          style={{ width: "16px", height: "16px" }} // Ensures icon size is consistent
        />
        <span
          className={`text-[14px] font-medium ${isSelected ? "text-[#fff]" : "text-[#64748B]"
            }`}
          onClick={() => dispatch(setCreateBreadCrumb(false))}
        >
          {label}
        </span>
      </div>

      {/* Right side with count (if applicable) */}
      {count !== undefined && count > 0 && (
        <span className="flex h-4 w-6 items-center justify-center rounded-full bg-black text-white text-[10px] font-medium">
          {count}
        </span>
      )}
    </Link>

  );
};

const NavLinks: FC<{
  onSelect: (label: string) => void;
  selected: string;
  count: number;
}> = ({ onSelect, selected, count }) => {
  //const [InReviewCount,setInReviewCount]=useState(0);
  const dispatch = useDispatch();
  return (
    <div className="bg-[#FBFBFB] h-full sidebar">
      <nav
        className="w-[calc(100%-20px)] ml-[10px] h-full flex flex-col"
        style={{ backgroundColor: "#FBFBFB" }}
      >
        <div className="flex-1 overflow-y-auto py-4 sidebar">
          {menuItems.map((item, index) => (
            <NavItem
              key={index}
              // setInReviewCount={setInReviewCount}
              // InReviewCount={InReviewCount}
              icon={item.icon}
              label={item.label}
              path={item.path}
              onClick={() => {
                onSelect(item.label);
                dispatch(setCreateBreadCrumb(false));
              }}
              select={selected}
              count={item.label === "Campaigns" ? count : 0} // Pass count for campaigns
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

const Navbar: FC<{
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setAuthenticated }) => {
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(""); // Default label
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaceName, setWorkspaceName] = useState("");
  const [InReviewCount, setInReviewCount] = useState(0);
  const CampaignInReviewCount = useSelector(
    (state: RootState) => state.admin.InReviewCount
  );
  const route = location.state?.route || "Home";
  // const workspace = location.state?.path || "Admin";

  const workspace = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );
  const breadCrumbStatus = useSelector(
    (state: RootState) => state.advertiserAccount.createBreadCrumb
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  //  const apiUrlAdvAcc = useSelector((state: RootState) => state.authentication.apiURL);
  const [apiUrlAdminAcc, setApiUrlAdminAcc] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdminAcc(config.ApiUrlAdminAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdminAcc) {
      fetchNotifications();
    }
  }, [apiUrlAdminAcc]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${apiUrlAdminAcc}/GetNotifications`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  // Mark notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${apiUrlAdminAcc}/MarkNotificationsRead`,
        {
          params: { workspaceId: 491 },
        });
      setNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (workspace != "") {
      setWorkspaceName(workspace);
    }

    switch (selectedLabel) {
      case "Home":
        setWorkspaceName("TravelAd stats at a glance");
        break;
      case "Accounts":
        setWorkspaceName("Below is the list of all of accounts");
        break;
      case "Campaigns":
        setWorkspaceName("Below is the list of all of campaigns");
        break;
      case "Audiences":
        setWorkspaceName("Below is the list of all of target audiences");
        break;
      case "Channels":
        setWorkspaceName("Below is the list of all of enabled channels");
        break;
      case "Team":
        setWorkspaceName("Below is the list of all of admin members");
        break;
      case "Plans":
        setWorkspaceName("Below is the list of all of Plans");
        break;
        case "Reports":
          setWorkspaceName("Below is the list of all of Reports");
          break;
      default:
        setWorkspaceName("TravelAd stats at a glance");
    }

    console.log("curr location: " + location.pathname);
    const data = location.pathname.split("/");
    console.log(data);
  }, [location, selectedLabel]);

  useEffect(() => {
    const fetchInReviewCount = async () => {
      try {
        const response = await axios.get("/config.json");
        const apiUrlAdminAcc = response.data.ApiUrlAdminAcc;
        const res = await axios.get(`${apiUrlAdminAcc}/GetInReviewCount?Mode=admin`);
        if (res.data.status === "Success") {
          dispatch(SetCampaignInReviewCount(res.data.campaignCount));
          setInReviewCount(res.data.campaignCount);
        }
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };
    setSelectedLabel(route);
    fetchInReviewCount();
  }, []);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const page = pathParts[2] || "home"; // Fallback to "home" if no path found

    // Check if the current path is for SMS or WhatsApp
    if (page === "sms" || page === "whatsapp" || page === "click2gowa" || page === "traveladwhatsapp" || page === "operatorswhatsapp" || page === "smsConnections") {
      setSelectedLabel("Channels");
    } else if(page === "campaignreview") {
      setSelectedLabel("Campaigns")
    } else if(page === "createplans") {
      setSelectedLabel("Plans");
    }
    else {
      const matchedItem = menuItems.find(
        (item) => item.path.toLowerCase() === page.toLowerCase()
      );
      setSelectedLabel(matchedItem ? matchedItem.label : "Home");
    }
  }, [location.pathname]);


  return (
    <div className="h-screen">
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
              sizes
            )}`;
          }}
          className="h-full items-stretch"
        >
          <ResizablePanel
            collapsible={false}
            minSize={20}
            maxSize={20}
            onCollapse={() => {
              setIsCollapsed(true);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                true
              )}`;
            }}
            onResize={() => {
              setIsCollapsed(false);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                false
              )}`;
            }}
            className={cn(
              isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
            )}
          >
            <div
              className={cn(
                "flex h-[60px] items-center justify-center bg-[#FBFBFB] header"
              )}
            >
              <div className="w-full">
              <DropdownMenuDemo
                profileImage=""
                profileName=""
                setAuthenticated={setAuthenticated}
              />
              </div>
              {/* Notification Bell Icon with Dropdown */}
              <div className="flex justify-end">
                <div
                  className="flex items-center justify-center mr-5  w-8 h-8 p-2 cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <NotificationBellAdmin/>                  
                </div>               
              </div>
            </div>
            <Separator />
            <NavLinks
              onSelect={setSelectedLabel}
              selected={selectedLabel}
              count={CampaignInReviewCount}
            />{" "}
            {/* Pass the setter function */}
          </ResizablePanel>
          {/* <Separator orientation="vertical" className="h-full ml-64" /> */}
          <ResizableHandle />

          <ResizablePanel className="h-screen">
            <Tabs defaultValue="all" className="h-full">
              <div className="flex w-full items-center justify-between px-4 py-2 h-[60px] header">
                {/* Left Section: Vertically Center the Parent, Left Align Inner Items */}
                <div className="flex flex-col items-start space-y-[4px]">
                  {/* Breadcrumb - Workspace Name */}
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink>
                          <div className="text-[#fff] font-normal text-[10px] ml-4">
                            {workspaceName}
                          </div>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  {/* Selected Label - Single Line, Left Aligned */}
                  <h1 className="text-semibold font-semibold font-[14px] text-[#fff] whitespace-nowrap overflow-hidden truncate ml-4">
                    {selectedLabel}
                  </h1>
                </div>

                {/* Right Section: Back Button */}
                {(location.pathname.includes("/sms") ||
                  location.pathname.includes("/whatsapp") ||
                  location.pathname.includes("/click2gowa") ||
                  location.pathname.includes("/traveladwhatsapp") ||
                  location.pathname.includes("/operatorswhatsapp") ||
                  location.pathname.includes("/smsConnections")
                ) && (
                    <button
                      className="form-button text-white px-3 py-1 rounded text-sm mr-2"
                      onClick={() => {
                        if (location.pathname.includes("/smsConnections")) {
                          navigate("/adminNavbar/sms");
                        } else {
                          navigate("/adminNavbar/channels")
                        }
                      }
                      }
                    >
                      Back
                    </button>
                  )}

              </div>

              <Separator />
              <TabsContent value="all" className="h-full overflow-y-auto m-0">
                {/* Outlet for rendering the matched route content */}
                <div className="h-full p-6 bg-[#FFFFFF]">
                  <Outlet />
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
};

export default Navbar;
