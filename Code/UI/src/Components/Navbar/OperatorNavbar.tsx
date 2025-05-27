import React, { FC, useEffect, useState } from "react";
import { Progress } from "../ui/progress";
import Logo from "../../Assets/Click2Go Logo final 2 (350 x 100 px).svg";

// import Logo from "../../Assets/Logo2.svg";
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
  Wallet
} from "lucide-react";
import { DropdownMenuDemo } from "./Operator_Dropdown";
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
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { UseSelector } from "react-redux";
import { SetCampaignInReviewCount } from "../../State/slices/OperatorSlice";
import { setWorkspaceId } from "../../State/slices/AuthenticationSlice"
// Define the menu items with routes as content
const menuItems = [
  { label: "Dashboard", icon: HomeIcon, path: "dashboard", permissions: "TO_Dashboard_View" },
  { label: "Campaigns", icon: PaperPlaneIcon, path: "campaignlist", permissions: "TO_Campaigns_View" },
  { label: "Data", icon: ChatBubbleIcon, path: "dataList", permissions: "TO_Data_View" },
  { label: "Members", icon: Users, path: "members", permissions: "TO_Members_View" }
];

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  onClick: () => void;
  select: string;
  count: number
}

const NavItem: FC<NavItemProps> = ({
  icon: Icon,
  label,
  path,
  onClick,
  select,
  count
}) => {
  const dispatch = useDispatch();
  const isSelected = select === label;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={
        isSelected
          ? "w-full flex items-center justify-between font-medium bg-[#F1F5F9] rounded-lg px-3 py-2"
          : "w-full flex items-center justify-between font-medium hover:text-black hover:rounded hover:bg-[#F1F5F9] rounded-lg px-3 py-2"
      }
    >
      {/* Left section: Icon and label */}
      <div className="flex items-center space-x-3">
        <Icon
          style={{
            width: '16px',
            height: '16px',
            color: isSelected ? "#fff" : "#64748B"
          }}
        />
        <span
          className="text-[14px]"
          style={{
            color: isSelected ? "#fff" : "#64748B"
          }}
          onClick={() => {
            dispatch(setCreateBreadCrumb(false));
          }}
        >
          {label}
        </span>
      </div>

      {/* Right section: Count */}
      {count !== undefined && count > 0 && (
        <span className="flex h-6 w-8 items-center justify-center rounded-full bg-black text-white text-[12px] font-medium">
          {count}
        </span>
      )}
    </Link>
  );

};


const NavLinks: FC<{ onSelect: (label: string) => void; selected: string, count: number; }> = ({
  onSelect,
  selected,
  count
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userPermissions = useSelector((state: RootState) => state.advertiserAccount.permissions);
  console.log("PERMISSION :", userPermissions);

  return (
    <div className="bg-[#FBFBFB] h-full sidebar">
      <nav
        className="w-[calc(100%-20px)] ml-[10px] h-full flex flex-col sidebar"
        style={{ backgroundColor: "#FBFBFB" }}
      >
        <div className="flex-1 overflow-y-auto py-4">
          {menuItems
            .filter(item => userPermissions.includes(item.permissions))
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
                count={item.label === "Campaigns" ? count : 0}
              />
            ))}
        </div>
        <div className="sticky bottom-0 p-4 w-full">
          <div className="flex flex-col space-y-2">
            <div
              style={{
                position: "sticky",
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
      </nav>
    </div>
  );
};

const Navbar: FC<{
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setAuthenticated }) => {
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Dashboard"); // Default label
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaceName, setWorkspaceName] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const emailId = useSelector((state: RootState) => state.authentication.userEmail);

  // Get user permissions from Redux
  const userRoleName = useSelector(
    (state: RootState) => state.advertiserAccount.user_role_name);

  const AdvAccUrl = useSelector(
    (state: RootState) => state.authentication.apiURL
  );

  const OpAccUrl = useSelector(
    (state: RootState) => state.authentication.operatorUrl
  );
  // const workspace = location.state?.path || "Admin";
  const workspace = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );
  const breadCrumbStatus = useSelector(
    (state: RootState) => state.advertiserAccount.createBreadCrumb
  );

  const CampaignInReviewCount = useSelector(
    (state: RootState) => state.operator.InReviewCount
  );

  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );



  useEffect(() => {
    console.log("Role Name :", userRoleName);
    if (userRoleName === "Operator Campaign Manager") {
      setSelectedLabel("Campaigns");
    } else {
      setSelectedLabel("Dashboard");
    }
  }, [userRoleName]); // Runs whenever userRoleName changes

  useEffect(() => {
    debugger
    if (workspace != "") {
      setWorkspaceName(workspace);
    }

    console.log("curr location: " + location.pathname);
    const data = location.pathname.split("/");
    console.log(data);
  }, [location]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(
          `${OpAccUrl}/GetOperatorProfileImage`,
          {
            params: { EmailId: emailId },
          }
        );

        if (response.data.status === "Success") {
          // Decode base64 string and create a data URL
          const base64String = response.data.image[0].image;
          const dataUrl = `data:image/jpeg;base64,${base64String}`;
          setImageSrc(dataUrl);
        } else {
          console.error("Failed to fetch image:", response.data.status_Description);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    const fetchInReviewCount = async () => {
      debugger
      try {
        const response = await axios.get("/config.json");
        const apiUrlAdminAcc = response.data.ApiUrlAdminAcc;
        const res = await axios.get(`${apiUrlAdminAcc}/GetInReviewCount?Mode=operator&WorkspaceId=${workspaceId}`);
        if (res.data.status === "Success") {
          dispatch(SetCampaignInReviewCount(res.data.campaignCount));

        }
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };
    fetchProfileImage();
    fetchInReviewCount()

  }, []);

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
                // profileImage="https://github.com/shadcn.png"
                profileImage={imageSrc}
                profileName={workspaceName}
                setAuthenticated={setAuthenticated}
              />
              <div className="mr-4  rounded p-2 sticky right-0">
                <FiBell
                  style={{ width: '16px', height: '16px', color: '#fff' }} />
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
              <div className="flex w-full header">
                <div className="flex-col items-center px-4 py-2 h-[60px] space-y-[4px]">
                  <div>
                    <Breadcrumb className="">
                      <BreadcrumbList className="">
                        <BreadcrumbItem>
                          <BreadcrumbLink
                            onClick={() => {
                              setSelectedLabel("Dashboard"); // Ensure selected label updates
                            }}
                          >
                            <Link
                              to="/operatorNavbar/dashboard"
                              className={
                                selectedLabel == "Dashboard"
                                  ? "text-[#fff] font-normal text-[10px] ml-4"
                                  : "text-[#fff] font-normal text-[10px] ml-4"
                              }
                            >
                              {workspaceName}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {selectedLabel == "Dashboard" ? (
                          <BreadcrumbItem>
                            <BreadcrumbPage></BreadcrumbPage>
                          </BreadcrumbItem>
                        ) : (
                          <>
                            <BreadcrumbSeparator className="text-sm mt-1 text-[8px] text-[#64748B]" />

                            <BreadcrumbItem>
                              <BreadcrumbPage
                                className={
                                  breadCrumbStatus
                                    ? "text-[#020617] font-normal text-[10px] mt-1"
                                    : "text-[#64748B] font-normal text-[10px] mt-1"
                                }
                              >
                                {selectedLabel}
                              </BreadcrumbPage>
                            </BreadcrumbItem>

                            {breadCrumbStatus ? (
                              <>
                                <BreadcrumbSeparator className="mt-1 text-[8px] text-[#64748B]" />
                                <BreadcrumbItem>
                                  <BreadcrumbPage className="text-[#64748B] text-[8px] mt-1">
                                    Create
                                  </BreadcrumbPage>
                                </BreadcrumbItem>
                              </>
                            ) : (
                              <BreadcrumbItem>
                                <BreadcrumbPage></BreadcrumbPage>
                              </BreadcrumbItem>
                            )}
                          </>
                        )}
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
