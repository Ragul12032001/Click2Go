import React, { useState, useEffect } from "react";
import { Button } from '../Components/ui/button'
import { Input } from "../Components/ui/input";
import { cn } from "../lib/utils";
import { Badge } from "../Components/ui/badge";
import { Link } from "react-router-dom";
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
} from "../Components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../Components/ui/breadcrumb";
import { Calendar } from "../Components/ui/calendar";
import { Separator } from "@radix-ui/react-select";
import axios from "axios";
import { Tabs, TabsContent } from "../Components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../Components/ui/dropdown-menu";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import config from "../config.json";
import {
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";
import { Skeleton } from "../Components/ui/skeleton";
import DropdownMenuDemo from "../Components/Filter/OperatorCampaignDropdown";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb } from "../State/slices/AdvertiserAccountSlice";
import * as XLSX from "xlsx";
import { RootState } from "../State/store";
interface Campaign {
  campaign_id: number;
  campaign_name: string;
  workspace_name: string;
  channel_type: string;
  status: string;
  start_date_time: string;
  end_date_time: string;
  campaign_budget: number;
  accountNames: string;
  account: string;
}

type CampaignCheck = {
  campaign_id: number;
  name: string;
};

interface DatePickerWithRangeProps {
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  onChange?: (selectedRange: DateRange | undefined) => void;
  setCampaignList: React.Dispatch<React.SetStateAction<Campaign[]>>;
  getCampaignList: () => void;
  setCurrentCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setInitialCampaign: React.Dispatch<React.SetStateAction<boolean>>;
  initialcampaign: boolean; 
  accountCreatedDate?: string;
  
}

const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  className,setCampaignList,getCampaignList,setCurrentCampaigns,  setInitialCampaign , initialcampaign, accountCreatedDate 
}) => {
  const createdDate = accountCreatedDate ? new Date(accountCreatedDate) : undefined;
  const [currentData, setCurrentData] = useState<Campaign[]>([]);
  const [fromDate, setfromDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  const [operatorapiUrl,setOperatorApiUrl]=useState("")
  const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to:  undefined
  });



    useEffect(() => {
      const fetchConfig = async () => {
        try {
          const response = await fetch("/config.json");
          const config = await response.json();
          setapiUrlAdminAcc(config.ApiUrlAdminAcc);
          setOperatorApiUrl(config.OperatorUrl);
          console.log("apiUrlAdminAcc:" , apiUrlAdminAcc);
        } catch (error) {
          console.error("Error loading config:", error);
        }
      };
  
      fetchConfig();
    }, []);


  useEffect(() => {

    if (date && date.from && date.to) {

      const date_to = format(date.to, "yyyy-MM-dd");

      const date_from = format(date.from, "yyyy-MM-dd"); 

      const ChartDateRange = async () => {
        debugger
        try {
          const response = await axios.get(
            `${operatorapiUrl}/GetCampaignListOperatorbyDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}&workspaceId=${workspaceId}`
          );
      
         
          if (
            response.data.status === "Success" &&
            response.data.campaignCount > 0
          ) {
           
            setCampaignList(response.data.campaignList);

          } else {
            // setChartData(response.data);
           // getCampaignList();
          // setCurrentData([]);
          // setCurrentCampaigns([]);
          // setInitialCampaign(false);
          // setCampaignList([]);
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
  },[date])

  useEffect(() => {
    if (initialcampaign === false) {
      setCampaignList([]);  // This will run after initialcampaign is set to false
    }
  }, [initialcampaign]);  // Dependency on initialcampaign state
  
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
            disabled={createdDate ? { before: createdDate } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const renderStatusIcon = (status: any) => {
  switch (status) {
    case "Live":
      return <PlayIcon className="text-gray-500" />; // Play icon for 'Live'
    case "Pending":
      return <StopwatchIcon className="text-gray-500" />; // Stopwatch icon for 'Pending'
    case "Paused":
      return <PauseIcon className="text-gray-500" />; // Pause icon for 'Paused'
    case "In review":
      return <MagnifyingGlassIcon className="text-gray-500" />; // Magnifying glass icon for 'In review'
    case "Rejected":
      return <Cross2Icon className="text-gray-500" />; // X icon for 'Rejected
    case "Completed":
      return (
        <CheckIcon className="text-gray-500 rounded-full border border-gray-500" />
      ); // Check icon for 'Completed'
    default:
      return null; // If no match, return nothing
  }
};

const OperatorCampaignList: React.FC = () => {
  const [accountCreatedDate, setAccountCreatedDate] = useState<string | undefined>(undefined);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State to control dialog visibility
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [currentCampaigns, setCurrentCampaigns] = useState<Campaign[]>([]);

  const [isSorted, setIsSorted] = useState(false);
  const [originalCampaigns, setOriginalCampaigns] = useState(currentCampaigns);

  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>(
    []
  );
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default 5 rows per page
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  const [operatorapiUrl,setOperatorApiUrl]=useState("")
  const [isLoading, setIsLoading] = useState(true);
  const [filterData, setFilterData] = useState({
    filter: "None",
    subFilter: "",
  });
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const [initialcampaign , setInitialCampaign] = useState(true);
  const dispatch = useDispatch();
  const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id);
  const OperatorUrl = useSelector((state:RootState)=>state.authentication.operatorUrl);
  //For Date Filter
  const [dateList, setDateList] = useState<string[]>([]);
    const [date, setDate] = useState<DateRange | undefined>({
      from: undefined,
      to:  undefined
    });

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
      setIsLoading(true);
      try {
        
        const response = await fetch("/config.json");
        const config = await response.json();
        setapiUrlAdminAcc(config.ApiUrlAdminAcc);
        setOperatorApiUrl(config.OperatorUrl);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdminAcc) {
      getCampaignList();
    }
  }, [apiUrlAdminAcc]); // Runs when apiUrlAdminAcc is updated

  useEffect(() => {
    if (campaignList.length > 0) {
      setDateListFunction();
    }
  }, [campaignList]); // Dependency on campaignList

  useEffect(() => {

    if (date && date.from && date.to) {

      const date_to = format(date.to, "yyyy-MM-dd");

      const date_from = format(date.from, "yyyy-MM-dd"); 

      const ChartDateRange = async () => {
        try {
          const response = await axios.get(
            `${operatorapiUrl}/GetCampaignListOperatorbyDateRange?from_date=${date_from.toString()}&to_date=${date_to.toString()}&workspaceId=${workspaceId}}`
          );
      
         
          if (
            response.data.status === "Success" &&
            response.data.campaignList.length > 0
          ) {
           
            setCampaignList(response.data.campaignList);

          } else {
            // setChartData(response.data);
           // getCampaignList();
          // setCurrentData([]);
          // setCurrentCampaigns([]);
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
  },[date])

  // Filter the campaigns by the search term and subFilter
  const filteredCampaigns = campaignList.filter((campaign) => {
    const matchesSearchTerm = searchTerm
      ? campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

      const matchesSubFilter = filterData.subFilter
      ? filterData.filter === "Channel"
        ? campaign.channel_type
            ?.toLowerCase()
            .includes(filterData.subFilter.toLowerCase())
        : filterData.filter === "Status"
        ? campaign.status?.toLowerCase().includes(filterData.subFilter.toLowerCase())
        : filterData.filter === "StartedAt"
        ? campaign.start_date_time.split("T")[0] === filterData.subFilter
        : true
      : true;
  
    return matchesSearchTerm && matchesSubFilter;
  });

  // Calculate total pages for filtered campaigns
  const totalPages: number = Math.ceil(filteredCampaigns.length / rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1); // Stay on the last valid page
    }
  }, [filteredCampaigns, totalPages]);

  useEffect(() => {
    const newCurrentCampaigns = filteredCampaigns.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );

    setCurrentCampaigns(newCurrentCampaigns);
  }, [filterData, campaignList, currentPage, rowsPerPage, searchTerm]);
  // Only re-run if dependencies change

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (campaignId: any, channelType: any) => {
    //console.log("CampaignId : " + campaignId)
    navigate("/navbar/createCampaign", { state: { campaignId, channelType } });
  };

  // Function to open the alert dialog
  const handleDeleteClick = (campaignId: any) => {
    setCampaignToDelete(campaignId); // Store campaign ID to delete
    setIsAlertOpen(true); // Open the alert dialog
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  // Function to handle the actual delete after confirmation

  useEffect(() => {
    console.log(
      "filter data: " +
        filterData.filter +
        " " +
        filterData.subFilter +
        " " 
    );
  }, [filterData]);

  // Use useEffect to avoid re-render loop
  useEffect(() => {
    if (filterData.filter === "none") {
      setFilterData({ filter: "none", subFilter: "" });
    }
  }, [filterData.filter]);

  const getCampaignList = async () => {
    debugger
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${OperatorUrl}/GetCampaignListOperator?WorkspaceId=${workspaceId}`
      );
      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.campaignList) {
        setCampaignList(response.data.campaignList);
        setAccountCreatedDate(response.data.accountCreatedDate);
        setIsLoading(false);
      
        console.log("Campaign List : ", response.data.campaignList);
      } else {
        console.log("No campaign list available in response.");
        setIsLoading(false);
      }
    } catch (error) {
      // Handle error if API call fails
      setHasCampaigns(false);
      setIsLoading(false);
      console.error("Error fetching campaign list:", error);
    } finally {
      // Ensure the menu is closed after fetching data
    }
  };

  const setDateListFunction = () => {
    const uniqueDates = campaignList.reduce(
      (acc: Record<string, string[]>, campaign) => {
        const date = campaign.start_date_time.split("T")[0]; // Extract only the date part (e.g., "2024-12-18")
        if (!acc[date]) {
          acc[date] = []; // Initialize an empty array for this date if it doesn't exist
        }
        acc[date].push(date); // Add the date to the group (if needed for further processing)
        return acc;
      },
      {}
    );
    const datekeys = Object.keys(uniqueDates);
    console.log("Unique Dates", datekeys); // Logs grouped unique dates
    setDateList(datekeys);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${apiUrlAdminAcc}/DeleteCampaignById?CampaignId=` + campaignToDelete
      );

      if (response.data.status === "Success") {
        setIsAlertOpen(false);
        toast.success("The campaign was deleted successfully", {
          autoClose: 1000,
          onClose: () => {
            getCampaignList();
          },
        });

        // Refresh the campaign list
      } else {
        console.error("Delete failed:", response.data.Status_Description);
        toast.error("Error while deleting the campaign");
        setTimeout(() => {
          /* wait for 1 second */
        }, 1000);
      }
    } catch (e) {
      console.error("Error in deleting campaign", e);
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [sortedField, setSortedField] = useState<string | null>(null);

const sortCampaignList = (tableHeader: string) => {
  const sortByField = (
    field: keyof Campaign,
    type: "string" | "number" | "date" = "string"
  ) => {
    let newSortOrder = 'asc';
    if (sortedField === field && sortOrder === 'asc') {
      newSortOrder = 'desc';
    }
    setSortOrder(newSortOrder as 'asc' | 'desc');
    setSortedField(field);

    const sortedCampaigns = [...campaignList].sort((a, b) => {
      let comparison = 0;
      if (type === "number") {
        comparison = Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        comparison = (
          new Date(a[field] as string).getTime() -
          new Date(b[field] as string).getTime()
        );
      } else {
        comparison = String(a[field]).localeCompare(String(b[field]));
      }
      return newSortOrder === 'asc' ? comparison : -comparison;
    });

    setCampaignList(sortedCampaigns);
  };

  switch (tableHeader) {
    case "ByCampaignName":
      sortByField("campaign_name", "string");
      break;
    case "ByCampaignAccount":
      sortByField("workspace_name", "string");
      break;
    case "ByCampaignChannel":
      sortByField("channel_type", "string");
      break;
    case "ByCampaignStatus":
      sortByField("status", "string");
      break;
    case "ByCampaignDate":
      sortByField("start_date_time", "date");
      break;
    case "ByCampaignAmount":
      sortByField("campaign_budget", "number");
      break;
    default:
      console.warn("Unknown table header");
  }
};

  // Function to handle checkbox selection
  // const handleRowSelect = (campaignId: CampaignId): void => {
  //   setSelectedRows((prevSelected) =>
  //     prevSelected.includes(campaignId)
  //       ? prevSelected.filter((id) => id !== campaignId)
  //       : [...prevSelected, campaignId]
  //   );
  // };

  useEffect(() => {
    setHasCampaigns(campaignList.length > 0);
  }, [campaignList]);
  // const hasCampaigns = campaignList.length > 0;

  const handleExportButtonClick = () => {
    // Filter columns to include only the desired fields
    const filteredData = filteredCampaigns.map(
      ({
        campaign_id,
        campaign_name,
        workspace_name,
        channel_type,
        status,
        start_date_time,
        end_date_time,
        campaign_budget,
      }) => ({
        campaign_id,
        campaign_name,
        workspace_name,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin_Campaign_List");

    // Export to an xlsx file
    XLSX.writeFile(workbook, "AdminCampaignList.xlsx");
  };

  const handleNavigate = (campaignId: number, channelType: string,status :string) => (event: { stopPropagation: () => void; }) => {
    event.stopPropagation(); // Prevent event bubbling
    navigate('/operatorNavbar/campaignreview', { state: { campaignId, channelType,status } }); // Navigate with state
  };

  return (
    <div>
      <ToastContainer />
      {isLoading && (
     
          <div className="flex flex-col items-center justify-center h-[500px]">
               <CircularProgress color="success" />
               </div>
        
      )}


      {hasCampaigns ? (
        <div>
          {/* Existing table code here */}
          <div className="flex  mt-2">
            <div className=" ">
              <Input
                placeholder="Search campaign by name..."
                className="w-[350px] text-[14px] font-normal text-[#64748B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end ml-auto ">
            <div className="mb-6">
                <DatePickerWithRange 
                 initialcampaign={initialcampaign} 
                 setInitialCampaign={setInitialCampaign} 
                 setCurrentCampaigns={setCurrentCampaigns} // Pass the setter function
                  getCampaignList={getCampaignList}
                  setCampaignList={setCampaignList}
                  accountCreatedDate={accountCreatedDate}
                  />
              </div>
              <DropdownMenuDemo setFilterData={setFilterData}  filterData={filterData}
              dateList={dateList}  />
              <Button
                variant="outline"
                className="w-24 mb-6 ml-4 mt-[-6] text-[#020617]"
                onClick={handleExportButtonClick}
              >
                <FileIcon style={{width:'14px' , height:'14px' }} className="mr-1 text-[#020617]" /> Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200  "
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow>
                    <TableHead className="">
                      <div className="flex items-center gap-6 justify-start cursor-pointer">
                        <input
                          type="checkbox"
                          className={`text-muted-foreground ${
                            isAllSelected
                              ? "accent-gray-700 bg-grey-700 text-red-500"
                              : ""
                          }`}
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                        Campaign name{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignName")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>

                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Account{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignAccount")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>

                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Channel{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignChannel")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Status{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignStatus")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Schedule{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignDate")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Amount{" "}
                        <CaretSortIcon
                          onClick={() => sortCampaignList("ByCampaignAmount")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>

                    <TableHead className="text-left"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-left text-[14px] font-normal text-[#020617] ">
                  {currentCampaigns.map((campaign) => {
                    let isSelected;
                    campaignList.map((campaings) => {
                      isSelected = checkboxSelectedRows.includes(
                        campaings.campaign_id
                      );
                    });

                    return (
                      <TableRow
                        key={campaign.campaign_id}
                        className={`${isSelected ? "bg-gray-200" : ""}`}
                      >
                        <TableCell className="flex justify-start py-4 text-green-900">
                          <div className="flex items-center gap-6">
                            <input
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
                                handleCheckboxRowSelect(campaign.campaign_id)
                              }
                            />
                            <span
                              className="hover:text-blue-500 text-black text-[14px] cursor-pointer font-normal"
                              onClick={handleNavigate(campaign.campaign_id,campaign.channel_type,campaign.status)}
                            >
                              {campaign.campaign_name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 text-[#FFFFFF]">
                          <span style={{ color: "#020202", fontSize: "15px" }}>
                            {campaign.workspace_name}
                          </span>
                        </TableCell>

                        <TableCell className="py-4 text-[#FFFFFF]">
                          <Badge
                            className={
                              campaign.channel_type === "WhatsApp"
                                ? ""
                                : campaign.channel_type === "SMS"
                                ? ""
                                : campaign.channel_type === "Push Notification"
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
                                : campaign.channel_type === "Push Notification" ||
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
                        <TableCell className="py-4 flex items-center gap-2">
                          {renderStatusIcon(campaign.status)}{" "}
                          {/* Display the appropriate icon */}
                          {campaign.status} {/* Display the status text */}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            {new Date(
                              campaign.start_date_time
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                            , {new Date(campaign.start_date_time).getFullYear()}
                            <ArrowRightIcon />
                            {new Date(campaign.end_date_time).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                            , {new Date(campaign.end_date_time).getFullYear()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 py-4 px-4 text-center">
                          ${campaign.campaign_budget}
                        </TableCell>

                        {/* <TableCell className="flex justify-left py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                onClick={() =>
                                  handleMenuToggle(campaign.campaign_id)
                                }
                                className="cursor-pointer w-6 h-6"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === campaign.campaign_id && (
                              <DropdownMenuContent
                                align="end"
                                className="w-24 bg-gray-200"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEdit(
                                      campaign.campaign_id,
                                      campaign.channel_type
                                    )
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteClick(campaign.campaign_id)
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            )}
                          </DropdownMenu>
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog
            open={isAlertOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{ "& .MuiPaper-root": { borderRadius: "10px" } }}
          >
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this campaign ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="outline" className="w-24" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="w-24" onClick={confirmDelete} autoFocus>
                OK
              </Button>
            </DialogActions>
          </Dialog>

          {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">

              <div className="flex items-center space-x-2 text-gray-500 text-sm ">
                <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                  currentPage * rowsPerPage,
                  filteredCampaigns.length
                )} of ${filteredCampaigns.length} row(s) selected`}</span>
              </div>


              <div className="flex items-center space-x-4 font-medium text-sm">
                <span className="text-[#020617] font-medium text-[14px]">Rows per page</span>

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
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page after changing rows per page
                    }}
                  >
                    {[5, 10, 20].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <CaretSortIcon
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4"
                  />
                </div>



                <div className="ml-4 mr-4">
                  <span className="text-[#020617] text-[14px] font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
                </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1 ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1 ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-200'}`}
                  onClick={() => handlePageChange(totalPages)}
                >
                  »
                </button>
              </div>

            </div>
            </div>
        </div>
      ) : (
              <>
              {isLoading && null}
              {!isLoading && (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <h2 className="text-[24px] font-semibold mb-1 text-[#000000]">
                  Here you will see all campaigns
                </h2>
              </div>
              )}
              </>
            )}
    </div>
  );
};

export default OperatorCampaignList;
