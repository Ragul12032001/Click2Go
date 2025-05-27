import { RootState } from "@/src/State/store";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card } from "../../Components/ui/card";
import { Calendar } from "../../Components/ui/calendar";
import { Button } from "../../Components/ui/button";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../../Components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../Components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { cn } from "../../lib/utils";
import { CalendarIcon } from "lucide-react";

interface CampaignData {
  contactId: number;
  firstName: string;
  phoneNo: string;
  campaignName: string;
  campaignId: number;
  status: string;
  lastDialledDate: string;
}

interface CampaignOption {
  campaignId: number;
  campaignName: string;
}

const AdminReport = () => {
  const [reports, setReports] = useState<CampaignData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const { toast } = useToast();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const apiUrlAdminAccount = useSelector(
    (state: RootState) => state.authentication.adminUrl
  );

  useEffect(() => {
    if (apiUrlAdminAccount) fetchCampaignList();
  }, [apiUrlAdminAccount]);

  const fetchCampaignList = async () => {
    try {
      const response = await fetch(`${apiUrlAdminAccount}/recorddata`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
     
      const uniqueCampaigns = Array.from(
        new Set(data.campaignData.map((c: CampaignOption) => c.campaignId))
      ).map((id) =>
        data.campaignData.find((c: CampaignOption) => c.campaignId === id)!
      );
      
      setCampaigns(uniqueCampaigns);

    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch campaigns: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const sortCampaignList = (field: keyof CampaignData) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";

    const sortedReports = [...reports].sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return newSortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return newSortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      return 0;
    });

    setReports(sortedReports);
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const fetchReports = async () => {
    try {
      if (!selectedCampaign || !dateRange?.from || !dateRange?.to) {
        toast({
          title: "Warning",
          description: "Please select a campaign and date range.",
          variant: "destructive",
        });
        return;
      }

      const startDate = format(new Date(dateRange.from), "yyyy-MM-dd");
      const endDate = format(new Date(dateRange.to), "yyyy-MM-dd");

      const response = await fetch(
        `${apiUrlAdminAccount}/RecordData/recorddata`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: selectedCampaign, startDate, endDate }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setReports(data?.campaignData || []);

      if(data.status == "Success"){
        toast({
          title: "Success",
          description: "Reports retrieved successfully.",
        });
      }
      else{
        toast({
          title: "Error",
          description: "No reports found.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch reports: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentReports = reports.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(reports.length / rowsPerPage);

  const handleCampaignChange = (value: string) => {
    setSelectedCampaign(Number(value));
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1) {
      setCurrentPage(1);
    } else if (pageNumber > totalPages) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(pageNumber);
    }
  };
  return (
    <Card>

    <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-bold text-left">Reports</h2>
                        <p className="text-sm text-gray-600">
You can find the Reports                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      </div>
      {/* ✅ Campaign Name & Date Range */}
      <div className="flex gap-4 mb-4 items-center">
        {/* Campaign Name */}
        <div className="flex flex-col">
          {/* <label className="block font-medium mb-1">Campaign Name <span style={{color:"red"}}>*</span></label> */}
          <Select
  value={selectedCampaign?.toString() || ""}
  onValueChange={handleCampaignChange} 
>
  <SelectTrigger className="border rounded-md p-2 w-60 text-gray-500">
    <SelectValue placeholder="Select The Campaign" />
  </SelectTrigger>
  <SelectContent>
    {campaigns.map((campaign) => (
      <SelectItem
        key={campaign.campaignId}
        value={campaign.campaignId.toString()} // Ensure it's a string
        className="text-[#64748B] text-sm font-normal"
      >
        {campaign.campaignName}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

        </div>

        {/* ✅ Date Range Picker */}
        <div className="flex flex-col">
        <Popover>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      className={cn(
        "min-w-[150px] w-auto justify-start text-left font-normal mt-0 w-60",
        !dateRange?.from && "text-muted-foreground"
      )}
    >
      <CalendarIcon className="mr-2 h-4 " />
      {dateRange?.from ? (
        dateRange.to ? (
          <>
            {format(dateRange.from, "dd/MM/yyyy")} -{" "}
            {format(dateRange.to, "dd/MM/yyyy")}
          </>
        ) : (
          format(dateRange.from, "dd/MM/yyyy")
        )
      ) : (
        <span>Pick a date</span>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-64 p-0" align="start">
  <Calendar
  initialFocus
  mode="range"
  defaultMonth={dateRange?.from}
  selected={dateRange}
  onSelect={(range) =>
    {
      setDateRange(range);

      if (range?.from)
      {
        console.log("From:", format(range.from, "dd/MM/yyyy HH:mm:ss"));
      }

      if (range?.to)
      {
        console.log("To:", format(range.to, "dd/MM/yyyy HH:mm:ss"));
      }
    }}
  numberOfMonths={1}
/>

  </PopoverContent>
</Popover>

        </div>
<div style={{flex:"1.1"}}></div>
        {/* ✅ Retrieve Button */}
        <button
          onClick={fetchReports}
          className="bg-orange-500 text-white px-4 py-2 rounded-md form-button"
        >
          Retrieve
        </button>
      </div>

      {/* ✅ Table */}
      <div className="rounded-md overflow-hidden">
  <Table className="rounded-xl whitespace-nowrap border-gray-200 border" style={{ color: "#020202", fontSize: "15px" }}>
    {/* Table Header */}
<TableHead className="p-2 text-left  ">
  <div className="flex items-center gap-2">
    Date
    <CaretSortIcon
      onClick={() => sortCampaignList("lastDialledDate")}
      className="cursor-pointer"
    />
    {sortField === "lastDialledDate" && (
      <span>{sortOrder === "asc" ? "" : ""}</span>
    )}
  </div>
</TableHead>
<TableHead className="p-2 text-left ">
  <div className="flex items-center gap-2">
    Time
    <CaretSortIcon
      onClick={() => sortCampaignList("firstName")}
      className="cursor-pointer"
    />
    {sortField === "firstName" && (
      <span>{sortOrder === "asc" ? "" : ""}</span>
    )}
  </div>
</TableHead>
<TableHead className="p-2 text-left ">
  <div className="flex items-center gap-2">
    Name
    <CaretSortIcon
      onClick={() => sortCampaignList("phoneNo")}
      className="cursor-pointer"
    />
    {sortField === "phoneNo" && (
      <span>{sortOrder === "asc" ? "" : ""}</span>
    )}
  </div>
</TableHead>

<TableHead className="p-2 text-left ">
  <div className="flex items-center gap-2">
    Phone No
    <CaretSortIcon
      onClick={() => sortCampaignList("status")}
      className="cursor-pointer"
    />
    {sortField === "status" && (
      <span>{sortOrder === "asc" ? "" : ""}</span>
    )}
  </div>
</TableHead>

<TableHead className="p-2 text-left ">
  <div className="flex items-center gap-2">
    Status
    <CaretSortIcon
      onClick={() => sortCampaignList("status")}
      className="cursor-pointer"
    />
    {sortField === "status" && (
      <span>{sortOrder === "asc" ? "" : ""}</span>
    )}
  </div>
</TableHead>

<TableBody className="border">
  {reports.filter(data => !selectedCampaign || data.campaignId === selectedCampaign).length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
        No data available
      </TableCell>
    </TableRow>
  ) : (
    reports
      .filter(data => !selectedCampaign || data.campaignId === selectedCampaign)
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map((data) => {
        const date = new Date(data.lastDialledDate);
        return (
          <TableRow key={data.contactId}>
            <TableCell className="p-2 text-left text-black text-[14px]">
              {date.toLocaleDateString("en-GB")}
            </TableCell>
            <TableCell className="p-2 text-left text-black text-[14px]">
              {date.toLocaleTimeString("en-GB")}
            </TableCell>
            <TableCell className="p-2 text-left text-black text-[14px]">
              {data.firstName}
            </TableCell>
            <TableCell className="p-2 text-left text-black text-[14px]">
              {data.phoneNo || "N/A"}
            </TableCell>
            <TableCell className="p-2 text-left text-black text-[14px]">
              {data.status === "Closed" ? (
                <span className="text-green-600 font-semibold">Delivered</span>
              ) : (
                <span className="text-red-600 font-semibold">{data.status}</span>
              )}
            </TableCell>
          </TableRow>
        );
      })
  )}
</TableBody>


  </Table>
</div>


      <div className="flex justify-between items-center mt-4">
                   <div className="flex items-center space-x-2 text-gray-500 text-sm ">
                     <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                       currentPage * rowsPerPage,
                       reports.length
                     )} of ${reports.length} row(s) selected`}</span>
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
     <Toaster />

                   </div>
                 </div>
    </div>
    </Card>
  );
};

export default AdminReport;