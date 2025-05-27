import React, { useEffect, useState } from "react";
import {
  Table, TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import {
  DotsHorizontalIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { Card } from "../../../Components/ui/card";

import { Button } from "../../../Components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import {
  StopwatchIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb } from "../../../State/slices/AdvertiserAccountSlice";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { Switch } from "../../../Components/ui/switch";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { useToast } from "../../../Components/ui/use-toast";
import { Toaster } from "../../../Components/ui/toaster";
import { RootState } from "@/src/State/store";

interface Plans {
  billingId: number;
  name: string;
  status: string;
  price: string;
  countrySymbol: string;
  messages: string;
  package_type:string;
  updatedAt: string;
}

interface ExistingPlans {
  countrySybmbol: string;
  name: string;
}


const AdminPlans: React.FC = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // Dialog visibility
  const [selectedPlan, setSelectedPlan] = useState(null);
  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId((prev) => (prev === rowId ? null : rowId));
  };

  const [currentPlans, setCurrentPlans] = useState<Plans[]>([]);
  const [isPriceSortedAsc, setIsPriceSortedAsc] = useState<boolean>(true);
  const [isNameSortedAsc, setIsNameSortedAsc] = useState<boolean>(true);
  const [isUpdatedAtSortedAsc, setIsUpdatedAtSortedAsc] = useState<boolean | null>(true); // Initializing as true
  const [isStatusSortedAsc, setIsStatusSortedAsc] = useState<boolean>(true);
  const [isMessagesSortedAsc, setIsMessagesSortedAsc] = useState<boolean>(true);
  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const totalPages = Math.ceil(currentPlans.length / rowsPerPage);
  const [isLoadingFullScreen, setIsLoadingFullScreen] = useState(false);
  const [existingPlansList , setExistingPlansList] = useState<ExistingPlans[]>([]);
  
  const toast = useToast();
  const adminApiUrl = useSelector((state: RootState) => state.authentication.adminUrl);


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
      getPlanList();
    }
  }, [apiUrlAdvAcc]);


  const sortPlansByMessages = () => {
    const sortedPlansByMessages = [...currentPlans].sort((a, b) => {
      // Check if the messages are numeric
      const isNumericA = !isNaN(Number(a.messages));
      const isNumericB = !isNaN(Number(b.messages));

      // If both messages are numeric, compare them numerically
      if (isNumericA && isNumericB) {
        return isMessagesSortedAsc
          ? Number(a.messages) - Number(b.messages)  // Ascending order
          : Number(b.messages) - Number(a.messages); // Descending order
      }

      // If one or both are non-numeric, compare them alphabetically
      return isMessagesSortedAsc
        ? a.messages.localeCompare(b.messages)  // Ascending alphabetical order
        : b.messages.localeCompare(a.messages); // Descending alphabetical order
    });

    setCurrentPlans(sortedPlansByMessages);
    setIsMessagesSortedAsc(!isMessagesSortedAsc); // Toggle sorting order
  };

  const sortPlansByStatus = () => {
    const sortedPlansByStatus = [...currentPlans].sort((a, b) => {
      const statusA = a.status === "Active" ? 1 : 0; // "Active" gets 1, "Inactive" gets 0
      const statusB = b.status === "Active" ? 1 : 0; // "Active" gets 1, "Inactive" gets 0

      return isStatusSortedAsc
        ? statusA - statusB  // Ascending order (Active first)
        : statusB - statusA; // Descending order (Inactive first)
    });

    setCurrentPlans(sortedPlansByStatus); // Update the sorted plans
    setIsStatusSortedAsc(!isStatusSortedAsc); // Toggle sorting order for next click
  };

  const sortPlansByUpdatedAt = () => {
    const sortedPlansByUpdatedAt = [...currentPlans].sort((a, b) => {
      const dateA = new Date(a.updatedAt);  // Convert to Date object
      const dateB = new Date(b.updatedAt);  // Convert to Date object
      return isUpdatedAtSortedAsc
        ? dateA.getTime() - dateB.getTime()  // Ascending order (oldest → newest)
        : dateB.getTime() - dateA.getTime(); // Descending order (newest → oldest)
    });

    setCurrentPlans(sortedPlansByUpdatedAt);
    setIsUpdatedAtSortedAsc(!isUpdatedAtSortedAsc); // Toggle sorting order
  };

  const sortPlansByName = () => {
    const sortedPlansByName = [...currentPlans].sort((a, b) => {
      return isNameSortedAsc
        ? a.name.localeCompare(b.name) // Ascending order (A → Z)
        : b.name.localeCompare(a.name); // Descending order (Z → A)
    });

    setCurrentPlans(sortedPlansByName);
    setIsNameSortedAsc(!isNameSortedAsc); // Toggle sorting order
  };

  const sortPlansByPrice = () => {
    const sortedPlansByPrice = [...currentPlans].sort((a, b) => {
      return isPriceSortedAsc
        ? Number(a.price) - Number(b.price) // Ascending order
        : Number(b.price) - Number(a.price); // Descending order
    });

    setCurrentPlans(sortedPlansByPrice);
    setIsPriceSortedAsc(!isPriceSortedAsc); // Toggle sorting order
  };
  const sortPlansBypackagetype = () => {
    const sortedPlans = [...currentPlans].sort((a, b) => {
      return isPriceSortedAsc
        ? a.package_type.localeCompare(b.package_type)
        : b.package_type.localeCompare(a.package_type);
    });
  
    setCurrentPlans(sortedPlans);
    setIsPriceSortedAsc(!isPriceSortedAsc);
  };
  

  const getPlanList = async () => {
    setIsLoading(true); // Show the loader initially
    console.log("Admin URL :" , adminApiUrl);
    try {
      const response = await axios.get(`${adminApiUrl}/GetPlans`);
      if (response.data && response.data.plansList) {
        const plansList = response.data.plansList;
        console.log("plansList ", plansList);
        setCurrentPlans(plansList);
        const extractedPlan = plansList.map(((plan: any) => ({
          countrySymbol: plan.countrySymbol,
          name: plan.name,
          package_type:plan.package_type
        })));
        console.log("Extracted Plan :", extractedPlan);
        setExistingPlansList(extractedPlan);
        setIsLoading(false); // Hide loader once processing is done
      } else {
        console.error("Invalid response format:", response.data);
        setIsLoading(false); // Hide loader once processing is done
      }
    } catch (error) {
      console.error("Error fetching campaign list:", error);
      setCurrentPlans([]); // Handle errors with an empty list
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const displayedPlans = currentPlans.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleCheckboxRowSelect = (id: number) => {
    setCheckboxSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id];
      setIsAllSelected(newSelectedRows.length === currentPlans.length);
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentPlans.map((plans) => plans.billingId);
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleEditPlan = (planId: number, name: string, messages: string, price: string, countrySymbol: string,package_type:string) => {

    console.log(" Items - ", planId, name, messages, price, countrySymbol,package_type);
    navigate("/adminNavbar/createplans", { state: { planId, name, messages, price, countrySymbol ,package_type} });

  }

  const handleDeletePlan = (planId: any) => {
    setSelectedPlan(planId); // Store Plan ID to delete
    setIsAlertOpen(true); // Open the alert dialog
  };

  const handleClose = () => {
    setIsAlertOpen(false);
  };

  const handleConfirmDelete = () => {

    console.log("plan deleted successfully");
    setIsAlertOpen(false);
  }



  const handleStatusToggle = (billingId: number, currentStatus: string) => {
    setIsLoadingFullScreen(true);
    // const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const newStatus = currentStatus;
    // Update the status in the backend
    axios
      .post(`${apiUrlAdvAcc}/ChangeStatusToggle`, {
        billingId,
        status: newStatus,
      })
      .then((response) => {
        if (response.status === 200) {
          // Update the status locally in the state
          console.log(billingId, newStatus); // Log the values
          setIsLoadingFullScreen(false);
          toast.toast({
            title:"Success",
            description: "Plan updated successfully"
          })
          setCurrentPlans((prevPlans) =>
            prevPlans.map((plan) =>
              plan.billingId === billingId ? { ...plan, status: newStatus } : plan
            )
          );
        }
      })
      .catch((error) => {
        setIsLoadingFullScreen(false);
        toast.toast({
          title:"Error",
          description: "Something went wrong, Please try again."
        })
        console.error("Error updating status:", error);
      });
  };


  const getMessageValue = (input: string) => {

    input = input.trim();
    if (input === "Unlimited messages") {
      return "N/A";
    }

    const number = input.match(/\d+/);
    if (number) {
      return parseInt(number[0]).toLocaleString('en-US');
    }
    return input;
  };

  const renderStatusIcon = (status: any) => {
    switch (status) {
      case "Syncing...":
        return <StopwatchIcon className="text-gray-500" />;
      case "Updated":
        return (
          <CheckIcon className="text-gray-500 rounded-full border border-gray-500" />
        );
      default:
        return null;
    }
  };


  return (
    <Card>

    <div className="p-4">
    <div>
  <h2 className="text-lg font-bold text-left">Plan</h2>
  <p className="text-sm text-gray-600 text-left">
    List of Admin plans
  </p>
  <p className="p-2"></p>
</div>
    <div>
    <Toaster />

    {isLoadingFullScreen && (
      <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
        <CircularProgress className="text-primary" />
      </div>
    )}
      <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
        <Button
          onClick={() => {
            dispatch(setCreateBreadCrumb(true));
            navigate("/adminNavbar/createplans",{
              state: {plansList : existingPlansList },
            });
          }}
          className="w-17 text-sm text-[#F8FAFC] font-medium h-[35px] mt-[10px] form-button"
        >
          New Plan
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      )}
      
      {!isLoading && displayedPlans.length>0 ? (
        <div>
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200  "
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow className="sticky top-0 z-10 bg-white hover:bg-white">
                    <TableHead className="" style={{ width: "40%" }}>
                      <div className="flex items-center gap-6 justify-start cursor-pointer" onClick={sortPlansByName}>
                        {/* <input
                          type="checkbox"
                          className={`text-muted-foreground ${isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""
                            }`}
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        /> */}
                        Name{" "}
                        <CaretSortIcon className="cursor-pointer"
                          onClick={sortPlansByName}
                        />
                      </div>
                    </TableHead>

                    <TableHead className="text-left" style={{ width: "10%" }}>
                      <div className="flex items-center gap-2 justify-start cursor-pointer" onClick={sortPlansByStatus}>
                        Status{" "}
                        <CaretSortIcon
                          className="cursor-pointer"
                          onClick={sortPlansByStatus}
                        />
                      </div>
                    </TableHead>

                    <TableHead style={{ width: "15%" }}>
                      <div className="flex items-left gap-2 justify-start cursor-pointer" onClick={sortPlansByPrice}>
                        Price{" "}
                        <CaretSortIcon
                          className="cursor-pointer"
                          onClick={sortPlansByPrice}
                        />
                      </div>
                    </TableHead>

                    <TableHead style={{ width: "15%" }}>
                      <div className="flex items-center gap-2 justify-start cursor-pointer" onClick={sortPlansByMessages}>
                        Messages{" "}
                        <CaretSortIcon
                          className="cursor-pointer"
                          onClick={sortPlansByMessages}
                        />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: "15%" }}>
                      <div className="flex items-center gap-2 justify-start cursor-pointer" onClick={sortPlansBypackagetype}>
                        Package Type{" "}
                        <CaretSortIcon
                          className="cursor-pointer"
                          onClick={sortPlansBypackagetype}
                        />
                      </div>
                    </TableHead>

                    <TableHead style={{ width: "20%" }}>
                      <div className="flex items-center gap-2 justify-start ml-3 cursor-pointer" onClick={sortPlansByUpdatedAt}>
                        Updated at{" "}
                        <CaretSortIcon
                          className="cursor-pointer"
                          onClick={sortPlansByUpdatedAt}
                        />
                      </div>
                    </TableHead>


                    <TableHead className="text-left"></TableHead>
                  </TableRow>
                </TableHeader>


                <TableBody className="text-left text-[14px] font-normal text-[#020617] ">
                  {displayedPlans.map((plan) => {
                    const isSelected = checkboxSelectedRows.includes(plan.billingId);

                    return (
                      <TableRow
                        key={plan.billingId}
                        className={`${isSelected ? "bg-gray-200" : ""}`}
                      >
                        <TableCell className=" text-green-900">
                          <div className="flex items-center  justify-start gap-4">
                            {/* <input
                              type="checkbox"
                              className={`accent-gray-700 bg-grey-700 text-red-500 ${isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""
                                }`}
                              checked={isSelected}
                              onChange={() => handleCheckboxRowSelect(plan.billingId)}
                            /> */}
                            <span className="ml-2"
                            style={{ color: "#020617", fontSize: "14px", fontWeight: "400" }}>
                              {plan.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="">
                          <div className="flex items-center justify-start">
                            <Switch
                              checked={plan.status === "Active"}
                              onCheckedChange={(checked) => {
                                handleStatusToggle(plan.billingId, checked ? "Active" : "Inactive");
                              }}
                              className="bg-gray-200"
                            />
                            
                          </div>
                        </TableCell>



                        <TableCell className="">
                          <span className="flex items-center justify-start" style={{ color: "#020617", fontSize: "14px", fontWeight: "400" }}>
                          {Number(plan.price).toLocaleString()} {plan.countrySymbol}
                          </span>
                        </TableCell>

                        <TableCell className="">
                          <span className="flex items-center justify-start" style={{ color: "#020617", fontSize: "14px", fontWeight: "400" }}>
                            {getMessageValue(plan.messages)}
                          </span>
                        </TableCell>
                        <TableCell className="">
                          <span className="flex items-center justify-start" style={{ color: "#020617", fontSize: "14px", fontWeight: "400" }}>
                          {getMessageValue(plan.package_type)?.charAt(0).toUpperCase() + getMessageValue(plan.package_type)?.slice(1)}

                          </span>
                        </TableCell>
                        <TableCell className="">
                          <div className="flex items-center justify-start gap-2 ml-2.5">
                            <span style={{ color: "#020617", fontSize: "14px", fontWeight: "400" }}>
                              {new Date(plan.updatedAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              ∙{" "}
                              {new Date(plan.updatedAt).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        {/* <TableCell className="flex justify-start py-4 mr-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                style={{ color: "#020617" }}
                                onClick={() => handleMenuToggle(plan.billingId)}
                                className="cursor-pointer w-5 h-5"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === plan.billingId && (
                              <DropdownMenuContent className="bg-white border border-gray-200 shadow-md rounded-md w-36 mr-5">
                                <DropdownMenuItem
                                  className="px-4 py-2 text-gray-900 hover:bg-gray-100  cursor-pointer"
                                  onClick={() =>
                                    handleEditPlan(
                                      plan.billingId,
                                      plan.name,
                                      plan.messages,
                                      plan.price,
                                      plan.countrySymbol,
                                      plan.package_type
                                    )
                                  }
                                >
                                  Edit
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
                Are you sure! you want to delete this plan ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="outline" className="w-24" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="w-24" onClick={handleConfirmDelete} autoFocus>
                OK
              </Button>
            </DialogActions>
          </Dialog>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm ">
              <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                currentPlans.length
              )} of ${currentPlans.length} row(s) selected`}</span>
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
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page after changing rows per page
                  }}
                >
                  {[5, 10].map((num) => (
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
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                    }`}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                    }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                    }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages
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
      ) : (
        <>
          {isLoading && null}
          {!isLoading && (
            <div className="flex flex-col items-center justify-center h-[500px]">
              <h2 className="text-[24px] font-semibold mb-1 text-[#000000]">
                Here you will see all plans
              </h2>
            </div>
          )}
        </>
      )}
    </div>
    </div>
    </Card>
  );
}

export default AdminPlans;