import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "../../Components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
// import { ToastContainer, toast } from "react-toastify";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import { Button } from "../../Components/ui/button";
import { cn } from "../../lib/utils";
import { Badge } from "../../Components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarIcon, FileIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { FiFilter } from "react-icons/fi";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../Components/ui/popover";
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
import { Tabs, TabsContent } from "../../Components/ui/tabs";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import config from "../../config.json";
import {
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";
import { Skeleton } from "../../Components/ui/skeleton";
import DropdownMenuDemo from "../../Components/Filter/AdminCampaignDropdown";
import { useDispatch } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import {
  setWorkspaceId,
  setworkspace,
} from "../../State/slices/AuthenticationSlice";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";

import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { stat } from "fs";

interface Account {
  workspaceid: number;
  name: string;
  industry: string;
  type: string;
  createdate: string;
  updateddate: string;
}

const Advertiser: React.FC = () => {
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAdminAcc, setApiUrlAdminAcc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dispatch = useDispatch();
  const totalPages = Math.ceil(accountList.length / rowsPerPage);
  const toast = useToast();
  const email = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  // const path = useSelector((state:RootState)=>state.authentication.workspaceName);
  let path = "";
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdminAcc(config.ApiUrlAdminAcc);
      } catch (error) {
        console.error("Error loading config:", error);
        toast.toast({
          title: "Error",
          description: "Failed to load configuration.",
      });
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdminAcc) {
      getAccountList();
    }
  }, [apiUrlAdminAcc]);

  const getAccountList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrlAdminAcc}/GetAdvertiserinfo`);
      if (response.data.status === "Success") {
        setAccountList(response.data.accountList);
        console.log(response.data.accountList);
        toast.toast({
          title: "Success",
          description: "Accounts loaded successfully.",
      });
        
      } else {
        toast.toast({
          title: "Error",
          description: "No accounts found.",
      });
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.toast({
        title: "Error",
        description: "Failed to fetch accounts.",
    });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleLinkClick = (account: Account) => {
    // Perform any additional logic if needed
    // navigate("/navbar/Dashboard", { state: { path: profileName } })
  };
  useEffect(() => {
    const filteredAccounts = accountList.filter((account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const paginatedAccounts = filteredAccounts.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
    setCurrentAccounts(paginatedAccounts);
  }, [searchTerm, accountList, currentPage]);

  const handleSelect = (workspaceid: number) => {
    setSelectedAccounts((prev) =>
      prev.includes(workspaceid)
        ? prev.filter((id) => id !== workspaceid)
        : [...prev, workspaceid]
    );
  };

  const handleEdit = (workspaceid: number, workspaceName: string) => {
    dispatch(setWorkspaceId(workspaceid));
    dispatch(setworkspace(workspaceName));
    navigate("/navbar/dashboard", {
      state: { workspaceid, path: workspaceName },
    });
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === currentAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(
        currentAccounts.map((account) => account.workspaceid)
      );
    }
  };

  return (
    <div>
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search by account name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[350px]"
        />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {currentAccounts.length === 0 ? (
            <div>No accounts found.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        <input
                          type="checkbox"
                          checked={
                            selectedAccounts.length === currentAccounts.length
                          }
                          onChange={handleSelectAll}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Name <CaretSortIcon className="cursor-pointer" />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Industry <CaretSortIcon className="cursor-pointer" />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Type <CaretSortIcon className="cursor-pointer" />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Created At <CaretSortIcon className="cursor-pointer" />
                      </div>
                    </TableHead>
                    <TableHead className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Updated At <CaretSortIcon className="cursor-pointer" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-left text-[14px] font-normal text-[#020617] ">
                  {currentAccounts.map((account, index) => (
                    <TableRow key={account.workspaceid}>
                      <TableCell className="py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes(
                            account.workspaceid
                          )}
                          onChange={() => handleSelect(account.workspaceid)}
                        />
                      </TableCell>

                      <TableCell>
                        <div
                          className="flex items-center gap-6 cursor-pointer"
                          key={index}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default anchor behavior
                            handleEdit(account.workspaceid, account.name); // Call the navigate function
                          }}
                        >
                          <span>{account.name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-left">
                        <span className="account-text">{account.industry}</span>
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        <span className="account-text">{account.type}</span>
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        <span className="account-text">
                          {account.createdate}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-left">
                        <span className="account-text">
                          {account.updateddate}
                        </span>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DotsHorizontalIcon
                              onClick={() =>
                                handleMenuToggle(account.workspaceid)
                              }
                              className="cursor-pointer w-6 h-6"
                            />
                          </DropdownMenuTrigger>
                          {openMenuRowId === account.workspaceid && (
                            <DropdownMenuContent
                              align="end"
                              className="w-20 bg-gray-200"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEdit(account.workspaceid, account.name)
                                }
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEdit(account.workspaceid, account.name)
                                }
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          )}
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2 text-gray-500 text-sm ">
          <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
            currentPage * rowsPerPage,
            accountList.length
          )} of ${accountList.length} row(s) selected`}</span>
        </div>
        <div className="flex items-center space-x-4 font-medium text-sm">
          <span>Rows per page:</span>
          <select
            className="ml-2 border border-gray-300 rounded px-2 py-1"
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
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="border p-1 pr-2 pl-2 rounded text-gray-500 hover:bg-gray-200"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            className="border p-1 pr-2 pl-2 rounded text-gray-500 hover:bg-gray-200"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <button
            className="border p-1 pr-2 pl-2 rounded text-gray-500 hover:bg-gray-200"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button
            className="border p-1 pr-2 pl-2 rounded text-gray-500 hover:bg-gray-200"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advertiser;
