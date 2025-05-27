import React, { useState, useEffect } from "react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { cn } from "../../lib/utils";
import { Badge } from "../../Components/ui/badge";
import { Link } from "react-router-dom";
import { Edit, Trash, Pause, Play } from "lucide-react";
import {
  DotsHorizontalIcon,
  CalendarIcon,
  FileIcon,
  CaretSortIcon,
  ArrowRightIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { FiFilter } from "react-icons/fi";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../Components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../Components/ui/breadcrumb";
import { Calendar } from "../../Components/ui/calendar";
import { Separator } from "@radix-ui/react-select";
import axios from "axios";
import { Tabs, TabsContent } from "../../Components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
//import { ToastContainer, toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import { DialogContent } from "../../Components/ui/dialog";
import { Dialog } from "../../Components/ui/dialog";
import { DialogTitle } from "../../Components/ui/dialog";
import { DialogHeader } from "../../Components/ui/dialog";
import { DialogDescription } from "../../Components/ui/dialog";
import config from "../../config.json";
import {
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";
import { Skeleton } from "../../Components/ui/skeleton";
import CampaignFilter from "../../Components/Filter/CampaignDropdown";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { UseSelector } from "react-redux";
import { RootState } from "../../State/store";
import * as XLSX from "xlsx";
import { University } from "lucide-react";
import CreateCampaign from "./CreateCampaign";
import { isAfter } from "date-fns";

interface Campaign {
  campaign_id: number;
  campaign_name: string;
  channel_type: string;
  //status: string;
  status: "Live" | "Pending" | "Paused" | "In review" | "Completed";
  start_date_time: string;
  end_date_time: string;
  campaign_budget: number;
  sent: string;
  delivered: string;
  read: string;
  ctr: string;
  delivery_rate: string;
  button_click: string;
  paused: boolean;
  currency_symbol:string;
}

interface BillingCountry {
  workspace_info_id: number;
  workspace_name: string;
  country_id: number;
  country_name: string;
  currency_name: string;
  symbol: string;
}

type CampaignCheck = {
  campaign_id: number;
  name: string;
};

interface DatePickerWithRangeProps {
  className?: string;
  fromDate?: Date; // Optional prop to set initial "from" date
  toDate?: Date;
  onChange?: (selectedRange: DateRange | undefined) => void;
  setCampaignList: React.Dispatch<React.SetStateAction<Campaign[]>>;
  getCampaignList: () => void;
  setInitialCampaign: React.Dispatch<React.SetStateAction<boolean>>;
  initialcampaign: boolean; 
}

interface StatusCellProps {
  status: "Live" | "Pending" | "Paused" | "In review" | "Completed"; // Limit status to specific strings
}

const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,
  setCampaignList,
  getCampaignList,
  setInitialCampaign , 
  initialcampaign 
}) => {
  const [fromDate, setfromDate] = useState<string | null>(null);
  const CurrentDate = new Date();

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const [toDate, setToDate] = useState<string>(formatDate(CurrentDate));

  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );


  const GetWorkspaceDetailsByID = async () => {
    axios
      .post(`${apiUrlAdvAcc}/GetWorkspaceDetailsByWorkspaceID`, {
        workspaceId: workspaceId, // Email ID for the user
      })
      .then((response) => {
        console.log("response:", response);

        if (response.data.length > 0 && response.data[0].Status === "Success") {
          const createdDate = response.data[0].created_date; // Get the created date

          const formattedDate = createdDate.split(" ")[0];
          console.log("Formatted Date1:", formattedDate); // Logs the formatted date

          setfromDate(formattedDate);
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

  useEffect(() => {
    console.log("ToDate1:", toDate);

    GetWorkspaceDetailsByID(); // Verify the formatted date
    console.log("FromDate1:", fromDate);
  }, [toDate]);

  useEffect(() => {
    console.log("FromDate2:", fromDate);
  }, [fromDate]);

  const [date, setDate] = React.useState<DateRange | undefined>({
    // from: new Date(), // Current date
    // to: addDays(new Date(), 20), // Current date + 20 days
    from: fromDate ? new Date(fromDate) : undefined,
    to: new Date(), // Current date
  });

  useEffect(() => {
    if (date && date.from && date.to) {
      //const date_from = format(date.from, "yyyy-MM-dd"); // Split by space and take the first part
      const date_to = format(date.to, "yyyy-MM-dd");

      const date_from = format(date.from, "yyyy-MM-dd");

      const ChartDateRange = async () => {
        try {
          //debugger;
          const response = await axios.get(
            `${apiUrlAdvAcc}/GetCampaignListbyDateRange/${workspaceId}?from_date=${date_from.toString()}&to_date=${date_to.toString()}`
          );
          if (
            response.data.status === "Success" &&
            response.data.campaignList.length > 0
          ) {
            setCampaignList(response.data.campaignList);
            console.log(response.data.campaignList,'campaignlist')
          } else {
            // setChartData(response.data);
            setInitialCampaign(false);
            setCampaignList([]);

            console.error("chart details not found");
          }
        } catch (error) {
          console.error("error in fetching chart details: ", error);
        }
      };

      ChartDateRange();
    } else {
      console.log("No date selected");
    }
  }, [date]);

  useEffect(() => {
    if (initialcampaign === false) {
      setCampaignList([]);  // This will run after initialcampaign is set to false
    }
  }, [initialcampaign]);

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[150px] w-auto justify-start text-left font-normal mt-0",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const renderStatusIcon = (status: any) => {
  switch (status) {
    case "Live":
      return <PlayIcon className="text-[#64748B]" />; // Play icon for 'Live'
    case "Pending":
      return <StopwatchIcon className="text-[#64748B]" />; // Stopwatch icon for 'Pending'
    case "Paused":
      return <PauseIcon className="text-[#64748B]" />; // Pause icon for 'Paused'
    case "In review":
      return <MagnifyingGlassIcon className="text-[#64748B]" />; // Magnifying glass icon for 'In review'
    case "Rejected":
      return <Cross2Icon className="text-gray-500" />;
    case "Completed":
      return (
        <CheckIcon className="text-[#64748B] rounded-full border border-gray-500" />
      ); // Check icon for 'Completed'
    default:
      return null; // If no match, return nothing
  }
};

const CampaignList: React.FC = () => {
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [pausedCampaigns, setPausedCampaigns] = useState<{
    [key: number]: boolean;
  }>({});
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const FromDateOne = new Date("2024-12-01"); // Replace with your dynamic logic
  const [fromDate, setfromDate] = useState<Date | null>(null);
  const CurrentDate = new Date();

  const WorkspaceCount = useSelector(
    (state: RootState) => state.advertiserAccount.workspace_count
  );
  const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 19); // Extract the "YYYY-MM-DDTHH:mm:ss" portion
  };

  const [toDate, setToDate] = useState<string | null>(formatDate(CurrentDate));


  useEffect(() => {
    console.log("Formatted ToDate:", toDate); // Verify the formatted date
  }, [toDate]);

  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State to control dialog visibility
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const [isSorted, setIsSorted] = useState(false);
  const [originalCampaigns, setOriginalCampaigns] = useState(campaignList);

  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>(
    []
  );
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); 
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(true); 
  const [columnsLoading, setColumnsLoading] = useState(true);
  const [initialcampaign , setInitialCampaign] = useState(true);
  const [currencyData, setCurrencyData] = useState<BillingCountry[]>([]);
  const [filterData, setFilterData] = useState({
    filter: "",
    subFilter: "",
    value: 0,
  });
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );

const userPermissions = useSelector(
  (state: RootState) => state.advertiserAccount.permissions);

  const [campaignNames, setCampaignNames] = useState([]);
  const [billingStatus , setBillingStatus] = useState("");

  const [visibleColumns, setVisibleColumns] = useState([
    "campaign_name",
    "channel_type",
    "status",
    "start_date_time",
    "campaign_budget",
    "sent",
    "delivered",
    "read",
    "ctr",
    "delivery_rate",
    "button_click",
  ]);

  const defaultColumns = [
    "campaign_name",
    "channel_type",
    "status",
    "start_date_time",
    "campaign_budget",
    "sent",
  ];

  const [isInternalDialogOpen , setInternalDialogOpen] = useState(false);
  const [isApiExecuting, setIsApiExecuting] = useState(false);


  // Merge default and visible columns
  const displayedColumns = [
    ...defaultColumns,
    ...visibleColumns.filter((col) => !defaultColumns.includes(col)),
  ];

  const [dateList, setDateList] = useState<string[]>([]);

  const handleCheckboxRowSelect = (id: number) => {
    setCheckboxSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id];
      setIsAllSelected(newSelectedRows.length === currentCampaigns.length); // Update `isAllSelected` if all rows are selected
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentCampaigns.map((campaign) => campaign.campaign_id);
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdvAcc) {
      getCampaignList();
      getWorkspaceBillingStatus();
    }
  }, [apiUrlAdvAcc]); // Runs when apiUrlAdvAcc is updated

  useEffect(() => {
    if (campaignList.length > 0) {
      setDateListFunction();
    }
  }, [campaignList]); // Dependency on campaignList

// Step 1: Apply search directly to the campaign list
const searchedCampaigns = campaignList.filter((campaign) => {
  return searchTerm
    ? campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) // Ensure correct search field
    : true;
});

// Step 2: Calculate new total pages based on searched results
const totalPages: number = Math.ceil(searchedCampaigns.length / rowsPerPage);

// Step 3: Adjust currentPage only if it’s out of bounds
useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages > 0 ? totalPages : 1); // Stay on the last valid page
  }
}, [searchedCampaigns, totalPages]);

// Step 4: Apply pagination
const currentCampaigns = searchedCampaigns.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

// Handle page change
const handlePageChange = (newPage: number) => {
  if (newPage > 0 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};

const handleEdit = (campaignId: any, channelType: any , isEditable: boolean) => {
  if (isEditable) {
  //console.log("CampaignId : " + campaignId)
  navigate("/navbar/createcampaign", { state: { campaignId, channelType } });
   }
};

const handleDeleteClick = (campaignId: any, isDeletable: boolean) => {
  if (isDeletable) {
  setCampaignToDelete(campaignId); // Store campaign ID to delete
  setIsAlertOpen(true); // Open the alert dialog
  }
};

const handleInternalOpenDialog = (campaignId: any, isDeletable: boolean) => {
  if (isDeletable) {
    setCampaignToDelete(campaignId); }
  setTimeout(() => {
    setInternalDialogOpen(true);
  }, 0);
};

const handleClose = () => {
  setIsAlertOpen(false);
};

  useEffect(() => {
  //  getWorkspaceBillingStatus();

    console.log(
      "filter data: " +
        filterData.filter +
        " " +
        filterData.subFilter +
        " " +
        filterData.value
    );
  }, [filterData]);

  // Use useEffect to avoid re-render loop
  useEffect(() => {
    if (filterData.filter === "none") {
      setFilterData({ filter: "none", subFilter: "", value: 0 });
    }
  }, [filterData.filter]);

  const getCampaignList = async () => {
    setIsLoading(true);
    //setCampaignLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetCampaignListbyWorkspaceId/${workspaceId}`
      );
      if (response.data && response.data.campaignList) {
       // debugger
        const campaigns = response.data.campaignList;
        setCampaignList(campaigns);
        const names = campaigns.map((campaign: { campaign_name: string }) => campaign.campaign_name);
        setCampaignNames(names);
  
        console.log("Extracted Campaign Names:", names); 

       // setCurrentCampaigns(campaigns);
        setIsLoading(false); 
        setHasCampaigns(campaigns.length > 0); 
      } else {
        setIsLoading(false); 
      }
    } catch (error) {
      console.error("Error fetching campaign list:", error);
      setCampaignList([]); 
    //  setHasCampaigns(false);
    } finally {
      //setCampaignLoading(false);
    }
  };

  const getWorkspaceBillingStatus = async () => {
    setIsLoading(true); 
   // setCampaignLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdvAcc}/GetWorkspaceBillingStatus`, 
        {
          params: { workspaceId }  
        }  );
      console.log("response::",response);
      console.log("Raw Response:", response);
      console.log("Data inside Response:", response.data);
      console.log("Billing Status:", response.data?.billingStatus);

      if (response.data && response.data.billingStatus) {
        console.log("Hloo1");
      
        setBillingStatus(response.data.billingStatus);
        //setIsLoading(false); 
      } else {
        //setIsLoading(false); 
        console.log("No Billing Status available in response.");
      }
    } catch (error) {
      console.error("Error fetching in get billing status:", error);
    } finally {
      //setCampaignLoading(false);
    }
  };


  const GetCurrencyById = async () => {
    setIsLoading(true);
   // setCampaignLoading(true);
    try {
      console.log("workspaceeid:", workspaceId);
      const response = await axios.get(`${apiUrlAdvAcc}/GetCurrencyById`, {
        params: { workspaceId },
      });
      if (response.data && response.data.currencyList) {
        setCurrencyData(response.data.currencyList);
        console.log(" Currencyy : ", response.data.currencyList);
       // setIsLoading(false); 
      } else {
        console.log("No currencyy available in response.", response.data);
      //  setIsLoading(false); 
      }
    
    } catch (error) {
      console.error("Error fetching in currency data: " + error);
    }
    finally {
    }
  };


  const setDateListFunction = () => {
    const uniqueDates = campaignList.reduce(
      (acc: Record<string, string[]>, campaign) => {
        const date = campaign.start_date_time.split("T")[0]; // Extract only the date part (e.g., "2024-12-18")
        if (!acc[date]) {
          acc[date] = []; 
        }
        acc[date].push(date); 
        return acc;
      },
      {}
    );
    const datekeys = Object.keys(uniqueDates);
    console.log("Unique Dates", datekeys); // Logs grouped unique dates
    setDateList(datekeys);
  };

  const confirmDelete = async () => {
    setIsApiExecuting(true);
    try {
      const response = await axios.delete(
        `${apiUrlAdvAcc}/DeleteCampaignById?CampaignId=` + campaignToDelete
      );

      if (response.data.status === "Success") {
        setIsAlertOpen(false);
        const Close = () => {
          getCampaignList();
        };
        Close();
        toast.toast({
          title: "Success",
          description: "The campaign was deleted successfully",
        });

        // Refresh the campaign list
      } else {
        console.error("Delete failed:", response.data.Status_Description);
        toast.toast({
          title: "Error",
          description: "Failed to delete campaign",
        });

        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e) {
      console.error("Error in deleting campaign", e);
    }
    finally{
      setInternalDialogOpen(false);
      setIsApiExecuting(false);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const handlePauseResumeClick = async (campaignId: number) => {
    // Find the current campaign
    const campaign = campaignList.find((c) => c.campaign_id === campaignId);
    if (!campaign) return;
  
    // Correctly determine the new status based on current "paused"
    const newStatus: Campaign["status"] = campaign.paused ? "Live" : "Paused";
  
    // Update local UI state optimistically
    setCampaignList((prevList) =>
      prevList.map((c) =>
        c.campaign_id === campaignId
          ? {
              ...c,
              paused: !c.paused,
              status: newStatus,
            }
          : c
      )
    );
  
    const payload = {
      CampaignId: campaignId,
      Status: newStatus,
    };
  
    try {
      const response = await axios.post(
        `${apiUrlAdvAcc}/UpdateCampaignStatus`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data?.status === "Success") {
        console.log(`Campaign status updated successfully: ${newStatus}`);
      } else {
        console.error(
          `Failed to update campaign status: ${response.data?.status_Description}`
        );
      }
    } catch (error) {
      console.error("Error while updating campaign status:", error);
    }
  };

  const sortCampaignList = (tableHeader: string) => {
    const sortByField = (
      field: keyof Campaign,
      type: "string" | "number" | "date" = "string"
    ) => {
      const sortedCampaigns = [...campaignList].sort((a, b) => {
        if (type === "number") {
          return Number(a[field]) - Number(b[field]);
        } else if (type === "date") {
          return (
            Date.parse(a[field] as string) - Date.parse(b[field] as string)
          );
        } else {
          return String(a[field]).localeCompare(String(b[field]));
        }
      });
      setOriginalCampaigns(campaignList);
      setCampaignList(sortedCampaigns);
    };

    if (isSorted) {
      setCampaignList(originalCampaigns);
    } else {
      switch (tableHeader) {
        case "ByCampaignName":
          sortByField("campaign_name", "string");
          break;
        case "ByCampaignChannel":
          sortByField("channel_type", "string");
          break;
        case "ByCampaignStatus":
          sortByField("status", "string");
          break;
        case "ByCampaignDate":
          sortByField("start_date_time", "date"); // Sorting by start date
          break;
        case "ByCampaignAmount":
          sortByField("campaign_budget", "number"); // Sorting by budget as a number
          break;
        case "ByCampaignSent":
          sortByField("sent", "number"); // Sorting by sent count as a number
          break;
        case "ByCampaignDelivered":
          sortByField("delivered", "string"); // Sorting by sent count as a number
          break;
        case "ByRead":
          sortByField("read", "string"); // Sorting by sent count as a number
          break;
        case "ByCTR":
          sortByField("ctr", "string"); // Sorting by sent count as a number
          break;
        case "ByDeliveryRate":
          sortByField("delivery_rate", "string"); // Sorting by sent count as a number
          break;
        case "ByButtonClick":
          sortByField("button_click", "string"); // Sorting by sent count as a number
          break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted);
  };
  useEffect(() => {
    setHasCampaigns(campaignList.length > 0);
  }, [campaignList]);
  // const hasCampaigns = campaignList.length > 0;

  const handleExportButtonClick = () => {
    // Filter columns to include only the desired fields
    const filteredData = currentCampaigns.map(
      ({
        campaign_id,
        campaign_name,
        channel_type,
        status,
        start_date_time,
        end_date_time,
        campaign_budget,
      }) => ({
        campaign_id,
        campaign_name,
        channel_type,
        status,
        start_date_time,
        end_date_time,
        campaign_budget,
      })
    );

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaign_List");

    // Export to an xlsx file
    XLSX.writeFile(workbook, "CampaignList.xlsx");
  };

  const handleCreateCampaign = () => {
    console.log("BillingS:" , billingStatus);
    if (billingStatus.toLowerCase() === "unpaired") {
     toast.toast({
       title: "Warning",
       description: "Your workspace is not paired. You cannot create a campaign.",
     });
     return;
   }
     dispatch(setCreateBreadCrumb(true));
    navigate("/navbar/createcampaign", { state: { campaignNames } });
 };
 
  return (
    <div>
      <Toaster />
      {isLoading && (campaignLoading || columnsLoading) && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      )}
      <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
     
            {userPermissions.includes("ADV_Campaigns_Create") && <Button
              onClick={handleCreateCampaign}
              className="w-36 text-sm text-[#F8FAFC] font-medium h-[35px] mt-[10px]  form-button"
            >Create Campaign</Button>
            }
      </div>

      {hasCampaigns || !initialcampaign ? (
        <>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 -mt-4">
              <div className="flex-shrink-0 w-full md:w-auto">
                <Input
                  placeholder="Search campaign by name..."
                  className="w-full md:w-[350px] text-[14px] font-normal text-[#171717]  !mt-0"
                  //className="w-[350px] text-[14px] mt-2 font-normal text-[#171717]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4 w-full md:w-auto ">
                {/* Date Picker */}
                <div className="flex-shrink-0 -mr-5">
                  <DatePickerWithRange
                    className="!mt-0"
                    getCampaignList={getCampaignList}
                    setCampaignList={setCampaignList}
                    initialcampaign={initialcampaign} 
                    setInitialCampaign={setInitialCampaign} 
                  />
                </div>

                {/*} <DropdownMenuDemo
                    setFilterData={setFilterData}
                    dateList={dateList} /> */}
                <div className="flex-shrink-0 -mr-1">
                  <CampaignFilter
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    workspaceId={workspaceId}
                    setColumnsLoading={setColumnsLoading}
                  />
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="outline"
                    className="w-24 text-[#020617] !mt-0"
                    onClick={handleExportButtonClick}
                  >
                    <FileIcon
                      style={{ width: "14px", height: "14px" }}
                      className="mr-1 text-[#020617]"
                    />{" "}
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="max-h-[60vh] overflow-y-auto">
                <Table
                  className="rounded-xl whitespace-nowrap border-gray-200  "
                  style={{ color: "#020617", fontSize: "14px" }}
                >
                  <TableHeader
                    className="text-center text-[14px] fore font-medium"
                    style={{ color: "#64748B" }}
                  >
                    <TableRow>
                      {/* {visibleColumns.includes("campaign_name") && */}
                      {displayedColumns.includes("campaign_name") && (
                        <TableHead className="">
                          <div className="flex items-center gap-6 justify-start cursor-pointer">
                            {/* <input
                              type="checkbox"
                              className={`text-muted-foreground ${
                                isAllSelected
                                  ? "accent-gray-700 bg-grey-700 text-red-500"
                                  : ""
                              }`}
                              checked={isAllSelected}
                              onChange={handleSelectAll}
                            /> */}
                            Campaign name{" "}
                            <CaretSortIcon
                              onClick={() => sortCampaignList("ByCampaignName")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}

                      {/*{visibleColumns.includes("channel_type") &&*/}
                      {displayedColumns.includes("channel_type") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Channel{" "}
                            <CaretSortIcon
                              onClick={() =>
                                sortCampaignList("ByCampaignChannel")
                              }
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}
                      {/*} {visibleColumns.includes("status") && */}
                      {displayedColumns.includes("status") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Status{" "}
                            <CaretSortIcon
                              onClick={() =>
                                sortCampaignList("ByCampaignStatus")
                              }
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}
                      {displayedColumns.includes("start_date_time") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Schedule{" "}
                            <CaretSortIcon
                              onClick={() => sortCampaignList("ByCampaignDate")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}

                      {displayedColumns.includes("campaign_budget") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Amount{" "}
                            <CaretSortIcon
                              onClick={() =>
                                sortCampaignList("ByCampaignAmount")
                              }
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}

                      {displayedColumns.includes("sent") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Sent{" "}
                            <CaretSortIcon
                              onClick={() => sortCampaignList("ByCampaignSent")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}

                      {/*} {visibleColumns.includes("delivered") &&  */}
                      {displayedColumns.includes("delivered") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Delivered{" "}
                            <CaretSortIcon
                              onClick={() =>
                                sortCampaignList("BYCampaignDelivered")
                              }
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}

                      {/* {visibleColumns.includes("read") && */}
                      {displayedColumns.includes("read") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Read{" "}
                            <CaretSortIcon
                              onClick={() => sortCampaignList("ByRead")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}
                      {/* {visibleColumns.includes("ctr") && */}
                      {displayedColumns.includes("ctr") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            CTR{" "}
                            <CaretSortIcon
                              onClick={() => sortCampaignList("ByCTR")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}

                      {/*{visibleColumns.includes("delivery_rate") && */}
                      {displayedColumns.includes("delivery_rate") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Delivery rate{" "}
                            <CaretSortIcon
                              onClick={() => sortCampaignList("ByDeliveryRate")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}

                      {/* {visibleColumns.includes("button_click") && */}
                      {displayedColumns.includes("button_click") && (
                        <TableHead className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            Button click{" "}
                            <CaretSortIcon
                              onClick={() => sortCampaignList("ByButtonClick")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      )}
                      <TableHead className="text-left"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-left text-[14px] font-normal text-[#020617] ">
                    {currentCampaigns.map((campaign) => {
                      console.log("Campaign Count :"+currentCampaigns.length)
                      let isSelected;
                      campaignList.map((campaings) => {
                        isSelected = checkboxSelectedRows.includes(
                          campaings.campaign_id
                        );
                      });
                      const startDate = new Date(campaign.start_date_time);
                      const endDate = new Date(campaign.end_date_time);

                      return (
                        <TableRow
                          key={campaign.campaign_id}
                          className={`${isSelected ? "bg-[#F1F5F9CC]" : ""}`}
                        >
                          {displayedColumns.includes("campaign_name") && (
                            <TableCell className="flex justify-start py-4 text-green-900">
                              <div className="flex items-center gap-6">
                                {/* <input
                                  type="checkbox"
                                  className={`accent-gray-700 bg-grey-700 text-red-500 ${
                                    isAllSelected
                                      ? "accent-gray-700 bg-grey-700 text-red-500"
                                      : ""
                                  }`}
                                  checked={checkboxSelectedRows.includes(
                                    campaign.campaign_id
                                  )}
                                  onChange={() =>
                                    handleCheckboxRowSelect(
                                      campaign.campaign_id
                                    )
                                  }
                                /> */}
                                <span className="text-[#020617]">
                                  {campaign.campaign_name}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          {displayedColumns.includes("channel_type") && (
                            <TableCell className="py-4 text-[#FFFFFF]">
                              <Badge
                                className={
                                  campaign.channel_type === "WhatsApp"
                                    ? ""
                                    : campaign.channel_type === "SMS"
                                    ? ""
                                    : campaign.channel_type ===
                                      "Push Notification"
                                    ? ""
                                    : campaign.channel_type === "Email"
                                    ? "bg-blue-400"
                                    : "bg-gray-400"
                                }
                                style={
                                  campaign.channel_type === "WhatsApp"
                                    ? { backgroundColor: "#479E98" }
                                    : campaign.channel_type === "SMS"
                                    ? { backgroundColor: "#DFA548" }
                                    : campaign.channel_type ===
                                        "Push Notification" ||
                                      campaign.channel_type === "Push"
                                    ? { backgroundColor: "#B87867" }
                                    : campaign.channel_type === "RCS" ||
                                      campaign.channel_type === "RCS messages"
                                    ? { backgroundColor: "#61177E" }
                                    : {}
                                }
                              >
                                {campaign.channel_type}
                              </Badge>
                            </TableCell>
                          )}
                          {displayedColumns.includes("status") && (
                            <TableCell className="py-4 flex items-center gap-2">
                              {renderStatusIcon(campaign.status)}{" "}
                              {/* Display the appropriate icon */}
                              {campaign.status} {/* Display the status text */}
                            </TableCell>
                          )}
                          {displayedColumns.includes("start_date_time") && (
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                {new Date(
                                  campaign.start_date_time
                                ).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                                ,{" "}
                                {new Date(
                                  campaign.start_date_time
                                ).getFullYear()}
                                <ArrowRightIcon />
                                {new Date(
                                  campaign.end_date_time
                                ).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                                ,{" "}
                                {new Date(campaign.end_date_time).getFullYear()}
                              </div>
                            </TableCell>
                          )}
                          {displayedColumns.includes("campaign_budget") && (
                            <TableCell className="py-4 px-4 text-left">
                             {campaign.currency_symbol}{campaign.campaign_budget}
                            </TableCell>
                          )}
                          {displayedColumns.includes("sent") && (
                            <TableCell className="py-4 px-4 text-left">
                              {campaign.sent}
                            </TableCell>
                          )}
                          {displayedColumns.includes("delivered") && (
                            <TableCell className="py-4 px-4 text-center">
                              {campaign.delivered}
                            </TableCell>
                          )}
                          {displayedColumns.includes("read") && (
                            <TableCell className="py-4 px-4 text-center">
                              {campaign.read}
                            </TableCell>
                          )}
                          {displayedColumns.includes("ctr") && (
                            <TableCell className="py-4 px-4 text-center">
                              {campaign.ctr}
                            </TableCell>
                          )}
                          {displayedColumns.includes("delivery_rate") && (
                            <TableCell className="py-4 px-4 text-center">
                              {campaign.delivery_rate}
                            </TableCell>
                          )}
                          {displayedColumns.includes("button_click") && (
                            <TableCell className="py-4 px-4 text-center">
                              {campaign.button_click}
                            </TableCell>
                          )}
                          <TableCell className="flex justify-left py-4">
                            {userPermissions.includes("ADV_Campaigns_Edit") &&  <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <DotsHorizontalIcon
                                  onClick={() => handleMenuToggle(campaign.campaign_id)}
                                  className="cursor-pointer w-6 h-6" />
                              </DropdownMenuTrigger>
                              {openMenuRowId === campaign.campaign_id && (
                                <DropdownMenuContent
                                  align="end"
                                   className="w-40 bg-white shadow-lg rounded-lg p-2 border border-gray-200"
                                >
                                   <DropdownMenuItem
                     onClick={() => {
                      if (campaign.status === "Live" || campaign.status === "Paused") {
                        handlePauseResumeClick(campaign.campaign_id);
                      }
                    }}
                    disabled={campaign.status !== "Live" && campaign.status !== "Paused"}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                      campaign.status === "Live" || campaign.status === "Paused"
                        ? "hover:bg-gray-100 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {campaign.status === "Paused" ? (
                      <>
                        <PlayIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-800">Resume</span>
                      </>
                    ) : 
                     campaign.status === "Live" ? (
                      <>
                        <PauseIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">Pause</span>
                      </>
                    ) : (
                      <>
                        <PauseIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-800">Pause</span>
                      </>
                    )}

                      </DropdownMenuItem>
                      <div className="border-t border-gray-200 my-1"></div>
                      {(() => {
              // const today = new Date();
              // const endDate = new Date(campaign.end_date_time);
             // const isEditable = isAfter(endDate, today);
             //const isDateValid = isAfter(endDate, today); // Checks if end date is in the future
             const isStatusValid = campaign.status === "In review"; // Checks if status is "In review"
             const isEditable = isStatusValid;
             
             return (
              <DropdownMenuItem
                onClick={() => handleEdit(
                  campaign.campaign_id,
                  campaign.channel_type,
                  isEditable
                )}
                disabled={!isEditable}
              // disabled={true}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  isEditable
                    ? "hover:bg-gray-100 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                  <Pencil1Icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-800">Edit</span>
              </DropdownMenuItem>
                );
              })()}

              <div className="border-t border-gray-200 my-1"></div>
              <DropdownMenuItem
                onClick={() => handleInternalOpenDialog(campaign.campaign_id,campaign.status !== "Live")}
                disabled={campaign.status === "Live"}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  campaign.status !== "Live"
                    ? "hover:bg-gray-100 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`} >
                  <TrashIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-800">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</div>
</div>

<Dialog open={isInternalDialogOpen} onOpenChange={setInternalDialogOpen}>
              <DialogContent className="p-6 mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-18px font-semibold text-[#09090B]">
                    Delete List
                  </DialogTitle>
                  <DialogDescription className="text-14px font-medium text-[#71717A] mt-2">
                    Are you sure you want to delete this list? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-4 flex-wrap">
                  <Button className="px-4 py-2 w-auto" variant="outline" disabled={isApiExecuting} onClick={() => setInternalDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="px-4 py-2 w-auto text-[#FAFAFA] bg-[#3A85F7]"
                    disabled={isApiExecuting}
                    onClick={confirmDelete}
                  >
                    {isApiExecuting ? "Deleting" : "Delete"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2 text-gray-500 text-sm ">
                <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                  currentPage * rowsPerPage,
                  currentCampaigns.length
                )} of ${campaignList.length} row(s) selected`}</span>
              </div>

              <div className="flex items-center space-x-4 font-medium text-sm">
                <span className="text-[#020617] font-medium text-[14px]">
                  Rows per page
                </span>

                <div className="relative inline-block ml-2">
                  <select
                    className="cursor-pointer border border-gray-300 rounded-md px-2 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      width: "60px",
                      height: "30px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "400",
                      borderColor: "#E5E7EB",
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)", // Adds slight shadow
                    }}
                    value={rowsPerPage}
                    onChange={(e) => {
                      const newRowsPerPage = Number(e.target.value);
                      setRowsPerPage(newRowsPerPage);
                      setCurrentPage(1); // Reset to first page after changing rows per page
                    }}
                  >
                    {[5, 10, 20].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <CaretSortIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4" />
                </div>

                <div className="ml-4 mr-4">
                  <span className="text-[#020617] text-[14px] font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                      currentPage === 1
                        ? "cursor-not-allowed bg-gray-100"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => handlePageChange(1)}
                  >
                    «
                  </button>
                  <button
                    disabled={currentPage === 1}
                    className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                      currentPage === 1
                        ? "cursor-not-allowed bg-gray-100"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    ‹
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed bg-gray-100"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    ›
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed bg-gray-100"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
        {isLoading && null}
        {!isLoading && (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <h2 className="text-[24px] font-semibold mb-1 text-[#000000]">
              Here you will see all your campaigns
            </h2>
            {userPermissions.includes("ADV_Campaigns_Create") && <div> 
          <p 
          className="text-[#64748B] font-normal mb-1 text-[14px]">
          Click the button below to create your first campaign.
        </p>
         <Button
        // onClick={() => {
        //   dispatch(setCreateBreadCrumb(true));
        //   navigate("/navbar/createcampaign");
        // }}
        onClick ={handleCreateCampaign}
        className="inline-flex items-center justify-center text-[14px] font-medium text-[#F8FAFC] px-5 py-5 whitespace-nowrap form-button"
        style={{ width: "auto", minWidth: "unset", padding:'16px' }}>        
        Create campaign
      </Button>
        </div> }
          </div>
        )}
      </>
    )}
  </div>
);
};

export default CampaignList;

