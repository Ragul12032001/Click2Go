import React, { FC, useEffect, useRef, useState } from "react";
import { Progress } from "../ui/progress";
import Logo from "../../Assets/Click2Go Logo final 2 (350 x 100 px).svg";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  User,
  Share2,
  Briefcase,
  CreditCard,
  Bell,
  Settings,
  Users,
  User2,
  Wallet,
} from "lucide-react";
import { DropdownMenuDemo } from "./Dropdown";
import {
  BellIcon,
  ChatBubbleIcon,
  HomeIcon,
  LightningBoltIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent } from "../ui/tabs";
import { TooltipProvider } from "../ui/tooltip";
import { Link, Outlet } from "react-router-dom";
import figmaPageImage from "../Assets/Login.png";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/State/store";
import { setCreateBreadCrumb, setSentCount, setTotalAvailableCount } from "../../State/slices/AdvertiserAccountSlice";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { UseSelector } from "react-redux";
import NotificationBell from "../ui/NotificationBell";

// Define the menu items with routes as content
const menuItems = [
  {
    label: "Dashboard",
    icon: HomeIcon,
    path: "dashboard",
    permission: "ADV_Dashboard",
  },
  {
    label: "Campaigns",
    icon: PaperPlaneIcon,
    path: "campaignlist",
    permission: "ADV_Campaigns_View",
  },
  {
    label: "Templates",
    icon: ChatBubbleIcon,
    path: "TemplateList",
    permission: "ADV_Template_View",
  },
  {
    label: "Audiences",
    icon: Users,
    path: "audiences",
    permission: "ADV_Audience_View",
  },
  {
    label: "Channels",
    icon: LightningBoltIcon,
    path: "channels",
    permission: "ADV_Channels_View",
  },
];

interface Notification {
  id: number;
  message: string;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  onClick: () => void;
  select: string;
}

const NavItem: FC<NavItemProps> = ({
  icon: Icon,
  label,
  path,
  onClick,
  select,
}) => {
  const dispatch = useDispatch();
  const isSelected = select === label;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={
        isSelected
          ? "w-full text-left flex items-center space-x-3 font-medium bg-[#F1F5F9] rounded-lg px-3 py-2"
          : "w-full text-left flex items-center space-x-3 font-medium hover:text-black hover:rounded hover:bg-[#F1F5F9] rounded-lg px-3 py-2"
      }
    >
      <Icon
        style={{
          width: "16px",
          height: "16px",
          color: isSelected ? "#fff" : "#64748B",
        }}
      />

      <span
        className="text-[14px]"
        style={{ color: isSelected ? "#fff" : "#64748B" }}
        onClick={() => {
          dispatch(setCreateBreadCrumb(false));
        }}
      >
        {label}
      </span>
    </Link>
  );
};

const NavLinks: FC<{ onSelect: (label: string) => void; selected: string }> = ({
  onSelect,
  selected,
}) => {
  const sampleTotalMessageCount = 10000;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [totalMessage, setTotalMessage] = useState<string>("");
  const userPermissions = useSelector(
    (state: RootState) => state.advertiserAccount.permissions
  );
  const sentCount = useSelector(
    (state: RootState) => state.advertiserAccount.sent_count_sidenav
  );
  const availableCount = useSelector(
    (state: RootState) => state.advertiserAccount.total_available_count_sidenav
  );
  const emailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const accountId = useSelector(
    (state: RootState) => state.authentication.account_id
  );
  const AdvAccUrl = useSelector((state: RootState) => state.authentication.apiURL);
  useEffect(() => {
    usertransactionlist();
    userdebitlist();
  }, [])


  const usertransactionlist = async () => {
    try {
      const response = await axios.get(
        `${AdvAccUrl}/GetuserTransaction?accountid=${accountId}`
      );
      console.log("Response : ", response.data.user_transaction[0].messages);
      if (response.data.status === "Success") {
        if (response.data) {
          setTotalMessage(response.data.user_transaction[0].messages);
          dispatch(setTotalAvailableCount(response.data.user_transaction[0].messages));
          console.log("Transaction Received");
        } else {
          console.error(
            "Error fetching Transaction details: response - ",
            response
          );
        }
      }
    } catch (error) {
      console.error("Error fetching Transaction details:", error);
    }
  };

  const userdebitlist = async () => {

    try {
      debugger;
      const response = await axios.get(`${AdvAccUrl}/Getdebitdetails?id=${accountId}`);
      console.log("Response : ", response.data.user_transaction);
      if (response.data.status === "Success") {
        if (response.data) {
          console.log("Debit :", response.data.user_transaction[0].messagecount);
          dispatch(setSentCount(response.data.user_transaction[0].messagecount));
        } else {
          console.error("Error fetching Transaction details: response - ", response);
        }
      }
    } catch (error) {
      console.error("Error fetching Transaction details:", error);
    }

  }



  return (
    <div className="bg-[#FBFBFB] h-full sidebar">
      <nav
        className="w-[calc(100%-20px)] ml-[10px] h-full flex flex-col sidebar"
        style={{ backgroundColor: "#FBFBFB" }}
      >
        <div className="flex-1 overflow-y-auto py-4">
          {menuItems
            .filter((item) => userPermissions.includes(item.permission))
            .map((item, index) => (
              <NavItem
                key={index}
                icon={item.icon}
                label={item.label}
                path={item.path}
                onClick={() => {
                  onSelect(item.label);
                  dispatch(setCreateBreadCrumb(false));
                }}
                select={selected}
              />
            ))}
        </div>

        <div className="sticky bottom-0 p-4 w-full">
          <div className="flex flex-col space-y-2">
            <div className="py-4 flex flex-col gap-[10px]">
              {userPermissions.includes("ADV_Billings_View") && (
                <>
                  <Button
                    className="w-[96px] h-[27px] text-[14px] font-normal form-button"
                    onClick={() =>
                      navigate("/settings/Billing", {
                        state: { route: "Billing" },
                      })
                    }
                  >
                    <div className="flex pr-16 pl-16 pt-8 pb-8 gap-[10px]">
                      <span>
                        <Wallet size={16} />
                      </span>
                      <span className="flex justify-center items-center w-[48px] h-[16px]">
                        Top Up
                      </span>
                    </div>
                  </Button>
                  <span className="text-sm text-[#020617] text-left font-[400px] flex gap-1">
                    <span>{sentCount || 0}</span>
                    <span className="text-[#64748B]">/</span>
                    <span>{availableCount || 0}</span>
                    <span>Messages</span>
                  </span>
                  <Progress
  value={(sentCount / availableCount) * 100}
  className="w-[218px] h-[6px] bg-gray-200 [&>div]:bg-[#1a7727]"
/>

                </>
              )}
              <div
                style={{
                  position: "sticky",
                  // left: '30px',
                  // bottom: '30px',
                  paddingTop: "2px",
                  zIndex: 20,
                  marginBottom: "2px",
                }}
              >
                 <img
                  src={Logo}
                  alt="Logo"
                  style={{ width: "150px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

const Navbar: FC<{
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setAuthenticated }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Dashboard"); // Default label
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state?.route || "";
  const [workspaceName, setWorkspaceName] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const emailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const AdvAccUrl = useSelector(
    (state: RootState) => state.authentication.apiURL
  );
  // Get user permissions from Redux
  const userRoleName = useSelector(
    (state: RootState) => state.advertiserAccount.user_role_name
  );

  // const workspace = location.state?.path || "Admin";
  const workspace = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );

  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const breadCrumbStatus = useSelector(
    (state: RootState) => state.advertiserAccount.createBreadCrumb
  );
  const isInvited = useSelector((state: RootState) => state.authentication.isInvited)

  useEffect(() => {
    if (route !== "") {
      console.log("Entered in Route");
      setSelectedLabel(route);
      return;
    }
    if (userRoleName === "Campaign Manager") {
      setSelectedLabel("Campaigns");
    } else if (userRoleName === "Audience Manager") {
      setSelectedLabel("Audiences");
    } else if (userRoleName === "Analytics Viewer") {
      setSelectedLabel("Dashboard");
    } else if (userRoleName === "Channel Specialist") {
      setSelectedLabel("Channels");
    } else {
      setSelectedLabel("Dashboard");
    }
  }, []); // Runs whenever mounting happens changes

  useEffect(() => {
    console.log("🔹 workspaceId:", workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    if (workspace !== "") {
      setWorkspaceName(workspace);
    }

    console.log("curr location: " + location.pathname);
    const data = location.pathname.split("/");
    console.log(data);
  }, [location]);

  useEffect(() => {
    setImageSrc("");
    const fetchProfileImage = async () => {
      try {
          const url = isInvited
              ? `${AdvAccUrl}/GetProfileImageByWorkspaceId?WorkspaceId=${workspaceId}`
              : `${AdvAccUrl}/GetProfileImage?EmailId=${emailId}&WorkspaceId=${workspaceId}`;

          console.log("Fetching from:", url); // ✅ Debugging log

          const response = await axios.get(url);

          console.log("API Response:", response); // ✅ Debugging log

          if (response.data.status === "Success") {
            // Decode base64 string and create a data URL
            const base64String = response.data.image[0].image;
            const dataUrl = `data:image/jpeg;base64,${base64String}`;
            setImageSrc(dataUrl);
          } else {
              console.error("Failed to fetch image:", response.data.Status_Description);
              setImageSrc("");
          }
      } catch (error) {
          console.error("Error fetching image:", error);
      }
  };

    fetchProfileImage();
  }, [emailId, workspaceId, isInvited]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleBreadcrumbClick = (label: string) => {
    // Update the selected label
    setSelectedLabel(label);

    // Navigation logic
    if (label === workspaceName) {
      navigate("/navbar/dashboard", {
        state: { path: workspaceName, route: "Dashboard" },
      });
    } else if (label === "Channels") {
      navigate("/navbar/channels", {
        state: { path: workspaceName, route: "Channels" },
      });
    } else if (isChannelTypePage()) {
      // Handle dynamic channel types
      const channelPath = label.toLowerCase();
      navigate(`/navbar/channels/${channelPath}`, {
        state: { path: workspaceName, route: label },
      });
    } else {
      navigate(`/navbar/${label.toLowerCase()}`, {
        state: { path: workspaceName, route: label },
      });
    }
  };

  // Improved channel type detection logic
  const isChannelsPage = () => {
    return location.pathname.includes('/navbar/channels') &&
      !location.pathname.includes('/whatsapp') &&
      !location.pathname.includes('/sms') &&
      !location.pathname.includes('/indosat') &&
      !location.pathname.includes('/travelad') &&
      !location.pathname.includes('/push');
  };

  const isChannelTypePage = () => {
    const pathParts = location.pathname.split('/');

    if (pathParts.includes('navbar')) {
      const channelTypes = ['whatsapp', 'sms'];
      return channelTypes.some(type => location.pathname.toLowerCase().includes(type));
    }
    return false;
  };

  const getChannelType = () => {
    if (isChannelTypePage()) {
      const pathParts = location.pathname.toLowerCase().split('/');

      // Map the URL parameter to display names
      const channelTypeMap: Record<string, string> = {
        'whatsapp': 'WhatsApp',
        'sms': 'SMS',
        'push': 'Push Notifications',
        'click2go': 'Click2go',
        'indosat': 'Indosat'
      };

      // Find which channel type is in the path
      for (const [urlPath, displayName] of Object.entries(channelTypeMap)) {
        if (pathParts.includes(urlPath)) {
          return displayName;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const pathParts = location.pathname.split("/");
  
    // Handle Channels and Sub-Channels
    const channelTypes = ["whatsapp", "sms", "indosat", "click2go", "push"];
    if (pathParts.includes("channels") || channelTypes.some(type => pathParts.includes(type))) {
      setSelectedLabel("Channels");
      return;
    }
  
    // Handle Campaigns and sub-routes like Create Campaign
    if (location.pathname.includes("campaign")) {
      setSelectedLabel("Campaigns");
      return;
    }
  
    // Handle Templates and sub-routes like Create Template
    if (location.pathname.includes("Template")) {
      setSelectedLabel("Templates");
      return;
    }
  
    // Fallback for other routes
    const page = pathParts[2] || "dashboard";
    const matchedItem = menuItems.find((item) => item.path.toLowerCase() === page.toLowerCase());
    setSelectedLabel(matchedItem ? matchedItem.label : "Dashboard");
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
              <DropdownMenuDemo
                profileImage={imageSrc}
                profileName={workspaceName}
                setAuthenticated={setAuthenticated}
              />
              <div className="relative">
                <div
                  className="relative mr-4 rounded p-2 cursor-pointer overflow-visible"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <div style={{padding:"7px"}}></div>
                 <NotificationBell  workspaceId={workspaceId} />

                </div>
              </div>
            </div>
            <Separator />
            <NavLinks
              onSelect={setSelectedLabel}
              selected={selectedLabel}
            />{" "}
          </ResizablePanel>
          {/* <Separator orientation="vertical" className="h-full ml-64" /> */}
          <ResizableHandle />

          <ResizablePanel className="h-screen">
            <Tabs defaultValue="all" className="h-full">
              <div className="flex w-full header">
                <div className="flex-col items-center px-4 py-2 h-[60px] space-y-[4px]">
                  <div>
                    <Breadcrumb className="">
                      <BreadcrumbList className="">
                        {/* Workspace Name / Dashboard */}
                        <BreadcrumbItem>
                          <BreadcrumbLink onClick={() => handleBreadcrumbClick("Dashboard")}>
                            <Link
                              to="/navbar/dashboard"
                              className={
                                selectedLabel === "Dashboard"
                                  ? "text-[#fff] font-normal text-[10px] ml-4"
                                  : "text-[#fff] font-normal text-[10px] ml-4"
                              }
                            >
                              {workspaceName}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>

                        {/* Conditional Breadcrumbs for Campaigns, Templates, Audience */}
                        {['Campaigns', 'Templates', 'Audiences'].includes(selectedLabel) && (
                          <>
                            <BreadcrumbSeparator className="text-sm mt-1 text-[8px] text-[#64748B]" />
                            <BreadcrumbItem>
                              <BreadcrumbPage className="text-[#64748B] font-normal text-[10px] mt-1">
                                {selectedLabel}
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </>
                        )}

                        {/* Channels and Sub Channels */}
                        {selectedLabel === "Channels" || isChannelTypePage() ? (
                          <>
                            <BreadcrumbSeparator className="text-sm mt-1 text-[8px] text-[#64748B]" />
                            <BreadcrumbItem>
                              <BreadcrumbLink onClick={() => handleBreadcrumbClick("Channels")}>
                                <Link
                                  to="/navbar/channels"
                                  className="text-[#fff] font-normal text-[10px] mt-1"
                                >
                                  Channels
                                </Link>
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            {/* Sub Channels like SMS, WhatsApp */}
                            {isChannelTypePage() && getChannelType() && (
                              <>
                                <BreadcrumbSeparator className="text-sm mt-1 text-[8px] text-[#64748B]" />
                                <BreadcrumbItem>
                                  <BreadcrumbPage className="text-[#64748B] font-normal text-[10px]">
                                    {getChannelType()}
                                  </BreadcrumbPage>
                                </BreadcrumbItem>
                              </>
                            )}
                          </>
                        ) : null}
                      </BreadcrumbList>
                    </Breadcrumb>





                  </div>
                  <h1 className="text-semibold text-left font-semibold font-[14px] text-[#fff] ml-4">
                    {selectedLabel}
                  </h1>
                </div>
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
